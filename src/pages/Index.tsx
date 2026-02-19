import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Users, Bot, Activity, Briefcase, RefreshCw, RotateCcw,
  Loader2, Zap, Database,
} from 'lucide-react';
import { api, JobResponse, AgentInfo, HealthResponse } from '@/lib/api';
import { Sidebar, NavPage } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { ScaffoldForm } from '@/components/ScaffoldForm';
import { BuildQueue } from '@/components/BuildQueue';
import { JobsPage } from '@/pages/JobsPage';
import { RegistryPage } from '@/pages/RegistryPage';
import { ConsolePage } from '@/pages/ConsolePage';
import { LogsModal } from '@/components/LogsModal';

const AUTO_REFRESH_INTERVAL = 5;

export default function Index() {
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [latestJob, setLatestJob] = useState<JobResponse | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePageRef = useRef<NavPage>('overview');
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL);

  const hasActiveJobs = jobs.some((j) => ['pending', 'running'].includes(j.status));

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

  useEffect(() => { activePageRef.current = activePage; }, [activePage]);

  // Auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshRef.current) { clearInterval(autoRefreshRef.current); autoRefreshRef.current = null; }
    if (countdownTickRef.current) { clearInterval(countdownTickRef.current); countdownTickRef.current = null; }
    setCountdown(AUTO_REFRESH_INTERVAL);
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    setCountdown(AUTO_REFRESH_INTERVAL);
    countdownTickRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? AUTO_REFRESH_INTERVAL : c - 1));
    }, 1000);
    autoRefreshRef.current = setInterval(async () => {
      await fetchJobs(true);
      setCountdown(AUTO_REFRESH_INTERVAL);
    }, AUTO_REFRESH_INTERVAL * 1000);
  }, [fetchJobs, stopAutoRefresh]);

  useEffect(() => {
    if (hasActiveJobs) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    return stopAutoRefresh;
  }, [hasActiveJobs]);

  // Poll latest job
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
    setActivePage('jobs');
  };

  const runningJobs = jobs.filter((j) => ['pending', 'running'].includes(j.status)).length;
  const successJobs = jobs.filter((j) => j.status === 'success').length;

  const handleNavigate = (page: NavPage) => {
    setActivePage(page);
    if (page === 'jobs') fetchJobs();
    if (page === 'registry') fetchAgents();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(220 16% 8%)' }}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        healthError={healthError}
        healthStatus={health?.status}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid hsl(220 13% 14%)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'hsl(210 20% 92%)' }}>
              {activePage === 'overview' && 'System Overview'}
              {activePage === 'registry' && 'Agent Registry'}
              {activePage === 'jobs' && 'Build Jobs'}
              {activePage === 'console' && 'System Console'}
            </h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'hsl(210 15% 40%)' }}>
              ROOT AUTHENTICATION: {healthError ? 'UNAVAILABLE' : 'ACTIVE'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchJobs(true); fetchAgents(); checkHealth(); }}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-white/8"
              style={{ border: '1px solid hsl(220 13% 18%)', color: 'hsl(210 15% 50%)' }}
              title="Refresh all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold font-mono tracking-wider"
              style={{
                border: '1px solid hsl(152 100% 45% / 0.4)',
                background: 'hsl(152 100% 45% / 0.08)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(152 100% 45%)', boxShadow: '0 0 6px hsl(152 100% 45% / 0.8)' }}
              />
              <span style={{ color: 'hsl(152 100% 55%)' }}>LOCAL</span>
              <span style={{ color: 'hsl(210 15% 55%)' }}>INSTANCE</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activePage === 'overview' && (
            <div className="animate-slide-in space-y-5 max-w-6xl">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={<Users className="w-5 h-5" style={{ color: 'hsl(152 100% 50%)' }} />}
                  label="Total Agents"
                  value={agents.length}
                  accentColor="hsl(152 100% 45%)"
                  iconBg="hsl(152 100% 45% / 0.12)"
                />
                <StatCard
                  icon={<Activity className="w-5 h-5" style={{ color: 'hsl(210 90% 60%)' }} />}
                  label="Running Jobs"
                  value={runningJobs}
                  accentColor="hsl(210 90% 60%)"
                  iconBg="hsl(210 90% 60% / 0.12)"
                />
                <StatCard
                  icon={<Database className="w-5 h-5" style={{ color: 'hsl(38 85% 50%)' }} />}
                  label="Registry Version"
                  value="V2.1"
                  accentColor="hsl(38 85% 50%)"
                  iconBg="hsl(38 85% 50% / 0.12)"
                />
              </div>

              {/* Scaffold + Build Queue */}
              <div className="grid grid-cols-[1fr_380px] gap-4" style={{ minHeight: '420px' }}>
                {/* Scaffold Panel */}
                <div
                  className="rounded-lg p-5"
                  style={{ background: 'hsl(220 16% 11%)', border: '1px solid hsl(220 13% 18%)' }}
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold" style={{ color: 'hsl(152 100% 50%)' }}>+</span>
                      <span className="text-sm font-semibold" style={{ color: 'hsl(210 20% 90%)' }}>
                        Scaffold New Agent
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{
                        background: 'hsl(220 14% 16%)',
                        color: 'hsl(210 15% 50%)',
                        border: '1px solid hsl(220 13% 22%)',
                      }}
                    >
                      REST ASYNC
                    </span>
                  </div>
                  <ScaffoldForm onCreated={handleCreated} />
                </div>

                {/* Build Queue */}
                <BuildQueue
                  jobs={jobs}
                  onViewLogs={setSelectedJob}
                  onNavigateJobs={() => setActivePage('jobs')}
                />
              </div>
            </div>
          )}

          {activePage === 'registry' && (
            <RegistryPage agents={agents} loading={loadingAgents} onRefresh={fetchAgents} />
          )}

          {activePage === 'jobs' && (
            <JobsPage
              jobs={jobs}
              loading={loadingJobs}
              onRefresh={() => fetchJobs()}
              onViewLogs={setSelectedJob}
              countdown={countdown}
              hasActiveJobs={hasActiveJobs}
            />
          )}

          {activePage === 'console' && (
            <ConsolePage jobs={jobs} />
          )}
        </div>
      </div>

      <LogsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
