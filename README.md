# Sweet Feliz · Cardápio de Natal

Site da Sweet Feliz, confeitaria artesanal no Campo Limpo (Zona Sul de São Paulo):
abertura em que uma linha desenha o bolo e escreve o nome conforme a rolagem, cardápio de Natal com sacolinha e pedido
direto no WhatsApp.

## Pastas

| Pasta | O que tem |
|---|---|
| `site-cinematografico/site/` | **O site publicado** (HTML, CSS e JavaScript puros, sem build) |
| `site-cinematografico/fonte/` | Desenho em traço da abertura (`desenho_abertura.py`), ilustrações das seções e a silhueta do Papai Noel |
| `index.html`, `css/`, `js/`, `img/` | Primeira versão do catálogo (página simples) |
| `DESIGN.md` | Cores e fontes da marca |

## Ver no computador

```
python -m http.server 4173 --directory site-cinematografico/site
```

e abra http://localhost:4173

## Publicação

Cada envio para a branch `main` publica `site-cinematografico/site` no GitHub Pages
(automação em `.github/workflows/publicar-site.yml`).

## Pedidos

O número do WhatsApp fica em `site-cinematografico/site/config.js`.
