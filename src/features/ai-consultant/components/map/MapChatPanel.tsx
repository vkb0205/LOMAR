import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { AssistantChat } from '../AssistantChat';
import { useConsultantChat } from '../../hooks/useConsultantChat';
import type { MapVendor } from '../../services/mapVendorService';

interface MapChatPanelProps {
  vendors: MapVendor[];
  highlightedIds: string[];
  onHighlight: (ids: string[]) => void;
  onSelectVendor: (id: string | null) => void;
  onClose: () => void;
}

/** AI consultant surface that projects returned vendor suggestions onto the map. */
export function MapChatPanel({
  vendors,
  highlightedIds,
  onHighlight,
  onSelectVendor,
  onClose,
}: MapChatPanelProps) {
  const chat = useConsultantChat('map');
  const mapVendorIds = useMemo(() => new Set(vendors.map(vendor => vendor.id)), [vendors]);

  useEffect(() => {
    const suggestedIds = Array.from(
      new Set(
        chat.retrievedServices
          .map(service => service.vendorId)
          .filter((id): id is string => Boolean(id && mapVendorIds.has(id))),
      ),
    );

    onHighlight(suggestedIds);
    onSelectVendor(suggestedIds[0] ?? null);
  }, [chat.retrievedServices, mapVendorIds, onHighlight, onSelectVendor]);

  return (
    <div className="relative h-full">
      <AssistantChat
        title="Bé Song Hỷ"
        subtitle="Trợ lý AI · Gợi ý trực tiếp trên bản đồ"
        input={chat.input}
        isTyping={chat.isTyping}
        messages={chat.messages}
        retrievedServices={chat.retrievedServices}
        messagesEndRef={chat.messagesEndRef}
        scrollContainerRef={chat.scrollContainerRef}
        onInputChange={chat.setInput}
        onSubmit={chat.submitMessage}
        compact
      />

      {highlightedIds.length > 0 && (
        <span className="absolute right-12 top-4 rounded-full border border-sage/20 bg-sage/10 px-2.5 py-1 text-[11px] font-medium text-forest">
          {highlightedIds.length} đã ghim
        </span>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Ẩn chat"
        title="Ẩn chat"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-canvas text-muted transition-colors hover:bg-surface-soft hover:text-ink lg:hidden"
      >
        <X strokeWidth={1.5} className="h-4 w-4" />
      </button>
    </div>
  );
}
