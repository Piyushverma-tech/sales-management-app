import { SaleStatus, SaleType } from '@/app/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type selectedStatusProps = {
  selectedStatus: SaleStatus;
  setSelectedStatus: React.Dispatch<React.SetStateAction<SaleStatus>>;
};
export function Status({
  selectedStatus,
  setSelectedStatus,
}: selectedStatusProps) {
  const statuses = ['In Progress', 'Closed Won', 'Closed Lost', 'Negotiation'];

  return (
    <div className="flex flex-col gap-2 poppins">
      <Label className="text-slate-600">{'Status'}</Label>

      <Select
        value={selectedStatus}
        onValueChange={(value) =>
          setSelectedStatus(value as SaleType['status'])
        }
      >
        <SelectTrigger className="h-[45px] shadow-none">
          <SelectValue placeholder={selectedStatus} />
        </SelectTrigger>
        <SelectContent className="poppins">
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
