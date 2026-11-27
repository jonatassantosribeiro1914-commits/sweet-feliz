"""Animação minimalista da abertura: o bolo da Sweet Feliz se monta até virar uma mesa de Natal.

Uso:
  python animacao.py horizontal saida.mp4          (1920x1080)
  python animacao.py vertical saida.mp4            (1080x1920)
  python animacao.py horizontal previa.png --previa  (folha com 6 momentos)
Precisa de Pillow e ffmpeg no PATH.
"""
import math
import random
import subprocess
import sys

from PIL import Image, ImageDraw

FPS, N, SS = 24, 192, 2

# Paleta adulta: rosa antigo, verde-água acinzentado e dourado, traço fino
CREME = (250, 243, 236)
CORACAO = (250, 243, 236)        # sem corações no fundo (FUNDO_CORACOES = False)
TINTA = (58, 46, 44)
ROSA_CLARO = (236, 200, 198)
MORANGO = (196, 112, 124)
CREME_RECHEIO = (252, 246, 240)
TURQUESA = (128, 170, 164)
OURO = (196, 158, 92)
BRANCO = (255, 252, 248)
CINZA = (168, 150, 130)
VERMELHO = (190, 72, 84)
FOLHA = (112, 146, 120)
CHOCOLATE = (88, 60, 50)
NEVE = (222, 206, 188)
NEVE_T = (200, 184, 160)
CONTORNO = 0.5          # espessura do traço (1 = traço grosso de desenho animado)
FUNDO_CORACOES = False


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def faixa(t, ini, dur):
    return clamp((t - ini) / dur)


def suave(x):
    return x * x * (3 - 2 * x)


def sai_cubica(x):
    return 1 - (1 - x) ** 3


def sai_volta(x, k=1.5):
    x -= 1
    return 1 + (k + 1) * x ** 3 + k * x ** 2


def lerp(a, b, x):
    return a + (b - a) * x


def misturar(c1, c2, x):
    return tuple(round(lerp(a, b, x)) for a, b in zip(c1, c2))


# ---------------------------------------------------------------- câmera
CAMERAS = {
    #             escala, fração x, fração y  (onde o centro do bolo aparece na tela)
    "horizontal": [(1.15, 0.72, 0.50), (1.12, 0.36, 0.53), (0.80, 0.50, 0.42)],
    "vertical":   [(1.22, 0.50, 0.40), (1.18, 0.50, 0.42), (0.74, 0.50, 0.36)],  # cabe na largura útil do celular (~82% do 9:16)
}
FOCO = (0, 60)  # ponto do mundo que a câmera segue (meio do bolo)


def camera(orient, t):
    k0, k1, k2 = CAMERAS[orient]
    if t < 0.55:
        a, b, x = k0, k1, suave(t / 0.55)
    else:
        a, b, x = k1, k2, suave((t - 0.55) / 0.45)
    return tuple(lerp(p, q, x) for p, q in zip(a, b))


class Tela:
    def __init__(self, W, H, orient, t):
        self.W, self.H, self.orient, self.t = W, H, orient, t
        self.s, fx, fy = camera(orient, t)
        self.ox, self.oy = fx * W, fy * H
        self.img = Image.new("RGB", (W * SS, H * SS), CREME)
        self.d = ImageDraw.Draw(self.img)

    def P(self, x, y):
        return ((x - FOCO[0]) * self.s + self.ox) * SS, ((y - FOCO[1]) * self.s + self.oy) * SS

    def L(self, v):
        return max(1, v * self.s * SS)

    def caixa(self, x0, y0, x1, y1):
        a, b = self.P(x0, y0)
        c, d = self.P(x1, y1)
        return [a, b, c, d]

    def mundo(self, sx, sy):
        return (sx / SS - self.ox) / self.s + FOCO[0], (sy / SS - self.oy) / self.s + FOCO[1]

    # Desenha um grupo de formas com contorno único (contorno por trás, recheio na frente)
    def grupo(self, formas, contorno=6):
        ow = self.L(contorno * CONTORNO)
        for passo in (0, 1):
            for f in formas:
                tipo, cor = f[0], f[-1]
                fill = TINTA if passo == 0 else cor
                larg = ow * 2 if passo == 0 else 0
                e = ow if passo == 0 else 0  # contorno = forma aumentada por trás
                if tipo == "rr":
                    _, (x0, y0, x1, y1), r, _ = f
                    a, b, c, dd = self.caixa(x0, y0, x1, y1)
                    self.d.rounded_rectangle([a - e, b - e, c + e, dd + e], radius=self.L(r) + e, fill=fill)
                elif tipo == "el":
                    _, (x0, y0, x1, y1), _ = f
                    a, b, c, dd = self.caixa(x0, y0, x1, y1)
                    self.d.ellipse([a - e, b - e, c + e, dd + e], fill=fill)
                elif tipo == "po":
                    _, pts, _ = f
                    sp = [self.P(*p) for p in pts]
                    if passo == 0:
                        self.d.polygon(sp, fill=TINTA)
                        self.d.line(sp + [sp[0]], fill=TINTA, width=int(larg), joint="curve")
                        for p in sp:  # cantos arredondados do contorno
                            self.d.ellipse([p[0] - larg / 2, p[1] - larg / 2, p[0] + larg / 2, p[1] + larg / 2], fill=TINTA)
                    else:
                        self.d.polygon(sp, fill=fill)


