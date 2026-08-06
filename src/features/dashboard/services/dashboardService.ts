import confetti from 'canvas-confetti';
import { getJson, putJson } from '../../../shared/api/backendClient';
import { resolveDataEndpoint } from '../../../shared/api/backendConfig';
import { DashboardData, DashboardTask } from '../types';

/**
 * Dashboard data now comes from `GET /api/v1/me/dashboard`, which performs the
 * journey-task/voucher join and status normalization server-side (FR-001,
 * FR-007). The owner is derived from the verified JWT, so no `userId` is sent
 * in the request — the parameter is kept only so existing call sites compile
 * unchanged, and is deliberately unused.
 */
export async function fetchDashboardData(_userId?: string): Promise<DashboardData> {
  return getJson<DashboardData>(resolveDataEndpoint('/api/v1/me/dashboard'));
}

export async function updateUserJourneyTaskStatus(
  _userId: string,
  taskId: string,
  status: DashboardTask['status']
): Promise<void> {
  await putJson<{ ok: boolean }>(
    resolveDataEndpoint(`/api/v1/me/journey-tasks/${encodeURIComponent(taskId)}`),
    { body: { status } }
  );
}

export async function updateUserVoucherStatus(
  _userId: string,
  voucherId: string,
  status: 'locked' | 'unlocked'
): Promise<void> {
  await putJson<{ ok: boolean }>(
    resolveDataEndpoint(`/api/v1/me/vouchers/${encodeURIComponent(voucherId)}`),
    { body: { status } }
  );
}

/** Purely a UI effect, so it stays client-side (contracts/dashboard.md). */
export function celebrateTaskCompletion(): void {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#F2BFC8', '#FFFFFF', '#1B2C40', '#FFFFFF'],
  });
}
