import base64
import os
import time
from io import BytesIO
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image, ImageOps
from pydantic import BaseModel, Field, HttpUrl

load_dotenv()

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1").strip()
GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "true").strip().lower() in {"1", "true", "yes", "on"}
NANO_BANANA_MODEL = os.getenv("NANO_BANANA_MODEL", os.getenv("GOOGLE_IMAGE_MODEL", "gemini-2.5-flash-image-preview")).strip()
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "3000"))

app = FastAPI(title="LOMAR Vertex AI Nano Banana VTON API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TryOnRequest(BaseModel):
    body_url: HttpUrl = Field(..., description="Presigned/public URL of the mannequin/base image")
    garment_url: HttpUrl = Field(..., description="Presigned/public URL of the selected dress/clothing image")
    category: str = Field("onepieces", pattern="^(tops|bottoms|onepieces|dress|clothes)$")
    prompt: Optional[str] = Field("", description="Optional user query for styling or further clothing edits")


def _bytes_to_data_url(content: bytes, content_type: str) -> str:
    content_type = (content_type or "image/png").split(";")[0]
    if not content_type.startswith("image/"):
        raise ValueError(f"Input did not contain an image. content-type={content_type}")

    encoded = base64.b64encode(content).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


def _normalize_image_bytes(content: bytes, content_type: str) -> Dict[str, Any]:
    content_type = (content_type or "image/png").split(";")[0]
    if not content_type.startswith("image/"):
        raise ValueError(f"Input did not contain an image. content-type={content_type}")

    try:
        with Image.open(BytesIO(content)) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            output = BytesIO()
            image.save(output, format="PNG")
            png_bytes = output.getvalue()
    except Exception as exc:
        raise ValueError(f"Could not decode image as a Vertex AI-compatible PNG: {exc}") from exc

    return {"bytes": png_bytes, "mime_type": "image/png", "data_url": _bytes_to_data_url(png_bytes, "image/png")}


def _download_image(url: str) -> Dict[str, Any]:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return _normalize_image_bytes(response.content, response.headers.get("content-type", "image/png"))


async def _read_upload_image(upload: UploadFile) -> Dict[str, Any]:
    content = await upload.read()
    if not content:
        raise ValueError(f"{upload.filename or 'uploaded file'} is empty")
    return _normalize_image_bytes(content, upload.content_type or "image/png")


def _category_label(category: str) -> str:
    labels = {
        "tops": "upper-body top garment",
        "bottoms": "lower-body bottom garment",
        "onepieces": "one-piece dress or full-body garment",
        "dress": "dress",
        "clothes": "selected clothing item",
    }
    return labels[category]


def _build_vton_prompt(category: str, user_prompt: Optional[str]) -> str:
    garment_label = _category_label(category)
    extra_instruction = (user_prompt or "").strip()
    extra_block = f"\n\nUser styling/edit query:\n{extra_instruction}" if extra_instruction else ""

    return f"""
You are generating a virtual try-on image for a fashion UI.

Reference image 1: base mannequin image.
Reference image 2: selected dress/clothing image.

Task:
Put the {garment_label} from reference image 2 onto the mannequin from reference image 1. The result must look like a realistic product try-on photo.

Core requirements:
- Preserve the mannequin identity, body proportions, pose, camera angle, lighting direction, and background from reference image 1.
- Preserve the clothing design from reference image 2: color, fabric texture, pattern, neckline, sleeves, hem, silhouette, logos, embroidery, buttons, and visible construction details.
- Fit the clothing naturally on the mannequin with realistic drape, wrinkles, folds, shadows, occlusion, and perspective.
- Replace only the relevant clothing area for category "{category}".
- If the user query asks for refinements, apply them while keeping the mannequin and selected clothing recognizable.
- Do not add text, watermarks, labels, borders, UI controls, extra people, extra mannequins, or unrelated accessories.
- Return only the final edited image.{extra_block}
""".strip()


def _create_vertex_client() -> genai.Client:
    if not GOOGLE_GENAI_USE_VERTEXAI:
        api_key = os.getenv("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY", "")).strip()
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY or GEMINI_API_KEY is required when GOOGLE_GENAI_USE_VERTEXAI=false")
        return genai.Client(api_key=api_key)

    if not GOOGLE_CLOUD_PROJECT:
        raise HTTPException(status_code=500, detail="GOOGLE_CLOUD_PROJECT is not configured in .env")

    return genai.Client(vertexai=True, project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_LOCATION)


