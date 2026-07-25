import { Loader2, Sparkles } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../services/customizeCatalogService';
import { MannequinType } from '../types';

interface PreviewCanvasProps {
  canGenerate: boolean;
  generatedPreviewUrl: string | null;
  inputValue: string;
  isGenerating: boolean;
  previewImage: string;
  selectedMannequin: MannequinType;
  onGenerate: () => void;
  onInputChange: (value: string) => void;
}

export function PreviewCanvas({
  canGenerate,
  generatedPreviewUrl,
  inputValue,
  isGenerating,
  previewImage,
  selectedMannequin,
  onGenerate,
  onInputChange,
}: PreviewCanvasProps) {
  return (
    <div className="flex-1 rounded-[24px] overflow-hidden bg-white relative flex flex-col mb-6 p-3">
      <div className="flex-1 min-h-[360px] relative overflow-hidden bg-[#FAF6EE] rounded-2xl border border-rose-50">
        <img
          src={previewImage}
          alt="AI Preview"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-500"
          style={{ objectPosition: 'top center' }}
          onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-[#ddb983] uppercase tracking-widest shadow-sm flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {generatedPreviewUrl ? 'Xem trước AI' : `Người mẫu ${selectedMannequin === 'female' ? 'Nữ' : 'Nam'}`}
        </div>
        {isGenerating && <GeneratingOverlay />}
      </div>

      <PromptComposer
        inputValue={inputValue}
        isGenerating={isGenerating}
        canGenerate={canGenerate}
        onGenerate={onGenerate}
        onInputChange={onInputChange}
      />
    </div>
  );
}

function GeneratingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/65 backdrop-blur-sm flex flex-col items-center justify-center text-[#1B2C40]">
      <Loader2 className="w-8 h-8 text-[#ffdb9f] animate-spin mb-3" />
      <span className="text-xs font-bold uppercase tracking-widest">Đang tạo ảnh bằng Vertex AI...</span>
    </div>
  );
}

interface PromptComposerProps {
  canGenerate: boolean;
  inputValue: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onInputChange: (value: string) => void;
}

function PromptComposer({
  canGenerate,
  inputValue,
  isGenerating,
  onGenerate,
  onInputChange,
}: PromptComposerProps) {
  return (
    <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-rose-50 shadow-sm mt-1">
      <label className="block text-[10px] font-bold text-[#ddb983] mb-3 uppercase tracking-widest">
        Prompt thiết kế / yêu cầu AI
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <textarea
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onGenerate();
          }}
          placeholder="Nhập ý tưởng của bạn hoặc chọn các tùy chọn bên trái rồi bấm Tạo ảnh..."
          className="flex-1 min-h-[92px] bg-white border border-rose-100 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-[#ffdb9f] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400 resize-none"
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="sm:w-[150px] py-3.5 bg-[#ffe9c9] text-[#1B2C40] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#ffdb9f] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Tạo ảnh
        </button>
      </div>
    </div>
  );
}
