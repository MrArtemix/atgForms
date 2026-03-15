import os
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether, HRFlowable, Flowable
)
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# =====================================================================
# CONFIGURATION
# =====================================================================
PAGE_W, PAGE_H = A4
LEFT_M = 20*mm
RIGHT_M = 20*mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M   # ~170mm

BLEU_FONCE  = colors.HexColor('#131F36')
ORANGE      = colors.HexColor('#F26122')
ORANGE_PALE = colors.HexColor('#FEF3EC')
BLEU_CLAIR  = colors.HexColor('#F0F4FA')
GRIS_BORD   = colors.HexColor('#D1D5DB')
GRIS_ZEBRA  = colors.HexColor('#F8FAFC')
BLANC       = colors.HexColor('#FFFFFF')
GRIS_TXT    = colors.HexColor('#6B7280')

FONT = 'Times-Roman'
try:
    pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
    CB_FONT = 'DejaVuSans'
except:
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

# =====================================================================
# HELPERS
# =====================================================================
def P(text, bold=False):
    if bold:
        text = f"<b>{text}</b>"
    return Paragraph(text, S['Normal'])

def PW(text, bold=True):
    """Paragraph en blanc pour les en-têtes de tableau."""
    if bold:
        text = f"<b>{text}</b>"
    return Paragraph(text, S['HeaderW'])

class CheckBox(Flowable):
    """Dessine un mini carré vide à cocher."""
    def __init__(self, size=10, border_color=BLEU_FONCE, border_width=1.2):
        Flowable.__init__(self)
        self.size = size
        self.border_color = border_color
        self.border_width = border_width
        self.width = size
        self.height = size

    def draw(self):
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(self.border_width)
        self.canv.setFillColor(BLANC)
        self.canv.rect(0, 0, self.size, self.size, fill=1, stroke=1)

class CheckedBox(Flowable):
    """Dessine un mini carré coché."""
    def __init__(self, size=10, border_color=BLEU_FONCE, check_color=ORANGE, border_width=1.2):
        Flowable.__init__(self)
        self.size = size
        self.border_color = border_color
        self.check_color = check_color
        self.border_width = border_width
        self.width = size
        self.height = size

    def draw(self):
        s = self.size
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(self.border_width)
        self.canv.setFillColor(BLANC)
        self.canv.rect(0, 0, s, s, fill=1, stroke=1)
        # Draw ✓
        self.canv.setStrokeColor(self.check_color)
        self.canv.setLineWidth(1.8)
        self.canv.setLineCap(1)
        m = s * 0.2
        self.canv.line(m, s * 0.5, s * 0.4, m)
        self.canv.line(s * 0.4, m, s - m, s - m)

def CB(options, checked=None):
    """Crée une rangée de cases à cocher avec labels."""
    if checked is None:
        checked = []
    cells = []
    widths = []
    for o in options:
        is_checked = False
        o_clean = str(o).strip().lower()
        o_first_word = o_clean.split()[0] if o_clean else ""
        for c in checked:
            if isinstance(c, str) and c.strip() != "":
                c_clean = c.strip().lower()
                if c_clean == o_clean or c_clean == o_first_word or o_clean.startswith(c_clean + " ") or o_clean.startswith(c_clean + " "):
                    is_checked = True
                    break
        
        if (isinstance(o, str) and o.strip() != "" and o in checked) or is_checked:
            cells.append(CheckedBox(size=11))
        else:
            cells.append(CheckBox(size=11))
        cells.append(Paragraph(f" {o}", S['Normal']))
        widths.append(5*mm)
        # Calculate exactly how much space the text needs to prevent wrapping AND table overflow
        text_width = pdfmetrics.stringWidth(f" {o}", FONT, 10)
        widths.append(text_width + 3*mm)
    t = Table([cells], colWidths=widths)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t

def divider():
    return HRFlowable(width="100%", thickness=0.5, color=GRIS_BORD,
                      spaceBefore=2*mm, spaceAfter=1*mm)

