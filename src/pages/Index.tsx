import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  Briefcase,
  Cpu,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Timer,
  Zap,
} from 'lucide-react';
import { api, JobResponse, AgentInfo, HealthResponse } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { CreateAgentForm } from '@/components/CreateAgentForm';
import { JobsTable } from '@/components/JobsTable';
import { AgentsGrid } from '@/components/AgentsGrid';
import { LogsModal } from '@/components/LogsModal';
import { SettingsBar } from '@/components/SettingsBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tab = 'create' | 'jobs' | 'agents';

const AUTO_REFRESH_INTERVAL = 5; // seconds

function StatCard({ icon: Icon, label, value, className }: { icon: any; label: string; value: string | number; className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl border border-border bg-card flex items-center gap-3', className)}>
      <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-teal" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

/** Circular countdown ring */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  return (
    <svg width="24" height="24" className="-rotate-90">
      <circle cx="12" cy="12" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
      <circle
        cx="12" cy="12" r={r}
        fill="none"
        stroke="hsl(var(--teal))"
        strokeWidth="2"
        strokeDasharray={`${progress} ${circ}`}
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'create', label: 'Create Agent', icon: Plus },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'agents', label: 'Agents', icon: Bot },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [latestJob, setLatestJob] = useState<JobResponse | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh state for Jobs tab
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL);
  const activeTabRef = useRef<Tab>('create');

  const checkHealth = useCallback(async () => {
    try {
      const h = await api.health();
      setHealth(h);
      setHealthError(false);
    } catch {
      setHealthError(true);
    }
  }, []);

  const fetchJobs = useCallback(async (silent = false) => {
    if (!silent) setLoadingJobs(true);
    try {
      const data = await api.listJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch { setJobs([]); }
    finally { if (!silent) setLoadingJobs(false); }
  }, []);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const data = await api.listAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch { setAgents([]); }
    finally { setLoadingAgents(false); }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchJobs();
    fetchAgents();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keep a ref in sync with activeTab for use inside intervals
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Auto-polling engine: runs when jobs tab is active AND there are active jobs
  const hasActiveJobs = jobs.some((j) => ['pending', 'running'].includes(j.status));

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshRef.current) { clearInterval(autoRefreshRef.current); autoRefreshRef.current = null; }
    if (countdownTickRef.current) { clearInterval(countdownTickRef.current); countdownTickRef.current = null; }
    setCountdown(AUTO_REFRESH_INTERVAL);
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    setCountdown(AUTO_REFRESH_INTERVAL);

    // Countdown ticker (1 Hz)
    countdownTickRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? AUTO_REFRESH_INTERVAL : c - 1));
    }, 1000);

    // Refresh every N seconds
    autoRefreshRef.current = setInterval(async () => {
      if (activeTabRef.current === 'jobs') {
        await fetchJobs(true); // silent refresh (no spinner)
        setCountdown(AUTO_REFRESH_INTERVAL);
      }
    }, AUTO_REFRESH_INTERVAL * 1000);
  }, [fetchJobs, stopAutoRefresh]);

  // Start/stop auto-refresh based on tab + active jobs
  useEffect(() => {
    if (activeTab === 'jobs' && hasActiveJobs) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    return stopAutoRefresh;
  }, [activeTab, hasActiveJobs]);

  // Poll the latest created job for status updates
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!latestJob || ['success', 'failed', 'cancelled'].includes(latestJob.status)) return;
    pollingRef.current = setInterval(async () => {
      try {
        const updated = await api.getJob(latestJob.job_id);
        setLatestJob(updated);
        setJobs((prev) => prev.map((j) => j.job_id === updated.job_id ? updated : j));
        if (['success', 'failed', 'cancelled'].includes(updated.status)) {
          clearInterval(pollingRef.current!);
          fetchAgents();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollingRef.current!);
  }, [latestJob?.job_id, latestJob?.status]);

  const handleCreated = (job: JobResponse) => {
    setLatestJob(job);
    setJobs((prev) => [job, ...prev]);
    setActiveTab('jobs');
  };

  const runningJobs = jobs.filter((j) => ['pending', 'running'].includes(j.status)).length;
  const successJobs = jobs.filter((j) => j.status === 'success').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal/15 flex items-center justify-center animate-pulse-glow">
              <Cpu className="w-4 h-4 text-teal" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">Meta-Agent</span>
              <span className="text-muted-foreground text-sm"> Factory</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className={cn('w-2 h-2 rounded-full', healthError ? 'bg-destructive' : 'bg-success animate-pulse-glow')} />
              <span className={cn('font-mono', healthError ? 'text-destructive' : 'text-success')}>
                {healthError ? 'Offline' : health?.status ?? 'Checking…'}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <SettingsBar />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Hero */}
        <div className="mb-6 rounded-2xl border border-teal/20 bg-gradient-to-br from-teal/8 via-transparent to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              AI Agent Factory <span className="text-teal">Control Panel</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Scaffold, manage and monitor specialized AI sub-agents via REST API
            </p>
          </div>
          {latestJob && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs">
              <Zap className="w-3.5 h-3.5 text-teal" />
              <span className="text-muted-foreground">Latest:</span>
              <span className="font-mono text-foreground">{latestJob.name || latestJob.job_id.slice(0, 8)}</span>
              <StatusBadge status={latestJob.status} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Bot} label="Agents Generated" value={agents.length} />
          <StatCard icon={Briefcase} label="Total Jobs" value={jobs.length} />
          <StatCard icon={Activity} label="Running Jobs" value={runningJobs} />
          <StatCard icon={Layers} label="Successful Builds" value={successJobs} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-muted/40 border border-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === 'jobs') fetchJobs();
                if (id === 'agents') fetchAgents();
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'jobs' && jobs.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-teal/15 text-teal text-xs font-mono leading-none">
                  {jobs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-slide-in" key={activeTab}>
          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal" />
                  New Agent Configuration
                </h2>
                <CreateAgentForm onCreated={handleCreated} />
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-foreground">All Jobs</h2>
                  {/* Auto-refresh indicator */}
                  {hasActiveJobs && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal/10 border border-teal/20 text-xs text-teal animate-slide-in">
                      <CountdownRing seconds={countdown} total={AUTO_REFRESH_INTERVAL} />
                      <Timer className="w-3 h-3" />
                      <span className="font-mono tabular-nums">Refreshing in {countdown}s</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchJobs()}
                  disabled={loadingJobs}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingJobs && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
              {loadingJobs ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-teal" />
                </div>
              ) : (
                <JobsTable jobs={jobs} onRefresh={() => fetchJobs()} onViewLogs={setSelectedJob} />
              )}
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Generated Agents</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchAgents}
                  disabled={loadingAgents}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingAgents && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
              {loadingAgents ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-teal" />
                </div>
              ) : (
                <AgentsGrid agents={agents} />
              )}
            </div>
          )}
        </div>
      </main>

      <LogsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
