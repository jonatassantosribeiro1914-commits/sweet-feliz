window.SITE = {
  nome: "Sweet Feliz",

  // Endereço final do site, sem barra no fim (ex.: https://sweetfeliz.com.br).
  // Deixe vazio enquanto não houver domínio; preencha antes de publicar.
  url: "https://sweet-feliz.vercel.app",

  whatsapp: {
    numero: "5511979538491", // só dígitos, com código do país
    mensagem: "Olá, Sweet Feliz! Vim pelo site e quero saber mais sobre as encomendas.",
  },

  // Rolagem macia (Lenis) no computador. false = rolagem nativa do navegador.
  rolagemSuave: true,

  // Encomendas de Natal: prazo final (horário de Brasília) e limite de horário de cada dia de retirada.
  // Para o próximo Natal, troque o ano/datas aqui (e os textos do cardápio).
  encomendas: {
    prazo: "2026-12-18T23:59:59-03:00",
    retiradaAte: { "23/12 (até 22h)": "22:00", "24/12 (até 12h)": "12:00" },
  },
};
