export default function ChartCard({
  title,
  subtitle,
  children,
  className = '',
  action,
}) {
  return (
    <div
      className={`rounded-xl border border-gov-border bg-gov-card ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gov-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gov-text">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gov-muted">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex min-h-[280px] items-center justify-center p-5">
        {children || (
          <div className="flex flex-col items-center gap-2 text-gov-muted">
            <div className="h-32 w-full rounded-lg border border-dashed border-gov-border bg-gov-surface/50" />
            <p className="text-xs">Chart data will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
