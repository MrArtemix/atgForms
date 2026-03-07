from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from fiche_officielle import generate_fiche_officielle

app = Flask(__name__)
# Permettre à Next.js (port 3002 ou autre) d'appeler cette API
CORS(app)

@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        template_id = data.get("template_id", "default")
        template_schema = data.get("template_schema", None)
        response_data = data.get("response_data", {})
        
        # Route logic for specific complex models
        if "fiche officielle" in template_id.lower() or "artisan" in template_id.lower():
            buffer = generate_fiche_officielle(response_data)
            headers = {
                "Content-Disposition": f"attachment; filename=fiche_artisan.pdf",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
            return Response(
                buffer.getvalue(),
                mimetype="application/pdf",
                headers=headers
            )
            
        # --- Default / Generic Schema Builder ---
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        PAGE_WIDTH, PAGE_HEIGHT = A4
        
        # Helper to convert hex to ReportLab color
        def get_color(hex_str, default=colors.black):
            if hex_str and hex_str.startswith("#"):
                return colors.HexColor(hex_str)
            return default

        if template_schema is not None and isinstance(template_schema, list):
            # Construction dynamique basée sur le schéma du builder (origine: Haut-Gauche)
            for el in template_schema:
                el_type = el.get("type")
                x = el.get("x", 0)
                y = el.get("y", 0)
                # Convertir Y (Haut-Gauche -> Bas-Gauche pour ReportLab)
                pdf_y = PAGE_HEIGHT - y
                
                color = get_color(el.get("color"), colors.black)
                font_size = el.get("fontSize", 12)
                is_bold = el.get("isBold", False)
                font_name = "Helvetica-Bold" if is_bold else "Helvetica"
                
                if el_type == "text":
                    c.setFont(font_name, font_size)
                    c.setFillColor(color)
                    c.drawString(x, pdf_y, str(el.get("value", "")))
                    
                elif el_type == "variable":
                    c.setFont(font_name, font_size)
                    c.setFillColor(color)
                    field_id = el.get("field_id", "")
                    val = response_data.get(field_id, "")
                    str_value = str(val)[:100] + "..." if len(str(val)) > 100 else str(val)
                    c.drawString(x, pdf_y, str_value)
                    
                elif el_type == "line":
                    c.setStrokeColor(color)
                    c.setLineWidth(el.get("lineWidth", 1))
                    x2 = el.get("x2", x)
                    y2 = el.get("y2", y)
                    pdf_y2 = PAGE_HEIGHT - y2
                    c.line(x, pdf_y, x2, pdf_y2)
                    
            c.showPage()
        
        else:
            # Rendu par défaut (Fallback)
            title = f"Rapport: {template_id.replace('-', ' ').title()}"
            
            c.setFont("Helvetica-Bold", 18)
            c.setFillColor(colors.HexColor("#2563eb"))
            c.drawString(50, PAGE_HEIGHT - 50, title)
            
            c.setStrokeColor(colors.lightgrey)
            c.line(50, PAGE_HEIGHT - 65, PAGE_WIDTH - 50, PAGE_HEIGHT - 65)
            
            c.setFont("Helvetica", 12)
            c.setFillColor(colors.black)
            
            y = PAGE_HEIGHT - 100
            for key, value in response_data.items():
                if y < 50:
                    c.showPage()
                    y = PAGE_HEIGHT - 50
                    c.setFont("Helvetica", 12)
                
                c.setFont("Helvetica-Bold", 10)
                c.drawString(50, y, f"{key}:")
                
                c.setFont("Helvetica", 10)
                str_value = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
                c.drawString(150, y, str_value)
                
                c.setStrokeColor(colors.whitesmoke)
                c.line(50, y - 5, PAGE_WIDTH - 50, y - 5)
                
                y -= 25

        c.save()
        buffer.seek(0)
        
        # Retourner le PDF directement avec les bons headers
        headers = {
            "Content-Disposition": f"attachment; filename=document_genere.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
        return Response(
            buffer.getvalue(),
            mimetype="application/pdf",
            headers=headers
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8002)
