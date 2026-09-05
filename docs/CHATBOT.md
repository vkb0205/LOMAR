# Bé Song Hỷ — AI Consultant Chatbot

The LOMAR wedding assistant ("Bé Song Hỷ") is the product's AI chat surface. It
helps couples find wedding services, confirm budgets and concepts, and be
directed to the right vendor categories. This page documents where the chatbot
lives in the frontend, how it is used, and how the individual surfaces are wired.

## Surfaces

The same assistant appears in two forms, controlled by the router layout:

| Surface | Route(s) | Component | Description |
| --- | --- | --- | --- |
| In-page sidebar chat | `/explore` | `AssistantChat` (via `ServicesPage`) | Persistent chat pinned to the right of the explore results |
| Floating launcher | everywhere a couple needs help | `FloatingChat` | Bottom-right launcher, contextual; hidden on `/explore`, `/map`, `/business-intelligence`, `/admin`, `/login` |

Both surfaces share the same network layer and session model.

## How to use it (user-facing)

1. Open the site and go to **Khám phá** (`/explore`).
2. Use the chat panel **Bé Song Hỷ** on the right to ask for help, e.g.:
   - “Tìm hộ mình váy cưới trong ngân sách 20 triệu”
   - “Mình cần studio chụp ảnh gần quận 7”
   - “So sánh giúp mình dịch vụ khám sức khỏe tiền hôn nhân”
3. The bot replies with prose and, when relevant, **retrieved-service cards**
   rendered below the chat (the cards, not the prose, are the clickable products).
4. In the bottom-right, click the **mascot** to open the floating assistant from
   any other page.

The assistant keeps a per-tab session (server-side process memory) and, when the
couple is logged in, their history is rehydrated on page reload.

## Code layout (frontend)

```
src/features/ai-consultant/
  components/
    AssistantChat.tsx        # In-page assistant chrome (sidebar layout)
    MessageBubble.tsx        # Individual message bubble
    RetrievedServiceRow.tsx  # Cards for services the agent retrieved this turn
    TypingIndicator.tsx      # "đang trả lời..." state
  hooks/
    useConsultantChat.ts     # Chat controller for embedded surfaces (messages, input, send)
  services/
    aiConsultantService.ts    # POST /api/v1/chat/consult client + session persistence
    chatMessageRepository.ts  # Supabase chat_messages persistence
  types.ts
```

The floating launcher lives in `src/features/chat/` (`FloatingChat.tsx`,
`openAssistant.ts`).

## Scroll behavior (important)

Two scroll-related bugs were fixed in this work; keep these patterns when
touching chat UI:

- **Never `scrollIntoView` on a chat message end marker.** Because the chat
  panel overlaps the page (sticky/fixed), `scrollIntoView` also scrolls the
  page behind it, yanking the user to the bottom of the site on every send.
  Instead, scroll only the scroll container:
  ```ts
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  ```
  See `useConsultantChat.ts` and `FloatingChat.tsx`.

- **The desktop `/explore` sidebar is `position: fixed`, not `sticky`.** The
  aside was `lg:sticky lg:top-24 lg:self-start`, but its containing flex row is
  barely taller than the chat, so the sticky chat scrolled off the viewport at
  the bottom of a long results list. `ServicesPage.tsx` now keeps an in-flow
  `<aside>` as a width spacer and renders the chat in a fixed panel:
  ```
  fixed top-24 right-[max(1rem,calc((100vw_-_1400px)/2_+_1rem))] z-30 w-[380px]
  ```
  The right offset keeps the panel aligned with the results column across
  viewports (16px gutter up to 1400px, then centered-gutter beyond).

## Backend contract

The chatbot talks to the backend through the endpoints below. The anonymous
couple consultant uses the tool-using agent + process-local session memory;
authenticated threads use durable DB-backed chat.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/chat/consult` | Anonymous/friendly couple consult. Body: `{ message, sessionId?, history?, path?, surface? }`. Returns `{ reply, sessionId, retrievedServices[], toolsUsed[], degraded }` |
| `POST` | `/api/v1/chat/threads` | Create a durable chat thread (authed) |
| `GET` | `/api/v1/chat/threads/{threadId}/messages` | List messages of a thread (authed) |
| `POST` | `/api/v1/chat/threads/{threadId}/messages` | Send a message in a thread (authed) |

The agent runtime that produces replies lives in the backend package:
`LOMAR_backend/app/agents/chatbot/runtime.py` (production runtime at
`LOMAR/agents/chatbot/runtime.py`). It strips technical markdown and image
URLs from replies so prose stays clean; product presentation is carried by
`retrievedServices`, never by image URLs in the reply text.

## Related docs

- `ARCHITECTURE.md` — frontend structure and monorepo siblings
- `SPEC.md` — product spec (FR-008 plan-aware context rules)
