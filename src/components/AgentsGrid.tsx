import { Bot, FolderOpen, Clock } from 'lucide-react';
import { AgentInfo } from '@/lib/api';
import { cn } from '@/lib/utils';

const TYPE_ICON_COLOR: Record<string, string> = {
  scraper: 'text-warning',
  api: 'text-info',
  service: 'text-teal',
  processor: 'text-primary',
  mail: 'text-success',
  llm: 'text-teal-glow',
};

interface AgentsGridProps {
  agents: AgentInfo[];
}

export function AgentsGrid({ agents }: AgentsGridProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Bot className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No agents generated yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Agents will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map((agent, i) => (
        <div
          key={i}
          className="group p-4 rounded-lg border border-border bg-card hover:border-teal/40 hover:bg-surface-hover transition-all animate-slide-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-teal/10 transition-colors">
              <Bot className={cn('w-4 h-4', TYPE_ICON_COLOR[agent.type || ''] ?? 'text-muted-foreground')} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold text-foreground truncate">{agent.name}</p>
              {agent.version && (
                <p className="text-xs text-muted-foreground mt-0.5">v{agent.version}</p>
              )}
              {agent.type && (
                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize font-mono">
                  {agent.type}
                </span>
              )}
            </div>
          </div>
          {agent.path && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderOpen className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono truncate">{agent.path}</span>
            </div>
          )}
          {agent.created_at && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{new Date(agent.created_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
