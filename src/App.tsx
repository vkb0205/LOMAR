import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Customize from './pages/Customize';
import Services from './pages/Services';
import Blog from './pages/Blog';
import Guide from './pages/Guide';
import AIConsultant from './pages/AIConsultant';
import Dashboard from './pages/Dashboard';
import VendorDetail from './pages/VendorDetail';
import Login from './pages/Login';
import RequireAdmin from './components/admin/RequireAdmin';
import AdminLayout from './components/admin/AdminLayout';
import OverviewPanel from './components/admin/panels/OverviewPanel';
import UsersPanel from './components/admin/panels/UsersPanel';
import VendorsPanel from './components/admin/panels/VendorsPanel';
import ModerationPanel from './components/admin/panels/ModerationPanel';
import JourneyPanel from './components/admin/panels/JourneyPanel';
import LeadsPanel from './components/admin/panels/LeadsPanel';
import AIPanel from './components/admin/panels/AIPanel';
import { AppProvider } from './context/AppContext';

// Router base path: configurable via VITE_BASE_PATH so the same bundle can be
// deployed under any sub-path. Defaults to root ("/") when unset. The GitHub
// Pages workflow sets VITE_BASE_PATH to "/<repo-name>/" explicitly. Any trailing
// slash is stripped because React Router's basename must not end in "/".
const ROUTER_BASENAME = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/+$/, '') || '/';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={ROUTER_BASENAME}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Services />} />
            <Route path="customize" element={<Customize />} />
            <Route path="blog" element={<Blog />} />
            <Route path="guide" element={<Guide />} />
            <Route path="ai-consultant" element={<AIConsultant />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendor/:vendorId" element={<VendorDetail />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Admin area — own shell, gated by RequireAdmin (UI convenience).
              The real security boundary is the admin RLS policies in
              database/admin_policies.sql. */}
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
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
