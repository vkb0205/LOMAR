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
        <div className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-mist">
          <Sparkles strokeWidth={1.5} className="h-4 w-4 text-rose-deep" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl p-3.5 ${textSize} font-medium leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'rounded-br-sm bg-cream text-ink-deep'
            : 'rounded-bl-sm border border-ink/8 bg-white text-ink shadow-card'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
