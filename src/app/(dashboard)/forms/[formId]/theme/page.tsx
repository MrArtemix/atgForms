"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "@/lib/hooks/use-form";
import { ThemePicker } from "@/components/themes/theme-picker";
import { ThemeCustomizer } from "@/components/themes/theme-customizer";
import { themeService } from "@/lib/services/theme-service";
import { FormTheme } from "@/types/theme";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";

export default function ThemePage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading, refetch } = useForm(formId);
  const [currentTheme, setCurrentTheme] = useState<Partial<FormTheme>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form?.theme) {
      setCurrentTheme(form.theme);
    }
  }, [form]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await themeService.saveFormTheme(formId, currentTheme);
      await refetch();
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
    setSaving(false);
  };

  const handleSelectSystemTheme = (theme: FormTheme) => {
    const { id: _id, created_at: _created_at, form_id: _form_id, updated_at: _updated_at, is_system: _is_system, ...themeProps } = theme;
    setCurrentTheme(themeProps);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Theme</h2>
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save Theme
        </Button>
      </div>

      <Tabs defaultValue="presets">
        <TabsList>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>
        <TabsContent value="presets" className="mt-4">
          <ThemePicker
            currentTheme={currentTheme?.name ? (currentTheme as FormTheme) : undefined}
            onSelectTheme={handleSelectSystemTheme}
          />
        </TabsContent>
        <TabsContent value="customize" className="mt-4">
          <div className="max-w-xl">
            <ThemeCustomizer
              theme={currentTheme}
              onChange={(updates) => setCurrentTheme((prev) => ({ ...prev, ...updates }))}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
