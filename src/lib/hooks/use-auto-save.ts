"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { LIMITS } from "@/lib/constants/limits";

export function useAutoSave(saveFunction: () => Promise<void>) {
  const isDirty = useFormBuilderStore((s) => s.isDirty);
  const isSaving = useFormBuilderStore((s) => s.isSaving);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveFnRef = useRef(saveFunction);
  const retryCountRef = useRef(0);

  saveFnRef.current = saveFunction;

  const performSave = useCallback(async () => {
    if (retryCountRef.current >= 3) {
      console.error("Auto-save failed after 3 retries");
      useFormBuilderStore.setState({ isSaving: false, isDirty: true });
      return;
    }
    
    try {
      await saveFnRef.current();
      retryCountRef.current = 0;
    } catch (error) {
      console.error("Auto-save failed:", error);
      retryCountRef.current++;
      useFormBuilderStore.setState({ isSaving: false });
    }
  }, []);

  useEffect(() => {
    if (!isDirty || isSaving) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void performSave();
    }, LIMITS.autoSave.debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, isSaving, performSave]);
}
