import { useState } from 'react';
import { LayoutDashboard, Users, Briefcase, Terminal, Settings, Check, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBaseUrl, setBaseUrl } from '@/lib/api';

export type NavPage = 'overview' | 'registry' | 'jobs' | 'console';

const NAV_ITEMS: { id: NavPage; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'registry', label: 'Registry', icon: Users },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'console', label: 'Console', icon: Terminal },
];

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  healthError: boolean;
  healthStatus?: string;
}

export function Sidebar({ activePage, onNavigate, healthError, healthStatus }: SidebarProps) {
  const [url, setUrl] = useState(getBaseUrl());
  const [saved, setSaved] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);

  const handleSave = () => {
    setBaseUrl(url);
    setSaved(true);
    setEditingUrl(false);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <aside
      className="flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style={{ background: 'hsl(220 18% 6%)', borderRight: '1px solid hsl(220 14% 14%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'hsl(220 14% 14%)' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: 'hsl(152 100% 45% / 0.15)', border: '1px solid hsl(152 100% 45% / 0.3)' }}
        >
          <span style={{ color: 'hsl(var(--teal))' }}>⚙</span>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'hsl(210 20% 90%)' }}>
            Meta Factory
          </div>
          <div className="text-xs tracking-wider" style={{ color: 'hsl(210 15% 45%)' }}>
            Protocol V2.1
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 text-left',
                isActive
                  ? 'font-semibold'
                  : 'hover:bg-white/5'
              )}
              style={
                isActive
                  ? {
                      background: 'hsl(152 100% 45% / 0.12)',
                      color: 'hsl(152 100% 55%)',
                      borderLeft: '2px solid hsl(152 100% 45%)',
                      paddingLeft: '10px',
                    }
                  : { color: 'hsl(210 15% 55%)' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Gateway Status */}
      <div
        className="mx-3 mb-4 rounded-lg p-3 space-y-2"
        style={{ background: 'hsl(220 16% 9%)', border: '1px solid hsl(220 14% 14%)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'hsl(210 15% 45%)' }}>
            Gateway
          </span>
          <Activity className="w-3 h-3" style={{ color: healthError ? 'hsl(var(--offline))' : 'hsl(var(--teal))' }} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn('w-2 h-2 rounded-full shrink-0', !healthError && 'animate-status-blink')}
            style={{ background: healthError ? 'hsl(var(--offline))' : 'hsl(var(--teal))' }}
          />
          <span
            className="text-xs font-mono font-bold"
            style={{ color: healthError ? 'hsl(var(--offline))' : 'hsl(var(--teal))' }}
          >
            {healthError ? 'OFFLINE' : healthStatus?.toUpperCase() ?? 'ONLINE'}
          </span>
        </div>
        {editingUrl ? (
          <div className="flex gap-1 mt-1">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 text-xs font-mono px-2 py-1 rounded outline-none min-w-0"
              style={{
                background: 'hsl(220 16% 13%)',
                border: '1px solid hsl(220 14% 22%)',
                color: 'hsl(210 15% 70%)',
              }}
              autoFocus
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 rounded text-xs font-bold"
              style={{ background: 'hsl(var(--teal))', color: 'hsl(220 16% 8%)' }}
            >
              {saved ? <Check className="w-3 h-3" /> : '✓'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingUrl(true)}
            className="text-xs font-mono w-full text-left truncate hover:opacity-80 transition-opacity"
            style={{ color: 'hsl(210 15% 40%)' }}
            title={url}
          >
            {url}
          </button>
        )}
      </div>
    </aside>
  );
}
