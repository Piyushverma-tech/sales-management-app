import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext, Controller } from 'react-hook-form';
import { BiRupee } from 'react-icons/bi';
import { MdError } from 'react-icons/md';
import { NumericFormat } from 'react-number-format';

export default function SaleValue() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="mt-5 flex flex-col gap-2 relative">
      <Label htmlFor="sale-value" className="text-slate-600">
        {'Sale Value'}
      </Label>

      <Controller
        name="saleValue"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value, ...field } }) => (
          <NumericFormat
            {...field}
            value={value}
            customInput={Input}
            thousandSeparator
            placeholder="Enter Amount"
            className="h-11"
            decimalScale={2}
            allowNegative={false}
            onValueChange={(values) => {
              const { floatValue, value } = values;
              onChange(value === '' ? '' : floatValue ?? 0);
            }}
          />
        )}
      />

      {errors.saleValue && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{errors.saleValue.message as string}</p>
        </div>
      )}
      <BiRupee className="absolute right-3 top-9 text-primary" />
    </div>
  );
}
