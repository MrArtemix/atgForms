"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FIELD_TYPE_CONFIGS } from "@/lib/constants/field-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, GripVertical, Trash2 } from "lucide-react";
import { FieldOption } from "@/types/field-types";

export function PropertiesPanel() {
  const {
    selectedFieldId,
    fields,
    selectField,
    updateFieldLabel,
    updateFieldRequired,
    updateField,
    updateFieldOptions,
    updateFieldValidation,
    updateFieldConfig,
  } = useFormBuilderStore();

  const field = selectedFieldId ? fields[selectedFieldId] : null;

  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-[hsl(var(--muted-foreground))] text-sm animate-fade-in">
        <p>Select a field to edit its properties</p>
      </div>
    );
  }

  const config = FIELD_TYPE_CONFIGS[field.type];

  return (
    <ScrollArea className="h-full custom-scrollbar">
      <div className="p-4 animate-slide-in-right">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Field Properties</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 transition-colors hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
            onClick={() => selectField(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="font-medium">{config.label}</span>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">
              Validation
            </TabsTrigger>
            {config.hasOptions ? (
              <TabsTrigger value="options" className="text-xs">
                Options
              </TabsTrigger>
            ) : (
              <TabsTrigger value="config" className="text-xs">
                Config
              </TabsTrigger>
            )}
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                placeholder="Field label"
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={field.description || ""}
                onChange={(e) =>
                  updateField(field.id, {
                    description: e.target.value || null,
                  })
                }
                placeholder="Optional description"
                rows={2}
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) =>
                  updateField(field.id, {
                    placeholder: e.target.value || null,
                  })
                }
                placeholder="Placeholder text"
                className="transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-xs">Required</Label>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) =>
                  updateFieldRequired(field.id, checked)
                }
              />
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="space-y-4">
            {(field.type === "short_text" || field.type === "long_text") && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Min Length</Label>
                  <Input
                    type="number"
                    value={field.validation_rules.min_length || ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        min_length: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Length</Label>
                  <Input
                    type="number"
                    value={field.validation_rules.max_length || ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        max_length: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="No maximum"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pattern (Regex)</Label>
                  <Input
                    value={field.validation_rules.pattern || ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        pattern: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g. ^[A-Z].*"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pattern Error Message</Label>
                  <Input
                    value={field.validation_rules.pattern_message || ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        pattern_message: e.target.value || undefined,
                      })
                    }
                    placeholder="Invalid format"
                  />
                </div>
              </>
            )}

            {field.type === "number" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Min Value</Label>
                  <Input
                    type="number"
                    value={field.validation_rules.min_value ?? ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        min_value: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Value</Label>
                  <Input
                    type="number"
                    value={field.validation_rules.max_value ?? ""}
                    onChange={(e) =>
                      updateFieldValidation(field.id, {
                        max_value: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </>
            )}

            {!config.hasValidation && field.type !== "number" && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No validation options for this field type.
              </p>
            )}
          </TabsContent>

          {/* Options Tab (for choice fields) */}
          {config.hasOptions && (
            <TabsContent value="options" className="space-y-3">
              <OptionsEditor
                options={field.options}
                onChange={(options) => updateFieldOptions(field.id, options)}
              />
            </TabsContent>
          )}

          {/* Config Tab (for non-choice fields) */}
          {!config.hasOptions && (
            <TabsContent value="config" className="space-y-4">
              {field.type === "linear_scale" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Min</Label>
                      <Input
                        type="number"
                        value={field.field_config.scale_min ?? 1}
                        onChange={(e) =>
                          updateFieldConfig(field.id, {
                            scale_min: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max</Label>
                      <Input
                        type="number"
                        value={field.field_config.scale_max ?? 5}
                        onChange={(e) =>
                          updateFieldConfig(field.id, {
                            scale_max: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Min Label</Label>
                    <Input
                      value={field.field_config.scale_min_label || ""}
                      onChange={(e) =>
                        updateFieldConfig(field.id, {
                          scale_min_label: e.target.value,
                        })
                      }
                      placeholder="e.g. Not at all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Label</Label>
                    <Input
                      value={field.field_config.scale_max_label || ""}
                      onChange={(e) =>
                        updateFieldConfig(field.id, {
                          scale_max_label: e.target.value,
                        })
                      }
                      placeholder="e.g. Very much"
                    />
                  </div>
                </>
              )}

              {field.type === "rating" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Rating</Label>
                    <Select
                      value={String(field.field_config.rating_max || 5)}
                      onValueChange={(v) =>
                        updateFieldConfig(field.id, { rating_max: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Icon</Label>
                    <Select
                      value={field.field_config.rating_icon || "star"}
                      onValueChange={(v) =>
                        updateFieldConfig(field.id, {
                          rating_icon: v as "star" | "heart" | "thumbsup",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="star">Star</SelectItem>
                        <SelectItem value="heart">Heart</SelectItem>
                        <SelectItem value="thumbsup">Thumbs Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {field.type === "long_text" && (
                <div className="space-y-2">
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    min={2}
                    max={20}
                    value={field.field_config.rows || 4}
                    onChange={(e) =>
                      updateFieldConfig(field.id, {
                        rows: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              {field.type === "number" && (
                <div className="space-y-2">
                  <Label className="text-xs">Step</Label>
                  <Input
                    type="number"
                    value={field.field_config.step || 1}
                    onChange={(e) =>
                      updateFieldConfig(field.id, {
                        step: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              {field.type === "section_header" && (
                <div className="space-y-2">
                  <Label className="text-xs">Heading Size</Label>
                  <Select
                    value={field.field_config.header_size || "h2"}
                    onValueChange={(v) =>
                      updateFieldConfig(field.id, {
                        header_size: v as "h2" | "h3" | "h4",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h2">Large (H2)</SelectItem>
                      <SelectItem value="h3">Medium (H3)</SelectItem>
                      <SelectItem value="h4">Small (H4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {field.type === "form_header" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Style de l’en-tête</Label>
                    <Select
                      value={field.field_config.header_style || "default"}
                      onValueChange={(v) =>
                        updateFieldConfig(field.id, {
                          header_style: v as "default" | "image" | "gradient" | "pattern",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Dégradé + motif</SelectItem>
                        <SelectItem value="image">Image de fond</SelectItem>
                        <SelectItem value="gradient">Dégradé seul</SelectItem>
                        <SelectItem value="pattern">Motif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(field.field_config.header_style === "image") && (
                    <div className="space-y-2">
                      <Label className="text-xs">Image de fond</Label>
                      {field.field_config.header_image_url ? (
                        <div className="relative rounded-md overflow-hidden border border-[hsl(var(--border))] group">
                          <img
                            src={field.field_config.header_image_url}
                            alt="Header Background"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
                              onClick={() => {
                                updateFieldConfig(field.id, {
                                  header_image_url: undefined,
                                });
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                const { createClient } = await import('@/lib/supabase/client');
                                const supabase = createClient();

                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                                const filePath = `headers/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('form-assets')
                                  .upload(filePath, file, { upsert: true });

                                if (uploadError) throw uploadError;

                                const { data: { publicUrl } } = supabase.storage
                                  .from('form-assets')
                                  .getPublicUrl(filePath);

                                updateFieldConfig(field.id, {
                                  header_image_url: publicUrl,
                                });
                              } catch (err) {
                                console.error("Error uploading image:", err);
                                // Error handled silently — toast would require hook at top level
                                console.error("Upload failed");
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {(field.field_config.header_style === "pattern" || field.field_config.header_style === "default") && (
                    <div className="space-y-2">
                      <Label className="text-xs">Motif</Label>
                      <Select
                        value={field.field_config.header_pattern || "dots"}
                        onValueChange={(v) =>
                          updateFieldConfig(field.id, {
                            header_pattern: v as "dots" | "grid" | "lines" | "waves" | "mesh" | "diagonal",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dots">Points</SelectItem>
                          <SelectItem value="grid">Grille</SelectItem>
                          <SelectItem value="lines">Lignes</SelectItem>
                          <SelectItem value="waves">Vagues</SelectItem>
                          <SelectItem value="mesh">Mesh</SelectItem>
                          <SelectItem value="diagonal">Diagonales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs">Hauteur de l’en-tête</Label>
                    <Select
                      value={field.field_config.header_height || "large"}
                      onValueChange={(v) =>
                        updateFieldConfig(field.id, {
                          header_height: v as "medium" | "large" | "hero",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="hero">Très grande (hero)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {[
                "date",
                "time",
                "email",
                "phone",
                "url",
                "signature",
                "paragraph_text",
              ].includes(field.type) && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    No additional configuration for this field type.
                  </p>
                )}

              {(field.type === "file_upload" || field.type === "image_upload") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Nombre maximal de fichiers</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={field.field_config.max_files ?? 1}
                      onChange={(e) =>
                        updateFieldConfig(field.id, {
                          max_files: Number(e.target.value),
                        })
                      }
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Par défaut: 1 fichier (idéal pour photo de profil)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Taille max. par fichier (Mo)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={(field.field_config.max_file_size ? field.field_config.max_file_size / (1024 * 1024) : 10)}
                      onChange={(e) =>
                        updateFieldConfig(field.id, {
                          max_file_size: Number(e.target.value) * 1024 * 1024,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}) {
  const addOption = () => {
    const newOption: FieldOption = {
      id: crypto.randomUUID(),
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    if (updates.label) {
      newOptions[index].value = updates.label
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    }
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Options</Label>
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center gap-1 animate-fade-in">
          <GripVertical className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] shrink-0 cursor-grab" />
          <Input
            value={option.label}
            onChange={(e) => updateOption(index, { label: e.target.value })}
            className="h-8 text-sm transition-shadow duration-200 focus:shadow-sm focus:shadow-[hsl(var(--primary))]/10"
            placeholder={`Option ${index + 1}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))] transition-colors"
            onClick={() => removeOption(index)}
            disabled={options.length <= 1}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full hover-lift"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Option
      </Button>
    </div>
  );
}
