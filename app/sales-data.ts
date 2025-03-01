import { nanoid } from 'nanoid';
import { SaleType } from './types';

export const salesData: SaleType[] = [
  {
    id: nanoid(),
    customerName: 'John Doe',
    dealValue: '₹95,000',
    status: 'In Progress',
    contactDate: '2024-01-20',
    salesperson: 'Dwight Schrute',
    priority: 'High',
  },
  {
    id: nanoid(),
    customerName: 'Acme Corp',
    dealValue: '₹84,000',
    status: 'In Progress',
    contactDate: '2024-03-05',
    salesperson: 'Jim Halpert',
    priority: 'High',
  },
  {
    id: nanoid(),
    customerName: 'Jane Smith',
    dealValue: '₹78,300',
    status: 'Closed Won',
    contactDate: '2024-02-15',
    salesperson: 'Andy Bernard',
    priority: 'Medium',
  },
  {
    id: nanoid(),
    customerName: 'Tech Solutions',
    dealValue: '₹57,000',
    status: 'Closed Lost',
    contactDate: '2024-02-28',
    salesperson: 'Stanley Hudson',
    priority: 'Low',
  },
];
