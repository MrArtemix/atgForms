from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.units import mm

options = ["Plombier", "Électricien", "Peintre", "Clim/Froid", "Autre"]
total = 0
for o in options:
    w = stringWidth(f" {o}", 'Times-Roman', 10)
    print(f"'{o}': {w} pt = {w/mm:.2f} mm")
    total += 5*mm + w + 3*mm

print(f"Total width needed: {total/mm:.2f} mm")
print("Available width: 115 mm")
