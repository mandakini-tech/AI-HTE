import { useState, useEffect } from 'react';
import {
  MapPin,
  School,
  Briefcase,
  GraduationCap,
  Building,
  CalendarCheck,
  IndianRupee,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsApi } from '../services/api';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { id: 'districts', label: 'District Comparison', icon: MapPin },
  { id: 'universities', label: 'University Comparison', icon: School },
  { id: 'placement', label: 'Placement Analysis', icon: Briefcase },
  { id: 'scholarships', label: 'Scholarship Analysis', icon: GraduationCap },
  { id: 'infrastructure', label: 'Infrastructure Analysis', icon: Building },
  { id: 'attendance', label: 'Attendance Analysis', icon: CalendarCheck },
  { id: 'budget', label: 'Budget Analysis', icon: IndianRupee },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#1e293b',
};

function formatCompact(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val;
}

function truncateLabel(label, max = 22) {
  if (!label || label.length <= max) return label;
  return `${label.slice(0, max)}…`;
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('districts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [scholarships, setScholarships] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [districtsRes, universitiesRes, placementRes, scholarshipsRes] =
        await Promise.all([
          analyticsApi.getDistricts(),
          analyticsApi.getUniversities(),
          analyticsApi.getPlacement(),
          analyticsApi.getScholarships(),
        ]);
      setDistricts(districtsRes.data);
      setUniversities(universitiesRes.data.slice(0, 15));
      setPlacement(placementRes.data);
      setScholarships(scholarshipsRes.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topDistricts = districts.slice(0, 12);
  const topUniversities = universities.slice(0, 12).map((item) => ({
    ...item,
    label: truncateLabel(item.university, 26),
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'districts':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Students by District"
              subtitle="Top districts by total enrollment"
            >
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topDistricts}
                    margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="district"
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={formatCompact}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value) => [value.toLocaleString(), 'Students']}
                    />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill="#60a5fa"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Placement vs Pass Rate"
              subtitle="District-level academic outcomes"
            >
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={topDistricts}
                    margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="district"
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="placement"
                      name="Placement %"
                      stroke="#34d399"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="passPercentage"
                      name="Pass %"
                      stroke="#f472b6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        );

      case 'universities':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Enrollment by University"
              subtitle="Top universities by student count"
            >
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topUniversities}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={formatCompact}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={10}
                      width={130}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
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
              title="University Budget"
              subtitle="Total budget allocation (₹ Lakhs)"
            >
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topUniversities}
                    margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={formatCompact}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value) => [
                        `${value.toLocaleString()} L`,
                        'Budget',
                      ]}
                    />
                    <Bar
                      dataKey="budget"
                      name="Budget"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        );

      case 'placement':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gov-border bg-gov-card px-5 py-4">
              <p className="text-sm text-gov-muted">Statewide Average Placement</p>
              <p className="mt-1 text-3xl font-bold text-gov-text">
                {placement?.averagePlacement ?? 0}%
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title="Top 10 Colleges" subtitle="Highest placement rates">
                <PlacementTable colleges={placement?.top10Colleges ?? []} />
              </ChartCard>
              <ChartCard
                title="Bottom 10 Colleges"
                subtitle="Lowest placement rates — intervention targets"
              >
                <PlacementTable
                  colleges={placement?.bottom10Colleges ?? []}
                  variant="danger"
                />
              </ChartCard>
            </div>
          </div>
        );

      case 'scholarships':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Scholarships by District"
              subtitle="Total scholarships disbursed"
            >
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(scholarships?.byDistrict ?? []).slice(0, 12)}
                    margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="district"
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={formatCompact}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value) => [value.toLocaleString(), 'Scholarships']}
                    />
                    <Bar
                      dataKey="scholarships"
                      name="Scholarships"
                      fill="#34d399"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Top Scholarship Recipients"
              subtitle="Colleges with highest scholarship allocation"
            >
              <ScholarshipTable colleges={scholarships?.topColleges ?? []} />
            </ChartCard>
          </div>
        );

      case 'infrastructure':
        return (
          <ChartCard
            title="Infrastructure Score by District"
            subtitle="Average infrastructure rating (0–100)"
          >
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topDistricts}
                  margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="district"
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${value}`, 'Infrastructure Score']}
                  />
                  <Bar
                    dataKey="infrastructure"
                    name="Infrastructure"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        );

      case 'attendance':
        return (
          <ChartCard
            title="Attendance by District"
            subtitle="Average attendance percentage across institutions"
          >
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={topDistricts}
                  margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="district"
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [`${value}%`, 'Attendance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    name="Attendance %"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        );

      case 'budget':
        return (
          <ChartCard
            title="Budget by District"
            subtitle="Total institutional budget (₹ Lakhs)"
          >
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topDistricts}
                  margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="district"
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={formatCompact}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `${value.toLocaleString()} L`,
                      'Budget',
                    ]}
                  />
                  <Bar
                    dataKey="budget"
                    name="Budget"
                    fill="#fbbf24"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading analytics..." />
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gov-text">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-gov-muted">
          Detailed metrics and academic indices across colleges and polytechnics
        </p>
      </div>

      <div className="overflow-x-auto border-b border-gov-border">
        <nav className="flex min-w-max space-x-1" aria-label="Analytics Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-gov-accent text-gov-accent'
                    : 'border-transparent text-gov-muted hover:border-gov-border hover:text-gov-text'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
}

function PlacementTable({ colleges, variant = 'success' }) {
  const valueClass =
    variant === 'danger' ? 'text-gov-danger' : 'text-gov-success';

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-gov-border text-xs uppercase tracking-wide text-gov-muted">
            <th className="px-3 py-3 font-medium">College</th>
            <th className="px-3 py-3 font-medium">District</th>
            <th className="px-3 py-3 font-medium text-right">Placement</th>
            <th className="px-3 py-3 font-medium text-right">Students</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map((college, index) => (
            <tr
              key={`${college.college}-${index}`}
              className="border-b border-gov-border/60 hover:bg-gov-surface/50"
            >
              <td className="max-w-[180px] truncate px-3 py-3 font-medium text-gov-text">
                {college.college}
              </td>
              <td className="px-3 py-3 text-gov-muted">{college.district}</td>
              <td className={`px-3 py-3 text-right font-semibold ${valueClass}`}>
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
  );
}

function ScholarshipTable({ colleges }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-gov-border text-xs uppercase tracking-wide text-gov-muted">
            <th className="px-3 py-3 font-medium">College</th>
            <th className="px-3 py-3 font-medium">District</th>
            <th className="px-3 py-3 font-medium text-right">Scholarships</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map((college, index) => (
            <tr
              key={`${college.college}-${index}`}
              className="border-b border-gov-border/60 hover:bg-gov-surface/50"
            >
              <td className="max-w-[180px] truncate px-3 py-3 font-medium text-gov-text">
                {college.college}
              </td>
              <td className="px-3 py-3 text-gov-muted">{college.district}</td>
              <td className="px-3 py-3 text-right font-semibold text-gov-accent">
                {college.scholarships?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
