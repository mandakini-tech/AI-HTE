import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gov-text">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gov-muted">
          System configuration & user preferences
        </p>
      </div>
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gov-border bg-gov-card">
        <Settings className="mb-3 h-10 w-10 text-gov-muted" />
        <p className="text-sm text-gov-muted">Settings panel coming soon</p>
      </div>
    </div>
  );
}
