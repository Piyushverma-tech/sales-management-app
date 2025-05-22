'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const router = useRouter();

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales-data/migration');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }
      
      setResults(`Migration successful! ${data.migratedCount} sales updated.`);
      toast.success(`Migration complete: ${data.migratedCount} sales updated`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Migration failed';
      setResults(`Error: ${message}`);
      toast.error(`Migration failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Migration Tool</h1>
        <p className="mb-6 text-gray-700">
          This tool will migrate your existing sales data to be visible to all members in your 
          organization. Run this once per organization.
        </p>

        <div className="flex flex-col gap-4">
          <Button
            onClick={runMigration}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
          >
            {loading ? 'Migrating...' : 'Run Migration'}
          </Button>

          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>

        {results && (
          <div className={`mt-6 p-4 rounded ${results.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {results}
          </div>
        )}
      </Card>
    </div>
  );
} 