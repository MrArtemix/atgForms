-- =====================================================
-- 11e modèle PDF : Fiche Officielle d'Enregistrement des Artisans
-- Ancien bouton "Produire un doc" transformé en template PDF réutilisable
-- =====================================================

INSERT INTO public.document_templates (name, description, category, is_system, layout) VALUES
(
  'Fiche Officielle d''Enregistrement des Artisans',
  'Fiche complète d''enregistrement officiel des artisans – Plateforme BROBROLI – ADEM avec catégorisation A / B, profil, équipements et engagement',
  'report',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 15, "bottom": 15, "left": 15 },
    "colors": {
      "primary": "#1E3A5F",
      "text": "#1F2937"
    },
    "header": {
      "title": "FICHE OFFICIELLE D''ENREGISTREMENT DES ARTISANS",
      "subtitle": "Plateforme BROBROLI – ADEM – Catégorisation A / B",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#1E3A5F",
        "textColor": "#FFFFFF",
        "padding": 14
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "Dossier N° {{ref}} | Établi le {{date}}",
        "style": { "fontSize": 10, "align": "right", "bold": true, "color": "#6B7280" }
      },
      {
        "type": "divider",
        "style": { "color": "#D1D5DB", "thickness": 0.5 }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "IDENTIFICATION GÉNÉRALE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Sexe", "Date de naissance", "Lieu de naissance", "Nationalité", "N° CNI / Attestation d''identité", "Téléphone principal", "Email", "Commune", "Région"],
        "style": { "zebra": true, "zebraColor": "#F0F4F8", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "PROFIL PROFESSIONNEL",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Métier principal (autre, à préciser)", "Métier(s) secondaire(s)", "Années d''expérience", "Formation professionnelle", "Établissement de formation", "Diplôme certifié ?", "N° Diplôme (si applicable)", "Anciennes entreprises / chantiers majeurs"],
        "style": { "zebra": true, "zebraColor": "#F0F4F8", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "CATÉGORISATION BROBROLI",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Documents à fournir"],
        "style": { "zebra": true, "zebraColor": "#F0F4F8", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "ÉQUIPEMENTS & CAPACITÉS",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Équipements disponibles"],
        "style": { "zebra": false, "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "ZONE D''INTERVENTION & DISPONIBILITÉ",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Zone(s) d''intervention", "Disponible immédiatement", "Horaires habituels", "Intervention d''urgence possible"],
        "style": { "zebra": true, "zebraColor": "#F0F4F8", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 12
      },
      {
        "type": "text",
        "content": "ENGAGEMENT OFFICIEL",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#1E3A5F", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Je soussigné(e)", "Engagement", "Date de signature"],
        "style": { "zebra": false, "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "L''artisan déclare exactes les informations fournies ci-dessus et s''engage à respecter la charte qualité BROBROLI, les normes de sécurité BTP, et les obligations fiscales et sociales applicables.",
        "style": { "fontSize": 9, "align": "center", "italic": true, "color": "#6B7280", "backgroundColor": "#F9FAFB", "padding": 6, "border": { "color": "#E5E7EB", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Signature de l''artisan", "Cachet et signature ADEM"]
      }
    ],
    "footer": {
      "text": "Fiche officielle d''enregistrement – Réf. {{ref}} – {{date}} – Plateforme BROBROLI / ADEM",
      "showPageNumbers": true
    }
  }'::jsonb
);
