import { Outlet, useLocation } from 'react-router-dom';
import FloatingChat from '../../features/chat/components/FloatingChat';
import { isWorkspacePath } from '../config/navigation';
import { ROUTES } from '../config/routes';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();
  const workspace = isWorkspacePath(pathname);
  // Contextual float everywhere couples need help — not BI, login, or admin.
  const showFloatingAssistant =
    !pathname.startsWith('/admin') &&
    pathname !== ROUTES.businessIntelligence &&
    pathname !== ROUTES.login;

  return (
    <div className="min-h-[100dvh] w-full bg-canvas flex flex-col font-sans text-ink">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas shadow-lift transition-transform focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>
      <Navbar />
      {!workspace && <div aria-hidden className="grain-overlay" />}
      <main id="main-content" className="relative z-10 flex w-full flex-1 flex-col">
        <Outlet />
      </main>
      {!workspace && <Footer />}
      {showFloatingAssistant && <FloatingChat />}
    </div>
  );
}
