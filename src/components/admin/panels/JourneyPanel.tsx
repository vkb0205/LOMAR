import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, Plus, Pencil, Route as RouteIcon, Ticket } from 'lucide-react';
import {
  fetchJourneyTasks,
  createJourneyTask,
  updateJourneyTask,
  deleteJourneyTask,
  fetchVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../../lib/admin';
import { Database } from '../../../types/database';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  StatusBadge,
  AdminActionButton,
  ConfirmDialog,
  formatDate,
} from '../ui';

type JourneyTaskRow = Database['public']['Tables']['journey_tasks']['Row'];
type VoucherRow = Database['public']['Tables']['vouchers']['Row'];

type Tab = 'tasks' | 'vouchers';

// Local editable shapes for the modal forms.
interface TaskForm {
  id?: string;
  code: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  display_order: number;
  active: boolean;
}

interface VoucherForm {
  id?: string;
  code: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  required_task_id: string;
  expires_at: string;
  active: boolean;
}

const EMPTY_TASK: TaskForm = {
  code: '',
  name: '',
  description: '',
  is_mandatory: false,
  display_order: 0,
  active: true,
};

const EMPTY_VOUCHER: VoucherForm = {
  code: '',
  title: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  required_task_id: '',
  expires_at: '',
  active: true,
};

