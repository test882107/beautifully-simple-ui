import { Terminal, AlertCircle } from 'lucide-react';
import { JobResponse } from '@/lib/api';

interface ConsolePageProps {
  jobs: JobResponse[];
}

export function ConsolePage({ jobs }: ConsolePageProps) {
  const recentLogs = jobs.slice(0, 10);

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h1 className="text-lg font-bold" style={{ color: 'hsl(210 20% 92%)' }}>Console</h1>
        <p className="text-xs mt-0.5" style={{ color: 'hsl(210 15% 45%)' }}>
          System activity and job events
        </p>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'hsl(220 18% 7%)', border: '1px solid hsl(220 13% 18%)' }}
      >
        {/* Terminal header */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid hsl(220 13% 18%)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0 72% 55%)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(38 85% 50%)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(142 60% 42%)' }} />
          </div>
          <span className="text-xs font-mono ml-2" style={{ color: 'hsl(210 15% 40%)' }}>
            meta-agent / system.log
          </span>
        </div>

        {/* Log output */}
        <div className="p-4 font-mono text-xs space-y-1 min-h-80 max-h-[60vh] overflow-y-auto" style={{ color: 'hsl(210 15% 55%)' }}>
          <p style={{ color: 'hsl(152 100% 45%)' }}>
            {'>'} Meta-Agent Factory — Protocol V2.1
          </p>
          <p style={{ color: 'hsl(210 15% 35%)' }}>{'>'} System initialized</p>
          <p style={{ color: 'hsl(210 15% 35%)' }}>{'>'} REST API server listening on :8787</p>
          <div className="h-2" />

          {recentLogs.length === 0 ? (
            <div className="flex items-center gap-2 py-8" style={{ color: 'hsl(210 15% 35%)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No job events yet. Scaffold an agent to see activity here.</span>
            </div>
          ) : (
            recentLogs.map((job) => {
              const ts = job.created_at
                ? new Date(job.created_at).toLocaleTimeString()
                : '—';
              const statusColor =
                job.status === 'success' ? 'hsl(142 60% 42%)'
                : job.status === 'failed' ? 'hsl(0 72% 55%)'
                : job.status === 'running' ? 'hsl(210 90% 60%)'
                : 'hsl(38 85% 50%)';
              return (
                <div key={job.job_id} className="flex gap-3 items-start">
                  <span style={{ color: 'hsl(210 15% 35%)' }}>[{ts}]</span>
                  <span style={{ color: 'hsl(152 100% 45%)' }}>JOB</span>
                  <span style={{ color: 'hsl(210 20% 75%)' }}>{job.name || job.job_id.slice(0, 8)}</span>
                  <span style={{ color: statusColor }}>{job.status.toUpperCase()}</span>
                  {job.agent_type && (
                    <span style={{ color: 'hsl(210 15% 40%)' }}>({job.agent_type})</span>
                  )}
                </div>
              );
            })
          )}

          <div className="flex items-center gap-1 mt-4" style={{ color: 'hsl(152 100% 45%)' }}>
            <span>{'>'}</span>
            <span className="w-2 h-4 animate-status-blink" style={{ background: 'hsl(152 100% 45%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
