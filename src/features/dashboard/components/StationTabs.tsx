import { CheckCircle2 } from 'lucide-react';
import { DashboardStation, DashboardStationId } from '../constants';
import { DashboardTask } from '../types';

interface StationTabsProps {
  activeStationId: DashboardStationId;
  stations: DashboardStation[];
  tasks: DashboardTask[];
  onChange: (stationId: DashboardStationId) => void;
}

export function StationTabs({ activeStationId, stations, tasks, onChange }: StationTabsProps) {
  return (
    <div className="flex bg-white rounded-2xl shadow-sm p-1.5 border border-rose-100/50 overflow-x-auto no-scrollbar gap-1.5">
      {stations.map(station => {
        const task = tasks.find(item => item.taskId === station.id);
        const isCompleted = task?.status === 'completed';
        const isActive = activeStationId === station.id;
        const Icon = station.icon;

        return (
          <button
            key={station.id}
            onClick={() => onChange(station.id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${isActive
              ? 'bg-[#F2BFC8] text-white shadow-md border-[#F2BFC8]'
              : 'bg-white hover:bg-rose-50/30 text-[#1B2C40] border-transparent hover:border-rose-100'
              }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : station.color}`} />
            <span>{station.name}</span>
            {isCompleted && (
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500 fill-white'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
