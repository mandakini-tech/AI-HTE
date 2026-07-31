import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#1e293b',
  borderRadius: 8,
};

function formatAxisValue(val) {
  if (typeof val !== 'number') return val;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val;
}

export default function ChartRenderer({ chart }) {
  if (!chart || !chart.data?.length) return null;

  const { type, title, xKey, yKey, data } = chart;

  const renderChart = () => {
    switch (type) {
      case 'horizontalBar':
        return (
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatAxisValue} />
            <YAxis
              type="category"
              dataKey={xKey}
              width={140}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatAxisValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatAxisValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${String(name).slice(0, 12)}${String(name).length > 12 ? '…' : ''} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: '#94a3b8' }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval={0}
              angle={data.length > 6 ? -35 : 0}
              textAnchor={data.length > 6 ? 'end' : 'middle'}
              height={data.length > 6 ? 70 : 30}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatAxisValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-gov-border bg-gov-surface/50 p-4">
      {title && (
        <h4 className="mb-3 text-xs font-semibold text-gov-text">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
