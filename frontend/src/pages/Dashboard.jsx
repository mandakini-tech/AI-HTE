import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  Award,
  HandCoins,
  IndianRupee,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsApi } from '../services/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';

const GENDER_COLORS = ['#38bdf8', '#f472b6'];
const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#1e293b',
};

function formatCompact(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val;
}

function formatBudget(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}Cr`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}L`;
  return `₹${val}L`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getDashboard();
      setData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.message ||
          'Failed to load dashboard data. Please verify the backend is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gov-danger/20 bg-gov-danger/5 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gov-danger/10">
          <AlertCircle className="h-6 w-6 text-gov-danger" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gov-text">
          Error Loading Analytics
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gov-muted">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gov-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gov-accent-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary ?? {};

  const kpis = [
    {
      title: 'Total Colleges',
      value: summary.totalInstitutions?.toLocaleString() ?? '0',
      icon: Building2,
      accentColor: 'text-blue-400',
      accentBg: 'bg-blue-400/10',
    },
    {
      title: 'Students',
      value: summary.totalStudents?.toLocaleString() ?? '0',
      icon: Users,
      accentColor: 'text-emerald-400',
      accentBg: 'bg-emerald-400/10',
    },
    {
      title: 'Teachers',
      value: summary.totalTeachers?.toLocaleString() ?? '0',
      icon: GraduationCap,
      accentColor: 'text-amber-400',
      accentBg: 'bg-amber-400/10',
    },
    {
      title: 'Placement %',
      value: `${summary.averagePlacement ?? 0}%`,
      icon: Briefcase,
      accentColor: 'text-violet-400',
      accentBg: 'bg-violet-400/10',
    },
    {
      title: 'Attendance %',
      value: `${summary.averageAttendance ?? 0}%`,
      icon: CalendarCheck,
      accentColor: 'text-cyan-400',
      accentBg: 'bg-cyan-400/10',
    },
    {
      title: 'Pass %',
      value: `${summary.averagePassPercentage ?? 0}%`,
      icon: Award,
      accentColor: 'text-pink-400',
      accentBg: 'bg-pink-400/10',
    },
    {
      title: 'Scholarships',
      value: summary.totalScholarships?.toLocaleString() ?? '0',
      icon: HandCoins,
      accentColor: 'text-indigo-400',
      accentBg: 'bg-indigo-400/10',
    },
    {
      title: 'Budget',
      value: formatBudget(summary.totalBudget ?? 0),
      icon: IndianRupee,
      accentColor: 'text-teal-400',
      accentBg: 'bg-teal-400/10',
    },
  ];

  const universityChartData = (data?.topUniversities ?? []).map((item) => ({
    ...item,
    label:
      item.university?.length > 28
        ? `${item.university.slice(0, 28)}…`
        : item.university,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gov-text">
          Unified Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-gov-muted">
          Maharashtra Higher &amp; Technical Education — overview across colleges
          and universities
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Enrollment Trend"
          subtitle="Year-over-year student enrollment"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data?.enrollmentTrend ?? []}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value) => [value.toLocaleString(), 'Students']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollment"
                  name="Enrolled Students"
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Top Districts"
          subtitle="Top 10 districts by student enrollment"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.topDistricts ?? []}
                margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="district"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value) => [value.toLocaleString(), 'Students']}
                />
                <Legend />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Gender Distribution"
          subtitle="Current student enrollment by gender"
        >
          <div className="flex h-[300px] w-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.genderDistribution ?? []}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  nameKey="name"
                >
                  {(data?.genderDistribution ?? []).map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [value.toLocaleString(), 'Students']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Budget Allocation"
          subtitle="Total budget allocation by academic year (₹ Lakhs)"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.budgetAllocation ?? []}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fbbf24' }}
                  formatter={(value) => [
                    `${value.toLocaleString()} L`,
                    'Budget',
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="budget"
                  name="Budget (Lakhs)"
                  stroke="#fbbf24"
                  fill="#fbbf24"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Universities"
          subtitle="Top 10 universities by student enrollment"
        >
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={universityChartData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatCompact}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  itemStyle={{ color: '#a78bfa' }}
                  formatter={(value, _name, props) => [
                    value.toLocaleString(),
                    props.payload.university,
                  ]}
                />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="#a78bfa"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Top 10 Colleges"
          subtitle="Highest placement rates among institutions"
        >
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gov-border text-xs uppercase tracking-wide text-gov-muted">
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">College</th>
                  <th className="px-3 py-3 font-medium">District</th>
                  <th className="px-3 py-3 font-medium text-right">
                    Placement
                  </th>
                  <th className="px-3 py-3 font-medium text-right">
                    Students
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data?.top10Colleges ?? []).map((college, index) => (
                  <tr
                    key={`${college.college}-${index}`}
                    className="border-b border-gov-border/60 transition-colors hover:bg-gov-surface/50"
                  >
                    <td className="px-3 py-3 text-gov-muted">{index + 1}</td>
                    <td className="max-w-[200px] truncate px-3 py-3 font-medium text-gov-text">
                      {college.college}
                    </td>
                    <td className="px-3 py-3 text-gov-muted">
                      {college.district}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gov-success">
                      {college.placement}%
                    </td>
                    <td className="px-3 py-3 text-right text-gov-text">
                      {college.students?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
