import { MannequinType, ServiceRow, VendorRow } from '../types';

interface PreviewHeaderProps {
  activeService?: ServiceRow;
  activeTab: string;
  selectedMannequin: MannequinType;
  vendorInfo: VendorRow | null;
  onMannequinChange: (mannequin: MannequinType) => void;
}

export function PreviewHeader({
  activeService,
  activeTab,
  selectedMannequin,
  vendorInfo,
  onMannequinChange,
}: PreviewHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1B2C40]">
          {activeService?.name || activeTab}
        </h1>
        {vendorInfo && (
          <p className="text-xs text-[#ddb983] font-bold uppercase tracking-widest mt-1">
            Bởi {vendorInfo.name}
          </p>
        )}
      </div>
      <div className="flex bg-white rounded-full shadow-sm p-1 border border-rose-100 self-start">
        <MannequinButton
          isActive={selectedMannequin === 'female'}
          label="Nữ"
          onClick={() => onMannequinChange('female')}
        />
        <MannequinButton
          isActive={selectedMannequin === 'male'}
          label="Nam"
          onClick={() => onMannequinChange('male')}
        />
      </div>
    </div>
  );
}

function MannequinButton({ isActive, label, onClick }: { isActive: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? 'bg-[#ffe9c9] text-[#1B2C40] shadow-inner' : 'text-[#1B2C40] hover:text-[#ddb983]'}`}
    >
      {label}
    </button>
  );
}
