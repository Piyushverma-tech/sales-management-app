'use client';
import { Card } from '@/components/ui/card';

import { useEffect, useState } from 'react';
import DeleteDialog from './Components/DeleteDialog';
import Topbar from './Components/Topbar';
import TableArea from './Components/TableArea/TableArea';
import SalesDialog from './Components/DealDialog/DealDialog';
import { SalesPersonManager } from './SalesPersonManager/SalesPersonManager';
import SalesTrendsChart from './Components/SalesTrendChart/SalesTrendsChart';
import { useOrganization } from '@clerk/nextjs';
import { useSalesStore } from '@/app/useSalesStore';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { organization } = useOrganization();
  const { loadAllSales } = useSalesStore();

  // Reload sales data when organization changes
  useEffect(() => {
    if (organization) {
      loadAllSales();
    }
  }, [organization?.id, loadAllSales]);

  return (
    <div className=" poppins">
      <DeleteDialog />
      <Card className="sm:m-5 max-sm:rounded-none shadow-none">
        <Topbar setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
      </Card>
      <SalesTrendsChart />
      <TableArea searchQuery={searchQuery} />
      <SalesPersonManager />
      <SalesDialog />
    </div>
  );
}
