"use client";

import { FieldComponentProps } from "./field-registry";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export function MatrixField({ field, mode, value, onChange, error }: FieldComponentProps) {
  const rows = field.field_config.matrix_rows || [];
  const columns = field.field_config.matrix_columns || [];
  const allowMultiple = field.field_config.matrix_allow_multiple ?? false;

  // Value shape: Record<string, string> for single, Record<string, string[]> for multiple
  const matrixValue = (value as Record<string, string | string[]>) || {};

  function handleSingleChange(rowId: string, colId: string) {
    if (mode === "builder") return;
    const updated = { ...matrixValue, [rowId]: colId };
    onChange?.(updated);
  }

  function handleMultipleChange(rowId: string, colId: string) {
    if (mode === "builder") return;
    const currentRow = (matrixValue[rowId] as string[]) || [];
    const updated = currentRow.includes(colId)
      ? currentRow.filter((c) => c !== colId)
      : [...currentRow, colId];
    onChange?.({ ...matrixValue, [rowId]: updated });
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 border-b font-medium" />
              {columns.map((col) => (
                <th key={col.id} className="text-center p-2 border-b font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                <td className="p-2 font-medium text-muted-foreground">{row.label}</td>
                {allowMultiple ? (
                  columns.map((col) => {
                    const rowValues = (matrixValue[row.id] as string[]) || [];
                    return (
                      <td key={col.id} className="text-center p-2">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={rowValues.includes(col.id)}
                            onCheckedChange={() => handleMultipleChange(row.id, col.id)}
                            disabled={mode === "builder"}
                          />
                        </div>
                      </td>
                    );
                  })
                ) : (
                  <RadioGroup
                    value={mode === "renderer" ? (matrixValue[row.id] as string) || "" : ""}
                    onValueChange={(v) => handleSingleChange(row.id, v)}
                    disabled={mode === "builder"}
                    className="contents"
                  >
                    {columns.map((col) => (
                      <td key={col.id} className="text-center p-2">
                        <div className="flex justify-center">
                          <RadioGroupItem
                            value={col.id}
                            id={`${field.id}-${row.id}-${col.id}`}
                          />
                        </div>
                      </td>
                    ))}
                  </RadioGroup>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
