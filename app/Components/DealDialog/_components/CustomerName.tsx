import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { MdError } from 'react-icons/md';

export default function CustomerName() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="mt-5 flex flex-col gap-2">
      <Label htmlFor="customer-name" className="text-slate-600">
        {'Customer Name'}
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          id="customer-name"
          className="h-11 shadow-none"
          placeholder="John Doe"
          {...register('customerName')}
        />
      </div>

      {errors.customerName && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{errors.customerName.message as string}</p>
        </div>
      )}
    </div>
  );
}
