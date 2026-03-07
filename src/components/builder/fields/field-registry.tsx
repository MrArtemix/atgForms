"use client";

import React from "react";
import { FieldType } from "@/types/field-types";
import { ComponentType } from "react";
import { FormField } from "@/types/field-types";

import { ShortTextField } from "./short-text-field";
import { LongTextField } from "./long-text-field";
import { NumberField } from "./number-field";
import { EmailField } from "./email-field";
import { PhoneField } from "./phone-field";
import { UrlField } from "./url-field";
import { DateField } from "./date-field";
import { TimeField } from "./time-field";
import { SingleChoiceField } from "./single-choice-field";
import { MultipleChoiceField } from "./multiple-choice-field";
import { DropdownField } from "./dropdown-field";
import { LinearScaleField } from "./linear-scale-field";
import { RatingField } from "./rating-field";
import { MatrixField } from "./matrix-field";
import { FileUploadField } from "./file-upload-field";
import { SectionHeaderField } from "./section-header-field";
import { FormHeaderField } from "./form-header-field";
import { ParagraphTextField } from "./paragraph-text-field";
import { SignatureField } from "./signature-field";
import { ImageUploadField } from "./image-upload-field";

export interface FieldComponentProps {
  field: FormField;
  mode: "builder" | "renderer";
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

// Placeholder component for new field types
const PlaceholderField = (props: FieldComponentProps) => {
  return React.createElement("div", {
    className: "p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500"
  },
    React.createElement("span", { className: "font-medium" }, props.field.type),
    React.createElement("p", { className: "text-sm" }, props.field.label)
  );
};

export const FieldRegistry: Record<FieldType, ComponentType<FieldComponentProps>> = {
  // Basic Fields
  short_text: ShortTextField,
  long_text: LongTextField,
  number: NumberField,
  email: EmailField,
  phone: PhoneField,
  url: UrlField,
  date: DateField,
  time: TimeField,
  datetime: PlaceholderField,
  month: PlaceholderField,
  week: PlaceholderField,
  color: PlaceholderField,
  password: PlaceholderField,
  search: PlaceholderField,

  // Choice Fields
  single_choice: SingleChoiceField,
  multiple_choice: MultipleChoiceField,
  dropdown: DropdownField,
  linear_scale: LinearScaleField,
  rating: RatingField,
  nps: PlaceholderField,
  yes_no: PlaceholderField,
  image_choice: PlaceholderField,
  matrix: MatrixField,

  // Advanced Fields
  file_upload: FileUploadField,
  image_upload: ImageUploadField,
  signature: SignatureField,
  richtext: PlaceholderField,
  video_embed: PlaceholderField,
  google_places: PlaceholderField,
  calculation: PlaceholderField,
  hidden: PlaceholderField,
  html_snippet: PlaceholderField,
  timer: PlaceholderField,
  consent_checkbox: PlaceholderField,

  // Layout Fields
  section_header: SectionHeaderField,
  form_header: FormHeaderField,
  paragraph_text: ParagraphTextField,
  divider: PlaceholderField,
  spacer: PlaceholderField,
  columns_2: PlaceholderField,
  columns_3: PlaceholderField,
  columns_4: PlaceholderField,
  image: PlaceholderField,
  video: PlaceholderField,
  accordion: PlaceholderField,
};
