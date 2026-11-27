"""Ilustrações das seções, no mesmo traço da abertura, com fundo branco
(o site usa mix-blend-mode: multiply, então o branco some no creme)."""
import os

import animacao as A

A.CREME = (255, 255, 255)
A.CORACAO = (248, 235, 226)  # coração do fundo depois de multiplicar pelo creme do site

ARTES = {
    # nome: (t da animação, escala, fração x, fração y)
    "processo": (1.0, 0.50, 0.44, 0.52),
    "contato": (1.0, 0.70, 0.50, 0.46),
}

pasta = os.path.dirname(os.path.abspath(__file__))
for nome, (t, s, fx, fy) in ARTES.items():
    # orientação horizontal com a câmera parada no enquadramento desta arte
    A.CAMERAS["horizontal"] = [(s, fx, fy)] * 3
    img = A.quadro("horizontal", t)
    img.save(os.path.join(pasta, f"{nome}.png"))
    print("OK", nome)
