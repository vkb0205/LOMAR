import confetti from 'canvas-confetti';
import { supabase } from '../../../shared/api/supabaseClient';
import { Database } from '../../../shared/types/database';
import {
  DashboardData,
  DashboardTask,
  DashboardVoucher,
  JourneyTaskRow,
  UserJourneyTaskRow,
  UserVoucherRow,
  VoucherRow,
} from '../types';

function normalizeTaskStatus(status: string | null | undefined): DashboardTask['status'] {
  return status?.toLowerCase() === 'completed' ? 'completed' : 'pending';
}

function mapDashboardTasks(
  journeyTasks: JourneyTaskRow[] | null,
  userTasks: UserJourneyTaskRow[] | null
): DashboardTask[] {
  return (journeyTasks ?? []).map(task => {
    const progress = userTasks?.find(userTask => userTask.task_id === task.id);

    return {
      taskId: task.id,
      name: task.name || 'Nhiệm vụ',
      isMandatory: task.is_mandatory || false,
      status: normalizeTaskStatus(progress?.status),
    };
  });
}

function mapDashboardVouchers(
  vouchers: VoucherRow[] | null,
  userVouchers: UserVoucherRow[] | null
): DashboardVoucher[] {
  return (vouchers ?? []).map(voucher => {
    const userVoucher = userVouchers?.find(item => item.voucher_id === voucher.id);

    return {
      voucherId: voucher.id,
      title: voucher.title || 'Voucher',
      discountValue: voucher.discount_value?.toString() || '',
      status: userVoucher ? userVoucher.status?.toLowerCase() : 'locked',
      requiredTaskId: voucher.required_task_id || null,
    };
  });
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [journeyTasksResult, userTasksResult, vouchersResult, userVouchersResult, savedDesignsResult] = await Promise.all([
    supabase.from('journey_tasks').select('*'),
    supabase.from('user_journey_tasks').select('*').eq('user_id', userId),
    supabase.from('vouchers').select('*'),
    supabase.from('user_vouchers').select('*').eq('user_id', userId),
    supabase
      .from('ai_design_projects')
      .select('id, title, category, status, created_at')
      .eq('user_id', userId),
  ]);

  if (journeyTasksResult.error) throw journeyTasksResult.error;
  if (userTasksResult.error) throw userTasksResult.error;
  if (vouchersResult.error) throw vouchersResult.error;
  if (userVouchersResult.error) throw userVouchersResult.error;
  if (savedDesignsResult.error) throw savedDesignsResult.error;

  return {
    tasks: mapDashboardTasks(journeyTasksResult.data, userTasksResult.data),
    vouchers: mapDashboardVouchers(vouchersResult.data, userVouchersResult.data),
    savedDesigns: savedDesignsResult.data ?? [],
  };
}

export async function updateUserJourneyTaskStatus(
  userId: string,
  taskId: string,
  status: DashboardTask['status']
): Promise<void> {
  const payload: Database['public']['Tables']['user_journey_tasks']['Insert'] = {
    user_id: userId,
    task_id: taskId,
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_journey_tasks')
    .upsert<Database['public']['Tables']['user_journey_tasks']['Insert']>(payload, {
      onConflict: 'user_id,task_id',
    });

  if (error) throw error;
}

export async function updateUserVoucherStatus(
  userId: string,
  voucherId: string,
  status: 'locked' | 'unlocked'
): Promise<void> {
  const payload: Database['public']['Tables']['user_vouchers']['Insert'] = {
    user_id: userId,
    voucher_id: voucherId,
    status,
    unlocked_at: status === 'unlocked' ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from('user_vouchers')
    .upsert<Database['public']['Tables']['user_vouchers']['Insert']>(payload, {
      onConflict: 'user_id,voucher_id',
    });

  if (error) throw error;
}

export function celebrateTaskCompletion(): void {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#F2BFC8', '#FFFFFF', '#1B2C40', '#FFFFFF'],
  });
}
