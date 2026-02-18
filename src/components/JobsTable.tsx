import { useState } from 'react';
import { Trash2, FileText, RefreshCw, ChevronRight } from 'lucide-react';
import { JobResponse, api } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobsTableProps {
  jobs: JobResponse[];
  onRefresh: () => void;
  onViewLogs: (job: JobResponse) => void;
  refreshing?: boolean;
}

export function JobsTable({ jobs, onRefresh, onViewLogs, refreshing }: JobsTableProps) {
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

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No jobs yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Create an agent to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr key={job.job_id} className="group hover:bg-surface-hover transition-colors">
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">{job.job_id.slice(0, 8)}…</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">{job.name || '—'}</span>
              </td>
              <td className="px-4 py-3">
                {job.agent_type ? (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                    {job.agent_type}
                  </span>
                ) : '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewLogs(job)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-teal hover:bg-teal/10"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Logs
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                    className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
