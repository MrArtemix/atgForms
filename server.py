"""
Serveur FastAPI – Génération PDF « Fiche Officielle d'Enregistrement des Artisans »
Reprend intégralement le design de fiche.py (reportlab) et remplit les champs
à partir des données de réponse envoyées par le frontend Next.js.

Lancement : uvicorn server:app --host 0.0.0.0 --port 8002 --reload
"""

import io
import os
import tempfile
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, KeepTogether, HRFlowable, Flowable
)
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# =====================================================================
# FastAPI
# =====================================================================
app = FastAPI(title="BROBROLI PDF Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PdfRequest(BaseModel):
    form_id: Optional[str] = None
    response_id: Optional[str] = None
    form_title: Optional[str] = None
    respondent_name: Optional[str] = None
    respondent_email: Optional[str] = None
    submitted_at: Optional[str] = None
    answers: Optional[dict] = None


# =====================================================================
# CONFIGURATION
# =====================================================================
PAGE_W, PAGE_H = A4
LEFT_M = 20 * mm
RIGHT_M = 20 * mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

BLEU_FONCE = colors.HexColor('#131F36')
ORANGE = colors.HexColor('#F26122')
ORANGE_PALE = colors.HexColor('#FEF3EC')
BLEU_CLAIR = colors.HexColor('#F0F4FA')
GRIS_BORD = colors.HexColor('#D1D5DB')
GRIS_ZEBRA = colors.HexColor('#F8FAFC')
BLANC = colors.HexColor('#FFFFFF')
GRIS_TXT = colors.HexColor('#6B7280')

FONT = 'Times-Roman'
try:
    pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
    CB_FONT = 'DejaVuSans'
except Exception:
    CB_FONT = FONT

# =====================================================================
# STYLES
# =====================================================================
S = getSampleStyleSheet()

S.add(ParagraphStyle('Title1', parent=S['Heading1'],
    fontName=FONT, fontSize=18, alignment=1, spaceAfter=2,
    textColor=BLEU_FONCE))

S.add(ParagraphStyle('Subtitle', parent=S['Normal'],
    fontName=FONT, fontSize=10, alignment=1, spaceAfter=1,
    textColor=GRIS_TXT))

S['Heading2'].fontName = FONT
S['Heading2'].fontSize = 12
S['Heading2'].spaceBefore = 6
S['Heading2'].spaceAfter = 3
S['Heading2'].textColor = BLEU_FONCE

S['Normal'].fontName = FONT
S['Normal'].fontSize = 10
S['Normal'].leading = 13

S.add(ParagraphStyle('Small', parent=S['Normal'],
    fontName=FONT, fontSize=8, textColor=GRIS_TXT))

S.add(ParagraphStyle('CB', parent=S['Normal'],
    fontName=CB_FONT, fontSize=10))

S.add(ParagraphStyle('HeaderW', parent=S['Normal'],
    fontName=FONT, fontSize=10, textColor=BLANC))

S.add(ParagraphStyle('Filled', parent=S['Normal'],
    fontName=FONT, fontSize=10, textColor=colors.HexColor('#111827')))


# =====================================================================
# HELPERS
# =====================================================================
def P(text, bold=False):
    if bold:
        text = f"<b>{text}</b>"
    return Paragraph(str(text), S['Normal'])


def PW(text, bold=True):
    if bold:
        text = f"<b>{text}</b>"
    return Paragraph(str(text), S['HeaderW'])


def P_filled(text):
    """Texte rempli (données réelles) — légèrement différent visuellement."""
    return Paragraph(str(text), S['Filled'])


class CheckBox(Flowable):
    """Case vide."""
    def __init__(self, size=10, border_color=None, border_width=1.2):
        Flowable.__init__(self)
        self.size = size
        self.border_color = border_color or BLEU_FONCE
        self.border_width = border_width
        self.width = size
        self.height = size

    def draw(self):
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(self.border_width)
        self.canv.setFillColor(BLANC)
        self.canv.rect(0, 0, self.size, self.size, fill=1, stroke=1)


class CheckedBox(Flowable):
    """Case cochée (✓)."""
    def __init__(self, size=10, border_color=None, border_width=1.2):
        Flowable.__init__(self)
        self.size = size
        self.border_color = border_color or BLEU_FONCE
        self.border_width = border_width
        self.width = size
        self.height = size

    def draw(self):
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(self.border_width)
        self.canv.setFillColor(BLANC)
        self.canv.rect(0, 0, self.size, self.size, fill=1, stroke=1)
        # Dessiner le ✓
        self.canv.setStrokeColor(ORANGE)
        self.canv.setLineWidth(1.8)
        s = self.size
        self.canv.line(s * 0.2, s * 0.5, s * 0.4, s * 0.2)
        self.canv.line(s * 0.4, s * 0.2, s * 0.8, s * 0.8)


def CB(options, selected=None):
    """Cases à cocher. Si selected est fourni, coche la bonne option."""
    cells = []
    widths = []
    selected_values = _normalize_selected(selected)
    for o in options:
        is_checked = _is_option_selected(o, selected_values)
        box = CheckedBox(size=11) if is_checked else CheckBox(size=11)
        cells.append(box)
        cells.append(Paragraph(f" {o}", S['Normal']))
        widths.append(5 * mm)
        widths.append(None)
    t = Table([cells], colWidths=widths)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


def _normalize_selected(selected):
    """Transforme la valeur sélectionnée en set de strings pour comparaison."""
    if selected is None:
        return set()
    if isinstance(selected, list):
        return {str(v).strip().lower() for v in selected}
    if isinstance(selected, str):
        return {selected.strip().lower()}
    return {str(selected).strip().lower()}


def _is_option_selected(option_label, selected_values):
    """Vérifie si une option est sélectionnée (comparaison souple)."""
    if not selected_values:
        return False
    label_lower = option_label.strip().lower()
    for sv in selected_values:
        if sv == label_lower or sv in label_lower or label_lower in sv:
            return True
    return False


def divider():
    return HRFlowable(width="100%", thickness=0.5, color=GRIS_BORD,
                      spaceBefore=2 * mm, spaceAfter=1 * mm)


def section_title(text):
    para = Paragraph(f"<b>{text}</b>",
                     ParagraphStyle('SecTitle', parent=S['Heading2'],
                                    textColor=BLANC, fontSize=11))
    t = Table([[para]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BLEU_FONCE),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -1), 2, ORANGE),
    ]))
    return t


