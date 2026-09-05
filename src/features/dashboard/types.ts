import { Database } from '../../shared/types/database';

export type JourneyTaskRow = Database['public']['Tables']['journey_tasks']['Row'];
export type UserJourneyTaskRow = Database['public']['Tables']['user_journey_tasks']['Row'];
export type VoucherRow = Database['public']['Tables']['vouchers']['Row'];
export type UserVoucherRow = Database['public']['Tables']['user_vouchers']['Row'];

export type DashboardStatus = 'pending' | 'completed';
export type VoucherStatus = 'locked' | 'unlocked' | 'redeemed' | string;

export interface DashboardTask {
  taskId: string;
  name: string;
  isMandatory: boolean;
  status: DashboardStatus;
}

export interface DashboardVoucher {
  voucherId: string;
  title: string;
  discountValue: string;
  status: VoucherStatus;
  requiredTaskId: string | null;
}

export interface DashboardData {
  tasks: DashboardTask[];
  vouchers: DashboardVoucher[];
}

export interface DashboardProgressSummary {
  totalTasksCount: number;
  completedTasksCount: number;
  progressPercentage: number;
}

export interface ProgressGreeting {
  title: string;
  desc: string;
}

export interface DemoLoginAccount {
  label: string;
  email: string;
  password: string;
}
