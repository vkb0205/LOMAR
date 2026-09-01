import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import logoImg from '../../assets/images/Asset 24.png';
import logoDarkImg from '../../assets/images/Logo.png';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ROUTES } from '../config/routes';
import { openContextualAssistant } from '../../features/chat/openAssistant';
import {
  ACCOUNT_MENU,
  PRIMARY_NAV,
  audiencesForRole,
  filterByAudience,
  isNavItemActive,
  primaryActionForAudiences,
  safeRedirectPath,
} from '../config/navigation';
import { EASE } from '../ui/motion';

const menuIcons: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  dashboard: RouteIcon,
  bi: BarChart3,
  admin: ShieldCheck,
};

function roleLabelFor(user: {
  accountRole?: string | null;
  role?: string | null;
}): string {
  if (user.accountRole === 'admin') return 'Quản trị';
  if (user.accountRole === 'vendor_admin') return 'Doanh nghiệp';
  if (user.role === 'groom') return 'Chú rể';
  if (user.role === 'planner') return 'Planner';
  return 'Cô dâu';
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuId = useId();
  const mobileNavId = useId();

  const audiences = audiencesForRole(user?.accountRole);
  const navLinks = filterByAudience(PRIMARY_NAV, audiences);
  const activeNavId = navLinks.find((link) => isNavItemActive(location.pathname, link))?.id;
  const accountItems = filterByAudience(ACCOUNT_MENU, audiences);
  const primaryAction = primaryActionForAudiences(audiences);

  const loginHref = `${ROUTES.login}?redirect=${encodeURIComponent(
    safeRedirectPath(`${location.pathname}${location.search}`, ROUTES.dashboard),
  )}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen && !showDropdown) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setShowDropdown(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, showDropdown]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Keep the header transparent while it is over the page hero.
  useEffect(() => {
    const headerHeight = 68;

    function update() {
      const hero = document.querySelector<HTMLElement>('[data-hero]');
      setScrolled(hero ? hero.getBoundingClientRect().bottom <= headerHeight : true);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
    navigate(ROUTES.home);
  };

  const onHero = !scrolled && !mobileOpen;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80]">
        <div
          className={`pointer-events-auto flex h-16 w-full items-center border-b px-4 transition-[background-color,box-shadow,border-color] duration-700 ease-fluid sm:h-[4.25rem] sm:px-6 xl:px-8 ${
            scrolled
              ? 'border-white/10 bg-ink/95 shadow-float'
              : 'border-transparent bg-transparent shadow-none'
          }`}
        >
          {/* Brand (left) */}
          <div className="pointer-events-none z-10 flex min-w-0 flex-1 items-center justify-start gap-2 sm:gap-2.5 [&>*]:pointer-events-auto">
            <button
              ref={menuButtonRef}
              type="button"
              className={`relative mr-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-500 lg:hidden ${
                onHero ? 'text-ink hover:bg-ink/5' : 'text-white hover:bg-white/10'
              }`}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              aria-controls={mobileNavId}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span
                className={`absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-500 ease-fluid ${
                  mobileOpen ? 'rotate-45' : '-translate-y-[3.5px]'
                }`}
              />
              <span
                className={`absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-500 ease-fluid ${
                  mobileOpen ? '-rotate-45' : 'translate-y-[3.5px]'
                }`}
              />
            </button>

            <Link
              to={ROUTES.home}
              className="group flex min-w-0 items-center gap-2.5 py-1"
              aria-label="Về trang chủ Hạnh Phúc Tới Nơi"
            >
              <img
                src={onHero ? logoDarkImg : logoImg}
                alt=""
                className={`w-auto object-contain transition-transform duration-500 ease-fluid group-hover:scale-105 ${
                  onHero ? 'h-7 md:h-8' : 'h-9 md:h-10'
                }`}
              />
              <div className="hidden min-w-0 flex-col justify-center sm:flex">
                <span className={`truncate font-serif text-base font-bold leading-tight tracking-wide ${onHero ? 'text-ink' : 'text-white'}`}>
                  Hạnh Phúc Tới Nơi
                </span>
                <span className={`hidden text-[9px] font-medium uppercase tracking-[0.18em] md:block ${onHero ? 'text-ink/55' : 'text-white/45'}`}>
                  Khu phố hạnh phúc · Hồ Văn Huê
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop discovery — fluid island with sliding active pill */}
          <nav
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            aria-label="Điều hướng chính"
          >
            <div className={`pointer-events-auto flex items-center gap-0.5 rounded-full p-1 ${onHero ? 'bg-ink/5' : 'bg-white/10'}`}>
              {navLinks.map((link) => {
                const active = activeNavId === link.id;
                return (
                  <Link
                    key={link.id}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className="relative rounded-full px-4 py-1.5 text-[13px] tracking-tight"
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-canvas"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-500 ${
                        active
                          ? 'font-semibold text-ink'
                          : onHero
                            ? 'font-medium text-ink/70 hover:text-ink'
                            : 'font-medium text-white/70 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Actions + account (right) — above page content; children re-enable hit targets */}
          <div
            className="pointer-events-none relative z-30 flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2 [&>*]:pointer-events-auto"
            ref={dropdownRef}
          >
            {primaryAction ? (
              <Link
                to={primaryAction.path}
                className={`hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-500 sm:inline-flex ${
                  isNavItemActive(location.pathname, primaryAction)
                    ? 'bg-canvas text-ink'
                    : 'bg-cream text-ink-deep hover:bg-gold'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                {primaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openContextualAssistant()}
                className="hidden items-center gap-1.5 rounded-full bg-cream px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-deep transition-colors duration-500 hover:bg-gold sm:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                Tư vấn AI
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown((open) => !open)}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  aria-controls={accountMenuId}
                  className={`flex max-w-[10rem] items-center gap-2 rounded-full border py-1.5 pr-2 pl-1.5 transition-colors duration-500 sm:max-w-[14rem] ${
                    onHero
                      ? 'border-ink/15 bg-ink/5 text-ink hover:bg-ink/10'
                      : 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-sage-mist/50"
                  />
                  <span className="hidden min-w-0 flex-1 truncate text-left text-sm font-semibold md:block">
                    {user.name.split(' ').pop()}
                  </span>
                  <ChevronDown
                    strokeWidth={1.5}
                    className={`hidden h-4 w-4 transition-transform duration-500 ease-fluid md:block ${
                      onHero ? 'text-ink/50' : 'text-white/50'
                    } ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      id={accountMenuId}
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-[1.25rem] border border-sage-mist bg-canvas py-1.5 shadow-float"
                    >
                      <div className="border-b border-sage-mist/70 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="mt-0.5 text-xs font-medium text-sage">{roleLabelFor(user)}</p>
                      </div>

                      <div className="py-1">
                        {accountItems.map((item) => {
                          const Icon = menuIcons[item.id] ?? User;
                          const active =
                            location.pathname === item.path ||
                            location.pathname.startsWith(`${item.path}/`);
                          return (
                            <Link
                              key={item.id}
                              role="menuitem"
                              to={item.path}
                              onClick={() => setShowDropdown(false)}
                              className={`flex items-start gap-3 px-4 py-2.5 transition-colors duration-500 ${
                                active ? 'bg-sage-mist/60 text-ink' : 'text-ink hover:bg-sage-mist/40'
                              }`}
                            >
                              <Icon
                                strokeWidth={1.5}
                                className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-sage' : 'text-sage/70'}`}
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold">{item.label}</span>
                                {item.description && (
                                  <span className="mt-0.5 block text-xs font-normal text-ink/55">
                                    {item.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-3 border-t border-sage-mist/70 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors duration-500 hover:bg-red-50"
                      >
                        <LogOut strokeWidth={1.5} className="h-4 w-4 text-red-500" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to={loginHref}
                className="inline-flex items-center gap-2 rounded-full bg-cream px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-deep transition-colors duration-500 hover:bg-gold sm:px-4"
              >
                <User strokeWidth={1.5} className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen glass overlay menu with staggered mask reveal */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            id={mobileNavId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed inset-0 z-[70] bg-ink-deep/90 backdrop-blur-3xl lg:hidden"
          >
            <div className="h-full overflow-y-auto px-6 pb-12 pt-28 sm:px-10 sm:pt-32">
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
                className="mb-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-canvas/40"
              >
                Khám phá
              </motion.p>

              <nav className="flex flex-col" aria-label="Menu di động">
                {navLinks.map((link, index) => {
                  const active = activeNavId === link.id;
                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 48 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 + index * 0.07, ease: EASE }}
                    >
                      <Link
                        to={link.path}
                        className={`group flex items-baseline gap-4 border-b border-white/8 py-4 transition-colors duration-500 ${
                          active ? 'text-cream' : 'text-canvas hover:text-cream'
                        }`}
                      >
                        <span className="font-serif text-xs italic text-rose">0{index + 1}</span>
                        <span className="font-serif text-3xl font-bold tracking-tight transition-transform duration-500 ease-fluid group-hover:translate-x-2 sm:text-4xl">
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + navLinks.length * 0.07, ease: EASE }}
                className="mt-10 flex flex-col gap-3"
              >
                {primaryAction ? (
                  <Link
                    to={primaryAction.path}
                    className="flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-deep transition-colors duration-500 hover:bg-gold"
                  >
                    <BarChart3 strokeWidth={1.5} className="h-4 w-4" />
                    {primaryAction.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openContextualAssistant();
                    }}
                    className="flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-deep transition-colors duration-500 hover:bg-gold"
                  >
                    <Sparkles strokeWidth={1.5} className="h-4 w-4" />
                    Tư vấn AI
                  </button>
                )}
              </motion.div>

              {user && accountItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.16 + navLinks.length * 0.07, ease: EASE }}
                  className="mt-10"
                >
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-canvas/40">
                    Tài khoản
                  </p>
                  <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-canvas">{user.name}</p>
                    <p className="text-xs text-rose-soft/80">{roleLabelFor(user)}</p>
                  </div>
                  <div className="flex flex-col">
                    {accountItems.map((item) => {
                      const Icon = menuIcons[item.id] ?? User;
                      const active =
                        location.pathname === item.path ||
                        location.pathname.startsWith(`${item.path}/`);
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-500 ${
                            active ? 'bg-white/15 text-sage-mist' : 'text-canvas/80 hover:bg-white/10'
                          }`}
                        >
                          <Icon strokeWidth={1.5} className="h-4 w-4 opacity-70" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-300 transition-colors duration-500 hover:bg-red-500/10"
                    >
                      <LogOut strokeWidth={1.5} className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}

              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.16 + navLinks.length * 0.07, ease: EASE }}
                  className="mt-10"
                >
                  <Link
                    to={loginHref}
                    className="block rounded-full bg-cream py-3.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-ink-deep transition-colors duration-500 hover:bg-gold"
                  >
                    Đăng nhập
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
