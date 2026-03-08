-- =====================================================
-- Mise à jour du template PDF "Fiche Officielle d'Enregistrement des Artisans"
-- Alignement des couleurs et sections avec le design original (fiche.py)
-- Couleurs : Bleu foncé #131F36, Orange #F26122
-- =====================================================

UPDATE public.document_templates
SET layout = '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 20, "bottom": 18, "left": 20 },
    "colors": {
      "primary": "#131F36",
      "accent": "#F26122",
      "text": "#1F2937"
    },
    "header": {
      "title": "FICHE OFFICIELLE D''ENREGISTREMENT DES ARTISANS",
      "subtitle": "Plateforme BROBROLI By ADEM",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#131F36",
        "textColor": "#FFFFFF",
        "padding": 14,
        "accentColor": "#F26122"
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "N° Dossier : {{ref}} | Date : {{date}}",
        "style": { "fontSize": 10, "align": "right", "bold": true, "color": "#6B7280", "backgroundColor": "#FEF3EC", "padding": 4, "border": { "color": "#F26122", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "IDENTIFICATION GÉNÉRALE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Sexe", "Date de naissance", "Lieu de naissance", "Nationalité", "N° CNI / Attestation d''identité", "Téléphone principal", "Email", "Commune", "Région"],
        "style": { "zebra": true, "zebraColor": "#F8FAFC", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "PROFIL PROFESSIONNEL",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Métier principal (autre, à préciser)", "Métier(s) secondaire(s)", "Années d''expérience", "Formation professionnelle", "Établissement de formation", "Diplôme certifié ?", "N° Diplôme (si applicable)", "Anciennes entreprises / chantiers majeurs"],
        "style": { "zebra": true, "zebraColor": "#F8FAFC", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "CATÉGORISATION BROBROLI",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Catégorie A – Certifiés", "Catégorie B – Non certifiés"],
        "style": { "zebra": true, "zebraColor": "#F0F4FA", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "DOCUMENTS À FOURNIR",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Documents à fournir"],
        "style": { "zebra": false, "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "ÉQUIPEMENTS & CAPACITÉS",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Équipements disponibles"],
        "style": { "zebra": false, "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "ZONE & DISPONIBILITÉ",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Zone(s) d''intervention", "Disponible immédiatement", "Horaires habituels", "Intervention d''urgence possible"],
        "style": { "zebra": true, "zebraColor": "#F8FAFC", "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "ENGAGEMENT OFFICIEL",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#131F36", "padding": 5, "borderBottom": { "color": "#F26122", "width": 2 } }
      },
      {
        "type": "fields_table",
        "fields": ["Je soussigné(e)", "Engagement", "Date de signature"],
        "style": { "zebra": false, "border": true, "borderColor": "#D1D5DB" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "L''artisan déclare exactes les informations fournies ci-dessus et s''engage à respecter la charte qualité BROBROLI, les normes de sécurité BTP, à honorer toute mission validée, à maintenir une conduite professionnelle irréprochable et à respecter les obligations fiscales et sociales applicables.",
        "style": { "fontSize": 9, "align": "left", "italic": true, "color": "#4B5563", "backgroundColor": "#F8FAFC", "padding": 8, "border": { "color": "#131F36", "width": 0.5 }, "borderLeft": { "color": "#F26122", "width": 3 } }
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
      "text": "Plateforme BROBROLI by ADEM • Document confidentiel • Réf. {{ref}} • {{date}}",
      "showPageNumbers": true
    }
  }'::jsonb,
  updated_at = NOW()
WHERE name = 'Fiche Officielle d''Enregistrement des Artisans' AND is_system = true;
