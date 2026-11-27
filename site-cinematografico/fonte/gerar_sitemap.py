"""Gera o site/sitemap.xml (página + fotos dos doces, para o Google Imagens).
Uso (na pasta site-cinematografico):  python fonte/gerar_sitemap.py
"""
import datetime
import sys
from pathlib import Path
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cardapio_dados import RAIZ as raiz, URL, ler_cardapio  # noqa: E402

produtos, bolo = ler_cardapio()
fotos = [(p["id"], p["nome"]) for p in produtos] + [(f, "Bolo Natalino") for f in bolo["fotos"]]
hoje = datetime.date.today().isoformat()
imgs = "\n".join(
    f"    <image:image><image:loc>{URL}assets/cardapio/produtos/{pid}.webp</image:loc>"
    f"<image:title>{escape(nome)} · Sweet Feliz</image:title></image:image>" for pid, nome in fotos)
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>{URL}</loc>
    <lastmod>{hoje}</lastmod>
    <changefreq>weekly</changefreq>
{imgs}
  </url>
</urlset>
'''
(raiz / "site/sitemap.xml").write_text(xml, encoding="utf-8")
print(f"OK: sitemap.xml com {len(fotos)} fotos, lastmod {hoje}")