def styled_table(data, col_widths, has_header=True):
    t = Table(data, colWidths=col_widths)
    style = [
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORD),
        ('FONTNAME', (0, 0), (-1, -1), FONT),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    if has_header:
        style += [
            ('BACKGROUND', (0, 0), (-1, 0), BLEU_FONCE),
            ('TEXTCOLOR', (0, 0), (-1, 0), BLANC),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, ORANGE),
        ]
    for i in range(1 if has_header else 0, len(data)):
        if i % 2 == 0:
            style.append(('BACKGROUND', (0, i), (-1, i), GRIS_ZEBRA))
    t.setStyle(TableStyle(style))
    return t


def field_row(label, content="______________"):
    if isinstance(content, str):
        content = P(content)
    t = Table([
        [P(label, bold=True), content]
    ], colWidths=[55 * mm, 68 * mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, GRIS_BORD),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    return t


def get_val(answers, *keys):
    """Cherche une valeur dans les réponses par différentes clés possibles."""
    if not answers:
        return None
    for key in keys:
        if key in answers:
            v = answers[key]
            if v is not None and v != "":
                return v
    return None


def field_or_blank(answers, label, *alt_keys):
    """Retourne la valeur remplie ou le placeholder ___."""
    val = get_val(answers, label, *alt_keys)
    if val is not None:
        return P_filled(str(val))
    return P("______________")


# =====================================================================
# BACKGROUND
# =====================================================================
def draw_background(canvas, doc):
    canvas.saveState()
    w, h = A4
    has_alpha = hasattr(canvas, 'setFillAlpha')

    # Top-right accent
    canvas.setFillColor(BLEU_FONCE)
    p = canvas.beginPath()
    p.moveTo(w - 45 * mm, h)
    p.lineTo(w, h)
    p.lineTo(w, h - 45 * mm)
    p.curveTo(w - 12 * mm, h - 35 * mm, w - 30 * mm, h - 12 * mm, w - 45 * mm, h)
    p.close()
    canvas.drawPath(p, fill=1, stroke=0)

    canvas.setFillColor(ORANGE)
    p2 = canvas.beginPath()
    p2.moveTo(w - 50 * mm, h)
    p2.lineTo(w - 56 * mm, h)
    p2.curveTo(w - 38 * mm, h - 12 * mm, w - 18 * mm, h - 38 * mm, w, h - 56 * mm)
    p2.lineTo(w, h - 50 * mm)
    p2.curveTo(w - 16 * mm, h - 34 * mm, w - 34 * mm, h - 14 * mm, w - 50 * mm, h)
    p2.close()
    canvas.drawPath(p2, fill=1, stroke=0)

    # Left bar — ruban tressé orange / bleu
    band_w = 5 * mm
    seg = 20 * mm
    n = int(h / seg) + 1

    canvas.setFillColor(ORANGE)
    canvas.rect(0, 0, band_w, h, fill=1, stroke=0)

    for i in range(n):
        y0 = i * seg
        canvas.setFillColor(BLEU_FONCE)
        p = canvas.beginPath()
        if i % 2 == 0:
            p.moveTo(0, y0)
            p.curveTo(band_w * 1.6, y0 + seg * 0.25,
                      band_w * 1.6, y0 + seg * 0.75,
                      0, min(y0 + seg, h))
            p.lineTo(0, y0)
        else:
            p.moveTo(band_w, y0)
            p.curveTo(-band_w * 0.6, y0 + seg * 0.25,
                      -band_w * 0.6, y0 + seg * 0.75,
                      band_w, min(y0 + seg, h))
            p.lineTo(band_w, y0)
        p.close()
        canvas.drawPath(p, fill=1, stroke=0)

    # Footer
    canvas.setStrokeColor(GRIS_BORD)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_M, 12 * mm, w - RIGHT_M, 12 * mm)
    canvas.setFillColor(ORANGE)
    canvas.rect(LEFT_M, 10 * mm, 12 * mm, 1.5 * mm, fill=1, stroke=0)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(GRIS_TXT)
    canvas.drawCentredString(w / 2, 7 * mm,
                             f"Plateforme BROBROLI by ADEM  \u2022  Page {doc.page}  \u2022  Document confidentiel")

    # Watermark
    logo_path = "logo/Logo brobroli version digital.png"
    if os.path.exists(logo_path) and has_alpha:
        try:
            import reportlab.lib.utils as rl_utils
            img = rl_utils.ImageReader(logo_path)
            ww = 150 * mm
            iw, ih = img.getSize()
            wh = ww * ih / iw
            canvas.setFillAlpha(0.06)
            canvas.drawImage(logo_path, (w - ww) / 2, (h - wh) / 2,
                             width=ww, height=wh, mask='auto')
            canvas.setFillAlpha(1)
        except Exception:
            pass

    canvas.restoreState()


