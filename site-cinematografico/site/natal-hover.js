/* Sweet Feliz · Papai Noel no trenó (silhueta de autoria da Sweet Feliz) dando voltas
 * em torno de um produto do cardápio: a rena corre, o Papai Noel balança de leve guiando
 * e atrás dele vai aparecendo e sumindo um rastro de estrelas.
 *  - Computador: ao passar o mouse (ou focar com o teclado), voltas enquanto o mouse estiver lá.
 *  - Celular: quando o produto aparece bem na tela, UMA volta (cada produto uma vez por visita).
 * Desligado com "reduzir movimento". */
(() => {
  const grade = document.getElementById('grade');
  if (!grade) return;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
  const mouseFino = matchMedia('(hover: hover) and (pointer: fine)');

  const RAIO = 22;
  // computador × celular: distância da borda, velocidade (px/s) e largura da figura (px)
  const AJUSTE = { mouse: { pad: 14, vel: 360, larg: 105 }, toque: { pad: -6, vel: 450, larg: 74 } }; // celular: rente à borda do card (a margem da tela é estreita)
  let PAD = 14, VELOCIDADE = 260, LARGURA = 105;

  // Camada única que "pula" para o card ativo. As duas peças têm o mesmo quadro e ficam sobrepostas.
  const camada = document.createElement('div');
  camada.className = 'noel-camada';
  camada.setAttribute('aria-hidden', 'true');
  camada.innerHTML = `
    <div class="noel-rastro"></div>
    <div class="noel-veiculo">
      <div class="noel-figura">
        <img class="noel-peca noel-treno" src="assets/natal/noel.png" alt="" width="351" height="210">
        <div class="noel-peca noel-rena">
          <img class="noel-peca rena-tras" src="assets/natal/rena-tras.png" alt="" width="351" height="210">
          <img class="noel-peca rena-frente" src="assets/natal/rena-frente.png" alt="" width="351" height="210">
          <img class="noel-peca" src="assets/natal/rena-corpo.png" alt="" width="351" height="210">
        </div>
      </div>
    </div>`;
  const rastro = camada.querySelector('.noel-rastro');
  const veiculo = camada.querySelector('.noel-veiculo');
  const figura = camada.querySelector('.noel-figura');

  let alvo = null, w = 0, h = 0, s = 0, ultimo = 0, raf = 0, ultimaEstrela = 0, umaVolta = false;

  // ponto e direção (graus) ao longo do retângulo arredondado em volta do card, sentido horário
  function ponto(dist) {
    const W = w + 2 * PAD, H = h + 2 * PAD, r = Math.min(RAIO + PAD, W / 2, H / 2);
    const ox = -PAD, oy = -PAD;
    const reto1 = W - 2 * r, reto2 = H - 2 * r, arco = Math.PI * r / 2;
    const segs = [reto1, arco, reto2, arco, reto1, arco, reto2, arco];
    const total = segs.reduce((a, b) => a + b, 0);
    let d = ((dist % total) + total) % total;
    let i = 0;
    while (d > segs[i]) { d -= segs[i]; i++; }
    const cantos = [[ox + W - r, oy + r], [ox + W - r, oy + H - r], [ox + r, oy + H - r], [ox + r, oy + r]];
    switch (i) {
      case 0: return [ox + r + d, oy, 0, total];
      case 2: return [ox + W, oy + r + d, 90, total];
      case 4: return [ox + W - r - d, oy + H, 180, total];
      case 6: return [ox, oy + H - r - d, 270, total];
      default: {
        const k = (i - 1) / 2, c = cantos[k], a0 = [-90, 0, 90, 180][k];
        const a = (a0 + (d / arco) * 90) * Math.PI / 180;
        return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), a0 + 90 + (d / arco) * 90, total];
      }
    }
  }

  // estrela que nasce atrás do trenó, brilha e some
  function estrela(x, y, ang) {
    if (rastro.childElementCount > 60) return;
    const e = document.createElement('i');
    const rad = ang * Math.PI / 180;
    const atras = LARGURA * 0.46 + Math.random() * 18;
    const lado = (Math.random() - 0.5) * 20;
    e.style.left = (x - Math.cos(rad) * atras - Math.sin(rad) * lado) + 'px';
    e.style.top = (y - Math.sin(rad) * atras + Math.cos(rad) * lado) + 'px';
    e.style.setProperty('--tam', (5 + Math.random() * 8).toFixed(1) + 'px');
    e.style.setProperty('--gira', (Math.random() * 90 | 0) + 'deg');
    e.addEventListener('animationend', () => e.remove());
    rastro.appendChild(e);
  }

  function quadro(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000 || 0);
    ultimo = t;
    s += VELOCIDADE * dt;
    const [x, y, ang, total] = ponto(s);
    if (umaVolta && s >= total) { desativar(false); return; } // celular: termina a volta e some
    // indo para a esquerda: espelha para o Papai Noel não ficar de cabeça para baixo
    const vira = Math.cos(ang * Math.PI / 180) < -0.01 ? ' scaleY(-1)' : '';
    veiculo.style.transform = `translate(${x}px, ${y}px) rotate(${ang}deg)${vira}`;
    if (t - ultimaEstrela > 40) { estrela(x, y, ang); ultimaEstrela = t; }
    raf = requestAnimationFrame(quadro);
  }

  function ativar(card, volta1 = false) {
    if (reduzir.matches || card === alvo) return;
    desativar(true);
    alvo = card;
    umaVolta = volta1;
    ({ pad: PAD, vel: VELOCIDADE, larg: LARGURA } = mouseFino.matches ? AJUSTE.mouse : AJUSTE.toque);
    figura.style.setProperty('--larg', LARGURA + 'px');
    w = card.offsetWidth; h = card.offsetHeight;
    card.classList.add('noel-ativo');
    card.appendChild(camada);
    s = 0; ultimo = performance.now();
    camada.classList.remove('saindo');
    void camada.offsetWidth;
    camada.classList.add('ativa');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(quadro);
  }

  function desativar(imediato) {
    if (!alvo) return;
    alvo.classList.remove('noel-ativo');
    alvo = null;
    camada.classList.remove('ativa');
    if (imediato) { cancelAnimationFrame(raf); rastro.textContent = ''; return; }
    camada.classList.add('saindo');
    setTimeout(() => { if (!alvo) { cancelAnimationFrame(raf); rastro.textContent = ''; camada.remove(); } }, 400);
    if (!mouseFino.matches) setTimeout(proximo, 700); // celular: segue para o próximo produto visível
  }

  grade.addEventListener('pointerover', (e) => {
    if (!mouseFino.matches) return;
    const card = e.target.closest('.card');
    if (card) ativar(card);
  });
  grade.addEventListener('pointerleave', () => { if (mouseFino.matches) desativar(false); });
  grade.addEventListener('pointerout', (e) => {
    if (!alvo || !mouseFino.matches) return;
    const para = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.card');
    if (para !== alvo && !alvo.contains(e.relatedTarget)) desativar(false);
  });
  grade.addEventListener('focusin', (e) => {
    const card = e.target.closest('.card');
    if (card && e.target.matches(':focus-visible')) ativar(card);
  });
  grade.addEventListener('focusout', () => desativar(false));
  addEventListener('resize', () => { if (alvo) { w = alvo.offsetWidth; h = alvo.offsetHeight; } });
  /* ── Celular: uma volta quando o produto aparece bem na tela ───────────────── */
  const jaVisto = new WeakSet();   // produtos que já ganharam a volta nesta visita
  const proporcao = new Map();     // quanto de cada produto está na tela agora
  // escolhe o produto mais visível que ainda não ganhou a volta
  function proximo() {
    if (alvo || mouseFino.matches || reduzir.matches || document.querySelector('dialog[open]')) return;
    let melhor = null, maior = 0;
    for (const [card, r] of proporcao) {
      if (card.isConnected && !jaVisto.has(card) && r >= 0.75 && r > maior) { melhor = card; maior = r; }
    }
    if (melhor) { jaVisto.add(melhor); ativar(melhor, true); }
  }
  const vigia = new IntersectionObserver((entradas) => {
    if (mouseFino.matches || reduzir.matches) return;
    for (const e of entradas) {
      proporcao.set(e.target, e.intersectionRatio);
      // saiu da tela no meio da volta (rolagem rápida): para, e o produto pode ganhar a volta depois
      if (e.target === alvo && e.intersectionRatio < 0.3) { jaVisto.delete(e.target); desativar(false); }
    }
    proximo();
  }, { threshold: [0, 0.3, 0.75, 1] });
  const vigiarCards = () => grade.querySelectorAll('.card').forEach((c) => vigia.observe(c));
  vigiarCards();

  // o filtro troca os cards: some junto e passa a vigiar os novos
  new MutationObserver(() => {
    if (alvo && !alvo.isConnected) desativar(true);
    vigiarCards();
  }).observe(grade, { childList: true });
})();
