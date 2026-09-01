import { BookOpen, Sparkles, Store, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openContextualAssistant } from '../../chat/openAssistant';
import { ROUTES } from '../../../shared/config/routes';
import { DashboardProgressSummary, ProgressGreeting } from '../types';

interface DashboardHeaderProps {
  greeting: ProgressGreeting;
  progress: DashboardProgressSummary;
}

export function DashboardHeader({ greeting, progress }: DashboardHeaderProps) {
  return (
    <div className="mb-8 bg-white rounded-3xl border border-rose-100/50 p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFFFF]/20 rounded-full blur-2xl" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#F2BFC8]/5 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div>
          <span className="text-[10px] font-bold text-[#F2BFC8] bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
            Tiến Trình Hành Trình
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2C40] mb-1 font-serif">
            {greeting.title}
          </h1>
          <p className="text-xs text-[#1B2C40]/70">{greeting.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={ROUTES.explore} className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1B2C40] hover:bg-rose-100 transition-colors">
              <Store className="w-3.5 h-3.5 text-[#F2BFC8]" /> Dịch vụ
            </Link>
            <button
              type="button"
              onClick={() => openContextualAssistant()}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1B2C40] hover:bg-rose-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2BFC8]" /> Tư vấn AI
            </button>
            <Link to={ROUTES.guide} className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1B2C40] hover:bg-rose-100 transition-colors">
              <BookOpen className="w-3.5 h-3.5 text-[#F2BFC8]" /> Cẩm nang
            </Link>
          </div>
        </div>
        <span className="text-xs text-gray-500 font-bold flex items-center gap-1 shrink-0 bg-rose-50/50 px-3 py-1.5 rounded-full border border-rose-100/50">
          <Trophy className="w-3.5 h-3.5 text-[#F2BFC8] fill-rose-50" />
          {progress.completedTasksCount}/{progress.totalTasksCount} Nhiệm vụ
        </span>
      </div>

      <div className="w-full relative z-10 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-[#1B2C40]">
          <span>Tiến độ chuẩn bị của bạn</span>
          <span className="text-[#F2BFC8]">{progress.progressPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-rose-100/20">
          <div
            className="h-full bg-gradient-to-r from-[#F2BFC8] to-orange-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
