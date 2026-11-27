(() => {
  const S = window.SITE || {};
  const raiz = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqCelular = matchMedia("(max-width: 760px)");
  const pronto = () => raiz.classList.add("pronto");
  setTimeout(pronto, 6500); // nunca deixa a pessoa presa no carregador

  /* ── Rolagem macia (Lenis). Desligue com rolagemSuave: false no config.js ─── */
  // Só no computador com mouse: no celular a rolagem é nativa e o script nem é baixado.
  let lenis = null;
  if (S.rolagemSuave !== false && !reduzir && !mqCelular.matches && matchMedia("(pointer: fine)").matches) {
    const s = document.createElement("script");
    s.src = "vendor/lenis.min.js";
    s.onload = () => {
      const topoAltura = () => (document.querySelector(".topo") || {}).offsetHeight || 0;
      lenis = new window.Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: -topoAltura() } });
    };
    document.head.appendChild(s);
  }

  /* ── Formato dos frames: AVIF se o navegador suportar, senão o próximo da lista ── */
  const suportaAvif = () => new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img.width > 0);
    img.onerror = () => ok(false);
    img.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  });
  const escolherFormato = async () => {
    const lista = (S.frames && S.frames.formatos) || ["webp"];
    for (const f of lista) if (f !== "avif" || (await suportaAvif())) return f;
    return lista[lista.length - 1];
  };

  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    escolherFormato().then((formato) => iniciarCine(formato));
  } else pronto();

  function iniciarCine(formato) {
    const ctx = canvas.getContext("2d", { alpha: false });
    const total = S.frames.total;
    const barraCarga = document.querySelector(".carregador-barra");
    const barraProg = cine.querySelector(".cine-progresso");
    const momentos = [...cine.querySelectorAll(".momento")];
    let padrao = mqCelular.matches ? S.frames.mobile : S.frames.desktop;
    const src = (i) => `${padrao.replace("{n}", String(i + 1).padStart(4, "0"))}.${formato}`;
    let quadros = new Array(total);
    let alvo = 0, atual = 0, desenhado = -1;

    // Ordem de carga em passadas (1 a cada 8, depois 4, 2, 1): o filme inteiro fica "rolável" cedo
    const fila = [];
    { const visto = new Set();
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!visto.has(i)) { visto.add(i); fila.push(i); } }
    const essenciais = Math.ceil(total / 8) + 1; // 1ª passada: com ela o site já pode abrir
    let carregados = 0, geracao = 0;

    const aoCarregar = (i, minha) => {
      if (minha !== geracao) return;
      carregados++;
      if (barraCarga) barraCarga.style.setProperty("--carga", Math.min(1, carregados / essenciais).toFixed(3));
      if (carregados >= essenciais) pronto();
      if (desenhado === -1 || Math.abs(Math.round(atual) - i) < Math.abs(Math.round(atual) - desenhado)) desenhar(Math.round(atual), true);
    };
    const carregar = (i, minha) => {
      if (quadros[i]) return;
      const img = new Image();
      img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      img.src = src(i);
      img.decode().then(() => aoCarregar(i, minha), () => aoCarregar(i, minha));
      quadros[i] = img;
    };
    const carregarTudo = () => {
      const minha = ++geracao;
      carregados = 0;
      carregar(0, minha);
      if (reduzir) { pronto(); return; }
      let k = 0;
      // Os quadros extras (só deixam o movimento mais liso) esperam o 1º gesto ou 8 s:
      // assim não disputam o processador com o carregamento da página no celular.
      let liberado = false;
      const esperarUso = (seguir) => {
        const eventos = ["scroll", "touchstart", "pointerdown", "keydown", "wheel"];
        let feito = false;
        const ir = () => {
          if (feito) return;
          feito = liberado = true;
          eventos.forEach((ev) => removeEventListener(ev, ir));
          seguir();
        };
        eventos.forEach((ev) => addEventListener(ev, ir, { passive: true, once: true }));
        setTimeout(ir, 8000);
      };
      const ocioso = window.requestIdleCallback ? (f) => requestIdleCallback(f, { timeout: 500 }) : (f) => setTimeout(f, 120);
      const lote = () => {
        if (minha !== geracao) return; // trocou de conjunto (girou o tablet/redimensionou)
        const primeira = k < essenciais; // 1ª passada (1 a cada 8): libera a abertura rápido
        for (let n = 0; n < (primeira ? 6 : 3) && k < fila.length; n++) carregar(fila[k++], minha);
        if (k >= fila.length) return;
        if (k < essenciais) setTimeout(lote, 30);
        else if (!liberado) esperarUso(() => ocioso(lote)); // o resto só depois que a pessoa começa a rolar
        else ocioso(lote); // em pedaços pequenos, sem travar o celular
      };
      lote();
    };

    const temQuadro = (i) => i >= 0 && i < total && quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (temQuadro(i - d)) return i - d;
        if (temQuadro(i + d)) return i + d;
      }
      return -1;
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      if (!cw || !ch) return;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    // Tamanho do canvas: acompanha o palco (100svh não muda quando a barra do celular aparece)
    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(Math.round(canvas.clientWidth * dpr), 2560);
      const h = Math.round(w * canvas.clientHeight / Math.max(1, canvas.clientWidth));
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w; canvas.height = h;
      ctx.imageSmoothingQuality = "high";
      desenhar(Math.round(atual), true);
    };
    new ResizeObserver(ajustar).observe(canvas);

    mqCelular.addEventListener("change", (e) => {
      padrao = e.matches ? S.frames.mobile : S.frames.desktop;
      quadros = new Array(total);
      desenhado = -1;
      carregarTudo();
    });

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };
    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
      cine.classList.toggle("fim", p > 0.995);
      if (barraProg) barraProg.style.setProperty("--p", p.toFixed(4));
    };

    // O laço só roda enquanto a abertura está na tela (economiza bateria no resto da página)
    let rodando = false, naTela = true;
    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * (lenis ? 0.35 : 0.18); // com Lenis a rolagem já vem suavizada
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      if (naTela || atual !== alvo) requestAnimationFrame(quadro);
      else rodando = false;
    };
    const iniciar = () => { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } };

    carregarTudo();
    ajustar();
    if (reduzir) atualizarMomentos(0);
    else {
      new IntersectionObserver(([e]) => { naTela = e.isIntersecting; if (naTela) iniciar(); }).observe(cine);
      iniciar();
    }
  }

  /* ── Parallax leve nas artes (um único quadro de animação por rolagem) ──────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    let pedido = false;
    const mover = () => {
      pedido = false;
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.setProperty("--y", `${(c * -60).toFixed(1)}px`);
      }
    };
    addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }

  /* ── Topo: fundo ao rolar, some ao descer e volta ao subir ─────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  const menu = document.querySelector(".menu");
  const menuBotao = document.querySelector(".menu-botao");
  let formNaTela = false, ultimoY = scrollY;
  const aoRolar = () => {
    const y = scrollY;
    if (topo) {
      topo.classList.toggle("rolou", y > 40);
      const descendo = y > ultimoY + 4, subindo = y < ultimoY - 4;
      const menuAberto = menu && menu.classList.contains("aberto");
      if (descendo && y > innerHeight * 1.2 && !menuAberto) topo.classList.add("escondido");
      else if (subindo || y < innerHeight) topo.classList.remove("escondido");
    }
    ultimoY = y;
    whats && whats.classList.toggle("visivel", y > innerHeight * 0.6 && !formNaTela);
  };
  const formEl = document.querySelector(".form");
  if (formEl) new IntersectionObserver(([e]) => { formNaTela = e.isIntersecting; aoRolar(); }).observe(formEl);
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ── Menu do celular ─────────────────────────────────────────────────────── */
  if (menu && menuBotao) {
    const abrir = (sim) => {
      menu.classList.toggle("aberto", sim);
      menuBotao.setAttribute("aria-expanded", String(sim));
      menuBotao.setAttribute("aria-label", sim ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = sim ? "hidden" : "";
      if (lenis) sim ? lenis.stop() : lenis.start();
    };
    menuBotao.addEventListener("click", () => abrir(!menu.classList.contains("aberto")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) abrir(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("aberto")) { abrir(false); menuBotao.focus(); } });
    mqCelular.addEventListener("change", () => abrir(false));
  }

  /* ── Seção ativa no menu ─────────────────────────────────────────────────── */
  const linksMenu = menu ? [...menu.querySelectorAll('a[href^="#"]')] : [];
  const alvos = linksMenu.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (alvos.length) {
    const marcar = (id) => linksMenu.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${id}`)));
    const ioSecao = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) marcar(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" });
    alvos.forEach((s) => ioSecao.observe(s));
  }

  /* ── Revelar ao rolar: só quando o CSS moderno (scroll-driven) não existe ──── */
  if (!CSS.supports("animation-timeline: view()")) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  }
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── WhatsApp ────────────────────────────────────────────────────────────── */
  if (whats && S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
  }

  /* ── Formulário → e-mail ─────────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    // Máscara leve de telefone brasileiro: (11) 99999-9999
    const tel = form.elements.telefone;
    if (tel) tel.addEventListener("input", () => {
      const d = tel.value.replace(/\D/g, "").slice(0, 11);
      tel.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, "($1) $2") : d;
    });

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "checkbox" ? c.checked
          : c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value)
          : c.type === "tel" ? c.value.replace(/\D/g, "").length >= 10
          : c.value.trim().length > 1;
        c.closest(".campo").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar("Confira os campos destacados.", "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;
      const assunto = S.contato.assunto || `Novo contato pelo site ${S.nome || ""}`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        // O código do FormSubmit (recebido por e-mail após a ativação) esconde o endereço real
        const destino = S.contato.formsubmitCodigo || S.contato.email;
        url = `https://formsubmit.co/ajax/${encodeURIComponent(destino)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar("Enviando…");
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar("Recebemos seu contato. Em breve falamos com você.", "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar("Não foi possível enviar agora. Chame a gente no WhatsApp.", "falha");
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
