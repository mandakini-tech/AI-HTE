export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-gov-border border-t-gov-accent ${sizeClasses[size]}`}
        role="status"
        aria-label={label}
      />
      {label && <p className="text-sm text-gov-muted">{label}</p>}
    </div>
  );
}
