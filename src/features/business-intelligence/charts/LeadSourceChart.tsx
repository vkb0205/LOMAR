import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface LeadSource {
  source: string;
  leads: number;
  conversionRate: number;
}

const DUMMY_SOURCES: LeadSource[] = [
  { source: 'Instagram', leads: 1240, conversionRate: 6.2 },
  { source: 'Google', leads: 980, conversionRate: 4.8 },
  { source: 'Referral', leads: 720, conversionRate: 11.3 },
  { source: 'Facebook', leads: 540, conversionRate: 3.1 },
  { source: 'Walk-in', leads: 310, conversionRate: 8.7 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as LeadSource;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-500">{d.source}</p>
      <p className="text-sm font-bold text-slate-900">{d.leads.toLocaleString()} leads</p>
      <p className="text-xs text-orange-600">{d.conversionRate}% conversion</p>
    </div>
  );
};

export function LeadSourceChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={DUMMY_SOURCES} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="leads" radius={[6, 6, 0, 0]} barSize={36}>
          {DUMMY_SOURCES.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#f97316' : i === 1 ? '#fb923c' : i === 2 ? '#1e293b' : '#cbd5e1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
