from fiche_officielle import generate_fiche_officielle

mock_data = {
    "Nom": "KOFFI", "Prénoms": "Kouassi Jean", 
    "id": "10045", "Métier principal": "Plombier",
    "N° CNI": "CI001234567", "Téléphone principal": "0102030405",
    "Commune": "Yopougon", "Date": "14/03/2026",
    "Sexe": "M", "Date de naissance": "12/05/1990",
    "Lieu de naissance": "Bouaké", "Nationalité": "Ivoirienne",
    "Email": "koffi.jean@example.com", "Région": "Abidjan",
    "Années d'expérience": "5–10 ans",
    "Formation professionnelle": "BT",
    "Établissement de formation": "Lycée Professionnel",
    "Diplôme certifié ?": "Oui",
    "N° Diplôme": "DIPL-998877",
    "Anciennes entreprises / chantiers majeurs": "Chantier ADEM",
    "Catégorie A – Certifiés": "Catégorie A - Certifiés",
    "Documents à fournir": ["CNI / Document adimistratif", "Copie diplôme", "Photo en situation de travail"],
    "Équipements disponibles": ["Outils complets", "Smartphone"],
    "Zone(s) d'intervention": "Yopougon, Abobo",
    "Disponible immédiatement": "Oui",
    "Intervention d'urgence possible": "Oui"
}

buf = generate_fiche_officielle(mock_data)
with open("TEST_FICHE_REMPLIE.pdf", "wb") as f:
    f.write(buf.getvalue())
print("Test generation successful!")
