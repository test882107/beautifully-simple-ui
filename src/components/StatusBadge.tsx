import { cn } from '@/lib/utils';

type Status = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'healthy' | 'unhealthy' | string;

const statusConfig: Record<string, { label: string; classes: string; dot?: string }> = {
  pending: { label: 'Pending', classes: 'bg-warning/15 text-warning border-warning/30', dot: 'bg-warning animate-status-blink' },
  running: { label: 'Running', classes: 'bg-info/15 text-info border-info/30', dot: 'bg-info animate-status-blink' },
  success: { label: 'Success', classes: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
  failed: { label: 'Failed', classes: 'bg-destructive/15 text-destructive border-destructive/30', dot: 'bg-destructive' },
  cancelled: { label: 'Cancelled', classes: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30', dot: 'bg-muted-foreground' },
  healthy: { label: 'Healthy', classes: 'bg-success/15 text-success border-success/30', dot: 'bg-success animate-pulse-glow' },
  unhealthy: { label: 'Unhealthy', classes: 'bg-destructive/15 text-destructive border-destructive/30', dot: 'bg-destructive' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', config.classes, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
