"use client";

import { create } from "zustand";
import { FormField } from "@/types/field-types";
import { FormPage } from "@/types/form";

export type FieldValue = string | number | boolean | string[] | Record<string, string | string[]> | File[] | (string | File)[] | null | undefined;

interface FormRendererState {
  // Form data
  formId: string | null;
  pages: FormPage[];
  fields: FormField[];

  // Current state
  currentPageIndex: number;
  answers: Record<string, FieldValue>;
  errors: Record<string, string>;
  visibleFields: Set<string>;
  touchedFields: Set<string>;

  // Status
  isSubmitting: boolean;
  isSubmitted: boolean;

  // Actions
  initRenderer: (formId: string, pages: FormPage[], fields: FormField[]) => void;
  reset: () => void;

  setAnswer: (fieldId: string, value: FieldValue) => void;
  setError: (fieldId: string, error: string) => void;
  clearError: (fieldId: string) => void;
  clearAllErrors: () => void;

  setVisibleFields: (fieldIds: Set<string>) => void;
  touchField: (fieldId: string) => void;

  goToNextPage: () => boolean;
  goToPrevPage: () => void;
  goToPage: (index: number) => void;

  setSubmitting: (submitting: boolean) => void;
  setSubmitted: () => void;

  getCurrentPageFields: () => FormField[];
  getProgress: () => number;
}

export const useFormRendererStore = create<FormRendererState>((set, get) => ({
  formId: null,
  pages: [],
  fields: [],
  currentPageIndex: 0,
  answers: {},
  errors: {},
  visibleFields: new Set(),
  touchedFields: new Set(),
  isSubmitting: false,
  isSubmitted: false,

  initRenderer: (formId, pages, fields) => {
    const allFieldIds = new Set(fields.map((f) => f.id));
    set({
      formId,
      pages: pages.sort((a, b) => a.sort_order - b.sort_order),
      fields: fields.sort((a, b) => a.sort_order - b.sort_order),
      currentPageIndex: 0,
      answers: {},
      errors: {},
      visibleFields: allFieldIds,
      touchedFields: new Set(),
      isSubmitting: false,
      isSubmitted: false,
    });
  },

  reset: () =>
    set({
      formId: null,
      pages: [],
      fields: [],
      currentPageIndex: 0,
      answers: {},
      errors: {},
      visibleFields: new Set(),
      touchedFields: new Set(),
      isSubmitting: false,
      isSubmitted: false,
    }),

  setAnswer: (fieldId, value) =>
    set((state) => ({
      answers: { ...state.answers, [fieldId]: value },
    })),

  setError: (fieldId, error) =>
    set((state) => ({
      errors: { ...state.errors, [fieldId]: error },
    })),

  clearError: (fieldId) =>
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[fieldId];
      return { errors: newErrors };
    }),

  clearAllErrors: () => set({ errors: {} }),

  setVisibleFields: (fieldIds) => set({ visibleFields: fieldIds }),

  touchField: (fieldId) =>
    set((state) => ({
      touchedFields: new Set([...state.touchedFields, fieldId]),
    })),

  goToNextPage: () => {
    const state = get();
    if (state.currentPageIndex < state.pages.length - 1) {
      set({ currentPageIndex: state.currentPageIndex + 1 });
      return true;
    }
    return false;
  },

  goToPrevPage: () => {
    const state = get();
    if (state.currentPageIndex > 0) {
      set({ currentPageIndex: state.currentPageIndex - 1 });
    }
  },

  goToPage: (index) => {
    const state = get();
    if (index >= 0 && index < state.pages.length) {
      set({ currentPageIndex: index });
    }
  },

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setSubmitted: () => set({ isSubmitted: true, isSubmitting: false }),

  getCurrentPageFields: () => {
    const state = get();
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) return [];
    return state.fields
      .filter((f) => f.page_id === currentPage.id)
      .filter((f) => state.visibleFields.has(f.id));
  },

  getProgress: () => {
    const state = get();
    if (state.pages.length === 0) return 0;
    return ((state.currentPageIndex + 1) / state.pages.length) * 100;
  },
}));