def section_title(text):
    """Section title: dark blue background, white text, orange left accent."""
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
    """Create a consistently styled table."""
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
    # Zebra
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
    ], colWidths=[55*mm, 68*mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, GRIS_BORD),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    return t

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
    p.moveTo(w - 45*mm, h)
    p.lineTo(w, h)
    p.lineTo(w, h - 45*mm)
    p.curveTo(w - 12*mm, h - 35*mm, w - 30*mm, h - 12*mm, w - 45*mm, h)
    p.close()
    canvas.drawPath(p, fill=1, stroke=0)

    canvas.setFillColor(ORANGE)
    p2 = canvas.beginPath()
    p2.moveTo(w - 50*mm, h)
    p2.lineTo(w - 56*mm, h)
    p2.curveTo(w - 38*mm, h - 12*mm, w - 18*mm, h - 38*mm, w, h - 56*mm)
    p2.lineTo(w, h - 50*mm)
    p2.curveTo(w - 16*mm, h - 34*mm, w - 34*mm, h - 14*mm, w - 50*mm, h)
    p2.close()
    canvas.drawPath(p2, fill=1, stroke=0)

    # Left bar — ruban tressé orange / bleu
    band_w = 5 * mm
    seg = 20 * mm
    n = int(h / seg) + 1

    # Fond orange
    canvas.setFillColor(ORANGE)
    canvas.rect(0, 0, band_w, h, fill=1, stroke=0)

    # Vagues bleu nuit par-dessus
    for i in range(n):
        y0 = i * seg
        y1 = min(y0 + seg, h)
        canvas.setFillColor(BLEU_FONCE)
        p = canvas.beginPath()
        if i % 2 == 0:
            p.moveTo(0, y0)
            p.curveTo(band_w * 1.6, y0 + seg * 0.25,
                      band_w * 1.6, y0 + seg * 0.75,
                      0, y1)
            p.lineTo(0, y0)
        else:
            p.moveTo(band_w, y0)
            p.curveTo(-band_w * 0.6, y0 + seg * 0.25,
                      -band_w * 0.6, y0 + seg * 0.75,
                      band_w, y1)
            p.lineTo(band_w, y0)
        p.close()
        canvas.drawPath(p, fill=1, stroke=0)

    # Footer
    canvas.setStrokeColor(GRIS_BORD)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_M, 12*mm, w - RIGHT_M, 12*mm)
    canvas.setFillColor(ORANGE)
    canvas.rect(LEFT_M, 10*mm, 12*mm, 1.5*mm, fill=1, stroke=0)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(GRIS_TXT)
    canvas.drawCentredString(w / 2, 7*mm, f"Plateforme BROBROLI by ADEM  •  Page {doc.page}  •  Document confidentiel")


    # Watermark
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    logo_path = os.path.join(base_dir, "logo/Logo brobroli version digital.png")
    if os.path.exists(logo_path) and has_alpha:
        import reportlab.lib.utils as rl_utils
        try:
            img = rl_utils.ImageReader(logo_path)
            ww = 150 * mm
            iw, ih = img.getSize()
            wh = ww * ih / iw
            canvas.setFillAlpha(0.06)
            canvas.drawImage(logo_path, (w - ww) / 2, (h - wh) / 2,
                             width=ww, height=wh, mask='auto')
            canvas.setFillAlpha(1)
        except:
            pass

    canvas.restoreState()

