import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { useAuth } from '../auth/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

/**
 * Route guard for /business-intelligence.
 * UI convenience only — API enforces require_business_user (vendor_admin|admin).
 */
export default function RequireBusiness({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fffdfa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BFC8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.businessIntelligence)}`}
        replace
      />
    );
  }

  if (user.accountRole !== 'admin' && user.accountRole !== 'vendor_admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#fffdfa] text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1B2C40] mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-sm text-[#1B2C40]/60 max-w-md">
          Không gian Business Intelligence dành cho tài khoản nhà cung cấp
          (vendor_admin) hoặc quản trị hệ thống (admin).
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
