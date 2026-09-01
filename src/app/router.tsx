import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../shared/layout/Layout';
import Home from '../features/home/HomePage';
import Services from '../features/vendors/ServicesPage';
import Blog from '../features/blog/BlogPage';
import Guide from '../features/guide/GuidePage';
import Dashboard from '../features/dashboard/DashboardPage';
import VendorDetail from '../features/vendors/VendorDetailPage';
import Login from '../features/auth/LoginPage';
import { ROUTES } from '../shared/config/routes';
import RequireAdmin from '../features/admin/components/RequireAdmin';
import AdminLayout from '../features/admin/components/AdminLayout';
import OverviewPanel from '../features/admin/panels/OverviewPanel';
import UsersPanel from '../features/admin/panels/UsersPanel';
import VendorsPanel from '../features/admin/panels/VendorsPanel';
import ModerationPanel from '../features/admin/panels/ModerationPanel';
import JourneyPanel from '../features/admin/panels/JourneyPanel';
import LeadsPanel from '../features/admin/panels/LeadsPanel';
import AIPanel from '../features/admin/panels/AIPanel';
import AnalyticsPanel from '../features/admin/panels/AnalyticsPanel';
import AnalyticsTracker from '../features/analytics/components/AnalyticsTracker';
import BusinessIntelligence from '../features/business-intelligence/BusinessIntelligencePage';
import RequireBusiness from '../features/business-intelligence/RequireBusiness';

// Router base path: configurable via VITE_BASE_PATH so the same bundle can be
// deployed under any sub-path. Defaults to root ("/") when unset. The GitHub
// Pages workflow sets VITE_BASE_PATH to "/<repo-name>/" explicitly. Any trailing
// slash is stripped because React Router's basename must not end in "/".
const ROUTER_BASENAME = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/+$/, '') || '/';

export function AppRouter() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Services />} />
          <Route
            path="business-intelligence"
            element={
              <RequireBusiness>
                <BusinessIntelligence />
              </RequireBusiness>
            }
          />
          <Route path="blog" element={<Blog />} />
          <Route path="guide" element={<Guide />} />
          <Route path="ai-consultant" element={<Navigate to={ROUTES.home} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendor/:vendorId" element={<VendorDetail />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Admin area — own shell, gated by RequireAdmin (UI convenience).
            The real security boundary is the admin RLS policies in
            supabase/legacy/admin_policies.sql. */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<OverviewPanel />} />
          <Route path="users" element={<UsersPanel />} />
          <Route path="vendors" element={<VendorsPanel />} />
          <Route path="moderation" element={<ModerationPanel />} />
          <Route path="journey" element={<JourneyPanel />} />
          <Route path="leads" element={<LeadsPanel />} />
          <Route path="ai" element={<AIPanel />} />
          <Route path="analytics" element={<AnalyticsPanel />} />
          <Route path="*" element={<Navigate to={ROUTES.admin} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
