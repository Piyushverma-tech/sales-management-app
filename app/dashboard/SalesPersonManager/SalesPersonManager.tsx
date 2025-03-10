import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSalesPersonStore } from '@/app/useSalesPersonStore';
import { useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSalesStore } from '@/app/useSalesStore';
import { SaleType } from '@/app/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export function SalesPersonManager() {
  const { salesPersons, loadSalesPersons, addSalesPerson, deleteSalesPerson } =
    useSalesPersonStore();
  const { openSalesPersonDialog, setOpenSalesPersonDialog, allSales } =
    useSalesStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const sortedSalesPersons = salesPersons
    .map((person) => ({
      name: person,
      count: allSales.filter((sale: SaleType) => sale.salesperson === person)
        .length,
    }))
    .sort((a, b) => b.count - a.count);

  useEffect(() => {
    loadSalesPersons();
  }, []);

  const onSubmit = async (data: { name: string }) => {
    await addSalesPerson(data.name);
    reset();
  };

  return (
    <Dialog
      open={openSalesPersonDialog}
      onOpenChange={setOpenSalesPersonDialog}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Sales Team
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                {...register('name')}
                placeholder="Enter sales person name"
                className="w-full h-10"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Button type="submit" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </form>

        <ScrollArea className="h-64 pr-4 mt-4">
          <div className="space-y-4">
            {salesPersons.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No sales persons added yet
              </div>
            ) : (
              sortedSalesPersons.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center justify-between border border-gray-600 hover:bg-gray-200/10 transition-colors py-1 px-4 rounded-md"
                >
                  <span className="font-medium mr-6">{person.name}</span>
                  <span className="text-gray-500 text-sm mr-auto">
                    Sales: {person.count}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSalesPerson(person.name)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
