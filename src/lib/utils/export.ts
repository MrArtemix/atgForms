import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { FormField } from "@/types/field-types";
import { ResponseWithAnswers } from "@/types/response";
import { createClient } from "@/lib/supabase/client";

function getAnswerValue(answer: ResponseWithAnswers["answers"][number]): string {
  if (answer.value_text) return answer.value_text;
  if (answer.value_number !== null && answer.value_number !== undefined) return String(answer.value_number);
  if (answer.value_boolean !== null && answer.value_boolean !== undefined) return answer.value_boolean ? "Yes" : "No";
  if (answer.value_date) return answer.value_date;
  if (answer.value_time) return answer.value_time;
  if (answer.value_json) {
    if (Array.isArray(answer.value_json) && typeof answer.value_json[0] === 'string' && answer.value_json[0].includes('/')) {
      const supabase = createClient();
      return (answer.value_json as string[]).map(path => supabase.storage.from("response-uploads").getPublicUrl(path).data.publicUrl).join(", ");
    }
    return JSON.stringify(answer.value_json);
  }
  return "";
}

function buildExportData(fields: FormField[], responses: ResponseWithAnswers[]) {
  const headers = ["#", "Date", ...fields.map((f) => f.label)];
  const rows = responses.map((response, index) => {
    const row: string[] = [
      String(index + 1),
      new Date(response.created_at).toLocaleString(),
    ];
    fields.forEach((field) => {
      const answer = response.answers.find((a) => a.field_id === field.id);
      row.push(answer ? getAnswerValue(answer) : "");
    });
    return row;
  });
  return { headers, rows };
}

export function exportToCSV(
  fields: FormField[],
  responses: ResponseWithAnswers[],
  filename: string = "responses"
) {
  const { headers, rows } = buildExportData(fields, responses);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export async function exportToExcel(
  fields: FormField[],
  responses: ResponseWithAnswers[],
  filename: string = "responses"
) {
  const { headers, rows } = buildExportData(fields, responses);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Responses");

  // Add header row with bold styling
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };
  });

  // Add data rows
  rows.forEach((row) => worksheet.addRow(row));

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) maxLength = Math.min(cellLength, 50);
    });
    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, `${filename}.xlsx`);
}

export function exportToPDF(
  fields: FormField[],
  responses: ResponseWithAnswers[],
  formTitle: string,
  filename: string = "responses"
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(formTitle, 14, 22);
  doc.setFontSize(10);
  doc.text(`${responses.length} responses`, 14, 30);

  let y = 40;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  responses.forEach((response, rIndex) => {
    // Check if we need a new page for the response header
    if (y + lineHeight * 3 > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Response ${rIndex + 1} - ${new Date(response.created_at).toLocaleString()}`,
      14,
      y
    );
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    fields.forEach((field) => {
      const answer = response.answers.find((a) => a.field_id === field.id);
      const rawValue = answer ? getAnswerValue(answer) : "-";

      // Check if this is a signature / base64 image
      const isImage =
        field.type === "signature" ||
        (typeof rawValue === "string" && rawValue.startsWith("data:image/"));

      if (isImage && rawValue && rawValue !== "-" && rawValue.startsWith("data:image/")) {
        // Render signature as an embedded image
        if (y + 30 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        doc.text(`${field.label}:`, 14, y);
        y += 3;

        try {
          // Determine image format from data URL
          const format = rawValue.includes("image/png") ? "PNG" : "JPEG";
          const imgWidth = 60;
          const imgHeight = 20;
          doc.addImage(rawValue, format, 14, y, imgWidth, imgHeight);
          y += imgHeight + 4;
        } catch {
          // Fallback if image can't be embedded
          doc.text("  [Signature]", 14, y);
          y += lineHeight;
        }
      } else {
        // Regular text field
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        const text = `${field.label}: ${rawValue || "-"}`;
        const lines = doc.splitTextToSize(text, pageWidth - 28);
        doc.text(lines, 14, y);
        y += lineHeight * lines.length;
      }
    });

    y += 4;
  });

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
