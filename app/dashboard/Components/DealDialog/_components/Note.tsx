import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Note() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="note" className="text-sm font-medium">
        Note (Optional)
      </Label>
      <Textarea
        id="note"
        placeholder="Add a short note about this sale..."
        className="resize-none"
        rows={3}
        {...register('note')}
      />
      {errors.note && (
        <p className="text-sm text-destructive">
          {errors.note?.message?.toString()}
        </p>
      )}
    </div>
  );
}
