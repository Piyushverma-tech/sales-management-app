import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import CustomerName from './_components/CustomerName';
import SaleValue from './_components/Salevalue';
import { Status } from './_components/Status';
import { ContactDatePicker } from './_components/Contactdate';
import { SalesPerson } from './_components/SalesPerson';
import { Priority } from './_components/Priority';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SalePriority, SaleStatus, SaleType } from '@/app/types';
import { useEffect, useState } from 'react';
import { useSalesStore } from '@/app/useSalesStore';

export const salesPersons = [
  'Jim Halpert',
  'Dwight Schrute',
  'Andy Bernard',
  'Pam Beesly',
  'Stanley Hudson',
  'Ryan Howard',
];

const dialogSchema = z.object({
  contactDate: z
    .date({ required_error: 'Please select the date' })
    .refine((date) => !!date, 'Date is required'),
  customerName: z.string().min(1, { message: 'The customer name is required' }),
  saleValue: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '', {
      message: 'Sale value is required',
    })
    .transform((val) => {
      if (val === '') return undefined;
      const num = Number(val);
      return Number(num.toFixed(2));
    })
    .pipe(
      z
        .number({
          required_error: 'Sale value is required',
          invalid_type_error: 'Sale value must be a number',
        })
        .nonnegative('Sale value cannot be negative')
    ),
});

type FormData = z.infer<typeof dialogSchema>;

export default function SalesDialog() {
  const [selectedPriority, setSelectedPriority] = useState<SalePriority>('Low');
  const [selectedStatus, setSelectedStatus] =
    useState<SaleStatus>('In Progress');

  const [selectedSalesperson, setSelectedSalesperson] = useState(
    salesPersons[0]
  );

  const methods = useForm<FormData>({
    resolver: zodResolver(dialogSchema),
    defaultValues: {
      saleValue: 0.0,
      customerName: '',
    },
  });

  const {
    addSale,
    openDealDialog,
    setOpenDealDialog,
    selectedSale,
    setSelectedSale,
    updateSale,
    isLoading,
  } = useSalesStore();

  const onSubmit = async (data: FormData) => {
    const formattedSaleValue = data.saleValue.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
    if (!selectedSale) {
      const newSale: SaleType = {
        clerkUserId: '',
        customerName: data.customerName,
        dealValue: formattedSaleValue,
        status: selectedStatus,
        priority: selectedPriority,
        salesperson: selectedSalesperson,
        contactDate: data.contactDate.toDateString(),
      };

      await addSale(newSale);
    } else {
      //edit sale logic
      const saleToUpdate: SaleType = {
        clerkUserId: selectedSale.clerkUserId,
        _id: selectedSale._id,
        contactDate: data.contactDate.toDateString(),
        dealValue: formattedSaleValue,
        customerName: data.customerName,
        priority: selectedPriority,
        status: selectedStatus,
        salesperson: selectedSalesperson,
      };

      await updateSale(saleToUpdate);
    }
    handleDialogClose();
    setOpenDealDialog(false);
  };

  const handleDialogClose = () => {
    methods.reset();
    setSelectedPriority('Low');
    setSelectedStatus('In Progress');
    setSelectedSalesperson(salesPersons[0]);
  };

  useEffect(() => {
    if (selectedSale) {
      methods.reset({
        customerName: selectedSale.customerName,
        contactDate: new Date(selectedSale.contactDate),
        saleValue: parseFloat(selectedSale.dealValue.replace(/[^0-9.-]+/g, '')),
      });
      setSelectedPriority(selectedSale.priority);
      setSelectedStatus(selectedSale.status);
      setSelectedSalesperson(selectedSale.salesperson);
    } else {
      methods.reset({ saleValue: 0.0, customerName: '' });
    }
  }, [openDealDialog, selectedSale]);

  return (
    <Dialog open={openDealDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="p-0 max-w-3xl max-h-screen sm:max-h-[90vh] max-sm:w-full overflow-auto rounded-lg poppins">
        <div className="sticky top-0 bg-background z-10 pt-6 px-8 ">
          <DialogHeader>
            <DialogTitle className="text-[22px]">
              {selectedSale ? 'Edit Sale' : 'Add Sale'}
            </DialogTitle>
            <DialogDescription className="text-[14px]">
              Fill the form to {selectedSale ? 'edit' : 'add new'} sale
            </DialogDescription>
          </DialogHeader>
        </div>
        <Separator />

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="px-8 py-4 space-y-6"
          >
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                <CustomerName />
                <SaleValue />
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                <Status
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                />
                <Priority
                  selectedPriority={selectedPriority}
                  setSelectedPriority={setSelectedPriority}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                <ContactDatePicker />
                <SalesPerson
                  selectedSalesperson={selectedSalesperson}
                  setSelectedSalesperson={setSelectedSalesperson}
                />
              </div>
            </div>

            <DialogFooter className="pt-2 pb-4 sm:pb-0 flex flex-col sm:flex-row gap-3">
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setSelectedSale(null);
                    setOpenDealDialog(false);
                  }}
                  variant="outline"
                  className="h-11 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto bg-primary hover:bg-blue-600 "
              >
                {isLoading
                  ? selectedSale
                    ? 'Updating...'
                    : 'Adding...'
                  : selectedSale
                  ? 'Edit Sale'
                  : 'Add Sale'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
