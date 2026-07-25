interface QuickHintsProps {
  onSelectHint: (hint: string) => void;
}

const QUICK_HINTS = ['Tìm váy cưới', 'Tư vấn vest', 'Địa điểm tổ chức', 'Chi phí trung bình'];

export function QuickHints({ onSelectHint }: QuickHintsProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Gợi ý nhanh</h3>
      <div className="flex flex-wrap gap-2">
        {QUICK_HINTS.map(hint => (
          <button
            key={hint}
            onClick={() => onSelectHint(hint)}
            className="px-4 py-2 bg-gray-50 rounded-full text-xs text-gray-600 font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors border border-gray-100"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
