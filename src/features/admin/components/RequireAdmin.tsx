import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

/**
 * Route guard for the /admin area.
 *
 * Two-layer security model:
 *  - This component only gates the UI. It is a convenience, not the security
 *    boundary.
 *  - The real enforcement is the admin RLS policies in
 *    database/admin_policies.sql (keyed on is_admin()). Even if a non-admin
 *    reached an admin page, every cross-user query would return nothing.
 *
 * Behaviour:
 *  - While the initial session bootstrap is in flight, render a lightweight
 *    loading state (avoids a flash-redirect before the profile role is known).
 *  - Signed-out users are redirected to login with a return path.
 *  - Signed-in non-admins see an "access denied" panel (no redirect loop).
 *  - Admins get the protected content.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fffdfa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2BFC8]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user.accountRole !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#fffdfa] text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1B2C40] mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-sm text-[#1B2C40]/60 max-w-md">
          Khu vực quản trị chỉ dành cho tài khoản có quyền quản trị hệ thống
          (authority). Tài khoản của bạn không có quyền này.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
