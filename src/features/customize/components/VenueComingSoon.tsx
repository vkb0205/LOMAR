export function VenueComingSoon() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-24 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FAF6EE] border border-rose-100 mb-8">
        <span className="text-4xl">🏛️</span>
      </div>
      <h2 className="text-4xl font-serif font-bold text-[#1B2C40] mb-4 tracking-wide">SẮP RA MẮT</h2>
      <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
        Tính năng tùy chỉnh Venue đang được phát triển.
        Bé Song sẽ sớm ra mắt trong thời gian tới!
      </p>
      <div className="mt-10 flex gap-3">
        <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full bg-[#ffdb9f] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
