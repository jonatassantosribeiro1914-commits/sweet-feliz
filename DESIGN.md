# Sweet Feliz — Design system

Direção: **confeitaria de bairro, carinhosa e artesanal** — tirada da logo (creme com corações, fatia de bolo rosa, script preto, arco turquesa, borda ondulada cinza). Natal entra só como tempero: dourado e estrelinhas. Sem gradientes roxos, sem vidro, sem emoji como ícone.

## Cor
| Token | Valor | Papel |
|---|---|---|
| `--creme` | `#FDF1E8` | Fundo da página |
| `--creme-2` | `#F8E4D6` | Fundo de seções alternadas, coraçõezinhos do padrão |
| `--branco` | `#FFFDFB` | Fundo de cards, modal e gaveta |
| `--tinta` | `#1E1E1E` | Texto principal e títulos script |
| `--cinza` | `#5E5E5E` | Texto secundário, bordas onduladas |
| `--linha` | `#EBD6C8` | Bordas finas e divisórias |
| `--rosa` | `#C2405F` | **Primária**: botões, links, preços (branco sobre ela 5,2:1) |
| `--rosa-escuro` | `#A3324E` | Hover da primária |
| `--rosa-claro` | `#F7B8C4` | Pílulas, fundos de destaque, coração |
| `--morango` | `#F06A8A` | Ilustração/decoração apenas (não usar para texto) |
| `--turquesa` | `#6CC3C1` | Acento: arcos, chips ativos (fundo), selo |
| `--turquesa-texto` | `#2B7674` | Texto em turquesa (rótulos espaçados) |
| `--ouro` | `#D9A441` | Só detalhes natalinos: estrelas, flocos |
| `--ok` / `--erro` | `#2F8F5B` / `#B3261E` | Feedback |

Sem modo escuro (é um catálogo de marca de fundo creme).

## Tipografia
- **Script (títulos, nomes de doces):** `Dancing Script` 600/700 — próxima do "Sweet Feliz" da logo.
- **Texto e interface:** `Quicksand` 500/600/700 — arredondada, combina com o traço da ilustração.
- **Rótulos:** Quicksand 700, CAIXA ALTA, `letter-spacing: .22em`, cor `--turquesa-texto` — eco de "BOLOS ARTESANAIS".

Escala (px / line-height): 12/1.4 rótulo · 14/1.5 · 16/1.6 corpo · 20/1.4 · 26/1.2 nome do doce (script) · 34/1.1 · 48/1.05 · 64/1 título da capa (script). Corpo nunca abaixo de 16px.

## Espaço
Escala de 4: 4, 8, 12, 16, 24, 32, 48, 64, 96. Seções: 64px mobile / 96px desktop. Largura do conteúdo: 1120px; textos corridos até 62ch.

## Forma e profundidade
- Raio: 10px (inputs, chips), 20px (cards, modal), 999px (pílulas, botões).
- Foto do card em **arco** (topo arredondado `border-radius: 999px 999px 20px 20px`), como no PDF.
- Borda ondulada (máscara SVG de semicírculos) no topo/rodapé de seções, em `--cinza` claro — eco do arco da logo.
- Sombra única: `0 10px 30px -12px rgba(120, 60, 40, .25)`; ao levantar: `0 18px 40px -14px rgba(120, 60, 40, .32)`.

## Componentes
- **Botão primário:** fundo `--rosa`, texto branco, pílula, 48px de altura; hover `--rosa-escuro`; foco anel 3px `--turquesa`; desabilitado 45% de opacidade.
- **Botão secundário:** borda 2px `--rosa`, texto `--rosa`, fundo transparente.
- **Botão discreto:** só texto `--tinta`, sublinhado no hover.
- **Chip de filtro:** borda `--linha`; ativo = fundo `--turquesa`, texto `--tinta`.
- **Card de doce:** fundo `--branco`, raio 20, foto em arco, nome em script, descrição curta 2 linhas, preço em pílula `--rosa-claro` com texto `--rosa-escuro`. Flutua (translateY ±6px, 6s, defasado); desliga com `prefers-reduced-motion`.
- **Modal:** folha que sobe de baixo no celular, centralizada no desktop; fundo escurecido `rgba(30,30,30,.45)`.
- **Sacolinha:** botão redondo fixo canto inferior direito, `--rosa`, contador em `--ouro`; abre gaveta lateral.
- **Inputs:** fundo `--branco`, borda `--linha`, raio 10, foco borda `--turquesa`.

## Imagem e ícones
- Fotos reais dos doces (do catálogo), sempre em arco ou círculo, nunca com filtro.
- Ícones: SVG de traço 2px, cantos arredondados, desenhados inline (sacola, calendário, coração, relógio, cartão). Sem emoji na interface.
- Decoração natalina: estrelas de 4 pontas e flocos em `--ouro`, pequenos e esparsos.
