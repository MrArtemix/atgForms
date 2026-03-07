"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { useAutoSave } from "@/lib/hooks/use-auto-save";
import { formService } from "@/lib/services/form-service";
import { BuilderLayout } from "@/components/builder/builder-layout";
import { DndProvider } from "@/components/builder/dnd-provider";
import { BuilderSaveProvider } from "@/components/builder/builder-save-context";
import { LoadingPage } from "@/components/common/loading";

export default function FormEditPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading, error, refetch } = useForm(formId);
  const initForm = useFormBuilderStore((s) => s.initForm);
  const initializedFormIdRef = useRef<string | null>(null);

  // N'initialiser le store qu'une seule fois par formulaire chargé, pour ne pas
  // écraser les modifications en cours avec une ancienne version de `form`.
  useEffect(() => {
    if (!form || form.id !== formId) return;
    if (initializedFormIdRef.current === formId) return;
    initializedFormIdRef.current = formId;
    initForm(
      form.id,
      form.title,
      form.description || "",
      form.status,
      form.pages,
      form.fields
    );
  }, [form, formId, initForm]);

  const performSave = useCallback(async () => {
    const state = useFormBuilderStore.getState();
    if (!state.formId) return;
    useFormBuilderStore.getState().markSaving();
    try {
      await formService.updateForm(state.formId, {
        title: state.title,
        description: state.description || null,
      } as any);
      await formService.savePagesAndFields(
        state.formId,
        state.pages,
        state.fields,
        state.fieldOrder
      );
      useFormBuilderStore.getState().markSaved();
      await refetch();
    } finally {
      useFormBuilderStore.setState({ isSaving: false });
    }
  }, [refetch]);

  // Auto-save (avec refetch après succès pour garder form à jour)
  useAutoSave(async () => {
    await performSave();
  });

  const saveNow = useCallback(async () => {
    const state = useFormBuilderStore.getState();
    if (!state.formId || state.isSaving) return;
    await performSave();
  }, [performSave]);

  if (loading) return <LoadingPage />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error loading form: {error}</p>
      </div>
    );
  }

  return (
    <DndProvider>
      <BuilderSaveProvider saveNow={saveNow}>
        <BuilderLayout />
      </BuilderSaveProvider>
    </DndProvider>
  );
}
