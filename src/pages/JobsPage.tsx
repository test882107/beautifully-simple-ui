import { useState } from 'react';
import { Trash2, FileText, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { JobResponse, api } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  pending: 'hsl(38 85% 50%)',
  running: 'hsl(210 90% 60%)',
  success: 'hsl(142 60% 42%)',
  failed: 'hsl(0 72% 55%)',
  cancelled: 'hsl(210 15% 45%)',
};

const STATUS_BG: Record<string, string> = {
  pending: 'hsl(38 85% 50% / 0.12)',
  running: 'hsl(210 90% 60% / 0.12)',
  success: 'hsl(142 60% 42% / 0.12)',
  failed: 'hsl(0 72% 55% / 0.12)',
  cancelled: 'hsl(210 15% 45% / 0.08)',
};

interface JobsPageProps {
  jobs: JobResponse[];
  loading: boolean;
  onRefresh: () => void;
  onViewLogs: (job: JobResponse) => void;
  countdown: number;
  hasActiveJobs: boolean;
}

export function JobsPage({ jobs, loading, onRefresh, onViewLogs, countdown, hasActiveJobs }: JobsPageProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteJob(id);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete job', e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'hsl(210 20% 92%)' }}>Job Queue</h1>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(210 15% 45%)' }}>
              {jobs.length} total job{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          {hasActiveJobs && (
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono animate-slide-in"
              style={{
                background: 'hsl(210 90% 60% / 0.1)',
                border: '1px solid hsl(210 90% 60% / 0.25)',
                color: 'hsl(210 90% 65%)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-status-blink" style={{ background: 'hsl(210 90% 60%)' }} />
              Auto-refresh in {countdown}s
            </div>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all hover:bg-white/5"
          style={{ color: 'hsl(210 15% 55%)', border: '1px solid hsl(220 13% 18%)' }}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--teal))' }} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'hsl(220 14% 14%)' }}
          >
            <FileText className="w-6 h-6" style={{ color: 'hsl(210 15% 40%)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'hsl(210 15% 50%)' }}>No jobs yet</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(210 15% 35%)' }}>Create an agent to get started</p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(220 13% 18%)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(220 16% 9%)', borderBottom: '1px solid hsl(220 13% 18%)' }}>
                {['Job ID', 'Name', 'Type', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      'px-4 py-3 text-left',
                      h === '' && 'text-right'
                    )}
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'hsl(210 15% 40%)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr
                  key={job.job_id}
                  className="transition-colors hover:bg-white/3"
                  style={{ borderBottom: i < jobs.length - 1 ? '1px solid hsl(220 13% 15%)' : undefined }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color: 'hsl(210 15% 45%)' }}>
                      {job.job_id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium" style={{ color: 'hsl(210 20% 85%)' }}>
                      {job.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {job.agent_type ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-mono capitalize"
                        style={{
                          background: 'hsl(220 14% 16%)',
                          color: 'hsl(210 15% 55%)',
                          border: '1px solid hsl(220 13% 22%)',
                        }}
                      >
                        {job.agent_type}
                      </span>
                    ) : <span style={{ color: 'hsl(210 15% 35%)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{
                        background: STATUS_BG[job.status] || 'hsl(210 15% 45% / 0.08)',
                        color: STATUS_COLOR[job.status] || 'hsl(210 15% 55%)',
                        border: `1px solid ${STATUS_COLOR[job.status] || 'hsl(210 15% 45%)'}33`,
                      }}
                    >
                      <span
                        className={cn('w-1.5 h-1.5 rounded-full', ['pending', 'running'].includes(job.status) && 'animate-status-blink')}
                        style={{ background: STATUS_COLOR[job.status] || 'hsl(210 15% 45%)' }}
                      />
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewLogs(job)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all hover:bg-white/8"
                        style={{ color: 'hsl(210 15% 50%)' }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Logs
                      </button>
                      <button
                        onClick={() => handleDelete(job.job_id)}
                        disabled={deletingId === job.job_id}
                        className="p-1.5 rounded transition-all hover:bg-red-500/10"
                        style={{ color: 'hsl(210 15% 40%)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
