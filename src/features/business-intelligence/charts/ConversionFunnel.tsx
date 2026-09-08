import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelStage {
  label: string;
  value: number;
}

const DUMMY_FUNNEL: FunnelStage[] = [
  { label: 'Page views', value: 12480 },
  { label: 'Inquiries', value: 3640 },
  { label: 'Qualified leads', value: 1820 },
  { label: 'Booked', value: 890 },
  { label: 'Completed', value: 612 },
];

const COLORS = ['#1e293b', '#334155', '#f97316', '#ea580c', '#c2410c'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-500">{payload[0].payload.label}</p>
      <p className="text-sm font-bold text-slate-900">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export function ConversionFunnel() {
  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={DUMMY_FUNNEL} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {DUMMY_FUNNEL.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>Funnel conversion</span>
        <span className="font-semibold text-orange-600">4.9%</span>
      </div>
    </div>
  );
}
