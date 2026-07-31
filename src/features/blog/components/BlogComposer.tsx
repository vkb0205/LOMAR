import { ImagePlus, Send, Smile } from 'lucide-react';
import { DEFAULT_BLOG_AVATAR } from '../constants';

interface BlogComposerProps {
  isAuthenticated: boolean;
  composer: string;
  posting: boolean;
  actionError: string | null;
  onComposerChange: (value: string) => void;
  onSubmit: () => void;
}

const feedTabs = ['Dành cho bạn', 'Đang theo dõi', 'Gần đây', 'Phổ biến'];

export function BlogComposer({
  isAuthenticated,
  composer,
  posting,
  actionError,
  onComposerChange,
  onSubmit,
}: BlogComposerProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-[32px] pt-4 px-6 pb-0 shadow-sm border border-rose-50 flex flex-col">
      <div className="flex items-center gap-3 mb-4 bg-white border border-rose-100 rounded-full p-2 pl-4 pr-3 shadow-sm">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white">
          <img src={DEFAULT_BLOG_AVATAR} alt="avatar" className="w-full h-full rounded-full object-cover" />
        </div>
        <input
          type="text"
          value={composer}
          onChange={(event) => onComposerChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') onSubmit(); }}
          disabled={!isAuthenticated || posting}
          placeholder={isAuthenticated ? 'Bạn đang nghĩ gì?' : 'Đăng nhập để chia sẻ...'}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[#1B2C40]/40 text-[#1B2C40] font-medium disabled:opacity-60"
        />
        <div className="flex text-[#F2BFC8] gap-1 shrink-0 items-center">
          <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><ImagePlus className="w-5 h-5" /></button>
          <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors font-bold text-[10px]">GIF</button>
          <button className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors"><Smile className="w-5 h-5" /></button>
          <button
            onClick={onSubmit}
            disabled={!isAuthenticated || posting || !composer.trim()}
            title="Đăng bài"
            className="w-8 h-8 rounded-full bg-[#F2BFC8] text-white flex items-center justify-center transition-colors hover:bg-[#1B2C40] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      {actionError && <p className="text-[11px] text-rose-600 mb-2 px-1">{actionError}</p>}
      <div className="flex items-center gap-2 justify-between">
        {feedTabs.map((tab, index) => (
          <button
            key={tab}
            className={`flex-1 py-4 text-xs font-bold transition-all relative uppercase tracking-wider ${index === 0 ? 'text-[#F2BFC8]' : 'text-[#1B2C40]/60 hover:text-[#1B2C40]'}`}
          >
            {tab}
            {index === 0 && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F2BFC8] rounded-t-full" />}
          </button>
        ))}
      </div>
    </div>
  );
}
