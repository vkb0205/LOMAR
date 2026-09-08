import { Tooltip, ResponsiveContainer } from 'recharts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'];

// Dummy: value = inquiry count for that day/hour slot
const DUMMY_DATA: number[][] = [
  [2, 5, 8, 6, 4, 3, 1],
  [1, 4, 12, 9, 7, 5, 2],
  [3, 7, 15, 11, 8, 4, 1],
  [4, 9, 18, 14, 10, 6, 2],
  [5, 11, 22, 17, 12, 8, 3],
  [8, 14, 25, 20, 15, 10, 4],
  [6, 10, 19, 16, 13, 9, 5],
];

const maxVal = Math.max(...DUMMY_DATA.flat());

function getColor(v: number): string {
  const ratio = v / maxVal;
  if (ratio < 0.15) return '#fef3c7';
  if (ratio < 0.35) return '#fed7aa';
  if (ratio < 0.55) return '#fdba74';
  if (ratio < 0.75) return '#fb923c';
  return '#f97316';
}

export function WeeklyHeatmap() {
  return (
    <div>
      <div className="flex gap-1">
        <div className="w-10 flex-shrink-0" />
        {HOURS.map(h => (
          <div key={h} className="flex-1 text-center text-[10px] font-medium text-slate-400">{h}</div>
        ))}
      </div>
      {DAYS.map((day, di) => (
        <div key={day} className="mt-1 flex gap-1 items-center">
          <div className="w-10 flex-shrink-0 text-[11px] font-medium text-slate-500">{day}</div>
          {DUMMY_DATA[di].map((val, hi) => (
            <div
              key={hi}
              className="flex-1 aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold text-slate-700 cursor-default"
              style={{ backgroundColor: getColor(val) }}
              title={`${day} ${HOURS[hi]}: ${val} inquiries`}
            >
              {val}
            </div>
          ))}
        </div>
      ))}
      <div className="mt-3 flex items-center justify-end gap-1">
        <span className="text-[10px] text-slate-400">Less</span>
        {['#fef3c7', '#fed7aa', '#fdba74', '#fb923c', '#f97316'].map(c => (
          <div key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}
