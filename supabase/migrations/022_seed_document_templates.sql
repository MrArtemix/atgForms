-- =====================================================
-- Seed Document Templates (Modèles de documents PDF)
-- =====================================================

INSERT INTO public.document_templates (name, description, category, is_system, layout) VALUES

(
  'Certificat Artisan Officiel',
  'Certificat officiel BROBROLI avec catégorisation et signature',
  'certificate',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
    "colors": {
      "primary": "#1E40AF",
      "text": "#1F2937"
    },
    "header": {
      "title": "CERTIFICAT D''ARTISAN",
      "subtitle": "Plateforme BROBROLI – ADEM",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#1E40AF",
        "textColor": "#FFFFFF",
        "padding": 12
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Ceci certifie que l''artisan(e) {{field:Nom}} {{field:Prénoms}}, né(e) le {{field:Date de naissance}} à {{field:Lieu de naissance}}, est officiellement enregistré(e) et reconnu(e) sur la plateforme BROBROLI dans la catégorie professionnelle correspondante.",
        "style": { "fontSize": 12, "align": "center", "bold": false, "backgroundColor": "#F3F4F6", "padding": 8, "border": { "color": "#D1D5DB", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Années d’expérience", "Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Label AASS"],
        "style": { "zebra": true, "border": true, "borderColor": "#E5E7EB" }
      },
      {
        "type": "spacer",
        "height": 20
      },
      {
        "type": "text",
        "content": "L''artisan s''engage à respecter la charte de qualité BROBROLI et les normes en vigueur.",
        "style": { "fontSize": 10, "align": "center", "italic": true, "color": "#4B5563" }
      },
      {
        "type": "spacer",
        "height": 30
      },
      {
        "type": "signature_block",
        "labels": ["Signature de l''artisan", "Cachet et signature ADEM"]
      }
    ],
    "footer": {
      "text": "Certificat généré le {{date}} – Référence d''enregistrement : {{ref}}",
      "showPageNumbers": false
    }
  }'::jsonb
),

(
  'Attestation de Formation',
  'Attestation standard délivrée après participation à une formation',
  'attestation',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "landscape",
    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 },
    "colors": {
      "primary": "#047857",
      "text": "#111827"
    },
    "header": {
      "title": "ATTESTATION DE FORMATION",
      "subtitle": "Direction de la Certification",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#047857",
        "textColor": "#ECFDF5",
        "padding": 12
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 20
      },
      {
        "type": "text",
        "content": "Nous soussignés, attestons par la présente que :",
        "style": { "fontSize": 14, "align": "center", "color": "#4B5563" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "{{field:Nom}} {{field:Prénoms}}",
        "style": { "fontSize": 26, "align": "center", "bold": true, "color": "#047857", "backgroundColor": "#ECFDF5", "padding": 8, "border": { "color": "#A7F3D0", "width": 1 } }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "A suivi avec succès le programme de formation et a validé l''ensemble des acquis demandés pour sa spécialisation.",
        "style": { "fontSize": 14, "align": "center", "italic": true }
      },
      {
        "type": "spacer",
        "height": 20
      },
      {
        "type": "fields_table",
        "fields": ["Formation professionnelle", "Établissement de formation", "N° Diplôme (si applicable)"],
        "style": { "zebra": true, "zebraColor": "#F0FDF4", "border": true, "borderColor": "#D1FAE5" }
      },
      {
        "type": "spacer",
        "height": 30
      },
      {
        "type": "signature_block",
        "labels": ["Le Directeur des Formations", "Le Formateur Principal"]
      }
    ],
    "footer": {
      "text": "Fait à Abidjan, le {{date}} – N° {{ref}}",
      "showPageNumbers": false
    }
  }'::jsonb
),

(
  'Fiche Récapitulative Complète',
  'Rapport complet incluant toutes les données du formulaire',
  'report',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 15, "bottom": 15, "left": 15 },
    "colors": {
      "primary": "#374151",
      "text": "#1F2937"
    },
    "header": {
      "title": "FICHE RÉCAPITULATIVE DE DOSSIER",
      "subtitle": "Extrait du registre des soumissions",
      "logoPosition": "left",
      "style": {
        "backgroundColor": "#1F2937",
        "textColor": "#FFFFFF",
        "padding": 12
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "Dossier N° {{ref}} | Édité le {{date}}",
        "style": { "fontSize": 10, "align": "right", "bold": true, "color": "#6B7280" }
      },
      {
        "type": "divider",
        "style": { "color": "#E5E7EB", "thickness": 0.5 }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "INFORMATIONS GÉNÉRALES",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#374151", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Email", "Téléphone principal", "Téléphone secondaire", "Sexe", "Date de naissance", "Lieu de naissance", "Nationalité", "N° CNI / Attestation d’identité", "Adresse complète", "Commune", "Région"],
        "style": { "zebra": true, "border": true, "borderColor": "#E5E7EB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "PROFIL PROFESSIONNEL & CAPACITÉS",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#374151", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Métier(s) secondaire(s)", "Années d’expérience", "Équipements disponibles", "Zone(s) d’intervention", "Disponible immédiatement", "Intervention d’urgence possible"],
        "style": { "zebra": true, "border": true, "borderColor": "#E5E7EB" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "ENGAGEMENT",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#374151", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Je soussigné(e)", "Date de signature"],
        "style": { "zebra": false, "border": true, "borderColor": "#E5E7EB" }
      }
    ],
    "footer": {
      "text": "Ce document est généré automatiquement par le système BROBROLI.",
      "showPageNumbers": true
    }
  }'::jsonb
);
