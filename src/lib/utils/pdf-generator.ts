import { jsPDF } from "jspdf";
import { ResponseWithAnswers } from "@/types/response";
import { FormField } from "@/types/field-types";
import { DocumentTemplate } from "@/types/document-template";

export function getAnswerTextValue(answer: ResponseWithAnswers["answers"][number]): string {
    if (answer.value_text) return answer.value_text;
    if (answer.value_number !== null && answer.value_number !== undefined)
        return String(answer.value_number);
    if (answer.value_boolean !== null && answer.value_boolean !== undefined)
        return answer.value_boolean ? "Oui" : "Non";
    if (answer.value_date) return answer.value_date;
    if (answer.value_time) return answer.value_time;
    if (answer.value_json) {
        if (Array.isArray(answer.value_json))
            return (answer.value_json as string[]).join(", ");
        return JSON.stringify(answer.value_json);
    }
    return "";
}

function substitutePlaceholders(text: string, fields: FormField[], response: ResponseWithAnswers): string {
    let result = text;

    const valuesMap = new Map<string, string>();
    fields.forEach(f => {
        const answer = response.answers.find(a => a.field_id === f.id);
        valuesMap.set(f.label.trim(), answer ? getAnswerTextValue(answer) : "");
    });

    result = result.replace(/\{\{field:([^}]+)\}\}/g, (match, label) => {
        return valuesMap.has(label.trim()) ? valuesMap.get(label.trim())! : `[${label}]`;
    });

    result = result.replace(/\{\{date\}\}/g, new Date().toLocaleDateString("fr-FR"));
    result = result.replace(/\{\{ref\}\}/g, response.id.split('-')[0].toUpperCase());

    return result;
}

