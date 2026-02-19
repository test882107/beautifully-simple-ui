import { Layers, ChevronRight, Clock, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { JobResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BuildQueueProps {
  jobs: JobResponse[];
  onViewLogs: (job: JobResponse) => void;
  onNavigateJobs: () => void;
}

const STATUS_STYLE: Record<string, { color: string; icon: any; dot: string }> = {
  pending:  { color: 'hsl(38 85% 50%)',  icon: Clock,         dot: 'hsl(38 85% 50%)' },
  running:  { color: 'hsl(210 90% 60%)', icon: Loader2,       dot: 'hsl(210 90% 60%)' },
  success:  { color: 'hsl(142 60% 42%)', icon: CheckCircle2,  dot: 'hsl(142 60% 42%)' },
  failed:   { color: 'hsl(0 72% 55%)',   icon: XCircle,       dot: 'hsl(0 72% 55%)' },
  cancelled:{ color: 'hsl(210 15% 45%)', icon: AlertCircle,   dot: 'hsl(210 15% 45%)' },
};

export function BuildQueue({ jobs, onViewLogs, onNavigateJobs }: BuildQueueProps) {
  // Show recent 6 jobs
  const recent = [...jobs].slice(0, 6);
  const activeCount = jobs.filter(j => ['pending', 'running'].includes(j.status)).length;

  return (
    <div
      className="flex flex-col h-full rounded-lg"
      style={{ background: 'hsl(220 16% 11%)', border: '1px solid hsl(220 13% 18%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'hsl(220 13% 18%)' }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" style={{ color: 'hsl(210 90% 60%)' }} />
          <span className="text-sm font-semibold" style={{ color: 'hsl(210 20% 90%)' }}>
            Build Queue
          </span>
          {activeCount > 0 && (
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded-full animate-status-blink"
              style={{
                background: 'hsl(210 90% 60% / 0.15)',
                color: 'hsl(210 90% 60%)',
                border: '1px solid hsl(210 90% 60% / 0.3)',
              }}
            >
              {activeCount} active
            </span>
          )}
        </div>
        <button
          onClick={onNavigateJobs}
          className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'hsl(210 15% 50%)' }}
        >
          Full History
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
            <div className="opacity-20">
              <Layers className="w-10 h-10" style={{ color: 'hsl(210 15% 55%)' }} />
            </div>
            <div className="text-center">
              <div
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'hsl(210 15% 45%)' }}
              >
                Queue Empty
              </div>
              <div className="text-xs mt-1" style={{ color: 'hsl(210 15% 35%)' }}>
                No active or recent build jobs
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(220 13% 15%)' }}>
            {recent.map((job) => {
              const s = STATUS_STYLE[job.status] ?? STATUS_STYLE.cancelled;
              const StatusIcon = s.icon;
              const isActive = ['pending', 'running'].includes(job.status);
              return (
                <button
                  key={job.job_id}
                  onClick={() => onViewLogs(job)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
                >
                  <div className="shrink-0 relative">
                    <StatusIcon
                      className={cn('w-4 h-4', isActive && job.status === 'running' && 'animate-spin')}
                      style={{ color: s.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-mono font-semibold truncate"
                      style={{ color: 'hsl(210 20% 85%)' }}
                    >
                      {job.name || job.job_id.slice(0, 12)}
                    </div>
                    <div className="text-xs font-mono mt-0.5 capitalize" style={{ color: s.color }}>
                      {job.status}
                      {job.agent_type && (
                        <span style={{ color: 'hsl(210 15% 40%)' }}> · {job.agent_type}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: s.dot,
                      boxShadow: isActive ? `0 0 6px ${s.dot}` : undefined,
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
