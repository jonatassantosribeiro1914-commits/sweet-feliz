window.SITE = {
  nome: "Sweet Feliz",

  // Endereço final do site, sem barra no fim (ex.: https://sweetfeliz.com.br).
  // Deixe vazio enquanto não houver domínio; preencha antes de publicar.
  url: "https://jonatassantosribeiro1914-commits.github.io/sweet-feliz",

  whatsapp: {
    numero: "5511979538491", // só dígitos, com código do país
    mensagem: "Olá, Sweet Feliz! Vim pelo site e quero saber mais sobre as encomendas.",
  },

  // Sem formulário: os pedidos vão pelo WhatsApp (sacolinha do cardápio).
  contato: null,

  // Linha impressa pelo fatiar_frames.py.
  frames: { total: 160, formatos: ["webp"], desktop: "assets/frames/desktop/f_{n}", mobile: "assets/frames/mobile/f_{n}" },

  // Rolagem macia (Lenis) no computador. false = rolagem nativa do navegador.
  rolagemSuave: true,
};
