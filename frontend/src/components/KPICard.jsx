import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  accentColor = 'text-gov-accent',
  accentBg = 'bg-gov-accent/10',
}) {
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-gov-border bg-gov-card p-5 transition-colors hover:border-gov-accent/30">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gov-muted">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-gov-text">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${accentBg}`}
        >
          <Icon className={`h-5 w-5 ${accentColor}`} />
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-gov-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-gov-danger" />
          )}
          <span
            className={isPositive ? 'text-gov-success' : 'text-gov-danger'}
          >
            {isPositive ? '+' : ''}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-gov-muted">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
