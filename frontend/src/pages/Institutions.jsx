import { Building2 } from 'lucide-react';

export default function Institutions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gov-text">
          Institutions
        </h1>
        <p className="mt-1 text-sm text-gov-muted">
          Engineering, Pharmacy, Polytechnic & University data
        </p>
      </div>
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gov-border bg-gov-card">
        <Building2 className="mb-3 h-10 w-10 text-gov-muted" />
        <p className="text-sm text-gov-muted">
          Institution directory coming soon
        </p>
      </div>
    </div>
  );
}
