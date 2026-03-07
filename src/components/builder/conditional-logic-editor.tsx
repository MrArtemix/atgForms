"use client";

import { useFormBuilderStore } from "@/stores/form-builder-store";
import { ConditionalLogic, Condition, ConditionalAction, ConditionalLogicType, ConditionalOperator } from "@/types/conditional-logic";
import { OPERATOR_LABELS, OPERATORS_BY_FIELD_TYPE } from "@/lib/utils/conditional-evaluator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Zap } from "lucide-react";

interface ConditionalLogicEditorProps {
  fieldId: string;
}

export function ConditionalLogicEditor({ fieldId }: ConditionalLogicEditorProps) {
  const { fields, updateFieldConditionalLogic } =
    useFormBuilderStore();
  const field = fields[fieldId];

  if (!field) return null;

  const logic = field.conditional_logic;
  const hasLogic = !!logic;

  // Get other fields that can be used as condition sources
  const otherFields = Object.values(fields).filter(
    (f) => f.id !== fieldId && !["section_header", "paragraph_text", "signature"].includes(f.type)
  );

  const enableLogic = () => {
    updateFieldConditionalLogic(fieldId, {
      conditions: [],
      logic: "and",
      action: "show",
    });
  };

  const disableLogic = () => {
    updateFieldConditionalLogic(fieldId, null);
  };

  const updateLogic = (updates: Partial<ConditionalLogic>) => {
    if (!logic) return;
    updateFieldConditionalLogic(fieldId, { ...logic, ...updates });
  };

  const addCondition = () => {
    if (!logic || otherFields.length === 0) return;
    const firstField = otherFields[0];
    const operators = OPERATORS_BY_FIELD_TYPE[firstField.type] || ["equals"];
    const newCondition: Condition = {
      id: crypto.randomUUID(),
      field_id: firstField.id,
      operator: operators[0],
      value: "",
    };
    updateLogic({ conditions: [...logic.conditions, newCondition] });
  };

  const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
    if (!logic) return;
    updateLogic({
      conditions: logic.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!logic) return;
    updateLogic({
      conditions: logic.conditions.filter((c) => c.id !== conditionId),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <Label className="text-xs font-medium">Conditional Logic</Label>
        </div>
        <Switch checked={hasLogic} onCheckedChange={(v) => (v ? enableLogic() : disableLogic())} />
      </div>

      {hasLogic && logic && (
        <div className="space-y-3 pl-1">
          {/* Action */}
          <div className="flex items-center gap-2 text-sm">
            <Select
              value={logic.action}
              onValueChange={(v) => updateLogic({ action: v as ConditionalAction })}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show</SelectItem>
                <SelectItem value="hide">Hide</SelectItem>
                <SelectItem value="require">Require</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">this field when</span>
            <Select
              value={logic.logic}
              onValueChange={(v) => updateLogic({ logic: v as ConditionalLogicType })}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">ALL</SelectItem>
                <SelectItem value="or">ANY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditions */}
          {logic.conditions.map((condition) => {
            const sourceField = fields[condition.field_id];
            const availableOps = sourceField
              ? OPERATORS_BY_FIELD_TYPE[sourceField.type] || ["equals"]
              : ["equals"];
            const needsValue = !["is_empty", "is_not_empty"].includes(condition.operator);

            return (
              <div key={condition.id} className="flex flex-col gap-1.5 p-2 border rounded-md bg-muted/30">
                <div className="flex items-center gap-1">
                  <Select
                    value={condition.field_id}
                    onValueChange={(v) => updateCondition(condition.id, { field_id: v })}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherFields.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="text-xs">
                          {f.label || f.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Select
                  value={condition.operator}
                  onValueChange={(v) =>
                    updateCondition(condition.id, { operator: v as ConditionalOperator })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOps.map((op) => (
                      <SelectItem key={op} value={op} className="text-xs">
                        {OPERATOR_LABELS[op as ConditionalOperator]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {needsValue && (
                  <Input
                    value={String(condition.value || "")}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    placeholder="Value"
                    className="h-7 text-xs"
                  />
                )}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={addCondition} className="w-full text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
        </div>
      )}
    </div>
  );
}