def _extract_generated_image(response: Any) -> Dict[str, Any]:
    raw_parts: List[str] = []
    finish_reason_str = "UNKNOWN"

    if not getattr(response, "candidates", None):
        raise HTTPException(status_code=502, detail={"message": "Nano Banana response did not include candidates"})

    for candidate in response.candidates:
        # Check finish_reason to detect safety refusals / blocked content
        finish_reason = getattr(candidate, "finish_reason", None)
        finish_reason_str = str(finish_reason) if finish_reason is not None else "UNKNOWN"

        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) if content else None
        if not parts:
            continue

        for part in parts:
            # --- Try inline_data first (generated image) ---
            inline_data = getattr(part, "inline_data", None)
            if inline_data and getattr(inline_data, "data", None):
                mime_type = getattr(inline_data, "mime_type", "image/png") or "image/png"
                image_bytes = inline_data.data
                if isinstance(image_bytes, str):
                    image_bytes = base64.b64decode(image_bytes)
                return {"image_url": _bytes_to_data_url(image_bytes, mime_type), "raw": raw_parts or None}

            # --- Try part.as_image() as a fallback for newer Gemini SDK ---
            try:
                as_image = part.as_image()
                if as_image is not None:
                    image_bytes = as_image
                    if isinstance(image_bytes, str):
                        image_bytes = base64.b64decode(image_bytes)
                    return {"image_url": _bytes_to_data_url(image_bytes, "image/png"), "raw": raw_parts or None}
            except Exception:
                pass

            # --- Collect text parts for diagnostics ---
            text = getattr(part, "text", None)
            if text:
                raw_parts.append(text)

    # Build detailed error including finish_reason and any safety ratings
    safety_info = None
    for candidate in response.candidates:
        sr = getattr(candidate, "safety_ratings", None)
        if sr:
            try:
                safety_info = [{"category": str(getattr(r, "category", "")), "probability": str(getattr(r, "probability", ""))} for r in sr]
            except Exception:
                safety_info = str(sr)
            break

    error_detail = {
        "message": "No image found in Nano Banana response",
        "text_parts": raw_parts,
        "finish_reason": finish_reason_str,
        "safety_ratings": safety_info,
    }
    raise HTTPException(status_code=502, detail=error_detail)


async def _run_vton(
    body_image: Dict[str, Any],
    garment_image: Dict[str, Any],
    category: str,
    user_prompt: Optional[str],
    started: float,
) -> Dict[str, Any]:
    try:
        client = _create_vertex_client()

        # Disable all safety filters for the VTON fashion use case.
        # The model may otherwise block mannequin/clothing edits as "dangerous".
        safety_settings = [
            types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold=types.HarmBlockThreshold.BLOCK_NONE),
            types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
            types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
            types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
        ]

        response = client.models.generate_content(
            model=NANO_BANANA_MODEL,
            contents=[
                _build_vton_prompt(category, user_prompt),
                types.Part.from_bytes(data=body_image["bytes"], mime_type=body_image["mime_type"]),
                types.Part.from_bytes(data=garment_image["bytes"], mime_type=garment_image["mime_type"]),
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                safety_settings=safety_settings,
            ),
        )
    except HTTPException:
        raise
    except Exception as exc:
        latency_ms = round((time.perf_counter() - started) * 1000)
        raise HTTPException(status_code=502, detail={"message": f"Vertex AI Nano Banana request failed: {exc}", "latency_ms": latency_ms}) from exc

    latency_ms = round((time.perf_counter() - started) * 1000)
    result = _extract_generated_image(response)
    return {
        "ok": True,
        "image_url": result["image_url"],
        "latency_ms": latency_ms,
        "latency_seconds": round(latency_ms / 1000, 2),
        "model": NANO_BANANA_MODEL,
        "provider": "vertex-ai" if GOOGLE_GENAI_USE_VERTEXAI else "google-ai-api-key",
        "project": GOOGLE_CLOUD_PROJECT if GOOGLE_GENAI_USE_VERTEXAI else None,
        "location": GOOGLE_CLOUD_LOCATION if GOOGLE_GENAI_USE_VERTEXAI else None,
        "category": category,
        "prompt": user_prompt or "",
        "raw": result["raw"],
    }


@app.get("/proxy-image")
def proxy_image(url: str):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "image/png")
        return Response(content=response.content, media_type=content_type)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to proxy image: {exc}")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "service": "LOMAR Vertex AI Nano Banana VTON API",
        "model": NANO_BANANA_MODEL,
        "provider": "vertex-ai" if GOOGLE_GENAI_USE_VERTEXAI else "google-ai-api-key",
        "project": GOOGLE_CLOUD_PROJECT if GOOGLE_GENAI_USE_VERTEXAI else None,
        "location": GOOGLE_CLOUD_LOCATION if GOOGLE_GENAI_USE_VERTEXAI else None,
        "vertex_configured": bool(GOOGLE_CLOUD_PROJECT) if GOOGLE_GENAI_USE_VERTEXAI else False,
    }


@app.post("/test-try-on")
async def test_try_on(request: TryOnRequest) -> Dict[str, Any]:
    started = time.perf_counter()

    try:
        body_image = _download_image(str(request.body_url))
        garment_image = _download_image(str(request.garment_url))
    except requests.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Could not download input image: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return await _run_vton(body_image, garment_image, request.category, request.prompt, started)


@app.post("/test-try-on-upload")
async def test_try_on_upload(
    body_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: str = Form("onepieces"),
    prompt: str = Form(""),
) -> Dict[str, Any]:
    if category not in {"tops", "bottoms", "onepieces", "dress", "clothes"}:
        raise HTTPException(status_code=400, detail="category must be one of: tops, bottoms, onepieces, dress, clothes")

    started = time.perf_counter()

    try:
        body_payload = await _read_upload_image(body_image)
        garment_payload = await _read_upload_image(garment_image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return await _run_vton(body_payload, garment_payload, category, prompt, started)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("test_api:app", host=API_HOST, port=API_PORT, reload=True)
