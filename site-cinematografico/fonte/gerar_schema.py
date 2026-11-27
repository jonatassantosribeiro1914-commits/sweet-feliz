"""Gera os dados estruturados (JSON-LD) do site a partir do próprio conteúdo:
- confeitaria (Bakery) com contato, região, pagamento e redes;
- cardápio de Natal (Menu) com nomes, descrições e preços tirados do cardapio.js;
- perguntas frequentes (FAQPage) tiradas da seção "Dúvidas" do index.html;
- o site (WebSite).
Nada é inventado: sem avaliações, sem endereço de rua.

Uso (na pasta site-cinematografico):  python fonte/gerar_schema.py
Substitui o bloco <script type="application/ld+json"> do site/index.html.
"""
import html
import json
import re
from pathlib import Path

URL = "https://jonatassantosribeiro1914-commits.github.io/sweet-feliz/"
PRAZO = "2026-12-18"  # "encomendas até 18/12"
raiz = Path(__file__).resolve().parent.parent
js = (raiz / "site/cardapio.js").read_text(encoding="utf-8")
pagina_arq = raiz / "site/index.html"
pagina = pagina_arq.read_text(encoding="utf-8")

# ---- cardápio (lido do cardapio.js) -------------------------------------------
produtos = []
for m in re.finditer(r"\{ id: '([^']+)', cat: '(\w+)', nome: '([^']+)', preco: (\d+),\s*desc: '([^']+)'(?:,\s*extra: \{ rotulo: '([^']+)', preco: (\d+) \})?", js):
    pid, cat, nome, preco, desc, extra_rot, extra_preco = m.groups()
    produtos.append(dict(id=pid, cat=cat, nome=nome, preco=int(preco), desc=desc, extra=(extra_rot, int(extra_preco)) if extra_rot else None))
assert len(produtos) == 12, f"esperava 12 sobremesas, achei {len(produtos)}"

bolo_desc = re.search(r"nome: 'Bolo Natalino',\s*desc: '([^']+)'", js).group(1)
tamanhos = re.findall(r"\{ id: '([PMG])', serve: '([^']+)', preco: (\d+) \}", js)
recheios = re.search(r"recheios: \[([^\]]+)\]", js).group(1).replace("'", "").split(", ")
assert len(tamanhos) == 3

def foto(pid):
    return f"{URL}assets/cardapio/produtos/{pid}.webp"

def oferta(preco, nome=None, descricao=None):
    o = {"@type": "Offer", "price": f"{preco:.2f}", "priceCurrency": "BRL",
         "availability": "https://schema.org/PreOrder", "validThrough": PRAZO}
    if nome:
        o["name"] = nome
    if descricao:
        o["description"] = descricao
    return o

def item(p):
    i = {"@type": "MenuItem", "name": p["nome"], "description": p["desc"], "image": foto(p["id"]), "offers": oferta(p["preco"])}
    if p["extra"]:
        rot, preco = p["extra"]
        i["menuAddOn"] = {"@type": "MenuItem", "name": rot, "offers": oferta(preco)}
    return i

secoes = [
    {"@type": "MenuSection", "name": "Travessas e tortas", "hasMenuItem": [item(p) for p in produtos if p["cat"] == "travessas"]},
    {"@type": "MenuSection", "name": "Taças", "hasMenuItem": [item(p) for p in produtos if p["cat"] == "tacas"]},
    {"@type": "MenuSection", "name": "Bolo natalino", "hasMenuItem": [{
        "@type": "MenuItem", "name": "Bolo Natalino",
        "description": f"{bolo_desc} Recheios: {', '.join(recheios)}.",
        "image": foto("bolo-natalino-1"),
        "offers": [oferta(int(p), f"Bolo Natalino {t}", f"Serve {s}") for t, s, p in tamanhos],
    }]},
]

# ---- perguntas frequentes (lidas da seção Dúvidas) ---------------------------
faq = [{"@type": "Question", "name": html.unescape(q),
        "acceptedAnswer": {"@type": "Answer", "text": html.unescape(a)}}
       for q, a in re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", pagina)]
assert len(faq) >= 4, "não achei as perguntas da seção Dúvidas"

descricao = re.search(r'<meta name="description" content="([^"]+)"', pagina).group(1)

grafo = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Bakery", "@id": URL + "#confeitaria",
            "name": "Sweet Feliz", "url": URL, "description": descricao,
            "logo": URL + "assets/logo.png", "image": [URL + "assets/og.jpg", URL + "assets/logo.png"],
            "telephone": "+55-11-97953-8491",
            "address": {"@type": "PostalAddress", "addressLocality": "São Paulo", "addressRegion": "SP", "addressCountry": "BR"},
            "areaServed": {"@type": "Place", "name": "Campo Limpo, Zona Sul de São Paulo"},
            "servesCuisine": ["Confeitaria", "Sobremesas", "Bolos artesanais"],
            "paymentAccepted": "Pix, dinheiro, cartão de crédito", "currenciesAccepted": "BRL",
            "priceRange": "R$ 70 – R$ 280",
            "contactPoint": {"@type": "ContactPoint", "telephone": "+55-11-97953-8491", "contactType": "pedidos",
                             "availableLanguage": "pt-BR", "url": "https://wa.me/5511979538491"},
            "sameAs": ["https://www.instagram.com/sweet_feliz/"],
            "hasMenu": {"@id": URL + "#cardapio-natal"},
        },
        {
            "@type": "Menu", "@id": URL + "#cardapio-natal", "name": "Cardápio de Natal",
            "url": URL + "#cardapio", "inLanguage": "pt-BR",
            "description": "Sobremesas de Natal feitas à mão. Encomendas até 18/12; somente retirada (23/12 até 22h ou 24/12 até 12h).",
            "hasMenuSection": secoes,
        },
        {"@type": "FAQPage", "@id": URL + "#duvidas", "mainEntity": faq},
        {"@type": "WebSite", "@id": URL + "#site", "name": "Sweet Feliz", "url": URL, "inLanguage": "pt-BR",
         "publisher": {"@id": URL + "#confeitaria"}},
    ],
}

bloco = '<script type="application/ld+json">\n' + json.dumps(grafo, ensure_ascii=False, indent=2) + "\n  </script>"
novo, n = re.subn(r'<script type="application/ld\+json">.*?</script>', lambda _: bloco, pagina, count=1, flags=re.S)
assert n == 1, "bloco JSON-LD não encontrado no index.html"
pagina_arq.write_text(novo, encoding="utf-8")
print(f"OK: {len(produtos)} sobremesas + bolo ({len(tamanhos)} tamanhos), {len(faq)} perguntas, {len(bloco) / 1024:.1f} KB")