# ---------------------------------------------------------------- formas
def coracao(cx, cy, tam, along=1.0, n=40):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        x = 16 * math.sin(a) ** 3
        y = -(13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a))
        pts.append((cx + x * tam / 32, cy + y * tam / 32 * along))
    return pts


def estrela4(cx, cy, r, fino=0.28):
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * fino
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


def escala_em(pts, cx, cy, k):
    return [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in pts]


# ---------------------------------------------------------------- cena
random.seed(7)
NEVE_FLOCOS = [(random.random(), random.random(), random.uniform(0.6, 1.4), random.uniform(2, 4.5), random.random() < 0.25)
               for _ in range(55)]


def fundo_coracoes(T):
    passo = 120
    x0, y0 = T.mundo(0, 0)
    x1, y1 = T.mundo(T.W * SS, T.H * SS)
    j0, j1 = int(math.floor(y0 / passo)) - 1, int(math.ceil(y1 / passo)) + 1
    i0, i1 = int(math.floor(x0 / passo)) - 1, int(math.ceil(x1 / passo)) + 1
    for j in range(j0, j1):
        for i in range(i0, i1):
            cx = i * passo + (passo / 2 if j % 2 else 0)
            T.d.polygon([T.P(*p) for p in coracao(cx, j * passo, 30, n=24)], fill=CORACAO)


def neve(T, t):
    for fx, fy, vel, r, turq in NEVE_FLOCOS:
        x = fx * T.W + math.sin(t * 6 + fy * 9) * 14
        y = ((fy + t * 0.55 * vel) % 1.05 - 0.025) * T.H
        r = r * (T.W / 1920 if T.W > T.H else T.H / 1920)
        cor = NEVE_T if turq else NEVE
        if turq:  # floquinho de 6 pontas
            for k in range(3):
                a = math.pi / 3 * k + t * 2
                dx, dy = math.cos(a) * r * 1.8, math.sin(a) * r * 1.8
                T.d.line([(x - dx) * SS, (y - dy) * SS, (x + dx) * SS, (y + dy) * SS], fill=cor, width=int(1.4 * SS))
        else:
            T.d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=cor)


def raios(T, t):
    p = faixa(t, 0.42, 0.16)
    if p <= 0:
        return
    cor = misturar(CREME, OURO, p * 0.55)
    for k in range(22):
        a = math.radians(180 + 180 * (k + 0.5) / 22)
        r0, r1 = 300 + (k % 2) * 25, 360 + (k % 2) * 40
        r1 = lerp(r0, r1, p)
        x0, y0 = T.P(math.cos(a) * r0, -20 + math.sin(a) * r0)
        x1, y1 = T.P(math.cos(a) * r1, -20 + math.sin(a) * r1)
        T.d.line([x0, y0, x1, y1], fill=cor, width=int(T.L(2)))


def anel_logo(T, t):
    p = suave(faixa(t, 0.68, 0.24))
    if p <= 0:
        return
    R = 470
    cx, cy = 0, 40
    caixa = T.caixa(cx - R, cy - R, cx + R, cy + R)
    T.d.arc(caixa, start=-90, end=-90 + 360 * p, fill=TURQUESA, width=int(T.L(3.5)))
    # arcos ondulados cinza (como a borda da logo)
    for ini, fim in ((200, 340), (20, 160)):
        alvo = lerp(ini, fim, p)
        pts = []
        a = ini
        while a <= alvo:
            r = R + 38 + 13 * abs(math.sin(math.radians(a) * 22))
            pts.append(T.P(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))))
            a += 0.6
        if len(pts) > 1:
            T.d.line(pts, fill=CINZA, width=int(T.L(3)), joint="curve")


