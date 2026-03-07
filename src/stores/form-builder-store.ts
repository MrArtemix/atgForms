"use client";

import { create } from "zustand";
import { FormField, FieldType, FieldOption, ValidationRules, FieldConfig } from "@/types/field-types";
import { FormPage, FormStatus } from "@/types/form";
import { ConditionalLogic } from "@/types/conditional-logic";
import { FIELD_TYPE_CONFIGS } from "@/lib/constants/field-types";
import { useHistoryStore } from "./history-store";

interface FormBuilderState {
  // Form metadata
  formId: string | null;
  title: string;
  description: string;
  status: FormStatus;

  // Fields stored as Record for O(1) access
  fields: Record<string, FormField>;
  // Order of field IDs per page
  fieldOrder: Record<string, string[]>;

  // Pages
  pages: FormPage[];
  currentPageId: string | null;

  // Selection
  selectedFieldId: string | null;

  // Save status
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;

  // Actions
  initForm: (formId: string, title: string, description: string, status: FormStatus, pages: FormPage[], fields: FormField[]) => void;

  // Title/Description
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;

  // Field actions
  addField: (type: FieldType, pageId: string, index?: number) => FormField;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  updateFieldLabel: (fieldId: string, label: string) => void;
  updateFieldRequired: (fieldId: string, required: boolean) => void;
  updateFieldOptions: (fieldId: string, options: FieldOption[]) => void;
  updateFieldValidation: (fieldId: string, rules: Partial<ValidationRules>) => void;
  updateFieldConfig: (fieldId: string, config: Partial<FieldConfig>) => void;
  updateFieldConditionalLogic: (fieldId: string, logic: ConditionalLogic | null) => void;
  moveField: (fieldId: string, fromPageId: string, toPageId: string, newIndex: number) => void;
  reorderFields: (pageId: string, newOrder: string[]) => void;
  duplicateField: (fieldId: string) => void;