# =====================================================================
# GÉNÉRATION
# =====================================================================
def generate_artisan_fiche(
    output,
    answers=None,
    ref_number=None,
    date_str=None,
    photo_url=None,
    logo_path_institutionnel="logo/Logo brobroli version institutionnelle.png",
    logo_path_digital="logo/Logo brobroli version digital.png",
):
    """
    Génère la fiche artisan dans `output` (chemin fichier ou buffer).
    Si `answers` est fourni (dict label→valeur), remplit les champs.
    Sinon, génère un formulaire vierge.
    """
    if answers is None:
        answers = {}

    doc = SimpleDocTemplate(
        output, pagesize=A4,
        topMargin=15 * mm, bottomMargin=18 * mm,
        leftMargin=LEFT_M, rightMargin=RIGHT_M
    )
    story = []

    # ── EN-TÊTE : Logo + QR Code ──────────────────────────────
    try:
        logo = Image(logo_path_institutionnel, height=25 * mm, width=60 * mm, kind='proportional')
    except Exception:
        logo = Paragraph("<font color='#131F36'><b>BROBROLI</b></font><br/>"
                         "<font color='#F26122'>by ADEM</font>", S['Normal'])

    nom = get_val(answers, "Nom", "nom") or "[Nom]"
    prenoms = get_val(answers, "Prénoms", "Prenoms", "prenoms") or ""
    qr_text = f"BROBROLI Validation\nArtisan: {nom} {prenoms}\nStatut: Enregistrement Officiel"
    if ref_number:
        qr_text += f"\nRéf: {ref_number}"

    qr = QrCodeWidget(qr_text)
    qr.barHeight = 28 * mm
    qr.barWidth = 28 * mm
    qr_draw = Drawing(28 * mm, 28 * mm)
    qr_draw.add(qr)

    header = Table([[logo, qr_draw]], colWidths=[CONTENT_W - 30 * mm, 30 * mm])
    header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, ORANGE),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header)
    story.append(Spacer(1, 3 * mm))

    # ── TITRE ─────────────────────────────────────────────────
    story.append(Paragraph("FICHE OFFICIELLE D\u2019ENREGISTREMENT DES ARTISANS", S['Title1']))
    story.append(Spacer(1, 1 * mm))
    story.append(Paragraph("Plateforme BROBROLI By ADEM", S['Subtitle']))
    story.append(Spacer(1, 2 * mm))

    # N° Dossier
    ref_val = ref_number or "_______________"
    date_val = date_str or "_______________"
    ref_table = Table([
        [P("N\u00b0 Dossier :", True), P_filled(ref_val) if ref_number else P("_______________"),
         P("Date :", True), P_filled(date_val) if date_str else P("_______________")]
    ], colWidths=[28 * mm, 50 * mm, 20 * mm, 50 * mm])
    ref_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, GRIS_BORD),
        ('LINEBELOW', (3, 0), (3, 0), 0.5, GRIS_BORD),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE_PALE),
        ('BOX', (0, 0), (-1, -1), 0.5, ORANGE),
    ]))
    story.append(ref_table)
    story.append(Spacer(1, 4 * mm))

    # ── 1. IDENTIFICATION GÉNÉRALE ────────────────────────────
    story.append(section_title("IDENTIFICATION G\u00c9N\u00c9RALE"))
    story.append(Spacer(1, 2 * mm))

    sexe_val = get_val(answers, "Sexe", "sexe")
    fields = [
        field_row("Nom", field_or_blank(answers, "Nom", "nom")),
        field_row("Pr\u00e9noms", field_or_blank(answers, "Prénoms", "Prenoms", "prenoms")),
        field_row("Sexe", CB(["M", "F"], selected=sexe_val)),
        field_row("Date de naissance", field_or_blank(answers, "Date de naissance")),
        field_row("Lieu de naissance", field_or_blank(answers, "Lieu de naissance")),
        field_row("Nationalit\u00e9", field_or_blank(answers, "Nationalité", "Nationalite")),
        field_row("N\u00b0 CNI / Attestation", field_or_blank(answers, "N° CNI / Attestation d'identité", "N° CNI / Attestation")),
        field_row("T\u00e9l. principal", field_or_blank(answers, "Téléphone principal", "Tel. principal")),
        field_row("Email", field_or_blank(answers, "Email", "email")),
        field_row("Commune", field_or_blank(answers, "Commune", "commune")),
        field_row("R\u00e9gion", field_or_blank(answers, "Région", "Region", "region")),
    ]

    left = Table([[f] for f in fields], colWidths=[130 * mm])
    left.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    # Photo
    photo_path = None
    if photo_url:
        # Télécharger l'image si c'est une URL
        try:
            import urllib.request
            tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
            urllib.request.urlretrieve(photo_url, tmp.name)
            photo_path = tmp.name
        except Exception:
            photo_path = None

    if photo_path and os.path.exists(photo_path):
        photo = Image(photo_path, width=35 * mm, height=35 * mm, kind='proportional')
    else:
        photo = Paragraph("<para alignment='center'>Photo 4x4<br/><b>\u00c0 coller</b></para>", S['Normal'])

    photo_box = Table([[photo]], colWidths=[37 * mm], rowHeights=[37 * mm])
    photo_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, BLEU_FONCE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 1),
        ('RIGHTPADDING', (0, 0), (-1, -1), 1),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    id_layout = Table([[left, photo_box]], colWidths=[130 * mm, CONTENT_W - 130 * mm])
    id_layout.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(id_layout)
    story.append(divider())

    # ── 2. PROFIL PROFESSIONNEL ───────────────────────────────
    story.append(section_title("PROFIL PROFESSIONNEL"))
    story.append(Spacer(1, 2 * mm))

    metier_val = get_val(answers, "Métier principal", "Metier principal")
    exp_val = get_val(answers, "Années d'expérience", "Annees d'experience")
    formation_val = get_val(answers, "Formation professionnelle")
    diplome_certifie_val = get_val(answers, "Diplôme certifié ?", "Diplome certifie ?")

    profil_data = [
        [PW("\u00c9l\u00e9ment"), PW("D\u00e9tail")],
        [P("M\u00e9tier principal"), CB(["Plombier", "\u00c9lectricien", "Peintre", "Clim/Froid", "Autre"], selected=metier_val)],
        [P("M\u00e9tier(s) secondaire(s)"), field_or_blank(answers, "Métier(s) secondaire(s)")],
        [P("Ann\u00e9es d\u2019exp\u00e9rience"), CB(["<5 ans", "5\u201310 ans", "10+ ans"], selected=exp_val)],
        [P("Formation professionnelle"), CB(["CAP", "BEP", "BT", "BTS", "Licence", "Aucun"], selected=formation_val)],
        [P("\u00c9tablissement de formation"), field_or_blank(answers, "Établissement de formation")],
        [P("Dipl\u00f4me certifi\u00e9 ?"), CB(["Oui", "Non"], selected=diplome_certifie_val)],
        [P("N\u00b0 Dipl\u00f4me"), field_or_blank(answers, "N° Diplôme (si applicable)", "N° Diplôme")],
        [P("Entreprises / chantiers majeurs"), field_or_blank(answers, "Anciennes entreprises / chantiers majeurs")],
    ]
    story.append(styled_table(profil_data, [55 * mm, CONTENT_W - 55 * mm]))
    story.append(divider())

    # ── 3. CATÉGORISATION BROBROLI ────────────────────────────
    cat_a_val = get_val(answers, "Catégorie A – Certifiés", "Categorie A")
    cat_b_val = get_val(answers, "Catégorie B – Non certifiés", "Categorie B")

    cat_title_el = section_title("CAT\u00c9GORISATION BROBROLI")
    cat_data = [
        [P("Cat\u00e9gorie A \u2013 Certifi\u00e9s", True)],
        [CB(["A1 (<5 ans)", "A1+ (5\u201310 ans)", "A1++ (10+ ans)"], selected=cat_a_val)],
        [P("Cat\u00e9gorie B \u2013 Non certifi\u00e9s", True)],
        [CB(["B1 (<5 ans)", "B1+ (5\u201310 ans)", "B1++ (10+ ans)"], selected=cat_b_val)],
    ]
    cat = Table(cat_data, colWidths=[CONTENT_W])
    cat.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), FONT),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 0.5, GRIS_BORD),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, GRIS_BORD),
        ('LINEBELOW', (0, 1), (-1, 1), 0.5, GRIS_BORD),
        ('LINEBELOW', (0, 2), (-1, 2), 0.5, GRIS_BORD),
        ('BACKGROUND', (0, 0), (-1, 0), BLEU_CLAIR),
        ('BACKGROUND', (0, 2), (-1, 2), BLEU_CLAIR),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(KeepTogether([cat_title_el, Spacer(1, 1 * mm), cat]))

    # ── 4. DOCUMENTS À FOURNIR ────────────────────────────────
    story.append(section_title("DOCUMENTS \u00c0 FOURNIR"))
    story.append(Spacer(1, 2 * mm))

    docs_list = [
        "Piece administratif", "Copie dipl\u00f4me (si certifi\u00e9)", "Attestation d\u2019exp\u00e9rience",
        "Extrait casier judiciaire",
        "RIB / Mobile Money", "Photo en situation de travail", "Carte CMU"
    ]
    docs_val = get_val(answers, "Documents à fournir", "Documents a fournir")

    doc_cells = []
    for d in docs_list:
        is_checked = _is_option_selected(d, _normalize_selected(docs_val))
        box = CheckedBox(size=11) if is_checked else CheckBox(size=11)
        cb_t = Table([[box, Paragraph(f" {d}", S['Normal'])]],
                     colWidths=[5 * mm, CONTENT_W / 3 - 5 * mm])
        cb_t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        doc_cells.append(cb_t)
    while len(doc_cells) % 3 != 0:
        doc_cells.append(P(""))
    rows = [doc_cells[i:i + 3] for i in range(0, len(doc_cells), 3)]
    doc_t = Table(rows, colWidths=[CONTENT_W / 3] * 3)
    doc_t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(doc_t)
    story.append(divider())

    # ── 5. ÉQUIPEMENTS & CAPACITÉS ────────────────────────────
    story.append(section_title("\u00c9QUIPEMENTS & CAPACIT\u00c9S"))
    story.append(Spacer(1, 2 * mm))

    equip_val = get_val(answers, "Équipements disponibles", "Equipements disponibles")
    equip_selected = _normalize_selected(equip_val)

    equip_items = [
        "Outils complets adapt\u00e9s au m\u00e9tier",
        "V\u00e9hicule (Moto / Tricycle / V\u00e9hicule)",
        "Smartphone Android",
        "Connexion internet r\u00e9guli\u00e8re",
        "\u00c9quipe disponible",
    ]

    def equip_cb(item_label):
        is_sel = _is_option_selected(item_label, equip_selected)
        yes_box = CheckedBox(size=11) if is_sel else CheckBox(size=11)
        no_box = CheckBox(size=11) if is_sel else CheckedBox(size=11) if equip_val is not None else CheckBox(size=11)
        # Si pas de données, les deux vides
        if equip_val is None:
            yes_box = CheckBox(size=11)
            no_box = CheckBox(size=11)
        return (
            Table([[yes_box]], colWidths=[5 * mm]),
            Table([[no_box]], colWidths=[5 * mm])
        )

    equip_data = [[PW("\u00c9quipement"), PW("Oui"), PW("Non")]]
    for item in equip_items:
        yes_cb, no_cb = equip_cb(item)
        equip_data.append([P(item), yes_cb, no_cb])

    story.append(styled_table(equip_data, [CONTENT_W - 40 * mm, 20 * mm, 20 * mm]))
    story.append(divider())

    # ── 6. ZONE & DISPONIBILITÉ ───────────────────────────────
    story.append(section_title("ZONE & DISPONIBILIT\u00c9"))
    story.append(Spacer(1, 2 * mm))

    dispo_val = get_val(answers, "Disponible immédiatement", "Disponible immediatement")
    urgence_val = get_val(answers, "Intervention d'urgence possible", "Intervention d'urgence possible")

    zone_data = [
        [PW("\u00c9l\u00e9ment"), PW("D\u00e9tail")],
        [P("Zone(s) d\u2019intervention"), field_or_blank(answers, "Zone(s) d'intervention")],
        [P("Disponible imm\u00e9diatement"), CB(["Oui", "Non"], selected=dispo_val)],
        [P("Horaires habituels"), field_or_blank(answers, "Horaires habituels")],
        [P("Intervention d\u2019urgence possible"), CB(["Oui", "Non"], selected=urgence_val)],
    ]
    story.append(styled_table(zone_data, [60 * mm, CONTENT_W - 60 * mm]))
    story.append(divider())

    # ── 7. ENGAGEMENT OFFICIEL ────────────────────────────────
    story.append(section_title("ENGAGEMENT OFFICIEL"))
    story.append(Spacer(1, 2 * mm))

    soussigne = get_val(answers, "Je soussigné(e)", "Je soussigne(e)") or "_________________________"

    eng_text = (
        f"Je soussign\u00e9(e) <u>{soussigne}</u> d\u00e9clare exactes les informations fournies et m\u2019engage \u00e0 :"
        "<br/><br/>"
        "\u2022 Respecter la charte qualit\u00e9 BROBROLI<br/>"
        "\u2022 Respecter les normes de s\u00e9curit\u00e9 BTP<br/>"
        "\u2022 Honorer toute mission valid\u00e9e<br/>"
        "\u2022 Maintenir une conduite professionnelle irr\u00e9prochable<br/>"
        "\u2022 Respecter les obligations fiscales et sociales applicables"
    )
    eng = Table([[P(eng_text)]], colWidths=[CONTENT_W])
    eng.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, BLEU_FONCE),
        ('BACKGROUND', (0, 0), (-1, -1), GRIS_ZEBRA),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBEFORE', (0, 0), (0, -1), 3, ORANGE),
    ]))
    story.append(eng)
    story.append(Spacer(1, 10 * mm))

    # Signature
    date_sign = get_val(answers, "Date de signature") or "_________________________"
    half = CONTENT_W / 2
    sign = Table([
        [P("Signature :", True), P("Date :", True)],
        [P("_________________________"), P_filled(date_sign) if get_val(answers, "Date de signature") else P("_________________________")]
    ], colWidths=[half, half])
    sign.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), FONT),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LINEABOVE', (0, 1), (0, 1), 0.5, BLEU_FONCE),
        ('LINEABOVE', (1, 1), (1, 1), 0.5, BLEU_FONCE),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(sign)

    # BUILD
    doc.build(story, onFirstPage=draw_background, onLaterPages=draw_background)

    # Nettoyage photo temporaire
    if photo_path and photo_path.startswith(tempfile.gettempdir()):
        try:
            os.unlink(photo_path)
        except Exception:
            pass