def pisca_pisca(T, t):
    p = faixa(t, 0.70, 0.20)
    if p <= 0:
        return
    xa, xb, ytopo, queda = -780, 780, -470, 120

    def y_de(x):
        u = (x - xa) / (xb - xa)
        return ytopo + queda * 4 * u * (1 - u)

    xf = lerp(xa, xb, sai_cubica(p))
    pts = [T.P(x, y_de(x)) for x in range(int(xa), int(xf) + 1, 10)]
    if len(pts) > 1:
        T.d.line(pts, fill=TINTA, width=int(T.L(2)), joint="curve")
    cores = (MORANGO, OURO, TURQUESA)
    for k, x in enumerate(range(xa + 50, xb, 95)):
        if x > xf:
            break
        brilho = 0.5 + 0.5 * math.sin(t * 50 + k * 2.1)
        cor = misturar(cores[k % 3], BRANCO, 0.35 * brilho)
        y = y_de(x)
        T.grupo([("el", (x - 11, y + 6, x + 11, y + 38), cor), ("rr", (x - 8, y - 2, x + 8, y + 10), 3, CINZA)], 3.5)


def presentes(T, t, orient):
    lista = ([(-570, 160, 190, 150, TURQUESA, MORANGO, 0.74), (575, 175, 150, 125, MORANGO, TURQUESA, 0.79)]
             if orient == "horizontal" else
             [(-300, 470, 190, 150, TURQUESA, MORANGO, 0.74), (300, 485, 150, 125, MORANGO, TURQUESA, 0.79)])
    for cx, base, w, h, cor, fita, ini in lista:
        p = faixa(t, ini, 0.12)
        if p <= 0:
            continue
        k = sai_volta(p)
        def S(x, y):
            return (cx + (x - cx) * k, base + (y - base) * k)
        top = base - h
        formas = [
            ("po", [S(cx - w / 2, top + 22), S(cx + w / 2, top + 22), S(cx + w / 2, base), S(cx - w / 2, base)], cor),
            ("po", [S(cx - w / 2 - 10, top), S(cx + w / 2 + 10, top), S(cx + w / 2 + 10, top + 26), S(cx - w / 2 - 10, top + 26)], cor),
            ("po", [S(cx - 13, top), S(cx + 13, top), S(cx + 13, base), S(cx - 13, base)], fita),
            ("po", [S(cx, top), S(cx - 48, top - 34), S(cx - 40, top + 4)], fita),
            ("po", [S(cx, top), S(cx + 48, top - 34), S(cx + 40, top + 4)], fita),
        ]
        T.grupo(formas, 5)


def estrelas(T, t):
    lista = [(-360, -210, 26, 0.0), (330, -300, 20, 0.0), (-620, -120, 22, 0.72), (640, -40, 28, 0.76),
             (-470, 360, 18, 0.8), (470, 330, 16, 0.84), (0, -560, 24, 0.86), (-760, 260, 20, 0.88), (760, 300, 22, 0.9)]
    for k, (x, y, r, ini) in enumerate(lista):
        p = 1.0 if ini == 0 else faixa(t, ini, 0.08)
        if p <= 0:
            continue
        pul = 0.75 + 0.25 * math.sin(t * 30 + k * 1.7)
        pts = escala_em(estrela4(x, y, r), x, y, sai_volta(p) * pul)
        T.d.polygon([T.P(*q) for q in pts], fill=OURO)


def suporte(T):
    T.grupo([
        ("po", [(-60, 205), (60, 205), (95, 262), (-95, 262)], BRANCO),
        ("rr", (-300, 178, 300, 206), 14, BRANCO),
    ], 6)


def camadas(T, t):
    for i in range(3):
        p = faixa(t, 0.05 + 0.085 * i, 0.12)
        if p <= 0:
            continue
        dy = -900 * (1 - sai_volta(p, 1.2))
        base = 180 - i * 100 + dy
        topo = base - 100
        T.grupo([("rr", (-220, topo, 220, base), 18, ROSA_CLARO)], 6)
        # recheio (faixa clara) e pontinhos de massa
        T.d.rectangle(T.caixa(-214, topo + 4, 214, topo + 18), fill=CREME_RECHEIO)
        for k in range(6):
            x = -170 + k * 68 + (i % 2) * 30
            T.d.ellipse(T.caixa(x - 5, base - 50 - 5, x + 5, base - 50 + 5), fill=misturar(ROSA_CLARO, MORANGO, 0.18))


def cobertura(T, t):
    p = faixa(t, 0.36, 0.2)
    if p <= 0:
        return
    cair = sai_cubica(clamp(p / 0.35))
    ytop = -133 - 300 * (1 - cair)
    formas = []
    gotas = [(-188, 52), (-122, 84), (-58, 46), (4, 96), (66, 58), (130, 82), (190, 48)]
    for k, (x, comp) in enumerate(gotas):
        q = sai_cubica(clamp((p - 0.3 - k * 0.05) / 0.4))
        if q > 0:
            formas.append(("rr", (x - 17, ytop + 20, x + 17, ytop + 34 + comp * q), 17, MORANGO))
    formas.append(("rr", (-230, ytop, 230, ytop + 38), 19, MORANGO))
    T.grupo(formas, 6)
    # brilho da cobertura
    if cair >= 1:
        T.d.rounded_rectangle(T.caixa(-180, ytop + 8, -90, ytop + 15), radius=T.L(4), fill=misturar(MORANGO, BRANCO, 0.45))


