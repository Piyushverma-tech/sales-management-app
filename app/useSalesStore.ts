import { create } from 'zustand';
import { SaleType } from './types';
import { toast } from 'sonner';

interface SalesAppState {
  allSales: SaleType[];
  openDeleteDialog: boolean;
  selectedSale: SaleType | null;
  setSelectedSale: (sale: SaleType | null) => void;
  isLoading: boolean;
  openDealDialog: boolean;
  noOrganization: boolean;
  setOpenDealDialog: (open: boolean) => void;
  openSalesPersonDialog: boolean;
  setOpenSalesPersonDialog: (open: boolean) => void;
  setOpenDeleteDialog: (open: boolean) => void;
  loadAllSales: () => Promise<void>;
  addSale: (newSale: SaleType) => Promise<{ success: boolean }>;
  updateSale: (updatedSale: SaleType) => Promise<{ success: boolean }>;
  deleteSale: (saleId: string) => Promise<{ success: boolean }>;
}

export const useSalesStore = create<SalesAppState>((set) => ({
  allSales: [],
  openDeleteDialog: false,
  isLoading: false,
  selectedSale: null,
  openDealDialog: false,
  openSalesPersonDialog: false,
  noOrganization: false,

  // Setter for opening/closing the deal dialog
  setOpenDealDialog: (open) => {
    set({ openDealDialog: open });
  },

  // Setter for opening/closing the delete dialog
  setOpenDeleteDialog: (open) => {
    set({ openDeleteDialog: open });
  },

  // Setter for opening/closing the sales person dialog
  setOpenSalesPersonDialog: (open) => {
    set({ openSalesPersonDialog: open });
  },

  // Setter for selecting a sale
  setSelectedSale: (sale: SaleType | null) => {
    set({ selectedSale: sale });
  },

  // Fetch all sales from the API
  loadAllSales: async () => {
    set({ isLoading: true, noOrganization: false });
    try {
      const response = await fetch('/api/sales-data');
      
      if (response.status === 400) {
        // No organization selected
        set({ noOrganization: true, allSales: [] });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const data = await response.json();
      set({ allSales: data, noOrganization: false });
    } catch (error) {
      toast.error('Failed to fetch sales');
      console.log(error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new sale
  addSale: async (newSale: SaleType) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/sales-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSale),
      });

      if (response.status === 400) {
        toast.error('Please select an organization first');
        return { success: false };
      }

      if (!response.ok) {
        throw new Error('Failed to add sale');
      }

      const addedSale = await response.json();
      set((state) => ({ allSales: [...state.allSales, addedSale] }));
      toast('Sale Added!', {
        description: `You have added a new sale for ${addedSale.customerName} worth ${addedSale.dealValue}`,
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
      return { success: true };
    } catch (error) {
      toast.error('Failed to add sale');
      console.log(error);
      return { success: false };
    } finally {
      set({ isLoading: false, openDealDialog: false, selectedSale: null });
    }
  },

  // Update an existing sale
  updateSale: async (updatedSale: SaleType) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/sales-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSale),
      });

      if (response.status === 400) {
        toast.error('Please select an organization first');
        return { success: false };
      }

      if (response.status === 403) {
        toast.error('Permission denied', {
          description: 'You can only edit your own sales',
        });
        return { success: false };
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update sale');
      }

      const updatedData = await response.json();
      set((state) => ({
        allSales: state.allSales.map((sale) =>
          sale._id === updatedData._id ? updatedData : sale
        ),
      }));
      toast('Sale Updated!', {
        description: `You have updated a sale for ${updatedData.customerName} worth ${updatedData.dealValue}`,
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
      return { success: true };
    } catch (error) {
      toast.error('Failed to update sale');
      console.log(error);
      return { success: false };
    } finally {
      set({ isLoading: false, openDealDialog: false, selectedSale: null });
    }
  },

  // Delete a sale
  deleteSale: async (saleId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/sales-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: saleId }),
      });

      if (response.status === 400) {
        toast.error('Please select an organization first');
        return { success: false };
      }

      if (response.status === 403) {
        toast.error('Permission denied', {
          description: 'You can only delete your own sales',
        });
        return { success: false };
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sale');
      }

      set((state) => ({
        allSales: state.allSales.filter((sale) => sale._id !== saleId),
      }));
      toast('Sale Deleted!', {
        description: 'The sale has been deleted successfully.',
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
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete sale');
      console.log(error);
      return { success: false };
    } finally {
      set({ isLoading: false, openDeleteDialog: false, selectedSale: null });
    }
  },
}));
