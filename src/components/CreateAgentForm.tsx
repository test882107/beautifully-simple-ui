import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { api, AgentCreateRequest, JobResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const AGENT_TYPES = ['scraper', 'api', 'service', 'processor', 'mail', 'llm'] as const;

interface CreateAgentFormProps {
  onCreated: (job: JobResponse) => void;
}

export function CreateAgentForm({ onCreated }: CreateAgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmRequired, setLlmRequired] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AgentCreateRequest>({
    defaultValues: { type: 'service', llm_required: false }
  });

  const agentType = watch('type');

  const onSubmit = async (data: AgentCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      data.llm_required = llmRequired;
      const job = await api.createAgent(data);
      onCreated(job);
      reset();
      setLlmRequired(false);
    } catch (e: any) {
      setError(e.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Agent Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="my_agent"
            className="font-mono"
            {...register('name', { required: 'Name is required', pattern: { value: /^[a-z0-9_]+$/, message: 'Lowercase, numbers, underscores only' } })}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Agent Type <span className="text-destructive">*</span>
          </Label>
          <Select defaultValue="service" onValueChange={(v) => setValue('type', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENT_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="font-mono capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="What does this agent do?"
          rows={2}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Libraries */}
        <div className="space-y-1.5">
          <Label htmlFor="libraries" className="text-sm font-medium text-foreground">Libraries</Label>
          <Input
            id="libraries"
            placeholder="requests,pandas,numpy"
            className="font-mono"
            {...register('libraries')}
          />
          <p className="text-xs text-muted-foreground">Comma-separated pip packages</p>
        </div>

        {/* Required ENV */}
        <div className="space-y-1.5">
          <Label htmlFor="required_env" className="text-sm font-medium">Required ENV</Label>
          <Input
            id="required_env"
            placeholder="API_KEY,API_SECRET"
            className="font-mono"
            {...register('required_env')}
          />
          <p className="text-xs text-muted-foreground">Comma-separated env var names</p>
        </div>
      </div>

      {/* LLM Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
        <div>
          <p className="text-sm font-medium">LLM Required</p>
          <p className="text-xs text-muted-foreground">Enable LLM-powered features for this agent</p>
        </div>
        <Switch checked={llmRequired} onCheckedChange={setLlmRequired} />
      </div>

      {/* LLM Settings (conditional) */}
      {llmRequired && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-teal/30 bg-teal/5 animate-slide-in">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">LLM Providers</Label>
            <Input placeholder="openai,gemini" className="font-mono" {...register('llm_providers')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Provider</Label>
            <Input placeholder="gemini" className="font-mono" {...register('provider')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Model</Label>
            <Input placeholder="gemini-2.5-flash" className="font-mono" {...register('model')} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={loading} variant="teal" className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating agent…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Agent
          </>
        )}
      </Button>
    </form>
  );
}
