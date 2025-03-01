import { Row } from '@tanstack/react-table';
import { MdContentCopy, MdMoreVert, MdOutlineDelete } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import { SaleType } from '../types';
import { useSalesStore } from '../useSalesStore';
import { toast } from 'sonner';

export default function ActionDropDown({ row }: { row: Row<SaleType> }) {
  const { setOpenDeleteDialog, setSelectedSale, setOpenDealDialog } =
    useSalesStore();

  const menuItems = [
    { icon: <MdContentCopy />, label: 'Copy', className: '' },
    { icon: <FaRegEdit />, label: 'Edit', className: '' },
    {
      icon: <MdOutlineDelete className="text-lg" />,
      label: 'Delete',
      className: 'text-red-600',
    },
  ];

  async function handleClickedItem(item: string) {
    if (item === 'Edit') {
      setSelectedSale(row.original);
      setOpenDealDialog(true);
    }
    if (item === 'Delete') {
      setSelectedSale(row.original);
      setOpenDeleteDialog(true);
    }
    if (item === 'Copy') {
      await copyToClipboard();
    }
  }

  async function copyToClipboard() {
    try {
      const { id, ...rowDataWithoutId } = row.original;
      if (id) {
        // Remove the id from the object
      }
      const formattedData = JSON.stringify(rowDataWithoutId, null, 2);
      await navigator.clipboard.writeText(formattedData);
      toast.success('Row Copied!', {
        description: 'The sale data has been copied to clipboard.',
        position: 'top-right',
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Could not copy the data.',
        position: 'top-right',
      });
      console.error('Copy failed:', error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8  p-0">
          <span className="sr-only">Open Menu</span>
          <MdMoreVert className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="poppins bg-primary-foreground z-40">
        {menuItems.map((item, index) => (
          <DropdownMenuItem
            key={index}
            className={`flex items-center gap-1 p-[10px] ${item.className} cursor-pointer`}
            onClick={() => {
              handleClickedItem(item.label);
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
