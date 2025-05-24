'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncSalespeopleButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      
      const response = await fetch('/api/salespeople/sync');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synchronize salespeople');
      }
      
      // Success - show the results
      const { syncResults } = data;
      const message = `Sync completed: ${syncResults.added} added, ${syncResults.updated} updated, ${syncResults.removed} removed`;
      
      toast.success('Salespeople Synchronized', {
        description: message
      });
      
      setSyncResult({
        success: true,
        message
      });
    } catch (error) {
      console.error('Error synchronizing salespeople:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to synchronize salespeople';
      
      toast.error('Synchronization Failed', {
        description: errorMessage
      });
      
      setSyncResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {isSyncing ? 'Synchronizing...' : 'Sync Salespeople'}
      </Button>
      
      {syncResult && (
        <div className={`text-sm flex items-center gap-1 ${
          syncResult.success ? 'text-green-500' : 'text-red-500'
        }`}>
          {syncResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{syncResult.message}</span>
        </div>
      )}
    </div>
  );
} 