"""Lê o cardápio direto do site/cardapio.js (uma fonte só para os geradores de schema e sitemap)."""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
URL = "https://sweet-feliz.vercel.app/"


def ler_cardapio():
    js = (RAIZ / "site/cardapio.js").read_text(encoding="utf-8")
    produtos = []
    padrao = (r"\{ id: '([^']+)', cat: '(\w+)', nome: '([^']+)', preco: (\d+),\s*desc: '([^']+)'"
              r"(?:,\s*extra: \{ rotulo: '([^']+)', preco: (\d+) \})?")
    for m in re.finditer(padrao, js):
        pid, cat, nome, preco, desc, extra_rot, extra_preco = m.groups()
        produtos.append(dict(id=pid, cat=cat, nome=nome, preco=int(preco), desc=desc,
                             extra=(extra_rot, int(extra_preco)) if extra_rot else None))
    assert len(produtos) == 12, f"esperava 12 sobremesas, achei {len(produtos)}"
    bolo = {
        "desc": re.search(r"nome: 'Bolo Natalino',\s*desc: '([^']+)'", js).group(1),
        "tamanhos": re.findall(r"\{ id: '([PMG])', serve: '([^']+)', preco: (\d+) \}", js),
        "recheios": re.search(r"recheios: \[([^\]]+)\]", js).group(1).replace("'", "").split(", "),
        "fotos": ["bolo-natalino-1", "bolo-natalino-2"],
    }
    assert len(bolo["tamanhos"]) == 3
    return produtos, bolo
