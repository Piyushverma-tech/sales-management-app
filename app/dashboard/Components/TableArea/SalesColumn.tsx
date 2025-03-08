import ActionDropDown from '@/app/Dropdowns/ActionDropDown';
import { SaleType } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format, isValid } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  column: Column<SaleType, unknown>;
  label: string;
}

function SortingIcon(isSorted: boolean | string) {
  if (isSorted === 'asc') {
    return <ArrowUp />;
  } else if (isSorted === 'desc') {
    return <ArrowDown />;
  } else {
    return <ArrowUpDown />;
  }
}

function SortableHeader({ column, label }: SortableHeaderProps) {
  const isSorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      className={`${isSorted && 'text-primary'}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      {SortingIcon(isSorted)}
    </Button>
  );
}

export const salesColumns: ColumnDef<SaleType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="pl-4">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="pl-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Customer Name" />;
    },
  },
  {
    accessorKey: 'dealValue',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Deal Value" />;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Status" />;
    },
    cell: ({ row }) => {
      return (
        <Badge className="rounded-xl bg-primary/15 text-primary font-normal select-none shadow-none">
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'Contactdate',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Contact Date" />;
    },
    cell: ({ row }) => {
      const contactDate = row.original.contactDate;
      const parsedDate = new Date(contactDate);
      const formattedDate = isValid(parsedDate)
        ? format(parsedDate, 'dd/MM/yyyy')
        : 'Invalid Date';

      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'salesperson',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Salesperson" />;
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return <SortableHeader column={column} label="Priority" />;
    },
    cell: ({ row }) => {
      const priority = row.original.priority;
      let priorityColor = '';

      //set the color based on priority
      if (priority === 'Low') {
        priorityColor = 'bg-green-500 text-white';
      } else if (priority === 'Medium') {
        priorityColor = 'bg-yellow-500 text-white';
      } else if (priority === 'High') {
        priorityColor = 'bg-red-500 text-white';
      }

      return (
        <Badge
          className={`${priorityColor} font-semibold hover:bg-${priorityColor} shadow-none`}
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <ActionDropDown row={row} />;
    },
  },
];
