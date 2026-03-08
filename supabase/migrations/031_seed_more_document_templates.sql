-- =====================================================
-- 7 nouveaux modèles de documents PDF (portant le total à 10)
-- =====================================================

INSERT INTO public.document_templates (name, description, category, is_system, layout) VALUES

-- 4. Badge Professionnel
(
  'Badge Professionnel',
  'Badge d''identification professionnelle avec photo et QR code',
  'badge',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 25, "right": 25, "bottom": 25, "left": 25 },
    "colors": {
      "primary": "#7C3AED",
      "text": "#1F2937"
    },
    "header": {
      "title": "BADGE PROFESSIONNEL",
      "subtitle": "Plateforme BROBROLI – Identification Artisan",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#7C3AED",
        "textColor": "#FFFFFF",
        "padding": 10
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "CARTE D''IDENTIFICATION N° {{ref}}",
        "style": { "fontSize": 14, "align": "center", "bold": true, "color": "#7C3AED" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "{{field:Nom}} {{field:Prénoms}}",
        "style": { "fontSize": 22, "align": "center", "bold": true, "color": "#1F2937", "backgroundColor": "#F5F3FF", "padding": 10, "border": { "color": "#C4B5FD", "width": 1 } }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Années d''expérience", "Téléphone principal", "Email"],
        "style": { "zebra": true, "zebraColor": "#F5F3FF", "border": true, "borderColor": "#DDD6FE" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "Ce badge atteste que le titulaire est un artisan enregistré et vérifié sur la plateforme BROBROLI. Il doit être présenté lors de chaque intervention.",
        "style": { "fontSize": 9, "align": "center", "italic": true, "color": "#6B7280" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "divider",
        "style": { "color": "#DDD6FE", "thickness": 1 }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Validité : 12 mois à compter de la date d''émission",
        "style": { "fontSize": 10, "align": "center", "bold": true, "color": "#7C3AED" }
      }
    ],
    "footer": {
      "text": "Badge émis le {{date}} – ID : {{ref}} – BROBROLI Platform",
      "showPageNumbers": false
    }
  }'::jsonb
),

-- 5. Attestation de Présence
(
  'Attestation de Présence',
  'Attestation confirmant la présence ou la participation à un événement',
  'attestation',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 25, "right": 25, "bottom": 25, "left": 25 },
    "colors": {
      "primary": "#0369A1",
      "text": "#1F2937"
    },
    "header": {
      "title": "ATTESTATION DE PRÉSENCE",
      "subtitle": "Direction des Ressources Humaines",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#0369A1",
        "textColor": "#FFFFFF",
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
        "style": { "fontSize": 13, "align": "center", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "{{field:Nom}} {{field:Prénoms}}",
        "style": { "fontSize": 24, "align": "center", "bold": true, "color": "#0369A1", "backgroundColor": "#F0F9FF", "padding": 10, "border": { "color": "#BAE6FD", "width": 1 } }
      },
      {
        "type": "spacer",
        "height": 12
      },
      {
        "type": "text",
        "content": "Né(e) le {{field:Date de naissance}} à {{field:Lieu de naissance}}, titulaire de la pièce d''identité N° {{field:N° CNI / Attestation d''identité}},",
        "style": { "fontSize": 12, "align": "center", "color": "#4B5563" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "A été effectivement présent(e) et a participé activement aux activités organisées dans le cadre de ses fonctions professionnelles au sein de notre structure.",
        "style": { "fontSize": 12, "align": "center", "italic": true, "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Commune", "Région", "Téléphone principal"],
        "style": { "zebra": true, "zebraColor": "#F0F9FF", "border": true, "borderColor": "#BAE6FD" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "Cette attestation est délivrée à l''intéressé(e) pour servir et valoir ce que de droit.",
        "style": { "fontSize": 11, "align": "center", "bold": true, "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Le Responsable", "Le Directeur Général"]
      }
    ],
    "footer": {
      "text": "Fait à Abidjan, le {{date}} – Réf. : {{ref}}",
      "showPageNumbers": false
    }
  }'::jsonb
),