# =====================================================================
# GÉNÉRATION EXPOSÉE POUR LE BACKEND FLASK
def generate_fiche_officielle(response_data: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=15*mm, bottomMargin=18*mm,
        leftMargin=LEFT_M, rightMargin=RIGHT_M
    )
    story = []
    
    # Helper getters (from previous version)
    def get_val(keys, default=""):
        if isinstance(keys, str):
            keys = [keys]
        for k in keys:
            if k in response_data and response_data[k]:
                val = response_data[k]
                if isinstance(val, list):
                    return ", ".join(map(str, val))
                return str(val)
        return default
        
    def get_list(keys):
        if isinstance(keys, str):
            keys = [keys]
        for k in keys:
            if k in response_data and response_data[k]:
                val = response_data[k]
                if isinstance(val, list):
                    return [str(v) for v in val]
                if isinstance(val, str):
                    return [s.strip() for s in val.split(',')]
                return [str(val)]
        return []

    base_dir = os.path.dirname(__file__)
    logo_path_institutionnel = os.path.join(base_dir, "static", "Logo brobroli version institutionnelle.png")
    
    # Extract data
    nom = get_val(["Nom", "nom"])
    prenoms = get_val(["Prénoms", "Prénom", "prénoms", "prénom"])
    full_name = f"{nom} {prenoms}".strip().replace("_", "") or "[Nom de l'artisan]"
    # id string will now come through correctly!
    ref_dossier = "BRB-" + str(get_val([str(k) for k in response_data.keys() if "id" == k.lower()], "XXXXX")).split("-")[0].upper()[:6] if get_val(["id","ID"], "") != "" else "_______________"
    metier = get_val(["Métier principal", "metier principal"], "")
    cni = get_val(["N° CNI / Attestation d’identité", "N° CNI / Attestation d'identité", "N° CNI"])
    tel = get_val(["Téléphone principal", "Tél. principal", "Téléphone"])
    commune = get_val("Commune")
    
    # Format date to French format (DD/MM/YYYY)
    raw_date = get_val(["Date", "Date de signature"])
    if raw_date and "T" in raw_date:
        parts = raw_date.split("T")[0].split("-")
        if len(parts) == 3:
            date_sign = f"{parts[2]}/{parts[1]}/{parts[0]}"
        else:
            date_sign = raw_date.split("T")[0]
    else:
        date_sign = raw_date if raw_date else "______________"

    # ── EN-TÊTE : Logo + QR Code ──────────────────────────────
    try:
        logo = Image(logo_path_institutionnel, height=25*mm, width=60*mm, kind='proportional')
    except:
        logo = Paragraph("<font color='#131F36'><b>BROBROLI</b></font><br/>"
                         "<font color='#F26122'>by ADEM</font>", S['Normal'])

    qr_text = (
        f"BROBROLI Validation\n"
        f"Artisan: {full_name}\n"
        f"Statut: Enregistrement Officiel"
    )
    qr = QrCodeWidget(qr_text)
    qr.barHeight = 28 * mm
    qr.barWidth = 28 * mm
    qr_draw = Drawing(28 * mm, 28 * mm)
    qr_draw.add(qr)

    header = Table([[logo, qr_draw]], colWidths=[CONTENT_W - 30*mm, 30*mm])
    header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, ORANGE),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header)
    story.append(Spacer(1, 3*mm))

    # ── TITRE ─────────────────────────────────────────────────
    story.append(Paragraph("FICHE OFFICIELLE D'ENREGISTREMENT DES ARTISANS", S['Title1']))
    story.append(Spacer(1, 1*mm))
    story.append(Paragraph("Plateforme BROBROLI By ADEM", S['Subtitle']))
    story.append(Spacer(1, 2*mm))

    # N° Dossier
    ref = Table([
        [P("N° Dossier :", True), P(ref_dossier),
         P("Date :", True), P(date_sign)]
    ], colWidths=[28*mm, 50*mm, 20*mm, 50*mm])
    ref.setStyle(TableStyle([
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
    story.append(ref)
    story.append(Spacer(1, 4*mm))

    # ── 1. IDENTIFICATION GÉNÉRALE ────────────────────────────
    story.append(section_title("IDENTIFICATION GÉNÉRALE"))
    story.append(Spacer(1, 2*mm))

    fields = [
        field_row("Nom", nom or "______________"), field_row("Prénoms", prenoms or "______________"),
        field_row("Sexe", CB(["M", "F"], checked=get_list(["Sexe", "sexe"]))),
        field_row("Date de naissance", get_val(["Date de naissance", "date de naissance"]) or "______________"), 
        field_row("Lieu de naissance", get_val(["Lieu de naissance", "lieu de naissance"]) or "______________"),
        field_row("Nationalité", get_val(["Nationalité", "nationalité"], "Ivoirienne")),
        field_row("N° CNI / Attestation", cni or "______________"),
        field_row("Tél. principal", tel or "______________"),
        field_row("Email", get_val(["Email", "email", "E-mail", "e-mail"]) or "______________"),
        field_row("Commune", commune or "______________"), field_row("Région", get_val(["Région", "région"], "Abidjan")),
    ]

    left = Table([[f] for f in fields], colWidths=[130*mm])
    left.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    # Photo integration 
    photo_img = None
    for k, v in response_data.items():
        if isinstance(v, str) and ("photo" in k.lower() or "profil" in k.lower() or "image" in k.lower()):
            import base64
            # A base64 image could be in a comma-separated list or just standalone.
            # Find the first occurrence of data:image/
            if "data:image/" in v:
                try:
                    # Extract the part starting with data:image/ up to the next space or end of string
                    start_idx = v.find("data:image/")
                    # The actual base64 data is after the first comma following data:image/
                    comma_idx = v.find(",", start_idx)
                    if comma_idx != -1:
                        # Find the end of this base64 string (either a space, another data:, or end of string)
                        end_idx = v.find(" data:image/", comma_idx)
                        if end_idx == -1:
                            end_idx = len(v)
                        
                        b64_str = v[comma_idx+1:end_idx].strip()
                        # If it mistakenly caught a trailing comma from a list join, strip it
                        if b64_str.endswith(","):
                            b64_str = b64_str[:-1]
                            
                        img_data = base64.b64decode(b64_str)
                        img_io = io.BytesIO(img_data)
                        photo_img = Image(img_io, width=35*mm, height=35*mm, kind='direct')
                        break
                except Exception as e:
                    print("Erreur photo base64:", e)
            elif "http" in v:
                urls = [u.strip() for u in v.split(',')]
                url = [u for u in urls if u.startswith("http")][0] if any(u.startswith("http") for u in urls) else ""
                if url:
                    try:
                        import urllib.request
                        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req) as response:
                            img_data = response.read()
                        img_io = io.BytesIO(img_data)
                        photo_img = Image(img_io, width=35*mm, height=35*mm, kind='direct')
                        break
                    except Exception as e:
                        print("Erreur photo url:", e)
                
    if not photo_img:
        photo_img = Paragraph("<para alignment='center'>Photo 4x4<br/><b>À coller</b></para>", S['Normal'])

    photo_box = Table([[photo_img]], colWidths=[37*mm], rowHeights=[37*mm])
    photo_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, BLEU_FONCE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 1),
        ('RIGHTPADDING', (0, 0), (-1, -1), 1),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    id_layout = Table([[left, photo_box]], colWidths=[130*mm, CONTENT_W - 130*mm])
    id_layout.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(id_layout)
    story.append(divider())

    # ── 2. PROFIL PROFESSIONNEL ───────────────────────────────
    story.append(section_title("PROFIL PROFESSIONNEL"))
    story.append(Spacer(1, 2*mm))

    profil_data = [
        [PW("Élément"), PW("Détail")],
        [P("Métier principal"), CB(["Plombier", "Électricien", "Peintre", "Clim/Froid", "Autre"], checked=[metier])],
        [P("Métier(s) secondaire(s)"), P(get_val(["Métier(s) secondaire(s)", "Métier secondaire"]) or "______________")],
        [P("Années d'expérience"), CB(["<5 ans", "5–10 ans", "10+ ans"], checked=get_list(["Années d'expérience", "Années d’expérience", "Années d" + chr(39) + "expérience", "Années d’expérience (dans le métier)"]))],
        [P("Formation professionnelle"), CB(["CAP", "BEP", "BT", "BTS", "Licence", "Aucun"], checked=get_list(["Formation professionnelle", "Formation", "Niveau de formation"]))],
        [P("Établissement de formation"), P(get_val(["Établissement de formation", "Établissement"]) or "______________")],
        [P("Diplôme certifié ?"), CB(["Oui", "Non"], checked=get_list(["Diplôme certifié ?", "Diplôme certifié"]))],
        [P("N° Diplôme"), P(get_val(["N° Diplôme (si applicable)", "N° Diplôme"]) or "______________")],
        [P("Entreprises / chantiers majeurs"), P(get_val(["Entreprises / chantiers majeurs", "Anciennes entreprises / chantiers majeurs"]) or "______________")],
    ]
    story.append(styled_table(profil_data, [55*mm, CONTENT_W - 55*mm]))
    story.append(divider())

    # ── 3. CATÉGORISATION BROBROLI ────────────────────────────
    cat_title = section_title("CATÉGORISATION BROBROLI")

    cat_a = get_val("Catégorie A – Certifiés", "")
    cat_b = get_val("Catégorie B – Non certifiés", "")
    
    cat_data = [
        [P("Catégorie A – Certifiés", True)],
        [CB(["A1 (<5 ans)", "A1+ (5–10 ans)", "A1++ (10+ ans)"], checked=[cat_a])],
        [P("Catégorie B – Non certifiés", True)],
        [CB(["B1 (<5 ans)", "B1+ (5–10 ans)", "B1++ (10+ ans)"], checked=[cat_b])],
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
    story.append(KeepTogether([cat_title, Spacer(1, 1*mm), cat]))


    # ── 4. DOCUMENTS À FOURNIR ────────────────────────────────
    story.append(section_title("DOCUMENTS À FOURNIR"))
    story.append(Spacer(1, 2*mm))

    docs = ["CNI / Document adimistratif", "Copie diplôme (si certifié)", "Attestation d'expérience",
            "Extrait casier judiciaire", "Attestation responsabilité civile",
            "RIB / Mobile Money", "Photo en situation de travail", "Carte CMU"]

    provided_docs = get_list("Documents à fournir")

    doc_cells = []
    for d in docs:
        is_checked = any(c.strip() != "" and (c.lower() in d.lower() or d.lower() in c.lower()) for c in provided_docs)
        box = CheckedBox(size=11) if is_checked else CheckBox(size=11)
        cb_t = Table([[box, Paragraph(f" {d}", S['Normal'])]],
                     colWidths=[5*mm, CONTENT_W/3 - 5*mm])
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
    rows = [doc_cells[i:i+3] for i in range(0, len(doc_cells), 3)]
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
    story.append(section_title("ÉQUIPEMENTS & CAPACITÉS"))
    story.append(Spacer(1, 2*mm))

    equipments_checked = get_list("Équipements disponibles")

    def cb_cell_equip(label):
        is_checked = any(e.strip() != "" and (label.lower() in e.lower() or e.lower() in label.lower()) for e in equipments_checked)
        if is_checked:
            return Table([[CheckedBox(size=11)]], colWidths=[5*mm])
        return Table([[CheckBox(size=11)]], colWidths=[5*mm])

    equip_data = [
        [PW("Équipement"), PW("Oui"), PW("Non")],
        [P("Outils complets adaptés au métier"), cb_cell_equip("Outils complets"), cb_cell_equip("Aucun")],
        [P("Véhicule (Moto / Tricycle / Véhicule)"), cb_cell_equip("Véhicule"), cb_cell_equip("Aucun")],
        [P("Smartphone Android"), cb_cell_equip("Smartphone"), cb_cell_equip("Aucun")],
        [P("Connexion internet régulière"), cb_cell_equip("Internet"), cb_cell_equip("Aucun")],
        [P("Équipe disponible"), cb_cell_equip("Équipe"), cb_cell_equip("Aucun")],
    ]
    story.append(styled_table(equip_data, [CONTENT_W - 40*mm, 20*mm, 20*mm]))
    story.append(divider())

    # ── 6. ZONE & DISPONIBILITÉ ───────────────────────────────
    story.append(section_title("ZONE & DISPONIBILITÉ"))
    story.append(Spacer(1, 2*mm))

    zone_data = [
        [PW("Élément"), PW("Détail")],
        [P("Zone(s) d'intervention"), P(get_val(["Zone(s) d'intervention", "Zone(s) d’intervention"]) or "______________")],
        [P("Disponible immédiatement"), CB(["Oui", "Non"], checked=get_list(["Disponible immédiatement", "Disponibilité immédiate"]))],
        [P("Horaires habituels"), P(get_val(["Horaires habituels", "Horaires de travail habituels"]) or "______________")],
        [P("Intervention d'urgence possible"), CB(["Oui", "Non"], checked=get_list(["Intervention d’urgence possible", "Intervention d'urgence"]))],
    ]
    story.append(styled_table(zone_data, [60*mm, CONTENT_W - 60*mm]))
    story.append(divider())

    # ── 7. ENGAGEMENT OFFICIEL ────────────────────────────────
    story.append(section_title("ENGAGEMENT OFFICIEL"))
    story.append(Spacer(1, 2*mm))
    
    nom_signataire = full_name if full_name != "[Nom de l'artisan]" else "Mr_________________________"

    eng_text = (
        f"Je soussigné(e) <u>{nom_signataire}</u> déclare exactes les informations fournies et m'engage à :"
        "<br/><br/>"
        "• Respecter la charte qualité BROBROLI<br/>"
        "• Respecter les normes de sécurité BTP<br/>"
        "• Honorer toute mission validée<br/>"
        "• Maintenir une conduite professionnelle irréprochable<br/>"
        "• Respecter les obligations fiscales et sociales applicables"
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
    story.append(Spacer(1, 10*mm))

    # Signature integration
    sig_img = None
    for k, v in response_data.items():
        if isinstance(v, str) and "signature" in k.lower():
            import base64
            if "data:image/" in v:
                try:
                    start_idx = v.find("data:image/")
                    comma_idx = v.find(",", start_idx)
                    if comma_idx != -1:
                        end_idx = v.find(" data:image/", comma_idx)
                        if end_idx == -1:
                            end_idx = len(v)
                        
                        b64_str = v[comma_idx+1:end_idx].strip()
                        if b64_str.endswith(","):
                            b64_str = b64_str[:-1]
                            
                        img_data = base64.b64decode(b64_str)
                        img_io = io.BytesIO(img_data)
                        sig_img = Image(img_io, width=40*mm, height=20*mm, kind='proportional')
                        break
                except Exception as e:
                    print("Erreur signature base64:", e)
            elif "http" in v:
                urls = [u.strip() for u in v.split(',')]
                url = [u for u in urls if u.startswith("http")][0] if any(u.startswith("http") for u in urls) else ""
                if url:
                    try:
                        import urllib.request
                        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req) as response:
                            img_data = response.read()
                        img_io = io.BytesIO(img_data)
                        sig_img = Image(img_io, width=40*mm, height=20*mm, kind='proportional')
                        break
                    except Exception as e:
                        print("Erreur signature url:", e)
                
    if not sig_img:
        sig_img = P(full_name if full_name != "[Nom de l'artisan]" else "_________________________")
        
    date_img = P(date_sign if date_sign != "______________" else "_________________________")

    half = CONTENT_W / 2
    sign = Table([
        [P("Signature :", True), P("Date :", True)],
        [sig_img, date_img]
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
    buffer.seek(0)
    return buffer

if __name__ == "__main__":
    generate_artisan_fiche(
        output_filename="FICHE_OFFICIELLE_ENREGISTREMENT_ARTISANS_BROBROLI.pdf"
    )
