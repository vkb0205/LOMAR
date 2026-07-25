import React from 'react';
import { Send } from 'lucide-react';
import { ChatBubbleMessage } from '../types';

interface CustomizeChatProps {
  canGenerate: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  inputValue: string;
  isGenerating: boolean;
  messages: ChatBubbleMessage[];
  onGenerate: () => void;
  onInputChange: (value: string) => void;
}

export function CustomizeChat({
  canGenerate,
  chatContainerRef,
  inputValue,
  isGenerating,
  messages,
  onGenerate,
  onInputChange,
}: CustomizeChatProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-[#ffdb9f]/30 p-6 flex-1 flex flex-col relative overflow-hidden h-[325px]">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 relative z-10 flex flex-col pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`text-xs p-4 rounded-[20px] max-w-[85%] shadow-sm leading-relaxed font-medium ${message.isUser
              ? 'bg-[#FAF6EE] text-[#1B2C40] rounded-tr-sm self-end ml-auto border border-[#ffdb9f]/30'
              : 'bg-white text-[#1B2C40] rounded-tl-sm self-start mr-auto border border-[#ffdb9f]/30'}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="relative z-10 w-full mt-auto pt-4 pb-2 bg-white/50 backdrop-blur-md border-t border-[#ffdb9f]/30">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onGenerate()}
          placeholder="Nhập yêu cầu của bạn..."
          className="w-full bg-white border border-[#ffdb9f]/30 rounded-full py-3.5 px-6 pr-14 text-xs font-medium focus:ring-1 focus:ring-[#ffdb9f] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400"
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ffe9c9] text-[#1B2C40] rounded-full flex items-center justify-center hover:bg-[#ffdb9f] shadow-sm transition-transform active:scale-95 animate-in zoom-in duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
