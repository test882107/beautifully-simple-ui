// Meta-Agent Factory REST API client

export interface AgentCreateRequest {
  name: string;
  description: string;
  type: 'scraper' | 'api' | 'service' | 'processor' | 'mail' | 'llm';
  libraries?: string;
  required_env?: string;
  llm_providers?: string;
  provider?: string;
  model?: string;
  llm_required?: boolean;
}

export interface JobResponse {
  job_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  status_url: string;
  logs_url: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  agent_type?: string;
  error?: string;
}

export interface AgentInfo {
  name: string;
  version?: string;
  path?: string;
  created_at?: string;
  type?: string;
}

export interface HealthResponse {
  status: string;
  version?: string;
  uptime?: number;
  timestamp?: string;
}

export interface LogsResponse {
  job_id: string;
  logs: string;
}

let BASE_URL = 'http://127.0.0.1:8787';

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, '');
}

export function getBaseUrl() {
  return BASE_URL;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  listAgents: () => request<AgentInfo[]>('/v1/agents'),
  createAgent: (data: AgentCreateRequest) =>
    request<JobResponse>('/v1/agents', { method: 'POST', body: JSON.stringify(data) }),
  listJobs: () => request<JobResponse[]>('/v1/jobs'),
  getJob: (id: string) => request<JobResponse>(`/v1/jobs/${id}`),
  getJobLogs: (id: string) => request<LogsResponse>(`/v1/jobs/${id}/logs`),
  deleteJob: (id: string) => request<{ success: boolean }>(`/v1/jobs/${id}`, { method: 'DELETE' }),
};
