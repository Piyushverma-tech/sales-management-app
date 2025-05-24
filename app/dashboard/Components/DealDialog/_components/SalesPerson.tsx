import { Label } from '@/components/ui/label';
import { useSalesPersonStore } from '@/app/useSalesPersonStore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSalesStore } from '@/app/useSalesStore';
import { useUser, useOrganization } from '@clerk/nextjs';
import { toast } from 'sonner';

type selectedSalespersonProps = {
  selectedSalesperson: string;
  setSelectedSalesperson: React.Dispatch<React.SetStateAction<string>>;
};

export function SalesPerson({
  setSelectedSalesperson,
}: selectedSalespersonProps) {
  const { salesPersons, loadSalesPersons } = useSalesPersonStore();
  const { openSalesPersonDialog } = useSalesStore();
  const { organization } = useOrganization();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [syncing, setSyncing] = useState(false);

  // Load sales persons on initial mount and when organization changes
  useEffect(() => {
    loadSalesPersons();
  }, [organization?.id]);

  // Refresh when dialog closes (in case new sales persons were added)
  useEffect(() => {
    if (!openSalesPersonDialog) {
      loadSalesPersons();
    }
  }, [openSalesPersonDialog]);

  // Set current user name as the salesperson when loaded
  useEffect(() => {
    if (isUserLoaded && user) {
      // Format name the same way as in organization members
      const userName = user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.primaryEmailAddress?.emailAddress || user.id;

      setSelectedSalesperson(userName);
    }
  }, [isUserLoaded, user, setSelectedSalesperson]);

  const handleSync = async () => {
    if (!organization) return;
    
    setSyncing(true);
    try {
      // Call the new API endpoint to sync salespeople
      const response = await fetch('/api/salespeople/sync');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synchronize team members');
      }
      
      toast.success('Team synchronized successfully');
      await loadSalesPersons();
    } catch (error) {
      console.error('Error synchronizing team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to synchronize team');
    } finally {
      setSyncing(false);
    }
  };

  // Get current user's name to display
  const currentUserName =
    isUserLoaded && user
      ? user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.primaryEmailAddress?.emailAddress || user.id
      : 'Loading...';

  return (
    <div className="flex flex-col gap-2 poppins">
      <div className="flex justify-between items-center">
        <Label className="text-slate-600">{'Sales Person'}</Label>

        {organization && salesPersons.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-6 flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-xs">Sync Team</span>
          </Button>
        )}
      </div>

      {/* Replaced with disabled input showing only current user */}
      <div className="h-[45px] flex items-center px-3 border rounded-md">
        {currentUserName}
      </div>
    </div>
  );
}
