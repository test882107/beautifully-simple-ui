import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Zap, ChevronDown } from 'lucide-react';
import { api, AgentCreateRequest, JobResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

const AGENT_TYPES = ['scraper', 'api', 'service', 'processor', 'mail', 'llm'] as const;

interface ScaffoldFormProps {
  onCreated: (job: JobResponse) => void;
}

export function ScaffoldForm({ onCreated }: ScaffoldFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AgentCreateRequest>({
    defaultValues: { type: 'processor' }
  });

  const agentType = watch('type');

  const onSubmit = async (data: AgentCreateRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const job = await api.createAgent(data);
      onCreated(job);
      reset({ type: 'processor' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to scaffold agent');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'hsl(220 16% 8%)',
    border: '1px solid hsl(220 13% 22%)',
    color: 'hsl(210 20% 85%)',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'hsl(210 15% 50%)',
    marginBottom: '6px',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Row 1: Agent Identifier + Specialization */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Agent Identifier</label>
          <input
            placeholder="agent_name"
            style={{
              ...inputStyle,
              ...(errors.name ? { borderColor: 'hsl(0 72% 55%)' } : {}),
            }}
            {...register('name', {
              required: 'Required',
              pattern: { value: /^[a-z0-9_]+$/, message: 'Lowercase, numbers, underscores only' },
            })}
            onFocus={(e) => { e.target.style.borderColor = 'hsl(152 100% 45% / 0.6)'; }}
            onBlur={(e) => { e.target.style.borderColor = errors.name ? 'hsl(0 72% 55%)' : 'hsl(220 13% 22%)'; }}
          />
          {errors.name && (
            <p style={{ color: 'hsl(0 72% 55%)', fontSize: '11px', marginTop: '4px' }}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Specialization</label>
          <div className="relative">
            <select
              value={agentType}
              onChange={(e) => setValue('type', e.target.value as any)}
              style={{
                ...inputStyle,
                appearance: 'none',
                paddingRight: '32px',
                cursor: 'pointer',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'hsl(152 100% 45% / 0.6)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'hsl(220 13% 22%)'; }}
            >
              {AGENT_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: 'hsl(220 16% 11%)' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'hsl(210 15% 50%)' }}
            />
          </div>
        </div>
      </div>

      {/* Description Directive */}
      <div>
        <label style={labelStyle}>Description Directive</label>
        <textarea
          placeholder="Describe the autonomous goal..."
          rows={3}
          style={{
            ...inputStyle,
            resize: 'none',
            lineHeight: '1.5',
            ...(errors.description ? { borderColor: 'hsl(0 72% 55%)' } : {}),
          }}
          {...register('description', { required: 'Description is required' })}
          onFocus={(e) => { e.target.style.borderColor = 'hsl(152 100% 45% / 0.6)'; }}
          onBlur={(e) => { e.target.style.borderColor = errors.description ? 'hsl(0 72% 55%)' : 'hsl(220 13% 22%)'; }}
        />
        {errors.description && (
          <p style={{ color: 'hsl(0 72% 55%)', fontSize: '11px', marginTop: '4px' }}>{errors.description.message}</p>
        )}
      </div>

      {/* Required Libraries */}
      <div>
        <label style={labelStyle}>Required Libraries</label>
        <input
          placeholder="pandas, requests, bs4..."
          style={inputStyle}
          {...register('libraries')}
          onFocus={(e) => { e.target.style.borderColor = 'hsl(152 100% 45% / 0.6)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'hsl(220 13% 22%)'; }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-md text-xs"
          style={{
            background: 'hsl(0 72% 55% / 0.1)',
            border: '1px solid hsl(0 72% 55% / 0.3)',
            color: 'hsl(0 72% 65%)',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold tracking-wider uppercase transition-all duration-150 disabled:opacity-60"
        style={{
          background: success ? 'hsl(142 60% 42%)' : 'hsl(152 100% 45%)',
          color: 'hsl(220 16% 8%)',
          letterSpacing: '0.08em',
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scaffolding...
          </>
        ) : success ? (
          '✓ Deployed Successfully'
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Deploy Scaffold Protocol
          </>
        )}
      </button>
    </form>
  );
}
