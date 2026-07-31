import { Search, Bell, User } from 'lucide-react';

function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Navbar({ sidebarCollapsed }) {
  const today = formatDate(new Date());

  return (
    <header
      className={`fixed top-0 z-30 flex h-16 items-center justify-between border-b border-gov-border bg-gov-surface/80 px-6 backdrop-blur-md transition-all duration-300 ${
        sidebarCollapsed ? 'left-[72px]' : 'left-64'
      } right-0`}
    >
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gov-muted" />
        <input
          type="search"
          placeholder="Search institutions, districts, reports..."
          className="w-full rounded-lg border border-gov-border bg-gov-card py-2 pl-10 pr-4 text-sm text-gov-text placeholder:text-gov-muted focus:border-gov-accent focus:outline-none focus:ring-1 focus:ring-gov-accent"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gov-muted lg:block">{today}</span>

        <button
          type="button"
          className="relative rounded-lg p-2 text-gov-muted transition-colors hover:bg-gov-card hover:text-gov-text"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gov-danger" />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gov-accent text-white transition-colors hover:bg-gov-accent-hover"
          aria-label="Profile"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
