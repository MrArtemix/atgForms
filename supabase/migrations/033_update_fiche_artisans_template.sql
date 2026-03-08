-- Migration: Mise à jour du template "Fiche officielle artisans"
-- Synchronisation avec le formulaire live modifié par l'utilisateur
-- Ajouts: form_header avec hero image, image_upload "Photo de profile", signature
-- Suppressions: Date d'expiration CNI, Téléphone secondaire, Adresse complète, Label AASS
-- Modifications: options "Documents à fournir", description "Anciennes entreprises"

UPDATE public.templates
SET form_definition = '{
    "pages": [
      { "title": "Identification générale", "sort_order": 0 },
      { "title": "Profil professionnel", "sort_order": 1 },
      { "title": "Catégorisation BROBROLI", "sort_order": 2 },
      { "title": "Équipements & capacités", "sort_order": 3 },
      { "title": "Zone & engagement", "sort_order": 4 }
    ],
    "fields": [
      { "type": "form_header", "label": "FICHE OFFICIELLE DES ARTISANS", "description": "Fiche officielle d''enregistrement des artisans – Plateforme BROBROLI – ADEM (catégorisation A / B)\n\n", "sort_order": 0, "page_index": 0, "field_config": { "header_style": "image", "header_height": "hero", "header_pattern": "dots", "header_image_url": "https://wikdhdgdyobunzpaualp.supabase.co/storage/v1/object/public/form-assets/headers/r66435rao99_1772730271759.png" } },
      { "type": "image_upload", "label": "Photo de profile", "sort_order": 1, "page_index": 0, "field_config": { "max_files": 1, "max_file_size": 2097152 } },
      { "type": "short_text", "label": "Nom", "required": true, "sort_order": 2, "page_index": 0 },
      { "type": "short_text", "label": "Prénoms", "required": true, "sort_order": 3, "page_index": 0 },
      { "type": "single_choice", "label": "Sexe", "options": [
        { "label": "M", "value": "M" },
        { "label": "F", "value": "F" }
      ], "required": true, "sort_order": 4, "page_index": 0 },
      { "type": "date", "label": "Date de naissance", "required": true, "sort_order": 5, "page_index": 0 },
      { "type": "short_text", "label": "Lieu de naissance", "required": true, "sort_order": 6, "page_index": 0 },
      { "type": "short_text", "label": "Nationalité", "required": true, "sort_order": 7, "page_index": 0 },
      { "type": "short_text", "label": "N° CNI / Attestation d''identité", "required": true, "sort_order": 8, "page_index": 0 },
      { "type": "phone", "label": "Téléphone principal", "required": true, "sort_order": 9, "page_index": 0 },
      { "type": "email", "label": "Email", "sort_order": 10, "page_index": 0 },
      { "type": "short_text", "label": "Commune", "sort_order": 11, "page_index": 0 },
      { "type": "short_text", "label": "Région", "sort_order": 12, "page_index": 0 },

      { "type": "section_header", "label": "Métier et expérience", "description": "Profil professionnel de l''artisan", "sort_order": 0, "page_index": 1, "field_config": { "header_size": "h3" } },
      { "type": "single_choice", "label": "Métier principal", "options": [
        { "label": "Plombier", "value": "plombier" },
        { "label": "Électricien", "value": "electricien" },
        { "label": "Peintre", "value": "peintre" },
        { "label": "Climatisation / Froid", "value": "climatisation_froid" },
        { "label": "Autre", "value": "autre" }
      ], "required": true, "sort_order": 1, "page_index": 1 },
      { "type": "short_text", "label": "Métier principal (autre, à préciser)", "sort_order": 2, "page_index": 1 },
      { "type": "long_text", "label": "Métier(s) secondaire(s)", "sort_order": 3, "page_index": 1, "field_config": { "rows": 2 } },
      { "type": "dropdown", "label": "Années d''expérience", "options": [
        { "label": "< 5 ans", "value": "<5" },
        { "label": "5–10 ans", "value": "5-10" },
        { "label": "10+ ans", "value": "10+" }
      ], "required": true, "sort_order": 4, "page_index": 1 },
      { "type": "multiple_choice", "label": "Formation professionnelle", "options": [
        { "label": "CAP", "value": "CAP" },
        { "label": "BEP", "value": "BEP" },
        { "label": "BT", "value": "BT" },
        { "label": "BTS", "value": "BTS" },
        { "label": "Licence", "value": "Licence" },
        { "label": "Aucun", "value": "Aucun" }
      ], "sort_order": 5, "page_index": 1 },
      { "type": "short_text", "label": "Établissement de formation", "sort_order": 6, "page_index": 1 },
      { "type": "single_choice", "label": "Diplôme certifié ?", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 7, "page_index": 1 },
      { "type": "short_text", "label": "N° Diplôme (si applicable)", "sort_order": 8, "page_index": 1 },
      { "type": "long_text", "label": "Anciennes entreprises / chantiers majeurs", "description": "Si vous êtes un artisans non certifié", "sort_order": 9, "page_index": 1, "field_config": { "rows": 3 } },

      { "type": "section_header", "label": "Catégorisation BROBROLI", "description": "Modèle A / B validé officiel", "sort_order": 0, "page_index": 2, "field_config": { "header_size": "h3" } },
      { "type": "single_choice", "label": "Catégorie A – Certifiés", "options": [
        { "label": "A1 (<5 ans)", "value": "A1" },
        { "label": "A1+ (5–10 ans)", "value": "A1plus" },
        { "label": "A1++ (10+ ans)", "value": "A1plusplus" }
      ], "sort_order": 1, "page_index": 2 },
      { "type": "single_choice", "label": "Catégorie B – Non certifiés", "options": [
        { "label": "B1 (<5 ans)", "value": "B1" },
        { "label": "B1+ (5–10 ans)", "value": "B1plus" },
        { "label": "B1++ (10+ ans)", "value": "B1plusplus" }
      ], "sort_order": 2, "page_index": 2 },
      { "type": "multiple_choice", "label": "Documents à fournir", "options": [
        { "label": "Piece administratif", "value": "piece_administratif" },
        { "label": "Copie diplôme (si certifié)", "value": "diplome" },
        { "label": "Attestation d''expérience", "value": "experience" },
        { "label": "Extrait casier judiciaire", "value": "casier" },
        { "label": "RIB / Mobile Money", "value": "rib" },
        { "label": "Photo en situation de travail", "value": "photo_travail" },
        { "label": "Carte CMU", "value": "carte_cmu" }
      ], "sort_order": 3, "page_index": 2 },

      { "type": "section_header", "label": "Équipements & capacités", "sort_order": 0, "page_index": 3, "field_config": { "header_size": "h3" } },
      { "type": "multiple_choice", "label": "Équipements disponibles", "options": [
        { "label": "Outils complets adaptés au métier", "value": "outils" },
        { "label": "Véhicule (Moto / Tricycle / Véhicule)", "value": "vehicule" },
        { "label": "Smartphone Android", "value": "smartphone" },
        { "label": "Connexion internet régulière", "value": "internet" },
        { "label": "Équipe disponible", "value": "equipe" }
      ], "sort_order": 1, "page_index": 3 },

      { "type": "section_header", "label": "Zone & disponibilité", "sort_order": 0, "page_index": 4, "field_config": { "header_size": "h3" } },
      { "type": "long_text", "label": "Zone(s) d''intervention", "sort_order": 1, "page_index": 4, "field_config": { "rows": 2 } },
      { "type": "single_choice", "label": "Disponible immédiatement", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 2, "page_index": 4 },
      { "type": "short_text", "label": "Horaires habituels", "sort_order": 3, "page_index": 4 },
      { "type": "single_choice", "label": "Intervention d''urgence possible", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 4, "page_index": 4 },
      { "type": "section_header", "label": "Engagement officiel", "sort_order": 5, "page_index": 4, "field_config": { "header_size": "h3" } },
      { "type": "short_text", "label": "Je soussigné(e)", "placeholder": "Nom et prénoms de l''artisan", "required": true, "sort_order": 6, "page_index": 4 },
      { "type": "single_choice", "label": "Engagement", "options": [
        {
          "label": "Je déclare exactes les informations fournies et m''engage à respecter la charte qualité BROBROLI, les normes de sécurité BTP, à honorer toute mission validée, à maintenir une conduite professionnelle irréprochable et à respecter les obligations fiscales et sociales applicables.",
          "value": "agree"
        }
      ], "required": true, "sort_order": 7, "page_index": 4 },
      { "type": "date", "label": "Date de signature", "required": true, "sort_order": 8, "page_index": 4 },
      { "type": "signature", "label": "Signature", "sort_order": 9, "page_index": 4 }
    ],
    "theme": null
  }',
  updated_at = NOW()
WHERE name = 'Fiche officielle artisans' AND is_system = true;
