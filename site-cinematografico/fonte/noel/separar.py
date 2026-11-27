"""Separa a silhueta (autoria da cliente) em duas peças com fundo transparente:
noel.png (Papai Noel + trenó + rédeas) e rena.png, no MESMO quadro, para sobrepor alinhadas."""
from collections import deque
from PIL import Image

TINTA = (46, 32, 32)
im = Image.open("original.webp").convert("L")
w, h = im.size
px = im.load()
escuro = bytearray(1 if px[x, y] < 140 else 0 for y in range(h) for x in range(w))
# corta a rédea onde encosta no peito da rena
for y in range(580, 640):
    for x in range(749, 752):
        escuro[y * w + x] = 0

def regiao(sx, sy):
    vis = bytearray(w * h); q = deque([(sx, sy)]); vis[sy * w + sx] = 1
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                i = ny * w + nx
                if escuro[i] and not vis[i]:
                    vis[i] = 1; q.append((nx, ny))
    return vis

rena = regiao(950, 600)
assert not rena[700 * w + 300], "a rena ainda encosta no trenó"
x0, y0, x1, y1 = 100, 310, 1155, 940  # quadro comum das duas peças
for nome, cond in (("rena", lambda i: rena[i]), ("noel", lambda i: escuro[i] and not rena[i])):
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    o = out.load()
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if cond(i):
                o[x, y] = TINTA + (255 - px[x, y] if px[x, y] > 60 else 255,)
    out = out.crop((x0, y0, x1, y1))
    out = out.resize((out.width // 3, out.height // 3), Image.LANCZOS)  # ~350 px: nítido no tamanho do site (2x)
    out.save(f"{nome}.png")
    print(nome, out.size)

# ---- Patas da rena em peças próprias (para galopar) -------------------------------
# Frente: abaixo de y=690 e à direita de x=1000 (ombro ~ (1075, 690)).
# Trás: à esquerda de x=815 e abaixo da linha da barriga (quadril ~ (770, 720)).
SOBRA = 14  # a pata leva uma faixa extra por baixo do corpo: ao girar, não abre emenda

def frente(x, y, folga=0):
    return x > 1000 and y > 690 - folga

def tras(x, y, folga=0):
    return x < 815 and y > 700 + 0.611 * (x - 720) - folga and y > 680 - folga

pecas = {
    "rena-corpo": lambda x, y: not frente(x, y) and not tras(x, y),
    "rena-frente": lambda x, y: frente(x, y, SOBRA),
    "rena-tras": lambda x, y: tras(x, y, SOBRA),
}
for nome, cond in pecas.items():
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    o = out.load()
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if rena[i] and cond(x, y):
                o[x, y] = TINTA + (255 - px[x, y] if px[x, y] > 60 else 255,)
    out = out.crop((x0, y0, x1, y1))
    out = out.resize((out.width // 3, out.height // 3), Image.LANCZOS)
    out.save(f"{nome}.png")
    print(nome, out.size)
# pivôs em % do quadro (para o CSS): ombro e quadril
qw, qh = x1 - x0, y1 - y0
print("pivô frente", round((1075 - x0) / qw * 100, 1), round((690 - y0) / qh * 100, 1))
print("pivô trás", round((770 - x0) / qw * 100, 1), round((720 - y0) / qh * 100, 1))
