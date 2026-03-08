import { ValidationRules, FormField } from "@/types/field-types";
import { FieldValue } from "@/stores/form-renderer-store";
import { isLayoutField } from "@/lib/constants/field-types";

export function validateField(field: FormField, value: FieldValue): string | null {
  // Layout fields don't need validation
  if (isLayoutField(field.type)) return null;

  // Required check
  if (field.required) {
    if (value === null || value === undefined || value === "") {
      return "Ce champ est obligatoire";
    }
    if (Array.isArray(value) && value.length === 0) {
      return "Veuillez sélectionner au moins une option";
    }
  }

  // If empty and not required, skip further validation
  if (value === null || value === undefined || value === "") return null;

  const rules = field.validation_rules;
  const strValue = typeof value === "string" ? value : "";

  switch (field.type) {
    case "short_text":
    case "long_text":
      return validateText(strValue, rules);

    case "email":
      return validateEmail(strValue);

    case "url":
      return validateUrl(strValue);

    case "phone":
      return validatePhone(strValue);

    case "number":
      return validateNumber(value as number, rules);

    case "file_upload":
      return null; // File validation happens at upload time

    default:
      return null;
  }
}

function validateText(value: string, rules: ValidationRules): string | null {
  if (rules.min_length && value.length < rules.min_length) {
    return `Minimum ${rules.min_length} caractères requis`;
  }
  if (rules.max_length && value.length > rules.max_length) {
    return `Maximum ${rules.max_length} caractères autorisés`;
  }
  if (rules.pattern) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return rules.pattern_message || "Format invalide";
    }
  }
  return null;
}

function validateEmail(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Veuillez entrer une adresse email valide";
  }
  return null;
}

function validateUrl(value: string): string | null {
  try {
    new URL(value);
    return null;
  } catch {
    return "Veuillez entrer une URL valide";
  }
}

function validatePhone(value: string): string | null {
  const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
  if (!phoneRegex.test(value)) {
    return "Veuillez entrer un numéro de téléphone valide";
  }
  return null;
}

function validateNumber(value: number, rules: ValidationRules): string | null {
  if (isNaN(value)) return "Veuillez entrer un nombre valide";
  if (rules.min_value !== undefined && value < rules.min_value) {
    return `La valeur minimale est ${rules.min_value}`;
  }
  if (rules.max_value !== undefined && value > rules.max_value) {
    return `La valeur maximale est ${rules.max_value}`;
  }
  return null;
}

export function validatePage(fields: FormField[], answers: Record<string, FieldValue>): Record<string, string> {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    const error = validateField(field, answers[field.id] ?? null);
    if (error) {
      errors[field.id] = error;
    }
  });
  return errors;
}
