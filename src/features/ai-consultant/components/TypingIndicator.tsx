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
      <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-mist">
        <Sparkles strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
      </div>
      <div
        className={`rounded-2xl rounded-bl-sm border border-ink/8 bg-white shadow-card ${
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
