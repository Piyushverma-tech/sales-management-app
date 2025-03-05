import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSalesPersonStore } from '@/app/useSalesPersonStore';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useSalesStore } from '@/app/useSalesStore';

type selectedSalespersonProps = {
  selectedSalesperson: string;
  setSelectedSalesperson: React.Dispatch<React.SetStateAction<string>>;
};
export function SalesPerson({
  selectedSalesperson,
  setSelectedSalesperson,
}: selectedSalespersonProps) {
  const { salesPersons, loadSalesPersons } = useSalesPersonStore();
  const { setOpenSalesPersonDialog } = useSalesStore();

  useEffect(() => {
    loadSalesPersons();
  }, []);

  return (
    <div className="flex flex-col gap-2 poppins">
      <Label className="text-slate-600">{'Sales Person'}</Label>

      <Select
        value={selectedSalesperson}
        onValueChange={(value) => setSelectedSalesperson(value)}
      >
        <SelectTrigger className="h-[45px] shadow-none">
          <SelectValue placeholder="Select a sales person" />
        </SelectTrigger>

        <SelectContent className="poppins">
          {salesPersons.length > 0 ? (
            salesPersons.map((person) => (
              <SelectItem key={person} value={person}>
                {person}
              </SelectItem>
            ))
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-500 text-sm italic">
                Please add a sales person
              </span>
              <Button
                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white sm:mr-4"
                size="sm"
                onClick={() => setOpenSalesPersonDialog(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
