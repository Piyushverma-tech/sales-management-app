export type SaleStatus =
  | 'In Progress'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Negotiation';
export type SalePriority = 'Low' | 'Medium' | 'High';

export type SaleType = {
  id: string;
  customerName: string;
  dealValue: string; // assuming dealValue is a number, if it's a string, adjust accordingly
  status: SaleStatus;
  contactDate: string; // assuming Contactdate is a Date object, if it's a string, adjust accordingly
  salesperson: string;
  priority: SalePriority; // assuming priority is a string, if it's a number, adjust accordingly
};
