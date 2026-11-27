"""Gera o site/sitemap.xml (página + fotos dos doces, para o Google Imagens).
Uso (na pasta site-cinematografico):  python fonte/gerar_sitemap.py
"""
import datetime
import re
from pathlib import Path
from xml.sax.saxutils import escape

URL = "https://jonatassantosribeiro1914-commits.github.io/sweet-feliz/"
raiz = Path(__file__).resolve().parent.parent
js = (raiz / "site/cardapio.js").read_text(encoding="utf-8")
fotos = [(pid, nome) for pid, nome in re.findall(r"\{ id: '([^']+)', cat: '\w+', nome: '([^']+)'", js)]
fotos += [("bolo-natalino-1", "Bolo Natalino"), ("bolo-natalino-2", "Bolo Natalino")]
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
