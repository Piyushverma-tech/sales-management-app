import { toast } from 'sonner';
import { useSalesStore } from '../../useSalesStore';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DeleteDialog() {
  const {
    openDeleteDialog,
    setOpenDeleteDialog,
    deleteSale,
    selectedSale,
    isLoading,
  } = useSalesStore();

  async function deleteSaleFunction() {
    if (selectedSale) {
      const result = await deleteSale(selectedSale.id);
      if (result) {
        toast('Sale Deleted!', {
          description: 'The sale has been deleted successfully.',
          duration: 5000,
          position: 'top-right',
          action: {
            label: 'Close',
            onClick: () => toast.dismiss(),
          },
          style: {
            fontSize: '14px',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        });
        setOpenDeleteDialog(false);
      }
    }
  }

  return (
    <AlertDialog
      open={openDeleteDialog}
      onOpenChange={(open) => {
        setOpenDeleteDialog(open);
      }}
    >
      <AlertDialogContent className="p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone, This will permanently delete this
            sale.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-4">
          <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={deleteSaleFunction}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