function hexToRgb(hex: string): [number, number, number] {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return [0, 0, 0];
    let expanded: string;
    if (hex.length === 4) {
        const chars = hex.substring(1).split('');
        expanded = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]].join('');
    } else {
        expanded = hex.substring(1);
    }
    const num = parseInt(expanded, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export async function generateDocumentPDF(
    template: DocumentTemplate,
    formTitle: string,
    fields: FormField[],
    response: ResponseWithAnswers
): Promise<Blob> {
    const layout = template.layout;
    const doc = new jsPDF({
        orientation: layout.orientation || "portrait",
        unit: "mm",
        format: layout.pageFormat || "a4"
    });

    const margins = {
        top: layout.margins?.top ?? 20,
        right: layout.margins?.right ?? 15,
        bottom: layout.margins?.bottom ?? 20,
        left: layout.margins?.left ?? 15,
    };

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - margins.left - margins.right;
    const textColor = layout.colors?.text || "#1F2937";
    const primaryColor = layout.colors?.primary || "#1E40AF";

    let y = margins.top;

    const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - margins.bottom) {
            doc.addPage();
            y = margins.top;
            return true;
        }
        return false;
    };

    if (layout.header) {
        const hStyle = layout.header.style;
        const align = layout.header.logoPosition === "center" ? "center" : "left";
        const padding = hStyle?.padding ?? 10;

        let headerHeight = 25;
        if (layout.header.subtitle) headerHeight += 12;

        if (hStyle?.backgroundColor) {
            doc.setFillColor(...hexToRgb(hStyle.backgroundColor));
            // Draw header background across top
            doc.rect(0, 0, pageWidth, margins.top + headerHeight - 5, "F");
            y = margins.top + padding;
        }

        const x = align === "center" ? pageWidth / 2 : margins.left + (hStyle?.backgroundColor ? padding : 0);

        doc.setTextColor(...hexToRgb(hStyle?.textColor || primaryColor));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(layout.header.title, x, y, { align });
        y += 8;

        if (layout.header.subtitle) {
            doc.setTextColor(...hexToRgb(hStyle?.textColor || textColor));
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(layout.header.subtitle, x, y, { align });
            y += 10;
        } else {
            y += 4;
        }

        // Only draw the line border if there's no background color
        if (!hStyle?.backgroundColor) {
            doc.setDrawColor(...hexToRgb(primaryColor));
            doc.setLineWidth(0.5);
            doc.line(margins.left, y, pageWidth - margins.right, y);
            y += 10;
        } else {
            // Adjust y spacing after a colored header
            y += 10;
        }
    }

    doc.setTextColor(...hexToRgb(textColor));

    for (const section of layout.sections) {
        switch (section.type) {
            case "text": {
                const s = section.style;
                doc.setFontSize(s?.fontSize || 11);
                doc.setFont("helvetica", s?.bold ? "bold" : (s?.italic ? "italic" : "normal"));
                if (s?.color) {
                    doc.setTextColor(...hexToRgb(s.color));
                } else {
                    doc.setTextColor(...hexToRgb(textColor));
                }

                const align = s?.align || "left";
                const content = substitutePlaceholders(section.content, fields, response);
                const padding = s?.padding || 0;

                // Adjust content width if padding is applied
                const effectiveWidth = contentWidth - (padding * 2);
                const lines = doc.splitTextToSize(content, effectiveWidth);
                const lineHeight = (s?.fontSize || 11) * 0.45;
                const totalTextHeight = lines.length * lineHeight;

                const boxHeight = totalTextHeight + (padding * 2);
                checkPageBreak(boxHeight + 5);

                const hasBg = !!s?.backgroundColor;
                const hasBorder = !!s?.border;

                if (hasBg || hasBorder) {
                    if (hasBg) doc.setFillColor(...hexToRgb(s!.backgroundColor!));
                    if (hasBorder) {
                        doc.setDrawColor(...hexToRgb(s!.border!.color));
                        doc.setLineWidth(s!.border!.width);
                    }
                    const styleStr = (hasBg && hasBorder) ? "FD" : (hasBg ? "F" : "D");
                    doc.roundedRect(margins.left, y, contentWidth, boxHeight, 2, 2, styleStr);
                }

                let textX = margins.left + padding;
                const textY = y + padding + (lineHeight * 0.7); // Adjust baseline

                if (align === "center") {
                    textX = pageWidth / 2;
                } else if (align === "right") {
                    textX = pageWidth - margins.right - padding;
                }

                doc.text(lines, textX, textY, { align: align as "left" | "center" | "right" | "justify" });
                y += boxHeight + 6;

                // reset color to default text
                doc.setTextColor(...hexToRgb(textColor));
                break;
            }

            case "fields_table": {
                const s = section.style;
                const labelsToInclude = section.fields.map(f => f.trim().toLowerCase());
                doc.setFontSize(10);
                let zebraColor = true;

                const startY = y;

                // Keep track of rows actually rendered
                let renderCount = 0;

                fields.forEach((field, _idx) => {
                    if (!labelsToInclude.includes(field.label.toLowerCase())) return;

                    checkPageBreak(12);

                    if (s?.zebra !== false) {
                        if (zebraColor) {
                            const zColor = s?.zebraColor || "#F8FAFC";
                            doc.setFillColor(...hexToRgb(zColor));
                            doc.rect(margins.left, y - 4, contentWidth, 10, "F");
                        }
                        zebraColor = !zebraColor;
                    }

                    doc.setFont("helvetica", "bold");
                    doc.text(`${field.label}:`, margins.left + 3, y);

                    const rawAnswer = response.answers.find(a => a.field_id === field.id);
                    const val = rawAnswer ? getAnswerTextValue(rawAnswer) : "-";
                    const isSignature = field.type === "signature" || (typeof val === "string" && val.startsWith("data:image/"));

                    if (isSignature && val && val !== "-") {
                        doc.setFont("helvetica", "normal");
                        try {
                            const fmt = val.includes("image/png") ? "PNG" : "JPEG";
                            doc.addImage(val, fmt, margins.left + (contentWidth / 2) + 2, y - 4, 30, 10);
                        } catch {
                            doc.text("[Signature Image]", margins.left + (contentWidth / 2) + 2, y);
                        }
                    } else {
                        doc.setFont("helvetica", "normal");
                        const valLines = doc.splitTextToSize(val || "-", (contentWidth / 2) - 8);
                        doc.text(valLines, margins.left + (contentWidth / 2) + 2, y);
                        if (valLines.length > 1) {
                            y += (valLines.length - 1) * 4;
                            // If it's zebra, we might want to extend the rect. For simplicity in jsPDF, we just adjust Y.
                        }
                    }

                    y += 8;
                    renderCount++;
                });

                if (s?.border && renderCount > 0) {
                    doc.setDrawColor(...hexToRgb(s.borderColor || "#E5E7EB"));
                    doc.setLineWidth(0.5);
                    doc.roundedRect(margins.left, startY - 4, contentWidth, y - startY, 2, 2);
                    // Draw a subtle vertical divider
                    doc.setDrawColor(...hexToRgb(s.borderColor || "#F1F5F9"));
                    doc.line(margins.left + (contentWidth / 2), startY - 4, margins.left + (contentWidth / 2), y - 4);
                }

                y += 6;
                break;
            }

            case "signature_block": {
                checkPageBreak(40);
                y += 10;

                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");

                const count = section.labels.length;
                if (count > 0) {
                    const blockWidth = contentWidth / count;
                    section.labels.forEach((sigLabel, i) => {
                        const cx = margins.left + (blockWidth * i) + (blockWidth / 2);
                        doc.text(sigLabel, cx, y, { align: "center" });
                        doc.setDrawColor(200, 200, 200);
                        doc.line(cx - 20, y > 10 ? y - 10 : y, cx + 20, y > 10 ? y - 10 : y);
                    });
                }
                y += 30;
                break;
            }

            case "divider": {
                checkPageBreak(10);
                y += 4;
                const color = section.style?.color || "#E5E7EB";
                doc.setDrawColor(...hexToRgb(color));
                doc.setLineWidth(section.style?.thickness || 0.5);
                doc.line(margins.left, y, pageWidth - margins.right, y);
                y += 6;
                break;
            }

            case "spacer": {
                y += (section.height || 10);
                break;
            }
        }
    }

    if (layout.footer) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const footerY = pageHeight - (margins.bottom / 2);
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);

            let footerText = substitutePlaceholders(layout.footer.text, fields, response);
            if (layout.footer.showPageNumbers) {
                footerText += `  -  Page ${i} / ${pageCount}`;
            }
            doc.text(footerText, pageWidth / 2, footerY, { align: "center" });
        }
    }

    return doc.output("blob");
}
