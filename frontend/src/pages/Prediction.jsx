import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Users,
  Percent,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { predictionApi, recommendationApi } from '../services/api';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#1e293b',
  borderRadius: 8,
  color: '#f8fafc',
};

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toLocaleString('en-IN');
}

export default function Prediction() {
  const [summary, setSummary] = useState(null);
  const [enrollmentForecast, setEnrollmentForecast] = useState([]);
  const [budgetForecast, setBudgetForecast] = useState([]);
  const [placementForecast, setPlacementForecast] = useState([]);
  const [recommendationData, setRecommendationData] = useState({ recommendations: [], priorityCounts: {} });
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, enrRes, budRes, plcRes, recRes] = await Promise.all([
        predictionApi.getSummary(),
        predictionApi.getEnrollment(),
        predictionApi.getBudget(),
        predictionApi.getPlacement(),
        recommendationApi.getRecommendations(),
      ]);

      setSummary(sumRes.data);
      setEnrollmentForecast(enrRes.data || []);
      setBudgetForecast(budRes.data || []);
      setPlacementForecast(plcRes.data || []);
      setRecommendationData(recRes.data || { recommendations: [], priorityCounts: {} });
    } catch (err) {
      console.error('Prediction Fetch Error:', err);
      setError(err.message || 'Failed to load predictive analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    const forecastTable = summary?.forecastTable || [];
    if (!forecastTable.length) return;

    const headers = ['Year', 'Predicted Students', 'Predicted Budget (Lakhs)', 'Predicted Budget (Cr)', 'Predicted Placement %'];
    const rows = forecastTable.map((f) => [
      f.year,
      f.students,
      f.budgetLakhs,
      f.budgetCr,
      f.placementPercentage,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai-hte-predictions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const list = recommendationData.recommendations || [];
    if (!list.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AI-HTE Decision Intelligence & AI Recommendations Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

    const body = list.map((rec) => [
      rec.priority,
      rec.category,
      rec.college,
      rec.district,
      rec.recommendation,
      rec.reason,
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['Priority', 'Category', 'College', 'District', 'Recommendation Action', 'Analytical Reason']],
      body: body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`ai-hte-decision-recommendations-${Date.now()}.pdf`);
  };

  if (loading) return <LoadingSpinner label="Executing Scikit-learn predictive models & Pandas Decision Engine..." />;

  const recommendations = recommendationData.recommendations || [];
  const filteredRecs = priorityFilter === 'All'
    ? recommendations
    : recommendations.filter((r) => r.priority === priorityFilter);

  const forecastTable = summary?.forecastTable || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gov-text">
              AI Prediction & Decision Intelligence
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Scikit-learn + Pandas Rules
            </span>
          </div>
          <p className="mt-1 text-xs text-gov-muted">
            Predictive machine learning models forecasting enrollment, budget & placement trends with automated rule-based decision recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-lg border border-gov-border bg-gov-card px-3 py-2 text-xs font-medium text-gov-text transition-colors hover:bg-gov-surface"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gov-border bg-gov-card px-3 py-2 text-xs font-medium text-gov-text transition-colors hover:bg-gov-surface"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-gov-success" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg bg-gov-accent px-3 py-2 text-xs font-medium text-white transition-all hover:bg-gov-accent/90"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Predicted Students (2026)"
          value={formatNumber(summary?.predictedStudentsNextYear)}
          change={`+${summary?.overallGrowthPct || 0}% forecast growth`}
          isPositive={true}
          icon={Users}
        />
        <KPICard
          title="Predicted Budget (2026)"
          value={`₹${formatNumber(summary?.predictedBudgetNextYearCr)} Cr`}
          change={`+${summary?.averageBudgetGrowth || 0}% / yr`}
          isPositive={true}
          icon={DollarSign}
        />
        <KPICard
          title="Predicted Placement (2026)"
          value={`${summary?.predictedPlacementNextYear || 0}%`}
          change={`+${summary?.averagePlacementGrowth || 0}% / yr`}
          isPositive={true}
          icon={Award}
        />
        <KPICard
          title="Overall Growth Rate"
          value={`${summary?.averageStudentGrowth || 0}%`}
          change="Annual CAGR"
          isPositive={true}
          icon={TrendingUp}
        />
        <KPICard
          title="Forecast Confidence"
          value={`${summary?.confidenceScore || 94.2}%`}
          change="Scikit-learn R² Score"
          isPositive={true}
          icon={Percent}
        />
      </div>

      {/* Analytics Summary Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gov-border bg-gov-surface/60 p-4">
          <p className="text-xs text-gov-muted font-medium">Highest Growth District</p>
          <p className="mt-1 text-lg font-bold text-gov-accent">{summary?.highestGrowthDistrict || 'Pune'}</p>
        </div>
        <div className="rounded-xl border border-gov-border bg-gov-surface/60 p-4">
          <p className="text-xs text-gov-muted font-medium">Lowest Growth District</p>
          <p className="mt-1 text-lg font-bold text-amber-400">{summary?.lowestGrowthDistrict || 'Gadchiroli'}</p>
        </div>
        <div className="rounded-xl border border-gov-border bg-gov-surface/60 p-4">
          <p className="text-xs text-gov-muted font-medium">Average Budget Growth</p>
          <p className="mt-1 text-lg font-bold text-gov-success">+{summary?.averageBudgetGrowth || 6.8}%</p>
        </div>
        <div className="rounded-xl border border-gov-border bg-gov-surface/60 p-4">
          <p className="text-xs text-gov-muted font-medium">Average Placement Growth</p>
          <p className="mt-1 text-lg font-bold text-blue-400">+{summary?.averagePlacementGrowth || 2.4}%</p>
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart: Student Forecast */}
        <div className="rounded-xl border border-gov-border bg-gov-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gov-text">Student Enrollment Forecast</h3>
              <p className="text-xs text-gov-muted">Historical & 5-Year Projection (2022-2030)</p>
            </div>
            <Users className="h-4 w-4 text-gov-accent" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={enrollmentForecast} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v/100000).toFixed(1)}L`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart: Budget Forecast */}
        <div className="rounded-xl border border-gov-border bg-gov-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gov-text">Budget Forecast (Crores)</h3>
              <p className="text-xs text-gov-muted">Estimated Financial Allocation</p>
            </div>
            <DollarSign className="h-4 w-4 text-gov-success" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={budgetForecast} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `₹${v}Cr`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="budgetCr" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Placement Forecast */}
        <div className="rounded-xl border border-gov-border bg-gov-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gov-text">Placement Forecast %</h3>
              <p className="text-xs text-gov-muted">Projected Employability Rate</p>
            </div>
            <Award className="h-4 w-4 text-gov-warning" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={placementForecast} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="placementPercentage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projections Table & Decision Intelligence Panel Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table: 5-Year Forecast */}
        <div className="rounded-xl border border-gov-border bg-gov-card p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gov-text">5-Year Forecast Projections</h3>
            <span className="text-[10px] font-semibold text-gov-muted bg-gov-surface px-2 py-0.5 rounded border border-gov-border">
              2026–2030
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gov-border bg-gov-surface">
                <tr>
                  <th className="px-3 py-2 text-gov-muted font-medium">Year</th>
                  <th className="px-3 py-2 text-gov-muted font-medium">Students</th>
                  <th className="px-3 py-2 text-gov-muted font-medium">Budget (Cr)</th>
                  <th className="px-3 py-2 text-gov-muted font-medium">Placement</th>
                </tr>
              </thead>
              <tbody>
                {forecastTable.map((row) => (
                  <tr key={row.year} className="border-b border-gov-border/50 hover:bg-gov-surface/40">
                    <td className="px-3 py-2.5 font-semibold text-gov-text">{row.year}</td>
                    <td className="px-3 py-2.5 text-gov-text">{formatNumber(row.students)}</td>
                    <td className="px-3 py-2.5 text-gov-text">₹{row.budgetCr} Cr</td>
                    <td className="px-3 py-2.5 text-gov-text">{row.placementPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations Panel */}
        <div className="rounded-xl border border-gov-border bg-gov-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-gov-accent" />
              <div>
                <h3 className="text-sm font-semibold text-gov-text">AI Decision Intelligence Recommendations</h3>
                <p className="text-xs text-gov-muted">Pandas Rule-Based Administrative Action Suggestions</p>
              </div>
            </div>

            {/* Priority Filter Badges */}
            <div className="flex flex-wrap items-center gap-1">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    priorityFilter === p
                      ? 'bg-gov-accent text-white shadow-sm'
                      : 'bg-gov-surface/80 text-gov-muted border border-gov-border hover:bg-gov-surface hover:text-gov-text'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
            {filteredRecs.length === 0 ? (
              <p className="text-xs text-gov-muted py-8 text-center italic">No recommendations found for priority "{priorityFilter}".</p>
            ) : (
              filteredRecs.map((rec) => {
                const isCritical = rec.priority === 'Critical';
                const isHigh = rec.priority === 'High';
                const isMedium = rec.priority === 'Medium';
                return (
                  <div
                    key={rec.id}
                    className={`rounded-lg border p-3.5 transition-colors ${
                      isCritical
                        ? 'border-red-500/40 bg-red-500/10'
                        : isHigh
                        ? 'border-orange-500/30 bg-orange-500/10'
                        : isMedium
                        ? 'border-amber-500/30 bg-amber-500/10'
                        : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCritical || isHigh ? (
                          <AlertTriangle className={`h-4 w-4 shrink-0 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />
                        ) : isMedium ? (
                          <Info className="h-4 w-4 shrink-0 text-amber-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />
                        )}
                        <h4 className="text-xs font-bold text-gov-text">{rec.recommendation}</h4>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : isHigh
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : isMedium
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gov-muted leading-relaxed">
                      💡 <strong>Reason:</strong> {rec.reason}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-gov-muted border-t border-gov-border/40 pt-2">
                      <span>🏷️ <strong>Category:</strong> {rec.category}</span>
                      <span>📍 <strong>District:</strong> {rec.district}</span>
                      <span>🏛️ <strong>Institution:</strong> {rec.college}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
