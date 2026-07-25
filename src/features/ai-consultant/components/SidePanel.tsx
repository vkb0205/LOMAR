import { ServiceRow } from '../types';
import { QuickHints } from './QuickHints';
import { SuggestedServiceCard } from './SuggestedServiceCard';

interface SidePanelProps {
  suggestedService: ServiceRow | null;
  onSelectHint: (hint: string) => void;
}

export function SidePanel({ suggestedService, onSelectHint }: SidePanelProps) {
  return (
    <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-6 overflow-y-auto">
      {suggestedService && <SuggestedServiceCard service={suggestedService} />}
      <QuickHints onSelectHint={onSelectHint} />
    </div>
  );
}