# =====================================================================
# ENDPOINT
# =====================================================================
@app.post("/generate-pdf")
async def generate_pdf(req: PdfRequest):
    answers = req.answers or {}

    # Chercher la photo de profil dans les réponses
    photo_url = None
    for key in ["Photo de profile", "Photo de profil", "photo"]:
        val = answers.get(key)
        if val:
            if isinstance(val, list) and len(val) > 0:
                photo_url = val[0] if isinstance(val[0], str) else val[0].get("url", None)
            elif isinstance(val, str) and val.startswith("http"):
                photo_url = val
            break

    # Référence et date
    ref_number = req.response_id[:8].upper() if req.response_id else None
    date_str = None
    if req.submitted_at:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(req.submitted_at.replace("Z", "+00:00"))
            date_str = dt.strftime("%d/%m/%Y")
        except Exception:
            date_str = req.submitted_at[:10]

    # Générer dans un buffer
    buffer = io.BytesIO()
    generate_artisan_fiche(
        output=buffer,
        answers=answers,
        ref_number=ref_number,
        date_str=date_str,
        photo_url=photo_url,
    )
    buffer.seek(0)

    nom = answers.get("Nom", "ARTISAN")
    prenoms = answers.get("Prénoms", "")
    filename = f"FICHE_{nom}_{prenoms}".upper().replace(" ", "_") + ".pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "BROBROLI PDF Generator"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
