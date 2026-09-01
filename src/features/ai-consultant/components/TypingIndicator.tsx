import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE } from '../../../shared/ui/motion';

interface TypingIndicatorProps {
  compact?: boolean;
}

export function TypingIndicator({ compact = false }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex justify-start"
    >
      <div className="mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
        <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-canvas" />
      </div>
      <div
        className={`rounded-lg rounded-tl-sm border border-hairline bg-canvas ${
          compact ? 'p-3' : 'p-4'
        }`}
      >
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-rose" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  );
}
