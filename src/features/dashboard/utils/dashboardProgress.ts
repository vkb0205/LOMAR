import { DashboardProgressSummary, DashboardTask, ProgressGreeting } from '../types';

export function calculateDashboardProgress(tasks: DashboardTask[]): DashboardProgressSummary {
  const totalTasksCount = tasks.length || 4;
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100) || 0;

  return {
    totalTasksCount,
    completedTasksCount,
    progressPercentage,
  };
}

export function getProgressGreeting(progressPercentage: number): ProgressGreeting {
  if (progressPercentage === 0) {
    return {
      title: 'Chào bạn! Hãy bắt đầu hành trình nhé! 🗺️',
      desc: 'Phố Hạnh Phúc đồng hành cùng bạn trên từng chặng đường chuẩn bị cho đám cưới trong mơ!',
    };
  }

  if (progressPercentage < 50) {
    return {
      title: 'Khởi đầu tuyệt vời! 🚀',
      desc: 'Bạn đã hoàn thành những bước đầu tiên. Bé Song Hỷ sẽ tiếp tục trợ giúp bạn!',
    };
  }

  if (progressPercentage < 100) {
    return {
      title: 'Đang tiến rất gần đích rồi! 💪',
      desc: 'Chỉ còn một vài công việc nữa thôi là ngày trọng đại của bạn sẽ hoàn toàn sẵn sàng!',
    };
  }

  return {
    title: 'Tất cả đã sẵn sàng! 🎉 Chúc mừng bạn!',
    desc: 'Hành trình chuẩn bị đã hoàn tất 100%. Chúc bạn và người thương một đám cưới viên mãn!',
  };
}
