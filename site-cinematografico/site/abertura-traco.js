/* Sweet Feliz · Abertura em traço, tocando sozinha como um vídeo: ao entrar na página,
 * uma linha fina desenha o bolo e escreve "Sweet Feliz"; no final entram as cores
 * (rosa antigo e dourado) e os brilhos. Sem textos durante a animação; no fim aparece
 * só o botão "Ver o cardápio" (classe .fim na abertura).
 * Cada elemento do desenho tem a sua janela no tempo (data-de / data-ate, de 0 a 1). */
(() => {
  const cine = document.querySelector('.cine');
  const svg = cine && cine.querySelector('.desenho');
  if (!svg) return;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DURACAO = 3500;   // ms do "vídeo" inteiro
  const ESPERA = 150;     // ms depois que a tela de entrada some

  const animados = [...svg.querySelectorAll('[data-de]')].map((el) => ({
    el, de: parseFloat(el.dataset.de), ate: parseFloat(el.dataset.ate), ultimo: '',
  }));
  const escrita = svg.querySelector('#escrita-rect');
  const ESCRITA = { de: 0.30, ate: 0.80, x0: 80, x1: 520 }; // o nome é escrito da esquerda para a direita
  const barra = cine.querySelector('.cine-progresso');

  const limitar = (v) => Math.min(1, Math.max(0, v));
  const suave = (v) => v * v * (3 - 2 * v);

  escrita.setAttribute('x', ESCRITA.x0);
  function pintar(p) {
    // só escreve quando o valor muda: traços que ainda não começaram ou já terminaram ficam quietos
    for (const a of animados) {
      const t = suave(limitar((p - a.de) / (a.ate - a.de))).toFixed(4);
      if (t !== a.ultimo) { a.el.style.setProperty('--t', t); a.ultimo = t; }
    }
    const e = limitar((p - ESCRITA.de) / (ESCRITA.ate - ESCRITA.de));
    escrita.setAttribute('width', ((ESCRITA.x1 - ESCRITA.x0) * e).toFixed(1));
    cine.classList.toggle('fim', p >= 1);
    if (barra) barra.style.setProperty('--p', p.toFixed(4));
  }

  if (reduzir) { pintar(1); return; }
  pintar(0);

  // Relógio próprio: soma o tempo quadro a quadro (com limite), então se a aba ficar
  // em segundo plano o "vídeo" pausa e continua de onde parou, sem pular para o fim.
  let decorrido = 0, anterior = 0;
  const quadro = (t) => {
    decorrido += Math.min(50, anterior ? t - anterior : 0);
    anterior = t;
    const p = limitar(decorrido / DURACAO);
    pintar(p);
    if (p < 1) requestAnimationFrame(quadro);
  };

  // Começa quando a tela de entrada sai e a letra do nome já carregou
  const raiz = document.documentElement;
  let iniciado = false;
  const comecar = () => {
    if (iniciado) return;
    iniciado = true;
    const fontes = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontes, new Promise((r) => setTimeout(r, 800))])
      .then(() => setTimeout(() => requestAnimationFrame(quadro), ESPERA));
  };
  if (raiz.classList.contains('pronto')) comecar();
  else {
    const vigia = new MutationObserver(() => {
      if (raiz.classList.contains('pronto')) { vigia.disconnect(); comecar(); }
    });
    vigia.observe(raiz, { attributes: true, attributeFilter: ['class'] });
    setTimeout(() => { vigia.disconnect(); comecar(); }, 7000);
  }
})();
