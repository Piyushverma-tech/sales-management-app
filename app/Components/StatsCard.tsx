import { Card } from '@/components/ui/card';
import { ChartLine, Handshake, Star } from 'lucide-react';
import { ReactNode } from 'react';
import { BiRupee } from 'react-icons/bi';
import { useSalesStore } from '../useSalesStore';

type SingleCard = {
  title: string;
  value: string;
  icon: ReactNode;
};

export default function StatsCards() {
  const { allSales } = useSalesStore();

  const closedSales = allSales.filter((sale) => sale.status === 'Closed Won');
  const stats: SingleCard[] = [
    {
      title: 'Total sales',
      value: allSales
        .reduce((total, sale) => {
          const numericValue = parseFloat(
            sale.dealValue.replace(/[^0-9.-]+/g, '')
          );
          return total + numericValue;
        }, 0)
        .toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
      icon: <BiRupee size={24} />,
    },
    {
      title: 'Deals in progress',
      value: allSales
        .filter((sale) => sale.status === 'In Progress')
        .length.toString(),
      icon: <Handshake />,
    },
    {
      title: 'Deals Won',
      value: allSales
        .filter((sale) => sale.status === 'Closed Won')
        .length.toString(),
      icon: <Star />,
    },

    {
      title: 'Conversion Rate',
      value:
        `${((closedSales.length / allSales.length) * 100).toFixed(2)}%` ||
        '0.00%',
      icon: <ChartLine />,
    },
  ];

  return (
    <div className="grid grid-cols-4 max-sm:grid-cols-1 mt-7 gap-6 p-6">
      {stats.map((stat, index) => (
        <SingleStatCard key={index} SingleCard={stat} />
      ))}
    </div>
  );
}

function SingleStatCard({ SingleCard }: { SingleCard: SingleCard }) {
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-none">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className=" text-sm font-semibold text-slate-600">
          {SingleCard.title}
        </span>
        <div className="size-7 rounded-md flex items-center justify-center text-sm bg-primary/25 font-bold text-primary">
          {SingleCard.icon}
        </div>
      </div>

      {/* amount */}
      <div className="text-3xl font-bold">{SingleCard.value}</div>
    </Card>
  );
}
