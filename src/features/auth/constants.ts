import type { DemoAccount, QuickLoginAccount } from './types';

export const demoAccounts: DemoAccount[] = [
  {
    name: 'Cô dâu Quỳnh Anh',
    roleText: 'Cô dâu (Bride)',
    email: 'quynhanh.bride@demo.com',
    role: 'bride',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    bgColor: 'from-pink-50 to-rose-50/50',
    borderColor: 'border-pink-100',
    iconColor: 'text-pink-500',
  },
  {
    name: 'Chú rể Gia Bảo',
    roleText: 'Chú rể (Groom)',
    email: 'giabao.groom@demo.com',
    role: 'groom',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    bgColor: 'from-blue-50 to-indigo-50/50',
    borderColor: 'border-blue-100',
    iconColor: 'text-blue-500',
  },
];

export const DEMO_PASSWORD = 'demo-password';

/**
 * One-click role accounts for local/demo environments.
 *
 * VITE_* values are bundled into the browser, so these must only point to
 * disposable demo accounts and never to real production credentials.
 */
export const quickLoginAccounts: QuickLoginAccount[] = [
  {
    id: 'customer',
    label: 'Người dùng',
    description: 'Normal user · Bride / Groom',
    email: import.meta.env.VITE_QUICK_LOGIN_CUSTOMER_EMAIL || demoAccounts[0].email,
    password: import.meta.env.VITE_QUICK_LOGIN_CUSTOMER_PASSWORD || DEMO_PASSWORD,
    accountRole: 'customer',
  },
  {
    id: 'vendor',
    label: 'Doanh nghiệp',
    description: 'Shop / Studio workspace',
    email: import.meta.env.VITE_QUICK_LOGIN_BUSINESS_EMAIL || '',
    password: import.meta.env.VITE_QUICK_LOGIN_BUSINESS_PASSWORD || '',
    accountRole: 'vendor',
  },
  {
    id: 'admin',
    label: 'Quản trị viên',
    description: 'Overall platform admin',
    email: import.meta.env.VITE_QUICK_LOGIN_ADMIN_EMAIL || '',
    password: import.meta.env.VITE_QUICK_LOGIN_ADMIN_PASSWORD || '',
    accountRole: 'admin',
  },
];
