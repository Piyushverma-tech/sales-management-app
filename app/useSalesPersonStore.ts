import { create } from 'zustand';
import { toast } from 'sonner';

interface SalesPersonState {
  salesPersons: string[];
  loadSalesPersons: () => Promise<void>;
  addSalesPerson: (name: string) => Promise<void>;
  deleteSalesPerson: (name: string) => Promise<void>;
}

export const useSalesPersonStore = create<SalesPersonState>((set) => ({
  salesPersons: [],

  loadSalesPersons: async () => {
    try {
      const response = await fetch('/api/sales-persons');
      
      if (!response.ok) {
        if (response.status === 400) {
          // No organization selected
          set({ salesPersons: [] });
          return;
        }
        throw new Error('Failed to load sales persons');
      }
      
      const data = await response.json();
      // Handle both array response and object response with salesPersons property
      const salesPersonsArray = Array.isArray(data) ? data : (data.salesPersons || []);
      set({ salesPersons: salesPersonsArray });
    } catch (error) {
      console.error('Error loading sales persons:', error);
      toast.error('Failed to load sales persons');
      // Set to empty array on error to prevent map errors
      set({ salesPersons: [] });
    }
  },

  addSalesPerson: async (name) => {
    // Note: This function is kept for API completeness but not exposed in the UI.
    // Members are now exclusively managed through the Clerk dashboard and synced to the app.
    try {
      const response = await fetch('/api/sales-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add');
      }

      set((state) => ({ salesPersons: [...state.salesPersons, name] }));
      toast(`Added ${name} to sales team!`, {
        duration: 5000,
        position: 'top-right',
        action: {
          label: 'Close',
          onClick: () => toast.dismiss(),
        },
        style: {
          fontSize: '14px',
          backgroundColor: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      console.error('Error adding sales person:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add sales person');
    }
  },

  deleteSalesPerson: async (name) => {
    // Note: This function is kept for API completeness but not exposed in the UI.
    // Member deletion should be handled by organization admins through the Clerk dashboard.
    try {
      const response = await fetch('/api/sales-persons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      set((state) => ({
        salesPersons: state.salesPersons.filter((person) => person !== name),
      }));
      toast(`Removed ${name} from sales team!`, {
        duration: 5000,
        position: 'top-right',
        action: {
          label: 'Close',
          onClick: () => toast.dismiss(),
        },
        style: {
          fontSize: '14px',
          backgroundColor: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      console.error('Error deleting sales person:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete sales person');
    }
  },
}));
