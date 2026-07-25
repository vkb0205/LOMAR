import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, CheckCircle2, PauseCircle, Store, Package } from 'lucide-react';
import {
  fetchVendors,
  updateVendorStatus,
  deleteVendor,
  fetchServices,
  updateServiceStatus,
  deleteService,
} from '../services/adminService';
import { Database } from '../../../shared/types/database';
import {
  PanelHeader,
  AdminCard,
  LoadingBlock,
  EmptyBlock,
  StatusBadge,
  AdminActionButton,
  ConfirmDialog,
  formatDate,
} from '../components/ui';

type VendorRow = Database['public']['Tables']['vendors']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];

type Tab = 'vendors' | 'services';
type DeleteTarget =
  | { kind: 'vendor'; row: VendorRow }
  | { kind: 'service'; row: ServiceRow }
  | null;

export default function VendorsPanel() {
  const [tab, setTab] = useState<Tab>('vendors');
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<DeleteTarget>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, s] = await Promise.all([fetchVendors(), fetchServices()]);
      setVendors(v);
      setServices(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setVStatus = async (
    row: VendorRow,
    status: 'draft' | 'active' | 'suspended'
  ) => {
    setBusyId(row.id);
    try {
      await updateVendorStatus(row.id, status);
      setVendors((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const setSStatus = async (
    row: ServiceRow,
    status: 'draft' | 'active' | 'archived'
  ) => {
    setBusyId(row.id);
    try {
      await updateServiceStatus(row.id, status);
      setServices((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.row.id);
    try {
      if (toDelete.kind === 'vendor') {
        await deleteVendor(toDelete.row.id);
        setVendors((prev) => prev.filter((r) => r.id !== toDelete.row.id));
      } else {
        await deleteService(toDelete.row.id);
        setServices((prev) => prev.filter((r) => r.id !== toDelete.row.id));
      }
      setToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name || id.slice(0, 8);

  return (
    <div>
      <PanelHeader
        title="Nhà cung cấp & Dịch vụ"
        description="Duyệt, tạm ngưng hoặc gỡ nhà cung cấp và dịch vụ"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab('vendors')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'vendors'
              ? 'bg-[#1B2C40] text-white'
              : 'bg-white text-[#1B2C40]/60 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Store className="w-4 h-4" />
          Nhà cung cấp ({vendors.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('services')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'services'
              ? 'bg-[#1B2C40] text-white'
              : 'bg-white text-[#1B2C40]/60 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          Dịch vụ ({services.length})
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
        ) : tab === 'vendors' ? (
          vendors.length === 0 ? (
            <EmptyBlock label="Chưa có nhà cung cấp" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-[#1B2C40]/40 border-b border-gray-100">
                    <th className="px-4 py-3 font-bold">Nhà cung cấp</th>
                    <th className="px-4 py-3 font-bold">Danh mục</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                    <th className="px-4 py-3 font-bold">Ngày tạo</th>
                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1B2C40]">{row.name}</p>
                        <p className="text-[11px] text-[#1B2C40]/50">
                          {row.city || row.email || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[#1B2C40]/70">
                        {row.category}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-[#1B2C40]/60 text-xs">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {row.status !== 'active' && (
                            <AdminActionButton
                              variant="primary"
                              disabled={busyId === row.id}
                              onClick={() => setVStatus(row, 'active')}
                              title="Duyệt"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Duyệt
                            </AdminActionButton>
                          )}
                          {row.status !== 'suspended' && (
                            <AdminActionButton
                              variant="neutral"
                              disabled={busyId === row.id}
                              onClick={() => setVStatus(row, 'suspended')}
                              title="Tạm ngưng"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                            </AdminActionButton>
                          )}
                          <AdminActionButton
                            variant="danger"
                            disabled={busyId === row.id}
                            onClick={() =>
                              setToDelete({ kind: 'vendor', row })
                            }
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
        ) : services.length === 0 ? (
          <EmptyBlock label="Chưa có dịch vụ" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#1B2C40]/40 border-b border-gray-100">
                  <th className="px-4 py-3 font-bold">Dịch vụ</th>
                  <th className="px-4 py-3 font-bold">Nhà cung cấp</th>
                  <th className="px-4 py-3 font-bold">Giá</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1B2C40]">{row.name}</p>
                      <p className="text-[11px] text-[#1B2C40]/50">
                        {row.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#1B2C40]/70">
                      {vendorName(row.vendor_id)}
                    </td>
                    <td className="px-4 py-3 text-[#1B2C40]/70">
                      {row.base_price.toLocaleString('vi-VN')} {row.currency}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {row.status !== 'active' && (
                          <AdminActionButton
                            variant="primary"
                            disabled={busyId === row.id}
                            onClick={() => setSStatus(row, 'active')}
                            title="Kích hoạt"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Kích hoạt
                          </AdminActionButton>
                        )}
                        {row.status !== 'archived' && (
                          <AdminActionButton
                            variant="neutral"
                            disabled={busyId === row.id}
                            onClick={() => setSStatus(row, 'archived')}
                            title="Lưu trữ"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                          </AdminActionButton>
                        )}
                        <AdminActionButton
                          variant="danger"
                          disabled={busyId === row.id}
                          onClick={() =>
                            setToDelete({ kind: 'service', row })
                          }
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

      <ConfirmDialog
        open={!!toDelete}
        title={toDelete?.kind === 'vendor' ? 'Xóa nhà cung cấp?' : 'Xóa dịch vụ?'}
        message={`Bạn sắp xóa "${toDelete?.row.name}". Hành động này không thể hoàn tác và có thể ảnh hưởng dữ liệu liên quan.`}
        confirmLabel="Xóa"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
