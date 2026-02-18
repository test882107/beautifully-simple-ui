import { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { getBaseUrl, setBaseUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function SettingsBar() {
  const [url, setUrl] = useState(getBaseUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setBaseUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">API Base URL</p>
            <p className="text-xs text-muted-foreground mt-0.5">The server endpoint for Meta-Agent Factory</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://127.0.0.1:8787"
              className="font-mono text-xs"
            />
            <Button size="sm" onClick={handleSave} variant={saved ? 'secondary' : 'default'}>
              {saved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
