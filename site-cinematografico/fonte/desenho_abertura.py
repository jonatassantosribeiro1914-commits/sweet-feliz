"""Gera o desenho em traço da abertura (SVG) que vai se desenhando com a rolagem.

Cada traço tem pathLength="1" e uma janela da rolagem (data-de / data-ate, de 0 a 1)
em que ele é desenhado. As áreas de cor (classe "cor") aparecem no final.
Saída: imprime o <svg> para colar no index.html (entre os marcadores DESENHO).

  python desenho_abertura.py > desenho.svg
"""

TINTA = "#3A2E2C"
OURO = "#C9A15A"


def drips(x0, x1, y, n, comprimentos):
    """Borda de cobertura escorrendo: vai de x0 a x1 na altura y, com n gotas."""
    largura = (x1 - x0) / n
    d = f"M{x0} {y}"
    for i in range(n):
        a = x0 + i * largura
        c = comprimentos[i % len(comprimentos)]
        m = a + largura / 2
        d += (f" Q{a + largura * 0.18:.1f} {y} {a + largura * 0.22:.1f} {y + c * 0.45:.1f}"
              f" Q{m:.1f} {y + c + 6:.1f} {a + largura * 0.78:.1f} {y + c * 0.45:.1f}"
              f" Q{a + largura * 0.82:.1f} {y} {a + largura:.1f} {y}")
    return d


def estrela(cx, cy, r, ri, pontas=5, giro=-90):
    import math
    pts = []
    for k in range(pontas * 2):
        a = math.radians(giro + k * 180 / pontas)
        rr = r if k % 2 == 0 else ri
        pts.append(f"{cx + rr * math.cos(a):.1f} {cy + rr * math.sin(a):.1f}")
    return "M" + " L".join(pts) + " Z"


def brilho(cx, cy, r):
    return (f"M{cx} {cy - r} C{cx + r * .12} {cy - r * .25} {cx + r * .25} {cy - r * .12} {cx + r} {cy} "
            f"C{cx + r * .25} {cy + r * .12} {cx + r * .12} {cy + r * .25} {cx} {cy + r} "
            f"C{cx - r * .12} {cy + r * .25} {cx - r * .25} {cy + r * .12} {cx - r} {cy} "
            f"C{cx - r * .25} {cy - r * .12} {cx - r * .12} {cy - r * .25} {cx} {cy - r} Z")


def coracao(cx, cy, s):
    return (f"M{cx} {cy + s * .9} C{cx - s * 1.3} {cy + s * .1} {cx - s * .9} {cy - s * .9} {cx} {cy - s * .35} "
            f"C{cx + s * .9} {cy - s * .9} {cx + s * 1.3} {cy + s * .1} {cx} {cy + s * .9} Z")


def ramo(x, y, lado):
    s = lado  # 1 = para a direita, -1 = para a esquerda
    d = f"M{x} {y} Q{x + 30 * s} {y - 10} {x + 62 * s} {y - 34}"
    for k, (px, py) in enumerate([(12, -3), (26, -8), (40, -16), (52, -25)]):
        bx, by = x + px * s, y + py
        d += f" M{bx} {by} l{-6 * s} {-12} M{bx} {by} l{10 * s} {4}"
    return d


def floco(cx, cy, r):
    return (f"M{cx} {cy - r} V{cy + r} M{cx - r * .87:.1f} {cy - r / 2} L{cx + r * .87:.1f} {cy + r / 2} "
            f"M{cx - r * .87:.1f} {cy + r / 2} L{cx + r * .87:.1f} {cy - r / 2}")


topo_y = 200
cobertura_y = 222
borda = drips(222, 378, cobertura_y, 6, [14, 24, 10, 20, 12, 18])
# área de cor da cobertura: a borda das gotas (da esquerda para a direita) fechada pelo topo do bolo
cobertura_cor = borda + f" V214 Q378 {topo_y} 364 {topo_y} H236 Q222 {topo_y} 222 214 Z"

