import { useSalesStore } from '@/app/useSalesStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarRange } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdError } from 'react-icons/md';

export function ContactDatePicker() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const { selectedSale } = useSalesStore();

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setValue('contactDate', selectedDate);

    if (selectedDate) {
      clearErrors('contactDate');
    }
  };

  useEffect(() => {
    if (selectedSale) {
      const saleDate = new Date(selectedSale.contactDate);
      setDate(saleDate);
      setValue('contactDate', saleDate);
    } else {
      setValue('contactDate', date);
    }
    clearErrors('contactDate');
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-slate-600">{'Contact Date'}</Label>
      <Popover>
        <PopoverTrigger className="border" asChild>
          <Button
            variant={'outline'}
            className="border flex gap-1 items-center justify-start h-11"
          >
            <CalendarRange className={`${!date && 'text-slate-500'}`} />
            {date ? (
              format(date, 'PPP')
            ) : (
              <span className="text-slate-500">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>

      {errors.contactDate && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>Please select the date</p>
        </div>
      )}
    </div>
  );
}
