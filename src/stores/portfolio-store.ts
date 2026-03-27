import { create } from 'zustand';
import type { Position, Transaction, Order, UserProfile } from '@/types';

interface PortfolioStore {
  user: UserProfile | null;
  positions: Position[];
  transactions: Transaction[];
  orders: Order[];
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setPositions: (positions: Position[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (amount: number) => void;
}

const INITIAL_BALANCE = 1000000; // ₹10,00,000

export const usePortfolioStore = create<PortfolioStore>()((set) => ({
  user: null,
  positions: [],
  transactions: [],
  orders: [],
  isLoading: false,

  setUser: (user) => set({ user }),
  setPositions: (positions) => set({ positions }),
  setTransactions: (transactions) => set({ transactions }),
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateBalance: (amount) =>
    set((state) => ({
      user: state.user ? { ...state.user, virtualBalance: amount } : null,
    })),
}));

export { INITIAL_BALANCE };
