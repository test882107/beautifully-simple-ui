import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor: string; // e.g. 'hsl(152 100% 45%)'
  iconBg: string;      // e.g. 'hsl(152 100% 45% / 0.15)'
}

export function StatCard({ icon, label, value, accentColor, iconBg }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-lg"
      style={{
        background: 'hsl(220 16% 11%)',
        border: '1px solid hsl(220 13% 18%)',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-xs font-bold tracking-widest uppercase mb-0.5"
          style={{ color: 'hsl(210 15% 45%)' }}
        >
          {label}
        </div>
        <div className="text-2xl font-bold" style={{ color: 'hsl(210 20% 92%)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}
