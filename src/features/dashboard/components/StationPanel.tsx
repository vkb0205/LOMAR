import { ArrowRight, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { DashboardStation } from '../constants';
import { DashboardTask, SavedDesign } from '../types';
import { formatDesignDate } from '../utils/designs';

interface StationPanelProps {
  designs: SavedDesign[];
  station: DashboardStation;
  task: DashboardTask | undefined;
  onToggleTask: (task: DashboardTask) => void;
}

export function StationPanel({ designs, station, task, onToggleTask }: StationPanelProps) {
  const isCompleted = task?.status === 'completed';
  const Icon = station.icon;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFFFF]/10 rounded-full blur-2xl" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-rose-50/50 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${station.bgGradient} border border-rose-50 shadow-sm ${station.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${station.badgeBg} px-2.5 py-0.5 rounded-full`}>
              {station.category}
            </span>
            <h2 className="text-xl font-bold text-[#1B2C40] font-serif mt-1">{station.name}</h2>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-center self-start md:self-auto ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-[#F2BFC8] border border-rose-100/30'
          }`}
        >
          {isCompleted ? 'Trạng thái: Đã hoàn thành' : 'Trạng thái: Đang chờ'}
        </span>
      </div>

      <div className="space-y-6">
        <p className="text-xs text-[#1B2C40]/70 leading-relaxed font-medium">{station.description}</p>

        <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isCompleted
          ? 'bg-emerald-50/30 border-emerald-100/50'
          : 'bg-rose-50/10 border-rose-100/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => task && onToggleTask(task)}
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-sm active:scale-95 ${isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-rose-300 hover:border-[#F2BFC8] bg-white'
                }`}
            >
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
            </button>
            <div>
              <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-800' : 'text-[#1B2C40]'}`}>
                {task?.name || 'Nhiệm vụ'}
              </h4>
              <span className="text-[10px] text-gray-400 font-medium">
                {task?.isMandatory ? 'Yêu cầu Bắt buộc • Hoàn thành để nhận ưu đãi' : 'Tùy chọn'}
              </span>
            </div>
          </div>
        </div>

        {station.id !== 'T01' && (
          <SavedDesignsSection designs={designs} station={station} />
        )}
      </div>
    </div>
  );
}

interface SavedDesignsSectionProps {
  designs: SavedDesign[];
  station: DashboardStation;
}

function SavedDesignsSection({ designs, station }: SavedDesignsSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <h4 className="text-xs font-bold uppercase text-[#1B2C40] tracking-wider flex items-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-[#F2BFC8] fill-rose-100" />
        Bản vẽ custom đã lưu tại {station.name}
      </h4>

      {designs.length === 0 ? (
        <div className="border border-dashed border-rose-100 rounded-2xl p-8 text-center bg-rose-50/10">
          <Sparkles className="w-6 h-6 mx-auto text-[#F2BFC8]/70 mb-3 animate-pulse" />
          <p className="text-xs text-gray-500 font-medium mb-4">Chưa có thiết kế độc bản nào tại ga này</p>
          <a
            href={station.ctaLink}
            className="inline-flex items-center px-5 py-2.5 bg-[#F2BFC8] text-white text-[10px] font-bold rounded-full uppercase tracking-wider hover:bg-rose-400 shadow-md transition-all active:scale-95"
          >
            {station.ctaText}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designs.map(design => (
            <SavedDesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SavedDesignCardProps {
  design: SavedDesign;
}

function SavedDesignCard({ design }: SavedDesignCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-rose-50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-extrabold uppercase bg-rose-50 text-[#F2BFC8] px-2.5 py-1 rounded-full tracking-wider">
          {design.category}
        </span>
        <span className="text-[10px] text-gray-400">{formatDesignDate(design.created_at)}</span>
      </div>
      <h5 className="font-serif font-bold text-sm text-[#1B2C40] mb-2 leading-tight">
        {design.title || `Bản vẽ ${design.category}`}
      </h5>
      <div className="pt-3 border-t border-rose-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Trạng thái</span>
          <span className="text-xs font-extrabold text-[#F2BFC8]">{design.status}</span>
        </div>
        <div className="w-7 h-7 rounded-full border border-rose-100 flex items-center justify-center text-[#F2BFC8] group-hover:scale-105 transition-transform bg-rose-50/20">
          <Heart className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
    </div>
  );
}
