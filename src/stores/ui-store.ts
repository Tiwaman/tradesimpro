import { create } from 'zustand';

interface UIStore {
  commandOpen: boolean;
  orderPanelOpen: boolean;
  orderType: 'BUY' | 'SELL';
  activeTab: 'positions' | 'orders' | 'history';
  sidebarCollapsed: boolean;
  setCommandOpen: (open: boolean) => void;
  setOrderPanel: (open: boolean, type?: 'BUY' | 'SELL') => void;
  setActiveTab: (tab: 'positions' | 'orders' | 'history') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  commandOpen: false,
  orderPanelOpen: false,
  orderType: 'BUY',
  activeTab: 'positions',
  sidebarCollapsed: false,

  setCommandOpen: (open) => set({ commandOpen: open }),
  setOrderPanel: (open, type) =>
    set((state) => ({
      orderPanelOpen: open,
      orderType: type || state.orderType,
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