-- 6. Bon de Commande / Ordre de Mission
(
  'Bon de Commande',
  'Document de commande ou ordre de mission pour une prestation artisanale',
  'general',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 15, "bottom": 15, "left": 15 },
    "colors": {
      "primary": "#B45309",
      "text": "#1F2937"
    },
    "header": {
      "title": "BON DE COMMANDE",
      "subtitle": "Ordre de prestation artisanale",
      "logoPosition": "left",
      "style": {
        "backgroundColor": "#B45309",
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
        "content": "N° Commande : {{ref}} | Date : {{date}}",
        "style": { "fontSize": 11, "align": "right", "bold": true, "color": "#B45309" }
      },
      {
        "type": "divider",
        "style": { "color": "#FDE68A", "thickness": 1 }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "PRESTATAIRE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#B45309", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Métier principal", "Téléphone principal", "Email", "Commune", "Région"],
        "style": { "zebra": true, "zebraColor": "#FFFBEB", "border": true, "borderColor": "#FDE68A" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "DÉTAILS DE LA PRESTATION",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#B45309", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Années d''expérience", "Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Équipements disponibles", "Zone(s) d''intervention", "Disponible immédiatement", "Intervention d''urgence possible"],
        "style": { "zebra": true, "zebraColor": "#FFFBEB", "border": true, "borderColor": "#FDE68A" }
      },
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "CONDITIONS",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#B45309", "padding": 4 }
      },
      {
        "type": "text",
        "content": "Le prestataire s''engage à réaliser les travaux conformément aux normes en vigueur et dans le respect des délais convenus. Tout retard ou manquement pourra entraîner des pénalités selon les termes du contrat cadre BROBROLI.",
        "style": { "fontSize": 10, "align": "left", "color": "#4B5563", "backgroundColor": "#FFFBEB", "padding": 6, "border": { "color": "#FDE68A", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Signature du prestataire", "Signature du donneur d''ordre", "Visa du responsable"]
      }
    ],
    "footer": {
      "text": "Bon de commande généré le {{date}} – Réf. {{ref}} – Plateforme BROBROLI",
      "showPageNumbers": true
    }
  }'::jsonb
),

