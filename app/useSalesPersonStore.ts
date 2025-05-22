import { create } from 'zustand';
import { toast } from 'sonner';

interface SalesPersonState {
  salesPersons: string[];
  loadSalesPersons: () => Promise<void>;
  addSalesPerson: (name: string) => Promise<void>;
  deleteSalesPerson: (name: string) => Promise<void>;
  syncOrganizationMembers: () => Promise<void>;
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
      set({ salesPersons: data });
    } catch (error) {
      console.error('Error loading sales persons:', error);
      toast.error('Failed to load sales persons');
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

  syncOrganizationMembers: async () => {
    try {
      console.log("Sending sync members request...");
      const response = await fetch('/api/sales-persons/sync-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync members');
      }

      set({ salesPersons: data.salesPersons || [] });
      
      toast(`Synced ${data.count} organization members!`, {
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
      console.error('Error syncing organization members:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync organization members');
    }
  },
}));
