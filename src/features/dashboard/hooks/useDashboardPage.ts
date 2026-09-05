import { useCallback, useEffect, useMemo, useState } from 'react';
import { DASHBOARD_STATIONS, DASHBOARD_STATION_IDS } from '../constants';
import {
  celebrateTaskCompletion,
  fetchDashboardData,
  updateUserJourneyTaskStatus,
  updateUserVoucherStatus,
} from '../services/dashboardService';
import { DashboardTask, DashboardVoucher } from '../types';
import { calculateDashboardProgress, getProgressGreeting } from '../utils/dashboardProgress';

interface UseDashboardPageOptions {
  userId: string | null;
  stationParam: string | null;
}

export function useDashboardPage({
  userId,
  stationParam,
}: UseDashboardPageOptions) {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [vouchers, setVouchers] = useState<DashboardVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStationId, setActiveStationId] = useState(DASHBOARD_STATIONS[0].id);

  useEffect(() => {
    if (stationParam && DASHBOARD_STATION_IDS.includes(stationParam as (typeof DASHBOARD_STATION_IDS)[number])) {
      setActiveStationId(stationParam as (typeof DASHBOARD_STATION_IDS)[number]);
    }
  }, [stationParam]);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData(userId);

        if (!isActive) return;

        setTasks(dashboardData.tasks);
        setVouchers(dashboardData.vouchers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const progress = useMemo(() => calculateDashboardProgress(tasks), [tasks]);
  const greeting = useMemo(() => getProgressGreeting(progress.progressPercentage), [progress.progressPercentage]);
  const activeStation = useMemo(
    () => DASHBOARD_STATIONS.find(station => station.id === activeStationId) || DASHBOARD_STATIONS[0],
    [activeStationId]
  );

  const toggleTaskStatus = useCallback(
    async (task: DashboardTask) => {
      const newStatus: DashboardTask['status'] = task.status === 'completed' ? 'pending' : 'completed';
      const dependentVouchers = vouchers.filter(voucher => voucher.requiredTaskId === task.taskId);

      setTasks(previousTasks =>
        previousTasks.map(previousTask =>
          previousTask.taskId === task.taskId ? { ...previousTask, status: newStatus } : previousTask
        )
      );

      if (!userId) return;

      try {
        await updateUserJourneyTaskStatus(userId, task.taskId, newStatus);

        for (const voucher of dependentVouchers) {
          const newVoucherStatus = newStatus === 'completed' ? 'unlocked' : 'locked';
          await updateUserVoucherStatus(userId, voucher.voucherId, newVoucherStatus);
          setVouchers(previousVouchers =>
            previousVouchers.map(previousVoucher =>
              previousVoucher.voucherId === voucher.voucherId
                ? { ...previousVoucher, status: newVoucherStatus }
                : previousVoucher
            )
          );
        }

        if (newStatus === 'completed') {
          celebrateTaskCompletion();
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái nhiệm vụ:', error);
      }
    },
    [userId, vouchers]
  );

  return {
    activeStation,
    activeStationId,
    greeting,
    loading,
    progress,
    setActiveStationId,
    stations: DASHBOARD_STATIONS,
    tasks,
    toggleTaskStatus,
    vouchers,
  };
}
