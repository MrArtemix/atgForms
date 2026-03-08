import { ConditionalLogic, Condition, ConditionalOperator } from "@/types/conditional-logic";
import { FormField } from "@/types/field-types";
import { FieldValue } from "@/stores/form-renderer-store";

export function evaluateConditions(
  conditionalLogic: ConditionalLogic,
  answers: Record<string, FieldValue>,
  _fields: FormField[]
): boolean {
  const { conditions, logic } = conditionalLogic;

  if (conditions.length === 0) return true;

  const results = conditions.map((condition) =>
    evaluateCondition(condition, answers[condition.field_id])
  );

  if (logic === "and") {
    return results.every(Boolean);
  } else {
    return results.some(Boolean);
  }
}

function evaluateCondition(condition: Condition, value: FieldValue): boolean {
  const { operator } = condition;
  const conditionValue = condition.value;

  switch (operator) {
    case "is_empty":
      return isEmpty(value);
    case "is_not_empty":
      return !isEmpty(value);
    case "equals":
      return String(value) === String(conditionValue);
    case "not_equals":
      return String(value) !== String(conditionValue);
    case "contains":
      return String(value || "").toLowerCase().includes(String(conditionValue).toLowerCase());
    case "not_contains":
      return !String(value || "").toLowerCase().includes(String(conditionValue).toLowerCase());
    case "greater_than":
      return Number(value) > Number(conditionValue);
    case "less_than":
      return Number(value) < Number(conditionValue);
    case "greater_equal":
      return Number(value) >= Number(conditionValue);
    case "less_equal":
      return Number(value) <= Number(conditionValue);
    case "starts_with":
      return String(value || "").toLowerCase().startsWith(String(conditionValue).toLowerCase());
    case "ends_with":
      return String(value || "").toLowerCase().endsWith(String(conditionValue).toLowerCase());
    default:
      return true;
  }
}

function isEmpty(value: FieldValue): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Compute the set of visible field IDs based on conditional logic and current answers.
 */
export function computeVisibleFields(
  fields: FormField[],
  answers: Record<string, FieldValue>
): Set<string> {
  const visible = new Set<string>();

  for (const field of fields) {
    if (!field.conditional_logic) {
      visible.add(field.id);
      continue;
    }

    const { action } = field.conditional_logic;
    const conditionMet = evaluateConditions(field.conditional_logic, answers, fields);

    switch (action) {
      case "show":
        if (conditionMet) visible.add(field.id);
        break;
      case "hide":
        if (!conditionMet) visible.add(field.id);
        break;
      default:
        visible.add(field.id);
    }
  }

  return visible;
}

/**
 * Compute required overrides from conditional logic
 */
export function computeRequiredOverrides(
  fields: FormField[],
  answers: Record<string, FieldValue>
): Set<string> {
  const overrides = new Set<string>();

  for (const field of fields) {
    if (!field.conditional_logic) continue;
    if (field.conditional_logic.action !== "require") continue;

    const conditionMet = evaluateConditions(field.conditional_logic, answers, fields);
    if (conditionMet) {
      overrides.add(field.id);
    }
  }

  return overrides;
}

export const OPERATOR_LABELS: Record<ConditionalOperator, string> = {
  equals: "est égal à",
  not_equals: "n'est pas égal à",
  contains: "contient",
  not_contains: "ne contient pas",
  greater_than: "est supérieur à",
  less_than: "est inférieur à",
  greater_equal: "est supérieur ou égal à",
  less_equal: "est inférieur ou égal à",
  is_empty: "est vide",
  is_not_empty: "n'est pas vide",
  starts_with: "commence par",
  ends_with: "se termine par",
};

export const OPERATORS_BY_FIELD_TYPE: Record<string, ConditionalOperator[]> = {
  short_text: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "is_empty", "is_not_empty"],
  long_text: ["contains", "not_contains", "is_empty", "is_not_empty"],
  number: ["equals", "not_equals", "greater_than", "less_than", "greater_equal", "less_equal", "is_empty", "is_not_empty"],
  email: ["equals", "not_equals", "contains", "is_empty", "is_not_empty"],
  phone: ["equals", "not_equals", "is_empty", "is_not_empty"],
  url: ["equals", "not_equals", "is_empty", "is_not_empty"],
  date: ["equals", "not_equals", "greater_than", "less_than", "is_empty", "is_not_empty"],
  time: ["equals", "not_equals", "is_empty", "is_not_empty"],
  single_choice: ["equals", "not_equals", "is_empty", "is_not_empty"],
  multiple_choice: ["contains", "not_contains", "is_empty", "is_not_empty"],
  dropdown: ["equals", "not_equals", "is_empty", "is_not_empty"],
  linear_scale: ["equals", "not_equals", "greater_than", "less_than", "greater_equal", "less_equal"],
  rating: ["equals", "not_equals", "greater_than", "less_than", "greater_equal", "less_equal"],
  file_upload: ["is_empty", "is_not_empty"],
};
