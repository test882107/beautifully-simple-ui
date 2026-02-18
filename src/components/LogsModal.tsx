import { useEffect, useState } from 'react';
import { Loader2, X, RefreshCw, Copy, Check } from 'lucide-react';
import { api, JobResponse } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LogsModalProps {
  job: JobResponse | null;
  onClose: () => void;
}

export function LogsModal({ job, onClose }: LogsModalProps) {
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    if (!job) return;
    setLoading(true);
    try {
      const res = await api.getJobLogs(job.job_id);
      setLogs(res.logs || '(no log output)');
    } catch (e: any) {
      setLogs(`Error fetching logs: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job) {
      setLogs('');
      fetchLogs();
    }
  }, [job?.job_id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                Build Logs — <span className="font-mono text-teal">{job?.name || job?.job_id?.slice(0, 8)}</span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                {job && <StatusBadge status={job.status} />}
                <span className="font-mono text-xs text-muted-foreground">{job?.job_id}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative mt-2">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg z-10">
              <Loader2 className="w-5 h-5 animate-spin text-teal" />
            </div>
          )}
          <pre className="font-mono text-xs bg-background border border-border rounded-lg p-4 overflow-auto max-h-96 text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {logs || '…'}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
