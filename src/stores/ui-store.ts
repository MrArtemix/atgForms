"use client";

import { create } from "zustand";

export type BuilderTab = "edit" | "settings" | "preview" | "responses" | "analytics" | "theme";

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activeTab: BuilderTab;
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: BuilderTab) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeTab: "edit",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
