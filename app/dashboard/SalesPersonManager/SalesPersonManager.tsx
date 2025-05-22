import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSalesPersonStore } from '@/app/useSalesPersonStore';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSalesStore } from '@/app/useSalesStore';
import { SaleType } from '@/app/types';
import dynamic from 'next/dynamic';
import { useOrganization } from '@clerk/nextjs';

const OrganizationSwitcher = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.OrganizationSwitcher),
  { ssr: false }
);

export function SalesPersonManager() {
  const { salesPersons, loadSalesPersons, syncOrganizationMembers } =
    useSalesPersonStore();
  const { openSalesPersonDialog, setOpenSalesPersonDialog, allSales } =
    useSalesStore();
  const { organization, isLoaded } = useOrganization();
  const [syncing, setSyncing] = useState(false);

  const sortedSalesPersons = salesPersons
    .map((person) => ({
      name: person,
      count: allSales.filter((sale: SaleType) => sale.salesperson === person)
        .length,
    }))
    .sort((a, b) => b.count - a.count);

  useEffect(() => {
    if (isLoaded && organization) {
      loadSalesPersons();
    }
  }, [isLoaded, organization?.id]);

  const handleClerkUIClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSyncMembers = async () => {
    if (!organization) return;

    setSyncing(true);
    try {
      await syncOrganizationMembers();
      await loadSalesPersons();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog
      open={openSalesPersonDialog}
      onOpenChange={setOpenSalesPersonDialog}
    >
      <DialogContent className="max-w-lg overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center ">
            Sales Team
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Manage your organization&apos;s sales team members
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 relative" style={{ zIndex: 9999 }}>
          <p className="mb-2">Select organization to manage sales team:</p>
          <div
            className="clerk-organization-switcher"
            style={{ isolation: 'isolate', position: 'relative', zIndex: 9999 }}
            onClick={handleClerkUIClick}
            onMouseDown={handleClerkUIClick}
          >
            <OrganizationSwitcher
              appearance={{
                elements: {
                  organizationSwitcherTrigger:
                    'w-full py-2 font-bold text-gray-500 hover:text-gray-600 justify-between',
                  rootBox: 'w-full relative z-[9999]',
                  organizationPreviewAvatarBox: 'h-8 w-8',
                  organizationSwitcherPopoverCard: {
                    zIndex: '9999',
                    pointerEvents: 'auto',
                  },
                  organizationPreviewButton: {
                    pointerEvents: 'auto',
                  },
                  organizationSwitcherPopover: {
                    pointerEvents: 'auto',
                  },
                },
              }}
            />
          </div>
        </div>

        {organization ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Organization Members</h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleSyncMembers}
                disabled={syncing}
              >
                <RefreshCw
                  className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`}
                />
                Sync Members
              </Button>
            </div>

            <ScrollArea className="h-64 pr-4">
              <div className="space-y-4">
                {salesPersons.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p>No sales persons added yet</p>
                    <p className="text-sm mt-2">
                      Click &quot;Sync Members&quot; to import organization
                      members
                    </p>
                  </div>
                ) : (
                  sortedSalesPersons.map((person) => (
                    <div
                      key={person.name}
                      className="flex items-center justify-between border border-gray-600 hover:bg-gray-200/10 transition-colors py-1 px-4 rounded-md"
                    >
                      <span className="font-medium mr-6">{person.name}</span>
                      <span className="text-gray-500 text-sm">
                        Sales: {person.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Please select or create an organization to manage sales team</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
