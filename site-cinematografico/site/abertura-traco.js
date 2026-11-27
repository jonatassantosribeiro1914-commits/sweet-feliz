/* Sweet Feliz · Abertura em traço: ao rolar, uma linha fina desenha o bolo e escreve
 * "Sweet Feliz"; no final entram as cores (rosa antigo e dourado) e os brilhos.
 * Cada elemento tem a sua janela na rolagem (data-de / data-ate, de 0 a 1).
 * Também cuida dos 3 textos da abertura, da barrinha de progresso e da dica "role". */
(() => {
  const cine = document.querySelector('.cine');
  const svg = cine && cine.querySelector('.desenho');
  if (!svg) return;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animados = [...svg.querySelectorAll('[data-de]')].map((el) => ({
    el, de: parseFloat(el.dataset.de), ate: parseFloat(el.dataset.ate),
  }));
  const escrita = svg.querySelector('#escrita-rect');
  const ESCRITA = { de: 0.30, ate: 0.80, x0: 80, x1: 520 }; // o nome é escrito da esquerda para a direita
  const momentos = [...cine.querySelectorAll('.momento')];
  const barra = cine.querySelector('.cine-progresso');

  const limitar = (v) => Math.min(1, Math.max(0, v));
  const suave = (v) => v * v * (3 - 2 * v);

  function pintar(p) {
    for (const a of animados) a.el.style.setProperty('--t', suave(limitar((p - a.de) / (a.ate - a.de))).toFixed(4));
    const e = limitar((p - ESCRITA.de) / (ESCRITA.ate - ESCRITA.de));
    escrita.setAttribute('x', ESCRITA.x0);
    escrita.setAttribute('width', ((ESCRITA.x1 - ESCRITA.x0) * e).toFixed(1));
    for (const m of momentos) {
      const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
      m.classList.toggle('ativo', p >= de && (p < ate || (ate >= 1 && p >= 1)));
    }
    cine.classList.toggle('andou', p > 0.02);
    cine.classList.toggle('fim', p > 0.995);
    if (barra) barra.style.setProperty('--p', p.toFixed(4));
  }

  if (reduzir) { pintar(1); momentos.forEach((m, i) => m.classList.toggle('ativo', i === 0)); return; }

  const progresso = () => {
    const r = cine.getBoundingClientRect();
    const curso = cine.offsetHeight - innerHeight;
    return limitar(-r.top / (curso || 1));
  };

  // acompanha a rolagem com uma leve suavização (o traço "corre atrás" do dedo)
  let atual = progresso(), pedido = 0;
  const quadro = () => {
    const alvo = progresso();
    atual += (alvo - atual) * 0.22;
    if (Math.abs(alvo - atual) < 0.0008) atual = alvo;
    pintar(atual);
    pedido = atual !== alvo ? requestAnimationFrame(quadro) : 0;
  };
  const acordar = () => { if (!pedido) pedido = requestAnimationFrame(quadro); };
  addEventListener('scroll', acordar, { passive: true });
  addEventListener('resize', acordar);
  pintar(atual);
})();
