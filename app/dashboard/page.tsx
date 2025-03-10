'use client';
import { Card } from '@/components/ui/card';

import { useState } from 'react';
import DeleteDialog from './Components/DeleteDialog';
import Topbar from './Components/Topbar';
import TableArea from './Components/TableArea/TableArea';
import SalesDialog from './Components/DealDialog/DealDialog';
import { SalesPersonManager } from './SalesPersonManager/SalesPersonManager';
import SalesTrendsChart from './Components/SalesTrendChart/SalesTrendsChart';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

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
