import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { ConsultantMessage } from '../types';
import { EASE } from '../../../shared/ui/motion';

interface MessageBubbleProps {
  message: ConsultantMessage;
  compact?: boolean;
}

export function MessageBubble({ message, compact = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mr-2.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-deep">
          <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-canvas" />
        </div>
      )}
      <div
        className={`max-w-[85%] p-3 ${textSize} leading-relaxed font-medium whitespace-pre-wrap ${
          isUser
            ? 'rounded-lg rounded-tr-sm bg-surface-card text-ink'
            : 'rounded-lg rounded-tl-sm border border-hairline bg-canvas text-ink'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
