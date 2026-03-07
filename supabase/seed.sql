-- Seed system templates
INSERT INTO public.templates (name, description, category, is_system, form_definition, use_count) VALUES
(
  'Contact Form',
  'Simple contact form with name, email, and message',
  'Contact',
  true,
  '{"pages":[{"title":"Contact Us","sort_order":0}],"fields":[{"type":"short_text","label":"Full Name","required":true,"sort_order":0},{"type":"email","label":"Email Address","required":true,"sort_order":1},{"type":"phone","label":"Phone Number","required":false,"sort_order":2},{"type":"dropdown","label":"Subject","options":[{"label":"General Inquiry","value":"general"},{"label":"Support","value":"support"},{"label":"Feedback","value":"feedback"},{"label":"Other","value":"other"}],"required":true,"sort_order":3},{"type":"long_text","label":"Message","required":true,"sort_order":4,"field_config":{"rows":5}}],"theme":null}',
  0
),
(
  'Customer Feedback',
  'Collect customer satisfaction feedback',
  'Feedback',
  true,
  '{"pages":[{"title":"Feedback","sort_order":0}],"fields":[{"type":"rating","label":"Overall Satisfaction","required":true,"sort_order":0,"field_config":{"rating_max":5,"rating_icon":"star"}},{"type":"single_choice","label":"How likely are you to recommend us?","options":[{"label":"Very Likely","value":"very_likely"},{"label":"Likely","value":"likely"},{"label":"Neutral","value":"neutral"},{"label":"Unlikely","value":"unlikely"},{"label":"Very Unlikely","value":"very_unlikely"}],"required":true,"sort_order":1},{"type":"long_text","label":"What did you like most?","sort_order":2},{"type":"long_text","label":"What could we improve?","sort_order":3},{"type":"email","label":"Email (optional)","sort_order":4}],"theme":null}',
  0
),
(
  'Event Registration',
  'Register attendees for an event',
  'Registration',
  true,
  '{"pages":[{"title":"Registration","sort_order":0}],"fields":[{"type":"short_text","label":"First Name","required":true,"sort_order":0},{"type":"short_text","label":"Last Name","required":true,"sort_order":1},{"type":"email","label":"Email","required":true,"sort_order":2},{"type":"phone","label":"Phone","sort_order":3},{"type":"dropdown","label":"Ticket Type","options":[{"label":"General Admission","value":"general"},{"label":"VIP","value":"vip"},{"label":"Student","value":"student"}],"required":true,"sort_order":4},{"type":"number","label":"Number of Guests","sort_order":5,"field_config":{"min":0,"max":5}},{"type":"long_text","label":"Dietary Requirements","sort_order":6}],"theme":null}',
  0
),
(
  'Employee Survey',
  'Annual employee satisfaction survey',
  'Survey',
  true,
  '{"pages":[{"title":"Work Environment","sort_order":0},{"title":"Management","sort_order":1},{"title":"Growth","sort_order":2}],"fields":[{"type":"linear_scale","label":"How satisfied are you with your work environment?","required":true,"sort_order":0,"field_config":{"scale_min":1,"scale_max":5,"scale_min_label":"Very Dissatisfied","scale_max_label":"Very Satisfied"}},{"type":"linear_scale","label":"How would you rate work-life balance?","required":true,"sort_order":1,"field_config":{"scale_min":1,"scale_max":5}},{"type":"long_text","label":"Comments about work environment","sort_order":2},{"type":"linear_scale","label":"How effective is your direct manager?","required":true,"sort_order":0,"field_config":{"scale_min":1,"scale_max":5}},{"type":"long_text","label":"Feedback for management","sort_order":1},{"type":"single_choice","label":"Do you see growth opportunities?","options":[{"label":"Yes, definitely","value":"yes"},{"label":"Somewhat","value":"somewhat"},{"label":"Not really","value":"no"}],"required":true,"sort_order":0},{"type":"long_text","label":"Additional comments","sort_order":1}],"theme":null}',
  0
),
(
  'Quiz Template',
  'Create a quiz with scored answers',
  'Quiz',
  true,
  '{"pages":[{"title":"Quiz","sort_order":0}],"fields":[{"type":"section_header","label":"General Knowledge Quiz","description":"Answer the following questions","sort_order":0,"field_config":{"header_size":"h2"}},{"type":"single_choice","label":"Question 1: What is the capital of France?","options":[{"label":"London","value":"london"},{"label":"Paris","value":"paris"},{"label":"Berlin","value":"berlin"},{"label":"Madrid","value":"madrid"}],"required":true,"sort_order":1},{"type":"single_choice","label":"Question 2: Which planet is closest to the Sun?","options":[{"label":"Venus","value":"venus"},{"label":"Mercury","value":"mercury"},{"label":"Earth","value":"earth"},{"label":"Mars","value":"mars"}],"required":true,"sort_order":2},{"type":"short_text","label":"Your Name","required":true,"sort_order":3}],"theme":null}',
  0
),
(
  'Job Application',
  'Collect job applications with resume upload',
  'HR',
  true,
  '{"pages":[{"title":"Personal Info","sort_order":0},{"title":"Experience","sort_order":1}],"fields":[{"type":"short_text","label":"Full Name","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"phone","label":"Phone Number","required":true,"sort_order":2},{"type":"url","label":"LinkedIn Profile","sort_order":3},{"type":"dropdown","label":"Position Applied For","options":[{"label":"Software Engineer","value":"swe"},{"label":"Designer","value":"designer"},{"label":"Product Manager","value":"pm"},{"label":"Marketing","value":"marketing"}],"required":true,"sort_order":0},{"type":"long_text","label":"Cover Letter","required":true,"sort_order":1,"field_config":{"rows":6}},{"type":"file_upload","label":"Resume/CV","required":true,"sort_order":2}],"theme":null}',
  0
),
(
  'Course Evaluation',
  'Evaluate a course or training session',
  'Education',
  true,
  '{"pages":[{"title":"Evaluation","sort_order":0}],"fields":[{"type":"short_text","label":"Course Name","required":true,"sort_order":0},{"type":"rating","label":"Overall Rating","required":true,"sort_order":1,"field_config":{"rating_max":5}},{"type":"linear_scale","label":"Content Quality","required":true,"sort_order":2,"field_config":{"scale_min":1,"scale_max":5,"scale_min_label":"Poor","scale_max_label":"Excellent"}},{"type":"linear_scale","label":"Instructor Effectiveness","required":true,"sort_order":3,"field_config":{"scale_min":1,"scale_max":5}},{"type":"multiple_choice","label":"What did you find most valuable?","options":[{"label":"Lectures","value":"lectures"},{"label":"Hands-on exercises","value":"exercises"},{"label":"Group discussions","value":"discussions"},{"label":"Reading materials","value":"materials"}],"sort_order":4},{"type":"long_text","label":"Suggestions for improvement","sort_order":5}],"theme":null}',
  0
),
(
  'Product Order Form',
  'Simple product order form',
  'Order',
  true,
  '{"pages":[{"title":"Order","sort_order":0}],"fields":[{"type":"short_text","label":"Full Name","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"short_text","label":"Shipping Address","required":true,"sort_order":2},{"type":"dropdown","label":"Product","options":[{"label":"Product A - $29","value":"product_a"},{"label":"Product B - $49","value":"product_b"},{"label":"Product C - $99","value":"product_c"}],"required":true,"sort_order":3},{"type":"number","label":"Quantity","required":true,"sort_order":4,"field_config":{"min":1,"max":100}},{"type":"long_text","label":"Special Instructions","sort_order":5}],"theme":null}',
  0
),
(
  'Newsletter Signup',
  'Simple newsletter subscription form',
  'Contact',
  true,
  '{"pages":[{"title":"Subscribe","sort_order":0}],"fields":[{"type":"email","label":"Email Address","required":true,"sort_order":0,"placeholder":"your@email.com"},{"type":"short_text","label":"First Name","sort_order":1},{"type":"multiple_choice","label":"Topics of Interest","options":[{"label":"Technology","value":"tech"},{"label":"Business","value":"business"},{"label":"Design","value":"design"},{"label":"Marketing","value":"marketing"}],"sort_order":2}],"theme":null}',
  0
),
(
  'Bug Report',
  'Report software bugs and issues',
  'Feedback',
  true,
  '{"pages":[{"title":"Bug Report","sort_order":0}],"fields":[{"type":"short_text","label":"Bug Title","required":true,"sort_order":0},{"type":"dropdown","label":"Severity","options":[{"label":"Critical","value":"critical"},{"label":"High","value":"high"},{"label":"Medium","value":"medium"},{"label":"Low","value":"low"}],"required":true,"sort_order":1},{"type":"long_text","label":"Steps to Reproduce","required":true,"sort_order":2,"field_config":{"rows":4}},{"type":"long_text","label":"Expected Behavior","required":true,"sort_order":3},{"type":"long_text","label":"Actual Behavior","required":true,"sort_order":4},{"type":"file_upload","label":"Screenshot","sort_order":5},{"type":"email","label":"Your Email","sort_order":6}],"theme":null}',
  0
),
(
  'Meeting Scheduler',
  'Find the best time for a meeting',
  'Survey',
  true,
  '{"pages":[{"title":"Schedule","sort_order":0}],"fields":[{"type":"short_text","label":"Your Name","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"multiple_choice","label":"Available Days","options":[{"label":"Monday","value":"mon"},{"label":"Tuesday","value":"tue"},{"label":"Wednesday","value":"wed"},{"label":"Thursday","value":"thu"},{"label":"Friday","value":"fri"}],"required":true,"sort_order":2},{"type":"dropdown","label":"Preferred Time","options":[{"label":"Morning (9-12)","value":"morning"},{"label":"Afternoon (12-17)","value":"afternoon"},{"label":"Evening (17-20)","value":"evening"}],"required":true,"sort_order":3},{"type":"long_text","label":"Notes","sort_order":4}],"theme":null}',
  0
),
(
  'RSVP Form',
  'Event RSVP with plus-one option',
  'Registration',
  true,
  '{"pages":[{"title":"RSVP","sort_order":0}],"fields":[{"type":"short_text","label":"Your Name","required":true,"sort_order":0},{"type":"email","label":"Email","required":true,"sort_order":1},{"type":"single_choice","label":"Will you attend?","options":[{"label":"Yes, I will attend","value":"yes"},{"label":"No, I cannot attend","value":"no"},{"label":"Maybe","value":"maybe"}],"required":true,"sort_order":2},{"type":"number","label":"Number of Guests","sort_order":3,"field_config":{"min":0,"max":5}},{"type":"long_text","label":"Dietary Restrictions","sort_order":4},{"type":"long_text","label":"Message for the Host","sort_order":5}],"theme":null}',
  0
),
(
  'Fiche officielle artisans',
  'Fiche officielle d’enregistrement des artisans – Plateforme BROBROLI – ADEM (catégorisation A / B)',
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
      { "type": "short_text", "label": "Nom", "required": true, "sort_order": 0, "page_index": 0 },
      { "type": "short_text", "label": "Prénoms", "required": true, "sort_order": 1, "page_index": 0 },
      { "type": "single_choice", "label": "Sexe", "options": [
        { "label": "M", "value": "M" },
        { "label": "F", "value": "F" }
      ], "required": true, "sort_order": 2, "page_index": 0 },
      { "type": "date", "label": "Date de naissance", "required": true, "sort_order": 3, "page_index": 0 },
      { "type": "short_text", "label": "Lieu de naissance", "required": true, "sort_order": 4, "page_index": 0 },
      { "type": "short_text", "label": "Nationalité", "required": true, "sort_order": 5, "page_index": 0 },
      { "type": "short_text", "label": "N° CNI / Attestation d’identité", "required": true, "sort_order": 6, "page_index": 0 },
      { "type": "date", "label": "Date d’expiration CNI", "sort_order": 7, "page_index": 0 },
      { "type": "phone", "label": "Téléphone principal", "required": true, "sort_order": 8, "page_index": 0 },
      { "type": "phone", "label": "Téléphone secondaire", "sort_order": 9, "page_index": 0 },
      { "type": "email", "label": "Email", "sort_order": 10, "page_index": 0 },
      { "type": "long_text", "label": "Adresse complète", "sort_order": 11, "page_index": 0, "field_config": { "rows": 2 } },
      { "type": "short_text", "label": "Commune", "sort_order": 12, "page_index": 0 },
      { "type": "short_text", "label": "Région", "sort_order": 13, "page_index": 0 },

      { "type": "section_header", "label": "Métier et expérience", "description": "Profil professionnel de l’artisan", "sort_order": 14, "page_index": 1, "field_config": { "header_size": "h3" } },
      { "type": "single_choice", "label": "Métier principal", "options": [
        { "label": "Plombier", "value": "plombier" },
        { "label": "Électricien", "value": "electricien" },
        { "label": "Peintre", "value": "peintre" },
        { "label": "Climatisation / Froid", "value": "climatisation_froid" },
        { "label": "Autre", "value": "autre" }
      ], "required": true, "sort_order": 15, "page_index": 1 },
      { "type": "short_text", "label": "Métier principal (autre, à préciser)", "sort_order": 16, "page_index": 1 },
      { "type": "long_text", "label": "Métier(s) secondaire(s)", "sort_order": 17, "page_index": 1, "field_config": { "rows": 2 } },
      { "type": "dropdown", "label": "Années d’expérience", "options": [
        { "label": "< 5 ans", "value": "<5" },
        { "label": "5–10 ans", "value": "5-10" },
        { "label": "10+ ans", "value": "10+" }
      ], "required": true, "sort_order": 18, "page_index": 1 },
      { "type": "multiple_choice", "label": "Formation professionnelle", "options": [
        { "label": "CAP", "value": "CAP" },
        { "label": "BEP", "value": "BEP" },
        { "label": "BT", "value": "BT" },
        { "label": "BTS", "value": "BTS" },
        { "label": "Licence", "value": "Licence" },
        { "label": "Aucun", "value": "Aucun" }
      ], "sort_order": 19, "page_index": 1 },
      { "type": "short_text", "label": "Établissement de formation", "sort_order": 20, "page_index": 1 },
      { "type": "single_choice", "label": "Diplôme certifié ?", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 21, "page_index": 1 },
      { "type": "short_text", "label": "N° Diplôme (si applicable)", "sort_order": 22, "page_index": 1 },
      { "type": "long_text", "label": "Anciennes entreprises / chantiers majeurs", "sort_order": 23, "page_index": 1, "field_config": { "rows": 3 } },

      { "type": "section_header", "label": "Catégorisation BROBROLI", "description": "Modèle A / B validé officiel", "sort_order": 24, "page_index": 2, "field_config": { "header_size": "h3" } },
      { "type": "single_choice", "label": "Catégorie A – Certifiés", "options": [
        { "label": "A1 (<5 ans)", "value": "A1" },
        { "label": "A1+ (5–10 ans)", "value": "A1plus" },
        { "label": "A1++ (10+ ans)", "value": "A1plusplus" }
      ], "sort_order": 25, "page_index": 2 },
      { "type": "single_choice", "label": "Catégorie B – Non certifiés", "options": [
        { "label": "B1 (<5 ans)", "value": "B1" },
        { "label": "B1+ (5–10 ans)", "value": "B1plus" },
        { "label": "B1++ (10+ ans)", "value": "B1plusplus" }
      ], "sort_order": 26, "page_index": 2 },
      { "type": "single_choice", "label": "Label AASS", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 27, "page_index": 2 },
      { "type": "multiple_choice", "label": "Documents à fournir", "options": [
        { "label": "Copie CNI", "value": "cni" },
        { "label": "Copie diplôme (si certifié)", "value": "diplome" },
        { "label": "Attestation d’expérience", "value": "experience" },
        { "label": "Extrait casier judiciaire", "value": "casier" },
        { "label": "Attestation responsabilité civile", "value": "responsabilite" },
        { "label": "RIB / Mobile Money", "value": "rib" },
        { "label": "Photo en situation de travail", "value": "photo_travail" }
      ], "sort_order": 28, "page_index": 2 },

      { "type": "section_header", "label": "Équipements & capacités", "sort_order": 29, "page_index": 3, "field_config": { "header_size": "h3" } },
      { "type": "multiple_choice", "label": "Équipements disponibles", "options": [
        { "label": "Outils complets adaptés au métier", "value": "outils" },
        { "label": "Véhicule (Moto / Tricycle / Véhicule)", "value": "vehicule" },
        { "label": "Smartphone Android", "value": "smartphone" },
        { "label": "Connexion internet régulière", "value": "internet" },
        { "label": "Équipe disponible", "value": "equipe" }
      ], "sort_order": 30, "page_index": 3 },

      { "type": "section_header", "label": "Zone & disponibilité", "sort_order": 31, "page_index": 4, "field_config": { "header_size": "h3" } },
      { "type": "long_text", "label": "Zone(s) d’intervention", "sort_order": 32, "page_index": 4, "field_config": { "rows": 2 } },
      { "type": "single_choice", "label": "Disponible immédiatement", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 33, "page_index": 4 },
      { "type": "short_text", "label": "Horaires habituels", "sort_order": 34, "page_index": 4 },
      { "type": "single_choice", "label": "Intervention d’urgence possible", "options": [
        { "label": "Oui", "value": "oui" },
        { "label": "Non", "value": "non" }
      ], "sort_order": 35, "page_index": 4 },
      { "type": "section_header", "label": "Engagement officiel", "sort_order": 36, "page_index": 4, "field_config": { "header_size": "h3" } },
      { "type": "short_text", "label": "Je soussigné(e)", "placeholder": "Nom et prénoms de l’artisan", "required": true, "sort_order": 37, "page_index": 4 },
      { "type": "date", "label": "Date de signature", "required": true, "sort_order": 38, "page_index": 4 },
      { "type": "single_choice", "label": "Engagement", "options": [
        {
          "label": "Je déclare exactes les informations fournies et m’engage à respecter la charte qualité BROBROLI, les normes de sécurité BTP, à honorer toute mission validée, à maintenir une conduite professionnelle irréprochable et à respecter les obligations fiscales et sociales applicables.",
          "value": "agree"
        }
      ], "required": true, "sort_order": 39, "page_index": 4 }
    ],
    "theme": null
  }',
  0
);
