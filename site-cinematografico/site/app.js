(() => {
  const S = window.SITE || {};
  const raiz = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqCelular = matchMedia("(max-width: 760px)");
  const pronto = () => raiz.classList.add("pronto");

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

  /* A abertura é o desenho em traço (abertura-traco.js): a tela de entrada pode sair já. */
  pronto();

  /* ── Parallax leve nas artes (um único quadro de animação por rolagem) ──────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    let pedido = false;
    const mover = () => {
      pedido = false;
      const caixas = artes.map((a) => a.parentElement.getBoundingClientRect()); // 1º só leituras…
      artes.forEach((a, k) => {                                                  // …depois só escritas
        const r = caixas[k];
        if (r.bottom < 0 || r.top > innerHeight) return;
        a.style.setProperty("--y", `${((r.top + r.height / 2 - innerHeight / 2) / innerHeight * -60).toFixed(1)}px`);
      });
    };
    addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }

  /* ── Topo: fundo ao rolar, some ao descer e volta ao subir ─────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  const menu = document.querySelector(".menu");
  const menuBotao = document.querySelector(".menu-botao");
  let ultimoY = scrollY;
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
    whats && whats.classList.toggle("visivel", y > innerHeight * 0.6);
  };
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
})();
