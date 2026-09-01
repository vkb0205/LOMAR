import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Send, Smile } from 'lucide-react';
import { DEFAULT_BLOG_AVATAR } from '../constants';
import { EASE } from '../../../shared/ui/motion';
import { motion } from 'motion/react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) return;
    inputRef.current?.focus();
  }, [focused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="flex flex-col rounded-bezel bg-ink/5 p-1.5 ring-1 ring-ink/5 shadow-tile"
    >
      <div className="flex flex-col rounded-bezel-inner bg-white pt-4 pb-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div
          className={`mx-6 mb-4 flex items-center gap-3 rounded-full p-2 pr-3 pl-4 transition-all duration-500 ease-fluid ${
            focused ? 'bg-canvas ring-1 ring-rose/40' : 'bg-canvas ring-1 ring-ink/10'
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-mist shadow-card">
            <img src={DEFAULT_BLOG_AVATAR} alt="avatar" className="h-full w-full rounded-full object-cover" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={composer}
            onChange={(event) => onComposerChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={!isAuthenticated || posting}
            placeholder={isAuthenticated ? 'Bạn đang nghĩ gì?' : 'Đăng nhập để chia sẻ...'}
            className="flex-1 border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink/40 disabled:opacity-60"
          />
          <div className="flex shrink-0 items-center gap-1 text-rose-deep">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500 hover:bg-rose-mist"
              aria-label="Thêm ảnh"
            >
              <ImagePlus strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-500 hover:bg-rose-mist"
              aria-label="Thêm GIF"
            >
              GIF
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500 hover:bg-rose-mist"
              aria-label="Thêm biểu tượng cảm xúc"
            >
              <Smile strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <button
              onClick={onSubmit}
              disabled={!isAuthenticated || posting || !composer.trim()}
              title="Đăng bài"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose text-white transition-all duration-500 ease-fluid hover:bg-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {actionError && <p className="mb-2 px-7 text-[11px] font-medium text-rose-deep">{actionError}</p>}

        <div className="flex items-center justify-between gap-2 border-t border-ink/5">
          {feedTabs.map((tab, index) => (
            <button
              key={tab}
              className={`relative flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                index === 0 ? 'text-rose-deep' : 'text-ink/55 hover:text-ink'
              }`}
            >
              {tab}
              {index === 0 && (
                <motion.span
                  layoutId="composer-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-rose"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
