"use client";

import { create } from "zustand";
import { FormField } from "@/types/field-types";
import { FormPage } from "@/types/form";
import { LIMITS } from "@/lib/constants/limits";

export interface HistorySnapshot {
  fields: Record<string, FormField>;
  fieldOrder: Record<string, string[]>;
  pages: FormPage[];
  title: string;
  description: string;
}

/** Deep clone a snapshot to prevent mutation of stored history */
function cloneSnapshot(snapshot: HistorySnapshot): HistorySnapshot {
  return JSON.parse(JSON.stringify(snapshot));
}

interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  pushSnapshot: (snapshot: HistorySnapshot) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushSnapshot: (snapshot) => {
    const state = get();
    // Deep clone to prevent external mutation corrupting history
    const newPast = [...state.past, cloneSnapshot(snapshot)].slice(-LIMITS.history.maxSnapshots);
    set({
      past: newPast,
      future: [],
      canUndo: newPast.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length <= 1) return null;

    const newPast = [...state.past];
    const current = newPast.pop()!;
    const previous = newPast[newPast.length - 1];

    set({
      past: newPast,
      future: [current, ...state.future],
      canUndo: newPast.length > 1,
      canRedo: true,
    });

    return cloneSnapshot(previous);
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const [next, ...restFuture] = state.future;
    const newPast = [...state.past, next];

    set({
      past: newPast,
      future: restFuture,
      canUndo: true,
      canRedo: restFuture.length > 0,
    });

    return cloneSnapshot(next);
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
