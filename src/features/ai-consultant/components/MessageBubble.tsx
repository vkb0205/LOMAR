import { Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import { ConsultantMessage } from '../types';

interface MessageBubbleProps {
  message: ConsultantMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-rose-600" />
        </div>
      )}
      <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
        message.role === 'user'
          ? 'bg-rose-500 text-white rounded-tr-sm'
          : 'bg-gray-50 text-gray-800 rounded-tl-sm'
      }`}>
        {message.content}
      </div>
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-rose-600" />
        </div>
      )}
    </motion.div>
  );
}
