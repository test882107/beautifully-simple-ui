import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Copy, Check, X } from 'lucide-react';
import { api, JobResponse } from '@/lib/api';

const STATUS_COLOR: Record<string, string> = {
  pending: 'hsl(38 85% 50%)',
  running: 'hsl(210 90% 60%)',
  success: 'hsl(142 60% 42%)',
  failed: 'hsl(0 72% 55%)',
  cancelled: 'hsl(210 15% 45%)',
};

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

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'hsl(220 16% 4% / 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-xl overflow-hidden animate-slide-in"
        style={{ background: 'hsl(220 16% 11%)', border: '1px solid hsl(220 13% 20%)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid hsl(220 13% 18%)' }}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'hsl(210 20% 90%)' }}>
                Build Logs —
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'hsl(152 100% 50%)' }}>
                {job.name || job.job_id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: `${STATUS_COLOR[job.status] || 'hsl(210 15% 45%)'}1a`,
                  color: STATUS_COLOR[job.status] || 'hsl(210 15% 55%)',
                  border: `1px solid ${STATUS_COLOR[job.status] || 'hsl(210 15% 45%)'}33`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: STATUS_COLOR[job.status] || 'hsl(210 15% 45%)' }}
                />
                {job.status}
              </span>
              <span className="font-mono text-xs" style={{ color: 'hsl(210 15% 40%)' }}>
                {job.job_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-white/8"
              style={{ color: 'hsl(210 15% 50%)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-white/8"
              style={{ color: copied ? 'hsl(142 60% 42%)' : 'hsl(210 15% 50%)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-white/8"
              style={{ color: 'hsl(210 15% 50%)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="relative">
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10 rounded-b-xl"
              style={{ background: 'hsl(220 16% 11% / 0.8)' }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(152 100% 50%)' }} />
            </div>
          )}
          <pre
            className="font-mono text-xs p-5 overflow-auto leading-relaxed whitespace-pre-wrap"
            style={{
              maxHeight: '440px',
              color: 'hsl(210 15% 65%)',
              background: 'hsl(220 18% 8%)',
            }}
          >
            {logs || '…'}
          </pre>
        </div>
      </div>
    </div>
  );
}
