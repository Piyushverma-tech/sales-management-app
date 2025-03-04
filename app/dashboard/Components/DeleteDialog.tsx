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
      await deleteSale(selectedSale._id!);
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
