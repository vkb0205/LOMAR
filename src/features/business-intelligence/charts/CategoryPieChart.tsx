import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c'];

const DUMMY_CATEGORIES = [
  { name: 'Wedding dresses', amount: '₫ 1.2B', share: '38%' },
  { name: 'Venues', amount: '₫ 860M', share: '27%' },
  { name: 'Photography', amount: '₫ 540M', share: '17%' },
  { name: 'Catering', amount: '₫ 320M', share: '10%' },
  { name: 'Flowers & decor', amount: '₫ 160M', share: '5%' },
  { name: 'Other', amount: '₫ 95M', share: '3%' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-500">{payload[0].name}</p>
      <p className="text-sm font-bold text-slate-900">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {payload?.map((entry: any, i: number) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

export function CategoryPieChart() {
  const chartData = DUMMY_CATEGORIES.map(c => ({ ...c, value: parseFloat(c.share.replace('%', '')) }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}
