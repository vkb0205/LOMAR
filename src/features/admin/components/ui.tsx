import React from 'react';

// Shared admin UI primitives — small, dependency-free building blocks used
// across every admin panel so the panels stay focused on data + actions.

// ----------------------------------------------------------------------------
// StatusBadge — colored pill for a status string
// ----------------------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
  // positive / active
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  booked: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  unlocked: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  redeemed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  // neutral / pending
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  new: 'bg-blue-50 text-blue-700 border-blue-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
  queued: 'bg-blue-50 text-blue-700 border-blue-100',
  running: 'bg-blue-50 text-blue-700 border-blue-100',
  contacted: 'bg-blue-50 text-blue-700 border-blue-100',
  quoted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  locked: 'bg-gray-100 text-gray-600 border-gray-200',
  customer: 'bg-gray-100 text-gray-600 border-gray-200',
  vendor: 'bg-purple-50 text-purple-700 border-purple-100',
  // negative / warning
  hidden: 'bg-gray-200 text-gray-700 border-gray-300',
  flagged: 'bg-rose-50 text-rose-700 border-rose-100',
  suspended: 'bg-rose-50 text-rose-700 border-rose-100',
  archived: 'bg-gray-200 text-gray-700 border-gray-300',
  failed: 'bg-rose-50 text-rose-700 border-rose-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  closed: 'bg-gray-200 text-gray-700 border-gray-300',
  expired: 'bg-rose-50 text-rose-700 border-rose-100',
  skipped: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status || 'unknown').toLowerCase();
  const style = STATUS_STYLES[key] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style}`}
    >
      {status || '—'}
    </span>
  );
}

// ----------------------------------------------------------------------------
// AdminActionButton — compact action button with variants
// ----------------------------------------------------------------------------

type Variant = 'primary' | 'neutral' | 'danger' | 'ghost';

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-[#1B2C40] text-white hover:bg-[#F2BFC8]',
  neutral: 'bg-white text-[#1B2C40] border border-gray-200 hover:bg-gray-50',
  danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
  ghost: 'text-[#1B2C40]/60 hover:text-[#1B2C40] hover:bg-gray-100',
};

export function AdminActionButton({
  children,
  onClick,
  variant = 'neutral',
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </button>
  );
}

// ----------------------------------------------------------------------------
// PanelHeader — title + optional description + right-side actions
// ----------------------------------------------------------------------------

export function PanelHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1B2C40]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[#1B2C40]/60 mt-1">{description}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// AdminCard — white rounded container
// ----------------------------------------------------------------------------

export function AdminCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-rose-100/50 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

// ----------------------------------------------------------------------------
// LoadingRow / EmptyRow — table body states
// ----------------------------------------------------------------------------

export function LoadingBlock({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-[#1B2C40]/50">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#F2BFC8]" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

export function EmptyBlock({ label = 'Không có dữ liệu' }: { label?: string }) {
  return (
    <div className="w-full py-16 flex items-center justify-center text-xs text-[#1B2C40]/40 font-medium">
      {label}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ConfirmDialog — inline modal for destructive/confirmable actions
// ----------------------------------------------------------------------------

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-serif font-bold text-[#1B2C40] mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#1B2C40]/70 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1B2C40]/60 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer ${
              danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-[#1B2C40] hover:bg-[#F2BFC8]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Toolbar helpers: SearchInput + FilterSelect
// ----------------------------------------------------------------------------

export function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] placeholder:text-[#1B2C40]/40 outline-none focus:border-[#F2BFC8] transition-colors w-full sm:w-64"
    />
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8] transition-colors cursor-pointer bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ----------------------------------------------------------------------------
// formatting helpers
// ----------------------------------------------------------------------------

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function shortId(value: string | null | undefined): string {
  return value ? value.slice(0, 8) : '—';
}
