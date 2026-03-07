"use client";

import { createContext, useContext } from "react";

export type SaveNowFn = () => Promise<void>;

const BuilderSaveContext = createContext<SaveNowFn | null>(null);

export function BuilderSaveProvider({
  saveNow,
  children,
}: {
  saveNow: SaveNowFn;
  children: React.ReactNode;
}) {
  return (
    <BuilderSaveContext.Provider value={saveNow}>
      {children}
    </BuilderSaveContext.Provider>
  );
}

export function useBuilderSave(): SaveNowFn | null {
  return useContext(BuilderSaveContext);
}
