'use client';
import { Card } from '@/components/ui/card';

import { useState } from 'react';
import DeleteDialog from './Components/DeleteDialog';
import Topbar from './Components/Topbar';
import StatsCards from './Components/StatsCard';
import TableArea from './Components/TableArea/TableArea';
import SalesDialog from './Components/DealDialog/DealDialog';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="m-5 poppins">
      <DeleteDialog />
      <Card className="sm:m-5 shadow-none">
        <Topbar setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
      </Card>
      <StatsCards />
      <TableArea searchQuery={searchQuery} />
      <SalesDialog />
    </div>
  );
}
