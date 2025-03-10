import { SalePriority, SaleType } from '@/app/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type selectedPriorityProps = {
  selectedPriority: SalePriority;
  setSelectedPriority: React.Dispatch<React.SetStateAction<SalePriority>>;
};

export function Priority({
  selectedPriority,
  setSelectedPriority,
}: selectedPriorityProps) {
  const priority: SaleType['priority'][] = ['Low', 'Medium', 'High'];

  function renderBoxColor(priority: SaleType['priority']) {
    switch (priority) {
      case 'Low':
        return 'bg-green-400';
      case 'Medium':
        return 'bg-yellow-400';
      case 'High':
        return 'bg-red-500';
      default:
        return 'bg-green-400';
    }
  }

  return (
    <div className="flex flex-col gap-2 poppins">
      <Label className="text-slate-600">{'Priority'}</Label>

      <Select
        value={selectedPriority}
        onValueChange={(value) =>
          setSelectedPriority(value as SaleType['priority'])
        }
      >
        <SelectTrigger className="h-[45px] shadow-none">
          <SelectValue placeholder={selectedPriority} />
        </SelectTrigger>

        <SelectContent className="poppins">
          {priority.map((priority) => (
            <SelectItem key={priority} value={priority}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${renderBoxColor(priority)}`}
                ></div>
                <span>{priority}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