def arvore(T, t):
    p = faixa(t, 0.58, 0.1)
    if p <= 0:
        return
    k = sai_volta(p, 2)
    cx, base = 0, -128
    def S(pts):
        return escala_em(pts, cx, base, k)
    formas = [
        ("po", S([(-12, base - 30), (12, base - 30), (12, base), (-12, base)]), CHOCOLATE),
        ("po", S([(-70, base - 28), (70, base - 28), (0, base - 120)]), TURQUESA),
        ("po", S([(-56, base - 78), (56, base - 78), (0, base - 160)]), TURQUESA),
        ("po", S([(-40, base - 122), (40, base - 122), (0, base - 196)]), TURQUESA),
    ]
    T.grupo(formas, 5)
    for x, y, c in ((-28, base - 52, MORANGO), (24, base - 66, OURO), (-14, base - 104, OURO), (16, base - 140, MORANGO)):
        T.d.ellipse(T.caixa(cx + (x - 7) * k, base + (y - base - 7) * k, cx + (x + 7) * k, base + (y - base + 7) * k), fill=c)
    T.grupo([("po", escala_em(estrela4(0, base - 206, 30, 0.35), 0, base, k), OURO)], 4)


def frutas(T, t):
    itens = [("b", -126, 0.50), ("m", -176, 0.52), ("m", 172, 0.545), ("b", 128, 0.565), ("m", -80, 0.585), ("m", 82, 0.60)]
    for tipo, x, ini in itens:
        p = faixa(t, ini, 0.09)
        if p <= 0:
            continue
        dy = -700 * (1 - sai_volta(p, 1.3))
        if tipo == "m":
            cy = -168 + dy
            corpo = coracao(x, cy, 74, 1.15)
            folhas = [(x - 26, cy - 34), (x - 8, cy - 26), (x, cy - 44), (x + 8, cy - 26), (x + 26, cy - 34), (x, cy - 18)]
            T.grupo([("po", corpo, VERMELHO), ("po", folhas, FOLHA)], 5)
            for sx, sy in ((-14, -6), (12, -4), (-4, 10), (16, 14), (-16, 18), (2, 26)):
                T.d.ellipse(T.caixa(x + sx - 3, cy + sy - 4, x + sx + 3, cy + sy + 4), fill=(255, 226, 140))
        else:
            cy = -160 + dy
            T.grupo([("el", (x - 27, cy - 27, x + 27, cy + 27), CHOCOLATE)], 5)
            rnd = random.Random(int(x))
            for _ in range(9):
                a, r = rnd.uniform(0, 6.28), rnd.uniform(4, 19)
                px, py = x + r * math.cos(a), cy + r * math.sin(a)
                T.d.line(T.caixa(px - 4, py, px + 4, py)[:4], fill=(150, 95, 70), width=int(T.L(4)))


def quadro(orient, t):
    W, H = (1920, 1080) if orient == "horizontal" else (1080, 1920)
    T = Tela(W, H, orient, t)
    if FUNDO_CORACOES:
        fundo_coracoes(T)
    raios(T, t)
    anel_logo(T, t)
    pisca_pisca(T, t)
    estrelas(T, t)
    suporte(T)
    arvore(T, t)       # atrás das frutas
    camadas(T, t)
    cobertura(T, t)
    arvore_frente = None
    frutas(T, t)
    presentes(T, t, orient)
    neve(T, t)
    return T.img.resize((W, H), Image.LANCZOS)


def main():
    orient, saida = sys.argv[1], sys.argv[2]
    if "--previa" in sys.argv:
        ts = [0, 0.2, 0.42, 0.58, 0.75, 1.0]
        ims = [quadro(orient, t) for t in ts]
        w, h = ims[0].width // 3, ims[0].height // 3
        folha = Image.new("RGB", (w * 3, h * 2), "white")
        for k, im in enumerate(ims):
            folha.paste(im.resize((w, h)), ((k % 3) * w, (k // 3) * h))
        folha.save(saida)
        return
    W, H = (1920, 1080) if orient == "horizontal" else (1080, 1920)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow",
                           "-crf", "14", "-pix_fmt", "yuv420p", saida], stdin=subprocess.PIPE)
    for f in range(N):
        ff.stdin.write(quadro(orient, f / (N - 1)).tobytes())
        if f % 24 == 0:
            print(f"{orient}: quadro {f}/{N}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("OK", saida)


if __name__ == "__main__":
    main()