tracos = [
    # (desenho, de, ate, extra)
    ("M138 364 Q300 376 462 364", 0.00, 0.10, ""),                                   # prato
    ("M272 368 L258 402 H342 L328 368", 0.04, 0.12, ""),                              # pé do prato
    ("M186 364 V286 Q186 272 200 272 H400 Q414 272 414 286 V364", 0.06, 0.30, ""),   # andar de baixo
    ("M186 318 C240 326 360 310 414 318", 0.22, 0.32, ' opacity=".55"'),            # recheio
    ("M222 272 V214 Q222 200 236 200 H364 Q378 200 378 214 V272", 0.20, 0.42, ""),  # andar de cima
    (borda, 0.36, 0.52, ""),                                                          # cobertura escorrendo
    ("M300 186 V200", 0.48, 0.52, ""),                                                # haste da estrela
    (estrela(300, 170, 17, 7), 0.48, 0.58, ""),                                       # estrela
    (coracao(250, 192, 11), 0.50, 0.58, ""),                                          # morango 1
    (coracao(350, 192, 11), 0.52, 0.60, ""),                                          # morango 2
    ("M246 182 l4 -5 l4 5 M346 182 l4 -5 l4 5", 0.56, 0.60, ""),                     # folhinhas dos morangos
    (ramo(168, 356, -1), 0.50, 0.64, ""),                                            # pinheiro esq.
    (ramo(432, 356, 1), 0.52, 0.66, ""),                                             # pinheiro dir.
    (floco(118, 168, 11), 0.56, 0.66, ""),
    (floco(486, 146, 9), 0.58, 0.68, ""),
    (floco(476, 292, 7), 0.60, 0.70, ""),
]

cores = [
    # (desenho, cor, de, ate)
    ("M186 364 V286 Q186 272 200 272 H400 Q414 272 414 286 V364 Z", "#F3DCD9", 0.72, 0.88),
    ("M222 272 V214 Q222 200 236 200 H364 Q378 200 378 214 V272 Z", "#EDCDCA", 0.74, 0.90),
    (cobertura_cor, "#C98591", 0.76, 0.92),
    (estrela(300, 170, 17, 7), OURO, 0.78, 0.92),
    (coracao(250, 192, 11), "#C9505E", 0.78, 0.92),
    (coracao(350, 192, 11), "#C9505E", 0.80, 0.94),
    ("M138 364 Q300 376 462 364 L462 367 Q300 379 138 367 Z", "#FFFCF8", 0.72, 0.88),
]

brilhos = [(206, 168, 9, 0.86), (414, 150, 12, 0.88), (150, 246, 7, 0.90), (452, 236, 8, 0.92), (300, 128, 6, 0.94)]

linhas = ['<svg class="desenho" viewBox="76 110 448 440" role="img" aria-label="Desenho de um bolo de Natal e o nome Sweet Feliz">',
          '  <defs><clipPath id="escrita"><rect id="escrita-rect" x="0" y="400" width="0" height="140"/></clipPath></defs>']
linhas.append('  <g class="cores">')
for d, cor, de, ate in cores:
    linhas.append(f'    <path class="cor" d="{d}" fill="{cor}" data-de="{de}" data-ate="{ate}"/>')
linhas.append('  </g>')
linhas.append(f'  <g class="tracos" fill="none" stroke="{TINTA}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">')
for d, de, ate, extra in tracos:
    linhas.append(f'    <path class="traco" pathLength="1" d="{d}" data-de="{de}" data-ate="{ate}"{extra}/>')
linhas.append('  </g>')
# nome escrito à mão: contorno revelado da esquerda para a direita, depois a tinta preenche
linhas.append('  <g clip-path="url(#escrita)">')
linhas.append(f'    <text class="nome nome-tinta" x="300" y="488" text-anchor="middle" data-de="0.80" data-ate="0.96">Sweet Feliz</text>')
linhas.append(f'    <text class="nome nome-traco" x="300" y="488" text-anchor="middle" fill="none" stroke="{TINTA}" stroke-width="1.3">Sweet Feliz</text>')
linhas.append('  </g>')
linhas.append(f'  <text class="sub cor" x="300" y="530" text-anchor="middle" data-de="0.84" data-ate="0.98">BOLOS ARTESANAIS · NATAL</text>')
linhas.append(f'  <g class="brilhos" fill="{OURO}">')
for x, y, r, de in brilhos:
    linhas.append(f'    <path class="brilho" d="{brilho(x, y, r)}" data-de="{de}" data-ate="{min(1, de + 0.08):.2f}" style="transform-origin:{x}px {y}px"/>')
linhas.append('  </g>')
linhas.append('</svg>')
print("\n".join(linhas))
