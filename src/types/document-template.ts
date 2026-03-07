export interface DocTemplateHeader {
    title: string;
    subtitle?: string;
    logoPosition?: "left" | "center" | "right";
    showLogo?: boolean;
    style?: {
        backgroundColor?: string;
        textColor?: string;
        padding?: number;
    };
}

export interface DocTemplateSectionText {
    type: "text";
    content: string;
    style?: {
        fontSize?: number;
        align?: "left" | "center" | "right" | "justify";
        bold?: boolean;
        italic?: boolean;
        color?: string;
        backgroundColor?: string;
        padding?: number;
        border?: {
            color: string;
            width: number;
        };
    };
}

export interface DocTemplateSectionFieldsTable {
    type: "fields_table";
    fields: string[]; // field labels to include
    style?: {
        zebra?: boolean;
        zebraColor?: string;
        border?: boolean;
        borderColor?: string;
    };
}

export interface DocTemplateSectionSignature {
    type: "signature_block";
    labels: string[];
}

export interface DocTemplateSectionDivider {
    type: "divider";
    style?: {
        color?: string;
        thickness?: number;
    };
}

export interface DocTemplateSectionSpacer {
    type: "spacer";
    height?: number;
}

export type DocTemplateSection =
    | DocTemplateSectionText
    | DocTemplateSectionFieldsTable
    | DocTemplateSectionSignature
    | DocTemplateSectionDivider
    | DocTemplateSectionSpacer;

export interface DocTemplateFooter {
    text: string;
    showPageNumbers?: boolean;
}

export interface DocTemplateLayout {
    pageFormat?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
    margins?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    header?: DocTemplateHeader;
    sections: DocTemplateSection[];
    footer?: DocTemplateFooter;
    colors?: {
        primary?: string;
        accent?: string;
        text?: string;
        background?: string;
    };
}

export interface DocumentTemplate {
    id: string;
    name: string;
    description: string | null;
    category: string;
    layout: DocTemplateLayout;
    form_id: string | null;
    is_system: boolean;
    created_by: string | null;
    use_count: number;
    created_at: string;
    updated_at: string;
}
