import { Users, Bot, FolderOpen, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { AgentInfo } from '@/lib/api';
import { cn } from '@/lib/utils';

const TYPE_COLOR: Record<string, string> = {
  scraper: 'hsl(38 85% 50%)',
  api: 'hsl(210 90% 60%)',
  service: 'hsl(152 100% 45%)',
  processor: 'hsl(280 70% 60%)',
  mail: 'hsl(142 60% 42%)',
  llm: 'hsl(152 100% 65%)',
};

interface RegistryPageProps {
  agents: AgentInfo[];
  loading: boolean;
  onRefresh: () => void;
}

export function RegistryPage({ agents, loading, onRefresh }: RegistryPageProps) {
  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'hsl(210 20% 92%)' }}>Agent Registry</h1>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(210 15% 45%)' }}>
            All generated agents in the store
          </p>
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
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'hsl(220 14% 14%)' }}
          >
            <Users className="w-6 h-6" style={{ color: 'hsl(210 15% 40%)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'hsl(210 15% 50%)' }}>No agents generated yet</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(210 15% 35%)' }}>Scaffold an agent to populate the registry</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent, i) => (
            <div
              key={i}
              className="rounded-lg p-4 transition-all duration-150 hover:translate-y-[-1px] animate-slide-in"
              style={{
                background: 'hsl(220 16% 11%)',
                border: '1px solid hsl(220 13% 18%)',
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${TYPE_COLOR[agent.type || ''] || 'hsl(152 100% 45%)'  }1a` }}
                >
                  <Bot className="w-4 h-4" style={{ color: TYPE_COLOR[agent.type || ''] || 'hsl(152 100% 45%)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold truncate" style={{ color: 'hsl(210 20% 90%)' }}>
                    {agent.name}
                  </p>
                  {agent.version && (
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(210 15% 40%)' }}>v{agent.version}</p>
                  )}
                  {agent.type && (
                    <span
                      className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded font-mono capitalize"
                      style={{
                        background: `${TYPE_COLOR[agent.type] || 'hsl(152 100% 45%)'}1a`,
                        color: TYPE_COLOR[agent.type] || 'hsl(152 100% 45%)',
                      }}
                    >
                      {agent.type}
                    </span>
                  )}
                </div>
              </div>
              {agent.path && (
                <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'hsl(210 15% 40%)' }}>
                  <FolderOpen className="w-3 h-3 shrink-0" />
                  <span className="font-mono truncate">{agent.path}</span>
                </div>
              )}
              {agent.created_at && (
                <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'hsl(210 15% 40%)' }}>
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{new Date(agent.created_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
