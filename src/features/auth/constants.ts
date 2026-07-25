import type { DemoAccount } from './types';

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
