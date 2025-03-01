import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { salesPersons } from '../DealDialog';

type selectedSalespersonProps = {
  selectedSalesperson: string;
  setSelectedSalesperson: React.Dispatch<React.SetStateAction<string>>;
};
export function SalesPerson({
  selectedSalesperson,
  setSelectedSalesperson,
}: selectedSalespersonProps) {
  return (
    <div className="flex flex-col gap-2 poppins">
      <Label className="text-slate-600">{'Sales Person'}</Label>

      <Select
        value={selectedSalesperson}
        onValueChange={(value) => setSelectedSalesperson(value)}
      >
        <SelectTrigger className="h-[45px] shadow-none">
          <SelectValue placeholder={selectedSalesperson} />
        </SelectTrigger>

        <SelectContent className="poppins">
          {salesPersons.map((person) => (
            <SelectItem key={person} value={person}>
              {person}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
