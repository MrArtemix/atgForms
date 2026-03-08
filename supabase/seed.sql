-- Seed system templates
-- Nettoyage des anciens templates système avant insertion
DELETE FROM public.templates WHERE is_system = true;

INSERT INTO public.templates (name, description, category, is_system, form_definition, use_count) VALUES
(
  'Formulaire de contact',
  'Formulaire de contact simple avec nom, email et message',
  'Contact',
  true,
  '{"pages":[{"title":"Nous contacter","sort_order":0}],"fields":[{"type":"short_text","label":"Nom complet","required":true,"sort_order":0},{"type":"email","label":"Adresse email","required":true,"sort_order":1},{"type":"phone","label":"Téléphone","required":false,"sort_order":2},{"type":"dropdown","label":"Objet","options":[{"label":"Demande générale","value":"general"},{"label":"Support","value":"support"},{"label":"Retour d''expérience","value":"feedback"},{"label":"Autre","value":"other"}],"required":true,"sort_order":3},{"type":"long_text","label":"Message","required":true,"sort_order":4,"field_config":{"rows":5}}],"theme":null}',
  0
),
(
  'Retour client',
  'Recueillez les avis et la satisfaction de vos clients',
  'Feedback',
  true,
  '{"pages":[{"title":"Votre avis","sort_order":0}],"fields":[{"type":"rating","label":"Satisfaction globale","required":true,"sort_order":0,"field_config":{"rating_max":5,"rating_icon":"star"}},{"type":"single_choice","label":"Recommanderiez-vous nos services ?","options":[{"label":"Très probablement","value":"very_likely"},{"label":"Probablement","value":"likely"},{"label":"Neutre","value":"neutral"},{"label":"Peu probable","value":"unlikely"},{"label":"Pas du tout","value":"very_unlikely"}],"required":true,"sort_order":1},{"type":"long_text","label":"Ce que vous avez apprécié","sort_order":2},{"type":"long_text","label":"Ce que nous pourrions améliorer","sort_order":3},{"type":"email","label":"Email (facultatif)","sort_order":4}],"theme":null}',
  0
),
(
  'Inscription événement',
  'Formulaire d''inscription pour un événement ou une formation',
  'Registration',
  true,
  '{"pages":[{"title":"Inscription","sort_order":0}],"fields":[{"type":"short_text","label":"Prénom","required":true,"sort_order":0},{"type":"short_text","label":"Nom","required":true,"sort_order":1},{"type":"email","label":"Email","required":true,"sort_order":2},{"type":"phone","label":"Téléphone","sort_order":3},{"type":"dropdown","label":"Type de place","options":[{"label":"Standard","value":"general"},{"label":"VIP","value":"vip"},{"label":"Étudiant","value":"student"}],"required":true,"sort_order":4},{"type":"number","label":"Nombre d''accompagnants","sort_order":5,"field_config":{"min":0,"max":5}},{"type":"long_text","label":"Besoins particuliers","sort_order":6}],"theme":null}',
  0
),
(
  'Sondage collaborateurs',
  'Enquête annuelle de satisfaction des employés',
  'Survey',
  true,
  '{"pages":[{"title":"Environnement de travail","sort_order":0},{"title":"Management","sort_order":1},{"title":"Évolution","sort_order":2}],"fields":[{"type":"linear_scale","label":"Satisfaction de votre environnement de travail","required":true,"sort_order":0,"field_config":{"scale_min":1,"scale_max":5,"scale_min_label":"Très insatisfait","scale_max_label":"Très satisfait"}},{"type":"linear_scale","label":"Équilibre vie professionnelle / vie personnelle","required":true,"sort_order":1,"field_config":{"scale_min":1,"scale_max":5}},{"type":"long_text","label":"Commentaires sur l''environnement","sort_order":2},{"type":"linear_scale","label":"Efficacité de votre responsable direct","required":true,"sort_order":0,"field_config":{"scale_min":1,"scale_max":5}},{"type":"long_text","label":"Retour sur le management","sort_order":1},{"type":"single_choice","label":"Voyez-vous des opportunités d''évolution ?","options":[{"label":"Oui, clairement","value":"yes"},{"label":"Un peu","value":"somewhat"},{"label":"Pas vraiment","value":"no"}],"required":true,"sort_order":0},{"type":"long_text","label":"Commentaires additionnels","sort_order":1}],"theme":null}',
  0
),
(
  'Candidature emploi',
  'Collectez les candidatures avec CV et lettre de motivation',
  'HR',
  true,
  '{"pages":[{"title":"Informations personnelles","sort_order":0},{"title":"Expérience","sort_order":1}],"fields":[{"type":"short_text","label":"Nom complet","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"phone","label":"Téléphone","required":true,"sort_order":2},{"type":"url","label":"Profil LinkedIn","sort_order":3},{"type":"dropdown","label":"Poste souhaité","options":[{"label":"Développeur","value":"dev"},{"label":"Designer","value":"designer"},{"label":"Chef de projet","value":"pm"},{"label":"Commercial","value":"commercial"}],"required":true,"sort_order":0},{"type":"long_text","label":"Lettre de motivation","required":true,"sort_order":1,"field_config":{"rows":6}},{"type":"file_upload","label":"CV / Curriculum Vitae","required":true,"sort_order":2}],"theme":null}',
  0
),
(
  'Fiche officielle artisans',
  'Fiche officielle d''enregistrement des artisans – Plateforme BROBROLI – ADEM (catégorisation A / B)',
  'Registration',
  true,
  '{
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
  0
),
(
  'Demande de devis',
  'Formulaire pour recevoir des demandes de devis de la part de vos clients',
  'Contact',
  true,
  '{"pages":[{"title":"Votre demande","sort_order":0}],"fields":[{"type":"short_text","label":"Nom complet","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"phone","label":"Téléphone","required":true,"sort_order":2},{"type":"short_text","label":"Entreprise / Société","sort_order":3},{"type":"dropdown","label":"Type de prestation","options":[{"label":"Plomberie","value":"plomberie"},{"label":"Électricité","value":"electricite"},{"label":"Peinture","value":"peinture"},{"label":"Climatisation","value":"climatisation"},{"label":"Rénovation complète","value":"renovation"},{"label":"Autre","value":"autre"}],"required":true,"sort_order":4},{"type":"long_text","label":"Description du projet","required":true,"sort_order":5,"field_config":{"rows":4}},{"type":"dropdown","label":"Budget estimé","options":[{"label":"Moins de 100 000 FCFA","value":"<100k"},{"label":"100 000 – 500 000 FCFA","value":"100k-500k"},{"label":"500 000 – 1 000 000 FCFA","value":"500k-1m"},{"label":"Plus de 1 000 000 FCFA","value":">1m"}],"sort_order":6},{"type":"date","label":"Date souhaitée de début","sort_order":7},{"type":"file_upload","label":"Photos ou plans (facultatif)","sort_order":8}],"theme":null}',
  0
),
(
  'Évaluation de formation',
  'Évaluez la qualité d''un cours ou d''une session de formation',
  'Education',
  true,
  '{"pages":[{"title":"Évaluation","sort_order":0}],"fields":[{"type":"short_text","label":"Nom de la formation","required":true,"sort_order":0},{"type":"short_text","label":"Nom du formateur","required":true,"sort_order":1},{"type":"rating","label":"Note globale","required":true,"sort_order":2,"field_config":{"rating_max":5,"rating_icon":"star"}},{"type":"linear_scale","label":"Qualité du contenu","required":true,"sort_order":3,"field_config":{"scale_min":1,"scale_max":5,"scale_min_label":"Faible","scale_max_label":"Excellent"}},{"type":"linear_scale","label":"Pédagogie du formateur","required":true,"sort_order":4,"field_config":{"scale_min":1,"scale_max":5}},{"type":"multiple_choice","label":"Ce qui vous a le plus apporté","options":[{"label":"Les cours théoriques","value":"cours"},{"label":"Les exercices pratiques","value":"exercices"},{"label":"Les échanges en groupe","value":"echanges"},{"label":"Les supports de formation","value":"supports"}],"sort_order":5},{"type":"long_text","label":"Suggestions d''amélioration","sort_order":6},{"type":"email","label":"Votre email (facultatif)","sort_order":7}],"theme":null}',
  0
);
