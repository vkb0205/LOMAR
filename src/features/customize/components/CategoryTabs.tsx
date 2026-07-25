interface CategoryTabsProps {
  activeTab: string;
  tabs: string[];
  onChange: (tab: string) => void;
}

export function CategoryTabs({ activeTab, tabs, onChange }: CategoryTabsProps) {
  return (
    <div className="max-w-[1200px] w-full mx-auto mb-6 flex justify-center overflow-x-auto no-scrollbar py-2">
      <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap uppercase ${activeTab === tab ? 'bg-[#ffe9c9] text-[#1B2C40] shadow-inner' : 'bg-transparent text-[#1B2C40] hover:text-[#ddb983]'}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