-- 7. Lettre de Recommandation
(
  'Lettre de Recommandation',
  'Lettre officielle recommandant un artisan pour ses compétences et son professionnalisme',
  'general',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 25, "right": 25, "bottom": 25, "left": 25 },
    "colors": {
      "primary": "#1D4ED8",
      "text": "#1F2937"
    },
    "header": {
      "title": "LETTRE DE RECOMMANDATION",
      "subtitle": "Plateforme BROBROLI – Direction Qualité",
      "logoPosition": "left",
      "style": {
        "backgroundColor": "#1D4ED8",
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
        "content": "Abidjan, le {{date}}",
        "style": { "fontSize": 11, "align": "right", "color": "#4B5563" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "Objet : Recommandation professionnelle",
        "style": { "fontSize": 12, "align": "left", "bold": true, "color": "#1D4ED8" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Madame, Monsieur,",
        "style": { "fontSize": 11, "align": "left" }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "Nous avons le plaisir de recommander {{field:Nom}} {{field:Prénoms}}, artisan enregistré sur la plateforme BROBROLI, spécialisé(e) en {{field:Métier principal}} avec {{field:Années d''expérience}} d''expérience professionnelle.",
        "style": { "fontSize": 11, "align": "justify", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "Au cours de ses différentes missions, cet(te) artisan(e) a démontré un haut niveau de compétence, un sens aigu du professionnalisme et un respect constant des normes de qualité et de sécurité en vigueur.",
        "style": { "fontSize": 11, "align": "justify", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Années d''expérience", "Catégorie A – Certifiés", "Formation professionnelle", "Commune", "Région"],
        "style": { "zebra": true, "zebraColor": "#EFF6FF", "border": true, "borderColor": "#BFDBFE" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Nous recommandons vivement ses services et restons disponibles pour tout complément d''information.",
        "style": { "fontSize": 11, "align": "justify", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "Veuillez agréer, Madame, Monsieur, l''expression de nos salutations distinguées.",
        "style": { "fontSize": 11, "align": "justify", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Le Directeur Qualité BROBROLI"]
      }
    ],
    "footer": {
      "text": "Réf. : {{ref}} – Plateforme BROBROLI",
      "showPageNumbers": false
    }
  }'::jsonb
),

-- 8. Procès-Verbal de Réception de Travaux
(
  'Procès-Verbal de Réception',
  'Document officiel de réception et validation des travaux réalisés par un artisan',
  'report',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 15, "bottom": 15, "left": 15 },
    "colors": {
      "primary": "#065F46",
      "text": "#1F2937"
    },
    "header": {
      "title": "PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX",
      "subtitle": "Direction des Opérations",
      "logoPosition": "left",
      "style": {
        "backgroundColor": "#065F46",
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
        "content": "PV N° {{ref}} | Date de réception : {{date}}",
        "style": { "fontSize": 11, "align": "right", "bold": true, "color": "#065F46" }
      },
      {
        "type": "divider",
        "style": { "color": "#A7F3D0", "thickness": 1 }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "IDENTIFICATION DU PRESTATAIRE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#065F46", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Métier principal", "Téléphone principal", "Email"],
        "style": { "zebra": true, "zebraColor": "#ECFDF5", "border": true, "borderColor": "#A7F3D0" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "DÉTAILS DES TRAVAUX",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#065F46", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Années d''expérience", "Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Équipements disponibles", "Zone(s) d''intervention"],
        "style": { "zebra": true, "zebraColor": "#ECFDF5", "border": true, "borderColor": "#A7F3D0" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "OBSERVATIONS",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#065F46", "padding": 4 }
      },
      {
        "type": "text",
        "content": "Les travaux ont été réalisés conformément au cahier des charges et aux normes de qualité BROBROLI. Le prestataire a respecté les délais convenus et les règles de sécurité applicables.",
        "style": { "fontSize": 10, "align": "left", "color": "#374151", "backgroundColor": "#ECFDF5", "padding": 6, "border": { "color": "#A7F3D0", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "DÉCISION : Les travaux sont déclarés conformes et réceptionnés sans réserve.",
        "style": { "fontSize": 11, "align": "center", "bold": true, "color": "#065F46", "backgroundColor": "#D1FAE5", "padding": 6, "border": { "color": "#6EE7B7", "width": 1 } }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Le Prestataire", "Le Maître d''ouvrage", "Le Contrôleur qualité"]
      }
    ],
    "footer": {
      "text": "PV de réception – Réf. {{ref}} – {{date}} – Plateforme BROBROLI",
      "showPageNumbers": true
    }
  }'::jsonb
),

-- 9. Certificat de Conformité
(
  'Certificat de Conformité',
  'Certificat attestant la conformité des travaux aux normes et standards',
  'certificate',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
    "colors": {
      "primary": "#92400E",
      "text": "#1F2937"
    },
    "header": {
      "title": "CERTIFICAT DE CONFORMITÉ",
      "subtitle": "Plateforme BROBROLI – Service Normes & Qualité",
      "logoPosition": "center",
      "style": {
        "backgroundColor": "#92400E",
        "textColor": "#FFFFFF",
        "padding": 12
      }
    },
    "sections": [
      {
        "type": "spacer",
        "height": 15
      },
      {
        "type": "text",
        "content": "N° Certificat : {{ref}}",
        "style": { "fontSize": 13, "align": "center", "bold": true, "color": "#92400E" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Le présent certificat atteste que les prestations réalisées par :",
        "style": { "fontSize": 12, "align": "center", "color": "#4B5563" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "{{field:Nom}} {{field:Prénoms}}",
        "style": { "fontSize": 22, "align": "center", "bold": true, "color": "#92400E", "backgroundColor": "#FFFBEB", "padding": 10, "border": { "color": "#FCD34D", "width": 1 } }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Artisan(e) certifié(e), spécialisé(e) en {{field:Métier principal}}, sont déclarées CONFORMES aux normes de qualité, de sécurité et aux standards professionnels en vigueur.",
        "style": { "fontSize": 12, "align": "center", "color": "#374151" }
      },
      {
        "type": "spacer",
        "height": 12
      },
      {
        "type": "fields_table",
        "fields": ["Métier principal", "Années d''expérience", "Catégorie A – Certifiés", "Formation professionnelle", "Label AASS"],
        "style": { "zebra": true, "zebraColor": "#FFFBEB", "border": true, "borderColor": "#FDE68A" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "Ce certificat est valable pour une durée de 24 mois à compter de la date d''émission. Passé ce délai, un renouvellement devra être effectué.",
        "style": { "fontSize": 10, "align": "center", "italic": true, "color": "#6B7280" }
      },
      {
        "type": "spacer",
        "height": 25
      },
      {
        "type": "signature_block",
        "labels": ["Responsable Normes & Qualité", "Le Directeur ADEM"]
      }
    ],
    "footer": {
      "text": "Certificat de conformité N° {{ref}} – Émis le {{date}} – BROBROLI / ADEM",
      "showPageNumbers": false
    }
  }'::jsonb
),

-- 10. Fiche de Suivi de Chantier
(
  'Fiche de Suivi de Chantier',
  'Fiche détaillée pour le suivi et le reporting d''un chantier ou d''une intervention',
  'report',
  true,
  '{
    "pageFormat": "a4",
    "orientation": "portrait",
    "margins": { "top": 15, "right": 15, "bottom": 15, "left": 15 },
    "colors": {
      "primary": "#4338CA",
      "text": "#1F2937"
    },
    "header": {
      "title": "FICHE DE SUIVI DE CHANTIER",
      "subtitle": "Plateforme BROBROLI – Gestion des interventions",
      "logoPosition": "left",
      "style": {
        "backgroundColor": "#4338CA",
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
        "content": "Fiche N° {{ref}} | Édité le {{date}}",
        "style": { "fontSize": 10, "align": "right", "bold": true, "color": "#6B7280" }
      },
      {
        "type": "divider",
        "style": { "color": "#C7D2FE", "thickness": 0.5 }
      },
      {
        "type": "spacer",
        "height": 5
      },
      {
        "type": "text",
        "content": "ARTISAN / PRESTATAIRE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#4338CA", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Nom", "Prénoms", "Métier principal", "Téléphone principal", "Email", "Commune"],
        "style": { "zebra": true, "zebraColor": "#EEF2FF", "border": true, "borderColor": "#C7D2FE" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "QUALIFICATION & EXPÉRIENCE",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#4338CA", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Années d''expérience", "Catégorie A – Certifiés", "Catégorie B – Non certifiés", "Formation professionnelle", "Établissement de formation", "Label AASS"],
        "style": { "zebra": true, "zebraColor": "#EEF2FF", "border": true, "borderColor": "#C7D2FE" }
      },
      {
        "type": "spacer",
        "height": 8
      },
      {
        "type": "text",
        "content": "MOYENS & DISPONIBILITÉ",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#4338CA", "padding": 4 }
      },
      {
        "type": "fields_table",
        "fields": ["Équipements disponibles", "Zone(s) d''intervention", "Disponible immédiatement", "Horaires habituels", "Intervention d''urgence possible"],
        "style": { "zebra": true, "zebraColor": "#EEF2FF", "border": true, "borderColor": "#C7D2FE" }
      },
      {
        "type": "spacer",
        "height": 10
      },
      {
        "type": "text",
        "content": "OBSERVATIONS DU CHEF DE CHANTIER",
        "style": { "fontSize": 11, "align": "left", "bold": true, "color": "#FFFFFF", "backgroundColor": "#4338CA", "padding": 4 }
      },
      {
        "type": "text",
        "content": "........................................................................................................\n........................................................................................................\n........................................................................................................",
        "style": { "fontSize": 10, "align": "left", "color": "#9CA3AF", "backgroundColor": "#F9FAFB", "padding": 8, "border": { "color": "#E5E7EB", "width": 0.5 } }
      },
      {
        "type": "spacer",
        "height": 20
      },
      {
        "type": "signature_block",
        "labels": ["L''Artisan", "Le Chef de chantier", "Le Superviseur BROBROLI"]
      }
    ],
    "footer": {
      "text": "Fiche de suivi N° {{ref}} – {{date}} – Plateforme BROBROLI – Document confidentiel",
      "showPageNumbers": true
    }
  }'::jsonb
);
