import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DUMMY_TREND = [
  { label: 'Jan', value: 42000000 },
  { label: 'Feb', value: 51000000 },
  { label: 'Mar', value: 48000000 },
  { label: 'Apr', value: 62000000 },
  { label: 'May', value: 58000000 },
  { label: 'Jun', value: 74000000 },
  { label: 'Jul', value: 82000000 },
  { label: 'Aug', value: 91000000 },
  { label: 'Sep', value: 86000000 },
  { label: 'Oct', value: 98000000 },
  { label: 'Nov', value: 112000000 },
  { label: 'Dec', value: 128000000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={DUMMY_TREND} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
