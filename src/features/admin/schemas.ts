import { z } from 'zod';
import type { Database } from '../../shared/types/database';

type JourneyTaskInsert =
  Database['public']['Tables']['journey_tasks']['Insert'];
type JourneyTaskUpdate =
  Database['public']['Tables']['journey_tasks']['Update'];
type VoucherInsert = Database['public']['Tables']['vouchers']['Insert'];
type VoucherUpdate = Database['public']['Tables']['vouchers']['Update'];

const codeSchema = z.string().trim().min(1).max(64);
const titleSchema = z.string().trim().min(1).max(200);
const descriptionSchema = z.string().trim().max(2_000).nullable().optional();

const journeyTaskFields = {
  code: codeSchema,
  name: titleSchema,
  description: descriptionSchema,
  is_mandatory: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
};

export const journeyTaskInsertSchema = z.strictObject(journeyTaskFields);
export const journeyTaskUpdateSchema = z
  .strictObject(journeyTaskFields)
  .partial();

const voucherFields = {
  vendor_id: z.string().nullable().optional(),
  code: codeSchema,
  title: titleSchema,
  description: descriptionSchema,
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().nonnegative(),
  min_order_value: z.number().nonnegative().nullable().optional(),
  required_task_id: z.string().nullable().optional(),
  starts_at: z.string().datetime({ offset: true }).nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).nullable().optional(),
  max_redemptions: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
};

function validatePercentageDiscount(
  value: {
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
  },
  context: z.RefinementCtx
) {
  if (
    value.discount_type === 'percentage' &&
    value.discount_value !== undefined &&
    value.discount_value > 100
  ) {
    context.addIssue({
      code: 'custom',
      path: ['discount_value'],
      message: 'Percentage discount cannot exceed 100.',
    });
  }
}

export const voucherInsertSchema = z
  .strictObject(voucherFields)
  .superRefine(validatePercentageDiscount);
export const voucherUpdateSchema = z
  .strictObject(voucherFields)
  .partial()
  .superRefine(validatePercentageDiscount);

function parsePayload<Payload>(
  schema: z.ZodType<Payload>,
  payload: unknown
): Payload {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;

  const firstIssue = result.error.issues[0];
  const field = firstIssue?.path.join('.');
  throw new Error(
    `Dữ liệu không hợp lệ${field ? ` (${field})` : ''}: ${
      firstIssue?.message ?? 'Không xác định'
    }`
  );
}

export function parseJourneyTaskInsert(
  payload: JourneyTaskInsert
): JourneyTaskInsert {
  return parsePayload(journeyTaskInsertSchema, payload);
}

export function parseJourneyTaskUpdate(
  payload: JourneyTaskUpdate
): JourneyTaskUpdate {
  return parsePayload(journeyTaskUpdateSchema, payload);
}

export function parseVoucherInsert(payload: VoucherInsert): VoucherInsert {
  return parsePayload(voucherInsertSchema, payload);
}

export function parseVoucherUpdate(payload: VoucherUpdate): VoucherUpdate {
  return parsePayload(voucherUpdateSchema, payload);
}
