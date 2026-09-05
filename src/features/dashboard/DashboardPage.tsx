import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import { DashboardHeader } from './components/DashboardHeader';
import { LoginGate } from './components/LoginGate';
import { StationPanel } from './components/StationPanel';
import { StationTabs } from './components/StationTabs';
import { VoucherWallet } from './components/VoucherWallet';
import { useDashboardPage } from './hooks/useDashboardPage';

export default function Dashboard() {
  const { user, signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = user?.id ?? null;

  const dashboard = useDashboardPage({
    userId,
    stationParam: searchParams.get('station'),
  });

  if (!user) {
    return <LoginGate onDemoSignIn={(email, password) => void signIn(email, password)} />;
  }

  const activeTask = dashboard.tasks.find(task => task.taskId === dashboard.activeStation.id);

  return (
    <div className="w-full flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 bg-[#FFFFFF]">
      <DashboardHeader greeting={dashboard.greeting} progress={dashboard.progress} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[68%] flex flex-col gap-6">
          <StationTabs
            activeStationId={dashboard.activeStationId}
            stations={dashboard.stations}
            tasks={dashboard.tasks}
            onChange={dashboard.setActiveStationId}
          />

          <StationPanel
            station={dashboard.activeStation}
            task={activeTask}
            onToggleTask={dashboard.toggleTaskStatus}
          />
        </div>

        <div className="w-full lg:w-[32%] shrink-0">
          <VoucherWallet
            loading={dashboard.loading}
            tasks={dashboard.tasks}
            vouchers={dashboard.vouchers}
          />
        </div>
      </div>
    </div>
  );
}
