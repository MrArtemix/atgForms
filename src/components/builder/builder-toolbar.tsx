"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { useHistoryStore } from "@/stores/history-store";
import { useBuilderSave } from "@/components/builder/builder-save-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Undo2, Redo2, Eye, Send, Loader2, Cloud, CloudOff, Link as LinkIcon, Check, TrendingUp, SlidersHorizontal, Save } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formService } from "@/lib/services/form-service";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";

export function BuilderToolbar() {
  const { title, setTitle, isDirty, isSaving, lastSavedAt, formId, status, setStatus, fieldOrder } = useFormBuilderStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const saveNow = useBuilderSave();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalFields = useMemo(() => {
    return Object.values(fieldOrder).reduce((sum, ids) => sum + ids.length, 0);
  }, [fieldOrder]);

  const handleSave = useCallback(async () => {
    if (saveNow && !isSaving) {
      try {
        await saveNow();
        toast({
          title: "Enregistré",
          description: "Vos modifications ont été sauvegardées",
          duration: 2000,
        });
      } catch (e) {
        console.error("Save failed:", e);
      }
    }
  }, [saveNow, isSaving, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleUndo = () => {
    const snapshot = undo();
    if (snapshot) {
      useFormBuilderStore.setState({
        fields: snapshot.fields,
        fieldOrder: snapshot.fieldOrder,
        pages: snapshot.pages,
        title: snapshot.title,
        description: snapshot.description,
        isDirty: true,
      });
    }
  };

  const handleRedo = () => {
    const snapshot = redo();
    if (snapshot) {
      useFormBuilderStore.setState({
        fields: snapshot.fields,
        fieldOrder: snapshot.fieldOrder,
        pages: snapshot.pages,
        title: snapshot.title,
        description: snapshot.description,
        isDirty: true,
      });
    }
  };

  const handlePublish = async () => {
    if (!formId) return;
    setIsPublishing(true);
    try {
      // Save pending changes before publishing
      if (saveNow) await saveNow();
      const publishedForm = await formService.publishForm(formId);
      setStatus("published");
      const origin = window.location.origin;
      const publicUrl = `${origin}/f/${publishedForm.slug}`;

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(publicUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Ignore clipboard failures silently
        }
      };

      toast({
        title: "Succès",
        description: (
          <div className="space-y-1">
            <p>Formulaire publié avec succès ! Partagez ce lien :</p>
            <p className="flex items-center gap-2 rounded-md bg-[hsl(var(--muted))] px-2 py-1 text-xs font-mono break-all">
              <LinkIcon className="h-3 w-3 shrink-0 text-[hsl(var(--primary))]" />
              <span className="truncate">{publicUrl}</span>
            </p>
          </div>
        ),
        action: (
          <ToastAction altText="Copy link" onClick={() => void handleCopy()}>
            {copied ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3 w-3" />
                Copié !
              </span>
            ) : (
              "Copier le lien"
            )}
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Failed to publish form:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Échec de la publication. Veuillez réessayer.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-lg">
      {/* Form Title - Editable */}
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-none bg-transparent text-lg font-semibold w-auto min-w-[200px] max-w-[400px] focus-visible:ring-1 h-9 px-2"
          placeholder="Titre du formulaire..."
        />
        {/* Status Badge */}
        {status && (
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            status === "published" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            status === "draft" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            status === "closed" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {status === "published" ? "Publié" : status === "draft" ? "Brouillon" : "Fermé"}
          </span>
        )}
        <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
          {totalFields} champ{totalFields !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Save Status */}
      <div className="flex items-center gap-1.5 text-sm ml-2">
        {isSaving ? (
          <span className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] animate-fade-in">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Enregistrement...</span>
          </span>
        ) : isDirty ? (
          <span className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] animate-fade-in">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Non enregistré</span>
          </span>
        ) : lastSavedAt ? (
          <span className="flex items-center gap-1.5 text-green-600 animate-fade-in">
            <Cloud className="h-3.5 w-3.5" />
            <span>Enregistré</span>
          </span>
        ) : null}
        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleSave()}
            className="h-7 px-2 text-xs gap-1"
            title="Enregistrer (Cmd+S)"
          >
            <Save className="h-3 w-3" />
            <span className="hidden md:inline">Sauvegarder</span>
          </Button>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
          className={cn("transition-opacity duration-200", !canUndo && "opacity-40")}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Rétablir (Ctrl+Y)"
          className={cn("transition-opacity duration-200", !canRedo && "opacity-40")}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-1" />

      {/* Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void (async () => {
            if (saveNow) {
              try {
                await saveNow();
              } catch (e) {
                console.error("Save before preview failed:", e);
              }
            }
            window.open(`/forms/${formId}/preview`, "_blank");
          })();
        }}
        className="hover-lift"
      >
        <Eye className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Aperçu</span>
      </Button>

      {formId && (
        <>
          <Button variant="outline" size="sm" asChild className="hover-lift">
            <Link href={`/forms/${formId}/responses`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Réponses</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="hover-lift">
            <Link href={`/forms/${formId}/settings`}>
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Paramètres</span>
            </Link>
          </Button>
        </>
      )}

      <Button
        size="sm"
        onClick={() => void handlePublish()}
        disabled={isPublishing}
        className="active-press hover-lift"
      >
        {isPublishing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-1" />
        )}
        {status === "published" ? "Publié" : "Publier"}
      </Button>
    </div>
  );
}
