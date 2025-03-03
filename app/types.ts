export type SaleStatus =
  | 'In Progress'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Negotiation';
export type SalePriority = 'Low' | 'Medium' | 'High';

export type SaleType = {
  id: string;
  customerName: string;
  dealValue: string;
  status: SaleStatus;
  contactDate: string;
  salesperson: string;
  priority: SalePriority;
};
