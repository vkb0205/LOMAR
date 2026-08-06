import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { ConsultantMessage, RetrievedService } from '../../ai-consultant/types';
import { RetrievedServiceRow } from '../../ai-consultant/components/RetrievedServiceRow';

interface ServicesChatProps {
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  inputValue: string;
  isGenerating: boolean;
  messages: ConsultantMessage[];
  onGenerate: () => void;
  onInputChange: (value: string) => void;
  retrievedServices: RetrievedService[];
}

export function ServicesChat({
  chatContainerRef,
  inputValue,
  isGenerating,
  messages,
  onGenerate,
  onInputChange,
  retrievedServices,
}: ServicesChatProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[32px] shadow-sm border border-[#ffdb9f]/30 flex flex-col relative overflow-hidden h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#ffdb9f]/30">
        <div className="w-10 h-10 rounded-full bg-[#ffe9c9] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#1B2C40]" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-[#1B2C40] text-sm">Trợ lý tư vấn dịch vụ</h3>
          <p className="text-[11px] text-[#6B92B4] font-medium">Hỏi để được gợi ý dịch vụ phù hợp</p>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 p-6 relative z-10 flex flex-col">
        {messages.map(message => (
          <div
            key={message.id}
            className={`text-xs p-4 rounded-[20px] max-w-[85%] shadow-sm leading-relaxed font-medium whitespace-pre-wrap ${message.role === 'user'
              ? 'bg-[#FAF6EE] text-[#1B2C40] rounded-tr-sm self-end ml-auto border border-[#ffdb9f]/30'
              : 'bg-white text-[#1B2C40] rounded-tl-sm self-start mr-auto border border-[#ffdb9f]/30'}`}
          >
            {message.content}
          </div>
        ))}
        {isGenerating && (
          <div className="bg-white text-[#1B2C40] rounded-[20px] rounded-tl-sm self-start mr-auto border border-[#ffdb9f]/30 p-4 shadow-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#ffdb9f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#ffdb9f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#ffdb9f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <RetrievedServiceRow services={retrievedServices} variant="sand" />

      <div className="relative z-10 w-full mt-auto px-4 pt-4 pb-4 bg-white/50 backdrop-blur-md border-t border-[#ffdb9f]/30">
        <input
          type="text"
          value={inputValue}
          onChange={event => onInputChange(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && onGenerate()}
          placeholder="Nhập yêu cầu của bạn..."
          className="w-full bg-white border border-[#ffdb9f]/30 rounded-full py-3.5 px-6 pr-14 text-xs font-medium focus:ring-1 focus:ring-[#ffdb9f] focus:outline-none shadow-sm text-[#1B2C40] placeholder:text-gray-400"
        />
        <button
          onClick={onGenerate}
          disabled={isGenerating || !inputValue.trim()}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ffe9c9] text-[#1B2C40] rounded-full flex items-center justify-center hover:bg-[#ffdb9f] shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}