export default function JourneyPanel() {
  const [tab, setTab] = useState<Tab>('tasks');
  const [tasks, setTasks] = useState<JourneyTaskRow[]>([]);
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState<TaskForm | null>(null);
  const [voucherForm, setVoucherForm] = useState<VoucherForm | null>(null);
  const [deleteTask, setDeleteTask] = useState<JourneyTaskRow | null>(null);
  const [deleteVoucher_, setDeleteVoucher_] = useState<VoucherRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, v] = await Promise.all([fetchJourneyTasks(), fetchVouchers()]);
      setTasks(t);
      setVouchers(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ----- Task save -----
  const saveTask = async () => {
    if (!taskForm) return;
    setBusy(true);
    setError(null);
    try {
      if (taskForm.id) {
        await updateJourneyTask(taskForm.id, {
          code: taskForm.code,
          name: taskForm.name,
          description: taskForm.description || null,
          is_mandatory: taskForm.is_mandatory,
          display_order: taskForm.display_order,
          active: taskForm.active,
        });
      } else {
        await createJourneyTask({
          code: taskForm.code,
          name: taskForm.name,
          description: taskForm.description || null,
          is_mandatory: taskForm.is_mandatory,
          display_order: taskForm.display_order,
          active: taskForm.active,
        });
      }
      setTaskForm(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTask) return;
    setBusy(true);
    try {
      await deleteJourneyTask(deleteTask.id);
      setTasks((prev) => prev.filter((r) => r.id !== deleteTask.id));
      setDeleteTask(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setBusy(false);
    }
  };

  // ----- Voucher save -----
  const saveVoucher = async () => {
    if (!voucherForm) return;
    setBusy(true);
    setError(null);
    try {
      const payload = {
        code: voucherForm.code,
        title: voucherForm.title,
        description: voucherForm.description || null,
        discount_type: voucherForm.discount_type,
        discount_value: voucherForm.discount_value,
        required_task_id: voucherForm.required_task_id || null,
        expires_at: voucherForm.expires_at
          ? new Date(voucherForm.expires_at).toISOString()
          : null,
        active: voucherForm.active,
      };
      if (voucherForm.id) {
        await updateVoucher(voucherForm.id, payload);
      } else {
        await createVoucher(payload);
      }
      setVoucherForm(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteVoucher = async () => {
    if (!deleteVoucher_) return;
    setBusy(true);
    try {
      await deleteVoucher(deleteVoucher_.id);
      setVouchers((prev) => prev.filter((r) => r.id !== deleteVoucher_.id));
      setDeleteVoucher_(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setBusy(false);
    }
  };

  const taskName = (id: string | null) =>
    id ? tasks.find((t) => t.id === id)?.name || '—' : '—';

  return (
    <div>
      <PanelHeader
        title="Hành trình & Ưu đãi"
        description="Cấu hình các bước trong hành trình và voucher thưởng"
        right={
          tab === 'tasks' ? (
            <AdminActionButton
              variant="primary"
              onClick={() => setTaskForm({ ...EMPTY_TASK, display_order: tasks.length })}
            >
              <Plus className="w-3.5 h-3.5" /> Thêm bước
            </AdminActionButton>
          ) : (
            <AdminActionButton
              variant="primary"
              onClick={() => setVoucherForm({ ...EMPTY_VOUCHER })}
            >
              <Plus className="w-3.5 h-3.5" /> Thêm voucher
            </AdminActionButton>
          )
        }
      />

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab('tasks')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'tasks'
              ? 'bg-[#1B2C40] text-white'
              : 'bg-white text-[#1B2C40]/60 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <RouteIcon className="w-4 h-4" /> Bước hành trình ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('vouchers')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'vouchers'
              ? 'bg-[#1B2C40] text-white'
              : 'bg-white text-[#1B2C40]/60 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Ticket className="w-4 h-4" /> Voucher ({vouchers.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : tab === 'tasks' ? (
          tasks.length === 0 ? (
            <EmptyBlock label="Chưa có bước hành trình" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-[#1B2C40]/40 border-b border-gray-100">
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Mã</th>
                    <th className="px-4 py-3 font-bold">Tên bước</th>
                    <th className="px-4 py-3 font-bold">Bắt buộc</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-[#1B2C40]/50">
                        {row.display_order}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#1B2C40]/70">
                        {row.code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1B2C40]">{row.name}</p>
                        {row.description && (
                          <p className="text-[11px] text-[#1B2C40]/50 line-clamp-1">
                            {row.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.is_mandatory ? (
                          <span className="text-[11px] font-bold text-rose-600">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#1B2C40]/40">
                            Tùy chọn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.active ? 'active' : 'draft'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <AdminActionButton
                            variant="neutral"
                            onClick={() =>
                              setTaskForm({
                                id: row.id,
                                code: row.code,
                                name: row.name,
                                description: row.description || '',
                                is_mandatory: row.is_mandatory,
                                display_order: row.display_order,
                                active: row.active,
                              })
                            }
                            title="Sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </AdminActionButton>
                          <AdminActionButton
                            variant="danger"
                            onClick={() => setDeleteTask(row)}
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </AdminActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : vouchers.length === 0 ? (
          <EmptyBlock label="Chưa có voucher" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#1B2C40]/40 border-b border-gray-100">
                  <th className="px-4 py-3 font-bold">Mã</th>
                  <th className="px-4 py-3 font-bold">Tiêu đề</th>
                  <th className="px-4 py-3 font-bold">Giảm giá</th>
                  <th className="px-4 py-3 font-bold">Mở khóa bởi</th>
                  <th className="px-4 py-3 font-bold">Hết hạn</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#1B2C40]/70">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1B2C40]">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-[#1B2C40]/70">
                      {row.discount_type === 'percentage'
                        ? `${row.discount_value}%`
                        : `${row.discount_value.toLocaleString('vi-VN')}₫`}
                    </td>
                    <td className="px-4 py-3 text-[#1B2C40]/60 text-xs">
                      {taskName(row.required_task_id)}
                    </td>
                    <td className="px-4 py-3 text-[#1B2C40]/60 text-xs">
                      {formatDate(row.expires_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.active ? 'active' : 'draft'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <AdminActionButton
                          variant="neutral"
                          onClick={() =>
                            setVoucherForm({
                              id: row.id,
                              code: row.code,
                              title: row.title,
                              description: row.description || '',
                              discount_type: row.discount_type,
                              discount_value: row.discount_value,
                              required_task_id: row.required_task_id || '',
                              expires_at: row.expires_at
                                ? row.expires_at.slice(0, 10)
                                : '',
                              active: row.active,
                            })
                          }
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </AdminActionButton>
                        <AdminActionButton
                          variant="danger"
                          onClick={() => setDeleteVoucher_(row)}
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Task form modal */}
      {taskForm && (
        <FormModal
          title={taskForm.id ? 'Sửa bước hành trình' : 'Thêm bước hành trình'}
          onClose={() => setTaskForm(null)}
          onSave={saveTask}
          busy={busy}
        >
          <FieldText
            label="Mã (code)"
            value={taskForm.code}
            onChange={(v) => setTaskForm({ ...taskForm, code: v })}
          />
          <FieldText
            label="Tên bước"
            value={taskForm.name}
            onChange={(v) => setTaskForm({ ...taskForm, name: v })}
          />
          <FieldTextarea
            label="Mô tả"
            value={taskForm.description}
            onChange={(v) => setTaskForm({ ...taskForm, description: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldNumber
              label="Thứ tự"
              value={taskForm.display_order}
              onChange={(v) => setTaskForm({ ...taskForm, display_order: v })}
            />
            <div className="flex flex-col gap-2 pt-6">
              <FieldCheckbox
                label="Bắt buộc"
                checked={taskForm.is_mandatory}
                onChange={(v) => setTaskForm({ ...taskForm, is_mandatory: v })}
              />
              <FieldCheckbox
                label="Kích hoạt"
                checked={taskForm.active}
                onChange={(v) => setTaskForm({ ...taskForm, active: v })}
              />
            </div>
          </div>
        </FormModal>
      )}

      {/* Voucher form modal */}
      {voucherForm && (
        <FormModal
          title={voucherForm.id ? 'Sửa voucher' : 'Thêm voucher'}
          onClose={() => setVoucherForm(null)}
          onSave={saveVoucher}
          busy={busy}
        >
          <FieldText
            label="Mã voucher"
            value={voucherForm.code}
            onChange={(v) => setVoucherForm({ ...voucherForm, code: v })}
          />
          <FieldText
            label="Tiêu đề"
            value={voucherForm.title}
            onChange={(v) => setVoucherForm({ ...voucherForm, title: v })}
          />
          <FieldTextarea
            label="Mô tả"
            value={voucherForm.description}
            onChange={(v) => setVoucherForm({ ...voucherForm, description: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
                Loại giảm giá
              </label>
              <select
                value={voucherForm.discount_type}
                onChange={(e) =>
                  setVoucherForm({ ...voucherForm, discount_type: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8] bg-white cursor-pointer"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <FieldNumber
              label="Giá trị"
              value={voucherForm.discount_value}
              onChange={(v) =>
                setVoucherForm({ ...voucherForm, discount_value: v })
              }
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
              Mở khóa khi hoàn thành bước
            </label>
            <select
              value={voucherForm.required_task_id}
              onChange={(e) =>
                setVoucherForm({
                  ...voucherForm,
                  required_task_id: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8] bg-white cursor-pointer"
            >
              <option value="">Không yêu cầu</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
                Ngày hết hạn
              </label>
              <input
                type="date"
                value={voucherForm.expires_at}
                onChange={(e) =>
                  setVoucherForm({ ...voucherForm, expires_at: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8]"
              />
            </div>
            <FieldCheckbox
              label="Kích hoạt"
              checked={voucherForm.active}
              onChange={(v) => setVoucherForm({ ...voucherForm, active: v })}
            />
          </div>
        </FormModal>
      )}

      <ConfirmDialog
        open={!!deleteTask}
        title="Xóa bước hành trình?"
        message={`Bạn sắp xóa "${deleteTask?.name}". Tiến trình của người dùng liên quan có thể bị ảnh hưởng.`}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTask(null)}
      />
      <ConfirmDialog
        open={!!deleteVoucher_}
        title="Xóa voucher?"
        message={`Bạn sắp xóa voucher "${deleteVoucher_?.title}". Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDeleteVoucher}
        onCancel={() => setDeleteVoucher_(null)}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Local form helpers
// ----------------------------------------------------------------------------

function FormModal({
  title,
  children,
  onClose,
  onSave,
  busy,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-serif font-bold text-[#1B2C40] mb-4">
          {title}
        </h3>
        <div className="space-y-3">{children}</div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1B2C40]/60 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#1B2C40] hover:bg-[#F2BFC8] transition-colors cursor-pointer disabled:opacity-50"
          >
            {busy ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8]"
      />
    </div>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
        {label}
      </label>
      <textarea
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8] resize-none"
      />
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#1B2C40]/50 mb-1 block">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2C40] outline-none focus:border-[#F2BFC8]"
      />
    </div>
  );
}

function FieldCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#1B2C40] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[#F2BFC8]"
      />
      {label}
    </label>
  );
}
