-- =====================================================
-- Marquer le template "Fiche Officielle Artisan" comme généré
-- côté serveur Python (reportlab) et non par le jsPDF client.
-- Le layout JSON est un placeholder minimal car la vraie
-- génération est faite par server.py avec le design exact.
-- =====================================================

UPDATE public.document_templates
SET
  layout = '{
    "renderer": "server",
    "serverEndpoint": "/generate-pdf",
    "pageFormat": "a4",
    "orientation": "portrait",
    "colors": {
      "primary": "#131F36",
      "accent": "#F26122"
    }
  }'::jsonb,
  description = 'Fiche officielle artisan – Génération serveur (reportlab) – Design BROBROLI avec ruban tressé, QR code, sections complètes, cases à cocher, photo artisan',
  updated_at = NOW()
WHERE name = 'Fiche Officielle Artisan' AND is_system = true;

-- Idem pour le template existant
UPDATE public.document_templates
SET
  layout = '{
    "renderer": "server",
    "serverEndpoint": "/generate-pdf",
    "pageFormat": "a4",
    "orientation": "portrait",
    "colors": {
      "primary": "#131F36",
      "accent": "#F26122"
    }
  }'::jsonb,
  description = 'Fiche complète d''enregistrement officiel des artisans – Génération serveur (reportlab) – Design BROBROLI avec ruban tressé, QR code, 7 sections, cases cochées automatiquement',
  updated_at = NOW()
WHERE name = 'Fiche Officielle d''Enregistrement des Artisans' AND is_system = true;