  // Page actions
  addPage: (title?: string) => FormPage;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<FormPage>) => void;
  reorderPages: (newOrder: string[]) => void;
  setCurrentPage: (pageId: string) => void;
  setStatus: (status: FormStatus) => void;

  // Selection
  selectField: (fieldId: string | null) => void;

  // Save
  markDirty: () => void;
  markSaving: () => void;
  markSaved: () => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultField(type: FieldType, pageId: string, formId: string, sortOrder: number): FormField {
  const config = FIELD_TYPE_CONFIGS[type];
  return {
    id: generateId(),
    form_id: formId,
    page_id: pageId,
    type,
    label: config.label,
    description: null,
    placeholder: null,
    required: false,
    sort_order: sortOrder,
    validation_rules: { ...config.defaultValidation },
    options:
      config.hasOptions
        ? [
          { id: generateId(), label: "Option 1", value: "option_1" },
          { id: generateId(), label: "Option 2", value: "option_2" },
        ]
        : [],
    field_config: { ...config.defaultConfig },
    conditional_logic: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const initialState = {
  formId: null as string | null,
  title: "Untitled Form",
  description: "",
  fields: {} as Record<string, FormField>,
  fieldOrder: {} as Record<string, string[]>,
  pages: [] as FormPage[],
  currentPageId: null as string | null,
  selectedFieldId: null as string | null,
  isDirty: false,
  isSaving: false,
  status: "draft" as FormStatus,
  lastSavedAt: null as string | null,
};

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  ...initialState,

  initForm: (formId, title, description, status, pages, fields) => {
    const fieldsRecord: Record<string, FormField> = {};
    const fieldOrder: Record<string, string[]> = {};

    pages.forEach((page) => {
      fieldOrder[page.id] = [];
    });

    fields
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((field) => {
        fieldsRecord[field.id] = field;
        if (fieldOrder[field.page_id]) {
          fieldOrder[field.page_id].push(field.id);
        }
      });

    set({
      formId,
      title,
      description,
      status,
      pages: pages.sort((a, b) => a.sort_order - b.sort_order),
      fields: fieldsRecord,
      fieldOrder,
      currentPageId: pages[0]?.id || null,
      selectedFieldId: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
    });

    useHistoryStore.getState().clear();
    useHistoryStore.getState().pushSnapshot({ fields: fieldsRecord, fieldOrder, pages, title, description });
  },

  reset: () => set(initialState),

  setTitle: (title) => {
    const state = get();
    set({ title, isDirty: true });
    useHistoryStore.getState().pushSnapshot({
      fields: state.fields, fieldOrder: state.fieldOrder, pages: state.pages, title, description: state.description,
    });
  },

  setDescription: (description) => {
    const state = get();
    set({ description, isDirty: true });
    useHistoryStore.getState().pushSnapshot({
      fields: state.fields, fieldOrder: state.fieldOrder, pages: state.pages, title: state.title, description,
    });
  },

  addField: (type, pageId, index) => {
    const state = get();
    const order = state.fieldOrder[pageId] || [];
    const sortOrder = index !== undefined ? index : order.length;
    const field = createDefaultField(type, pageId, state.formId || "", sortOrder);

    const newOrder = [...order];
    if (index !== undefined) {
      newOrder.splice(index, 0, field.id);
    } else {
      newOrder.push(field.id);
    }

    const newFields = { ...state.fields, [field.id]: field };
    const newFieldOrder = { ...state.fieldOrder, [pageId]: newOrder };

    set({
      fields: newFields,
      fieldOrder: newFieldOrder,
      selectedFieldId: field.id,
      isDirty: true,
    });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields,
      fieldOrder: newFieldOrder,
      pages: state.pages,
      title: state.title,
      description: state.description,
    });

    return field;
  },

  removeField: (fieldId) => {
    const state = get();
    const field = state.fields[fieldId];
    if (!field) return;

    const newFields = { ...state.fields };
    delete newFields[fieldId];

    const newFieldOrder = { ...state.fieldOrder };
    newFieldOrder[field.page_id] = (newFieldOrder[field.page_id] || []).filter(
      (id) => id !== fieldId
    );

    set({
      fields: newFields,
      fieldOrder: newFieldOrder,
      selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      isDirty: true,
    });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields,
      fieldOrder: newFieldOrder,
      pages: state.pages,
      title: state.title,
      description: state.description,
    });
  },

  updateField: (fieldId, updates) => {
    const state = get();
    const field = state.fields[fieldId];
    if (!field) return;

    const newFields = {
      ...state.fields,
      [fieldId]: { ...field, ...updates, updated_at: new Date().toISOString() },
    };

    set({ fields: newFields, isDirty: true });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields, fieldOrder: state.fieldOrder, pages: state.pages,
      title: state.title, description: state.description,
    });
  },

  updateFieldLabel: (fieldId, label) => get().updateField(fieldId, { label }),
  updateFieldRequired: (fieldId, required) => get().updateField(fieldId, { required }),
  updateFieldOptions: (fieldId, options) => get().updateField(fieldId, { options }),

  updateFieldValidation: (fieldId, rules) => {
    const field = get().fields[fieldId];
    if (!field) return;
    get().updateField(fieldId, {
      validation_rules: { ...field.validation_rules, ...rules },
    });
  },

  updateFieldConfig: (fieldId, config) => {
    const field = get().fields[fieldId];
    if (!field) return;
    get().updateField(fieldId, {
      field_config: { ...field.field_config, ...config },
    });
  },

  updateFieldConditionalLogic: (fieldId, logic) => {
    get().updateField(fieldId, { conditional_logic: logic });
  },

  moveField: (fieldId, fromPageId, toPageId, newIndex) => {
    const state = get();
    const newFieldOrder = { ...state.fieldOrder };

    // Remove from source
    newFieldOrder[fromPageId] = (newFieldOrder[fromPageId] || []).filter(
      (id) => id !== fieldId
    );

    // Add to destination
    const destOrder = [...(newFieldOrder[toPageId] || [])];
    destOrder.splice(newIndex, 0, fieldId);
    newFieldOrder[toPageId] = destOrder;

    // Update field's page_id
    const newFields = {
      ...state.fields,
      [fieldId]: { ...state.fields[fieldId], page_id: toPageId },
    };

    set({ fields: newFields, fieldOrder: newFieldOrder, isDirty: true });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields,
      fieldOrder: newFieldOrder,
      pages: state.pages,
      title: state.title,
      description: state.description,
    });
  },

  reorderFields: (pageId, newOrder) => {
    const state = get();
    const newFieldOrder = { ...state.fieldOrder, [pageId]: newOrder };

    set({ fieldOrder: newFieldOrder, isDirty: true });

    useHistoryStore.getState().pushSnapshot({
      fields: state.fields,
      fieldOrder: newFieldOrder,
      pages: state.pages,
      title: state.title,
      description: state.description,
    });
  },

  duplicateField: (fieldId) => {
    const state = get();
    const field = state.fields[fieldId];
    if (!field) return;

    const newField: FormField = {
      ...field,
      id: generateId(),
      label: `${field.label} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const order = state.fieldOrder[field.page_id] || [];
    const currentIndex = order.indexOf(fieldId);
    const newOrder = [...order];
    newOrder.splice(currentIndex + 1, 0, newField.id);

    const newFields = { ...state.fields, [newField.id]: newField };
    const newFieldOrder = { ...state.fieldOrder, [field.page_id]: newOrder };

    set({
      fields: newFields,
      fieldOrder: newFieldOrder,
      selectedFieldId: newField.id,
      isDirty: true,
    });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields,
      fieldOrder: newFieldOrder,
      pages: state.pages,
      title: state.title,
      description: state.description,
    });
  },

  addPage: (title) => {
    const state = get();
    const page: FormPage = {
      id: generateId(),
      form_id: state.formId || "",
      title: title || `Page ${state.pages.length + 1}`,
      description: null,
      sort_order: state.pages.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newPages = [...state.pages, page];
    const newFieldOrder = { ...state.fieldOrder, [page.id]: [] };

    set({
      pages: newPages,
      fieldOrder: newFieldOrder,
      currentPageId: page.id,
      isDirty: true,
    });

    useHistoryStore.getState().pushSnapshot({
      fields: state.fields,
      fieldOrder: newFieldOrder,
      pages: newPages,
      title: state.title,
      description: state.description,
    });

    return page;
  },

  removePage: (pageId) => {
    const state = get();
    if (state.pages.length <= 1) return;

    const fieldIdsToRemove = state.fieldOrder[pageId] || [];
    const newFields = { ...state.fields };
    fieldIdsToRemove.forEach((id) => delete newFields[id]);

    const newFieldOrder = { ...state.fieldOrder };
    delete newFieldOrder[pageId];

    const newPages = state.pages
      .filter((p) => p.id !== pageId)
      .map((p, i) => ({ ...p, sort_order: i }));

    set({
      pages: newPages,
      fields: newFields,
      fieldOrder: newFieldOrder,
      currentPageId:
        state.currentPageId === pageId ? newPages[0]?.id || null : state.currentPageId,
      isDirty: true,
    });

    useHistoryStore.getState().pushSnapshot({
      fields: newFields,
      fieldOrder: newFieldOrder,
      pages: newPages,
      title: state.title,
      description: state.description,
    });
  },

  updatePage: (pageId, updates) => {
    const state = get();
    set({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
      isDirty: true,
    });
  },

  reorderPages: (newOrder) => {
    const state = get();
    const pageMap = new Map(state.pages.map((p) => [p.id, p]));
    const newPages = newOrder
      .map((id, i) => {
        const page = pageMap.get(id);
        return page ? { ...page, sort_order: i } : null;
      })
      .filter(Boolean) as FormPage[];

    set({ pages: newPages, isDirty: true });
  },

  setCurrentPage: (pageId) => set({ currentPageId: pageId }),

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),

  markDirty: () => set({ isDirty: true }),
  markSaving: () => set({ isSaving: true }),
  markSaved: () =>
    set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),

  setStatus: (status) => set({ status }),
}));
