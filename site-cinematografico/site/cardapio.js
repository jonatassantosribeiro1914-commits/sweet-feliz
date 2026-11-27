/* Sweet Feliz — Cardápio de Natal (seção do site cinematográfico)
 * O número do WhatsApp vem do config.js (SITE.whatsapp.numero).
 */
const WHATSAPP_NUMBER = String((window.SITE && window.SITE.whatsapp && window.SITE.whatsapp.numero) || '5511979538491').replace(/\D/g, '');
const WHATSAPP_LINK_CURTO = 'https://wa.me/message/5YUTZFNBVAWVB1';

const PRODUTOS = [
  { id: 'maracuja-trufado', cat: 'travessas', nome: 'Maracujá Trufado', preco: 90,
    desc: 'Mousse delicioso de maracujá com ganache cremosa de chocolate.' },
  { id: 'torta-de-limao', cat: 'travessas', nome: 'Torta de Limão', preco: 90,
    desc: 'Base crocante de biscoito, mousse cremoso de limão, chantininho e raspas de limão.' },
  { id: 'travessa-felicidade-morango', cat: 'travessas', nome: 'Travessa da Felicidade de Morango', preco: 135,
    desc: 'Morangos, brownie, creme de Ninho e ganache cremosa de brigadeiro.' },
  { id: 'suprema-brownie-morango', cat: 'travessas', nome: 'Suprema de Brownie com Morango', preco: 145,
    desc: 'Brownie, morangos, brigadeiro de chocolate e de Ninho, chantininho e suspiro.' },
  { id: 'guirlanda-de-brownie', cat: 'travessas', nome: 'Guirlanda de Brownie', preco: 125,
    desc: 'Brownie com cobertura de Ninho, finalizado com brigadeiros de chocolate, Ninho com Nutella e morangos frescos.' },
  { id: 'bombom-de-morango', cat: 'travessas', nome: 'Bombom de Morango', preco: 120,
    desc: 'Brigadeiro branco cremoso, morangos frescos e ganache cremosa de chocolate.' },
  { id: 'bombom-de-uva', cat: 'travessas', nome: 'Bombom de Uva', preco: 120,
    desc: 'Brigadeiro branco cremoso, uvas frescas e ganache cremosa de chocolate.' },
  { id: 'pave', cat: 'travessas', nome: 'Pavê', preco: 95,
    desc: 'Camadas de creme branco delicioso, bolacha maisena e ganache de chocolate.',
    extra: { rotulo: 'Com bolacha champanhe', preco: 10 } },
  { id: 'pudim-tradicional', cat: 'travessas', nome: 'Pudim Tradicional', preco: 70,
    desc: 'Pudim cremoso e irresistível, com uma deliciosa calda de caramelo.' },
  { id: 'taca-de-morango', cat: 'tacas', nome: 'Taça de Morango', preco: 150,
    desc: 'Brigadeiro branco cremoso, creme de Ninho, morangos frescos, brownie e ganache cremosa de chocolate.' },
  { id: 'taca-de-uva', cat: 'tacas', nome: 'Taça de Uva', preco: 150,
    desc: 'Brigadeiro branco cremoso, mousse de Ninho, brownie, uvas frescas e ganache cremosa de chocolate.' },
  { id: 'taca-de-maracuja', cat: 'tacas', nome: 'Taça de Maracujá', preco: 160,
    desc: 'Mousse de maracujá, brownie, ganache cremosa de chocolate e brigadeiros.' },
];

const BOLO = {
  id: 'bolo-natalino', cat: 'bolo', nome: 'Bolo Natalino',
  desc: 'Massa branca ou de chocolate, com o recheio que você escolher. O topo de Natal já está incluso.',
  fotos: ['bolo-natalino-1', 'bolo-natalino-2'],
  tamanhos: [
    { id: 'P', serve: '8 a 10 pessoas', preco: 130 },
    { id: 'M', serve: '15 a 20 pessoas', preco: 210 },
    { id: 'G', serve: '25 a 30 pessoas', preco: 280 },
  ],
  massas: ['Branca', 'Chocolate'],
  recheios: ['Prestígio', 'Dois amores', 'Brigadeiro', 'Ninho'],
};
const TOPOS = Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, '0'));

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const foto = (id) => `assets/cardapio/produtos/${id}.webp`;
const fotoTopo = (n) => `assets/cardapio/topos/topo-${n}.webp`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function avisar(msg) {
  const t = $('#toast');
  // diálogos modais ficam numa camada acima de tudo: o aviso vai junto
  const aberto = document.querySelector('dialog[open]');
  (aberto || document.body).appendChild(t);
  t.textContent = msg;
  t.classList.add('ver');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('ver'), 2600);
}

/* ---------- catálogo ---------- */
const grade = $('#grade');
let filtro = 'todas';

function cardProduto(p, i) {
  return `<li class="card" style="--i:${i}">
    <button class="card-botao" type="button" data-abrir="${p.id}">
      <img class="card-foto" src="${foto(p.id)}" alt="" loading="lazy" width="400" height="500">
      <span class="card-nome">${p.nome}</span>
      <span class="card-desc">${p.desc}</span>
      <span class="preco">${brl(p.preco)}</span>
    </button></li>`;
}
function cardBolo(i) {
  return `<li class="card card-destaque" style="--i:${i}">
    <button class="card-botao" type="button" data-abrir="bolo-natalino">
      <span class="card-fotos">${BOLO.fotos.map((f) => `<img class="card-foto" src="${foto(f)}" alt="" loading="lazy" width="400" height="500">`).join('')}</span>
      <span class="card-info">
        <span class="rotulo">Topo incluso</span>
        <span class="card-nome">${BOLO.nome}</span>
        <span class="card-desc">${BOLO.desc}</span>
        <span class="tamanhos">${BOLO.tamanhos.map((t) => `<span class="preco">${t.id} · ${brl(t.preco)}</span>`).join('')}</span>
      </span>
    </button></li>`;
}
function cardTopo(n, i) {
  return `<li class="card card-topo" style="--i:${i}">
    <button class="card-botao" type="button" data-abrir="bolo-natalino" data-topo="${n}">
      <img class="card-foto" src="${fotoTopo(n)}" alt="Topo de bolo de Natal nº ${Number(n)}" loading="lazy" width="320" height="320">
      <span class="card-nome">Topo nº ${Number(n)}</span>
    </button></li>`;
}

function render() {
  let html = '';
  let i = 0;
  const lista = (cat) => PRODUTOS.filter((p) => p.cat === cat).map((p) => cardProduto(p, i++)).join('');
  if (filtro === 'todas') html = cardBolo(i++) + lista('travessas') + lista('tacas');
  if (filtro === 'travessas' || filtro === 'tacas') html = lista(filtro);
  if (filtro === 'bolo') html = cardBolo(i++) + TOPOS.map((n) => cardTopo(n, i++)).join('');
  if (filtro === 'topos') html = TOPOS.map((n) => cardTopo(n, i++)).join('');
  grade.innerHTML = html;
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    filtro = chip.dataset.filtro;
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  });
});

/* ---------- modal ---------- */
const modal = $('#modal');
const corpo = $('#modal-corpo');
let gatilho = null;

grade.addEventListener('click', (e) => {
  const b = e.target.closest('[data-abrir]');
  if (!b) return;
  gatilho = b;
  b.dataset.abrir === 'bolo-natalino' ? abrirBolo(b.dataset.topo) : abrirProduto(b.dataset.abrir);
});
modal.addEventListener('close', () => gatilho && gatilho.focus());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

function controleQtd() {
  return `<div class="adicionar">
    <div class="qtd" role="group" aria-label="Quantidade">
      <button type="button" data-q="-1" aria-label="Diminuir">−</button>
      <output aria-live="polite">1</output>
      <button type="button" data-q="1" aria-label="Aumentar">+</button>
    </div>
    <button class="cbotao cbotao-primario" type="submit">Adicionar · <span data-total></span></button>
  </div>`;
}

function abrirProduto(id) {
  const p = PRODUTOS.find((x) => x.id === id);
  corpo.innerHTML = `
    <div class="modal-midia"><img src="${foto(p.id)}" alt="${p.nome}"></div>
    <form class="modal-info" id="form-item">
      <p class="rotulo">${p.cat === 'tacas' ? 'Taça' : 'Sobremesa de Natal'}</p>
      <h2 id="modal-titulo">${p.nome}</h2>
      <p>${p.desc}</p>
      <p class="modal-preco">${brl(p.preco)}</p>
      ${p.extra ? `<label class="check"><input type="checkbox" name="extra"> ${p.extra.rotulo} (+${brl(p.extra.preco)})</label>` : ''}
      ${controleQtd()}
    </form>`;
  ligarForm(() => {
    const f = $('#form-item');
    const extra = p.extra && f.extra.checked;
    return {
      chave: p.id + (extra ? '+extra' : ''),
      id: p.id, nome: p.nome, img: foto(p.id),
      det: extra ? p.extra.rotulo : '',
      preco: p.preco + (extra ? p.extra.preco : 0),
    };
  });
  modal.showModal();
}

function abrirBolo(topoInicial) {
  const pilulas = (nome, itens, marcar) => itens.map((it, k) => `
    <label class="opcao-pilula"><input type="radio" name="${nome}" value="${it.valor}" ${k === marcar ? 'checked' : ''} required>
    <span>${it.texto}</span></label>`).join('');
  corpo.innerHTML = `
    <div class="modal-midia"><div class="galeria-bolo"><img class="galeria-principal" src="${foto(BOLO.fotos[0])}" alt="Bolo natalino decorado, modelo 1" width="300" height="400"><div class="galeria-miniaturas" role="group" aria-label="Escolher foto">${BOLO.fotos.map((f, k) => `<button type="button" class="miniatura" data-foto="${foto(f)}" aria-label="Ver bolo modelo ${k + 1}" aria-pressed="${k === 0}"><img src="${foto(f)}" alt=""></button>`).join('')}</div></div></div>
    <form class="modal-info" id="form-item">
      <p class="rotulo">Topo incluso</p>
      <h2 id="modal-titulo">${BOLO.nome}</h2>
      <p>${BOLO.desc}</p>
      <fieldset class="grupo"><legend>Tamanho</legend><div class="opcoes">
        ${pilulas('tamanho', BOLO.tamanhos.map((t) => ({ valor: t.id, texto: `${t.id} · ${brl(t.preco)}<small>serve ${t.serve}</small>` })), 1)}
      </div></fieldset>
      <fieldset class="grupo"><legend>Massa</legend><div class="opcoes">
        ${pilulas('massa', BOLO.massas.map((m) => ({ valor: m, texto: m })), 0)}
      </div></fieldset>
      <fieldset class="grupo"><legend>Recheio</legend><div class="opcoes">
        ${pilulas('recheio', BOLO.recheios.map((r) => ({ valor: r, texto: r })), 0)}
      </div></fieldset>
      <fieldset class="grupo"><legend>Topo</legend><div class="topos-escolha">
        ${TOPOS.map((n) => `<label class="topo-op"><input type="radio" name="topo" value="${n}" ${n === (topoInicial || '01') ? 'checked' : ''} aria-label="Topo nº ${Number(n)}"><img src="${fotoTopo(n)}" alt="" loading="lazy"></label>`).join('')}
      </div></fieldset>
      ${controleQtd()}
    </form>`;
  ligarForm(() => {
    const f = $('#form-item');
    const t = BOLO.tamanhos.find((x) => x.id === f.tamanho.value);
    const topo = Number(f.topo.value);
    return {
      chave: ['bolo', t.id, f.massa.value, f.recheio.value, topo].join('|'),
      id: BOLO.id, nome: `Bolo Natalino ${t.id}`, img: foto(BOLO.fotos[0]),
      det: `Massa ${f.massa.value.toLowerCase()} · recheio ${f.recheio.value.toLowerCase()} · topo nº ${topo}`,
      preco: t.preco,
    };
  });
  modal.showModal();
  if (topoInicial) $('.topo-op input:checked', corpo).scrollIntoView({ block: 'nearest' });
  corpo.querySelectorAll('.miniatura').forEach((b, k) => b.addEventListener('click', () => {
    const principal = $('.galeria-principal', corpo);
    principal.src = b.dataset.foto;
    principal.alt = `Bolo natalino decorado, modelo ${k + 1}`;
    corpo.querySelectorAll('.miniatura').forEach((m) => m.setAttribute('aria-pressed', String(m === b)));
  }));
}

function ligarForm(montar) {
  const f = $('#form-item');
  let qtd = 1;
  const atualizar = () => {
    $('output', f).textContent = qtd;
    $('[data-total]', f).textContent = brl(montar().preco * qtd);
  };
  f.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    qtd = Math.max(1, Math.min(20, qtd + Number(b.dataset.q)));
    atualizar();
  });
  f.addEventListener('change', atualizar);
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    adicionar(montar(), qtd);
    modal.close();
    avisar('Adicionado à sacolinha');
    const sb = $('#abrir-sacola');
    sb.classList.remove('pulo'); void sb.offsetWidth; sb.classList.add('pulo');
  });
  atualizar();
}

/* ---------- sacolinha ---------- */
const CHAVE = 'sweetfeliz-sacola-natal';
let sacola = [];
try { sacola = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { sacola = []; }

const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch {} };
const totalItens = () => sacola.reduce((s, it) => s + it.qtd, 0);
const totalValor = () => sacola.reduce((s, it) => s + it.qtd * it.preco, 0);

function adicionar(item, qtd) {
  const ja = sacola.find((x) => x.chave === item.chave);
  ja ? (ja.qtd += qtd) : sacola.push({ ...item, qtd });
  salvar(); pintarSacola();
}

const gaveta = $('#gaveta');
$('#abrir-sacola').addEventListener('click', () => gaveta.showModal());
gaveta.addEventListener('click', (e) => {
  if (e.target === gaveta) return gaveta.close();
  const b = e.target.closest('[data-mudar]');
  if (!b) return;
  const it = sacola.find((x) => x.chave === b.dataset.chave);
  it.qtd += Number(b.dataset.mudar);
  if (it.qtd <= 0) sacola = sacola.filter((x) => x !== it);
  salvar(); pintarSacola();
});

function pintarSacola() {
  const n = totalItens();
  const cont = $('#contador');
  cont.hidden = n === 0;
  cont.textContent = n;
  $('#abrir-sacola').setAttribute('aria-label', `Abrir sacolinha, ${n} ${n === 1 ? 'item' : 'itens'}`);

  $('#itens').innerHTML = n === 0
    ? '<p class="vazia">Sua sacolinha está vazia.<br>Escolha uma delícia no cardápio.</p>'
    : sacola.map((it) => `
      <div class="item">
        <img src="${it.img}" alt="">
        <div><div class="item-nome">${esc(it.nome)}</div>${it.det ? `<div class="item-det">${esc(it.det)}</div>` : ''}</div>
        <div class="item-lado">
          <strong>${brl(it.preco * it.qtd)}</strong>
          <div class="item-qtd">
            <button type="button" data-mudar="-1" data-chave="${esc(it.chave)}" aria-label="Remover um ${esc(it.nome)}">−</button>
            <span>${it.qtd}</span>
            <button type="button" data-mudar="1" data-chave="${esc(it.chave)}" aria-label="Adicionar um ${esc(it.nome)}">+</button>
          </div>
        </div>
      </div>`).join('');

  const total = totalValor();
  $('#totais').innerHTML = `
    <div class="total"><span>Total</span><span>${brl(total)}</span></div>
    <div class="sinal"><span>Sinal de 50% para confirmar</span><span>${brl(total / 2)}</span></div>`;
  $('#enviar').disabled = n === 0;
}

$('#form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!sacola.length) return;
  const f = e.target;
  const total = totalValor();
  const linhas = [
    'Olá, Sweet Feliz! Quero fazer uma encomenda do Cardápio de Natal:',
    '',
    ...sacola.map((it) => `• ${it.qtd}x ${it.nome}${it.det ? ` (${it.det})` : ''} — ${brl(it.preco * it.qtd)}`),
    '',
    `Total: ${brl(total)}`,
    `Sinal (50%): ${brl(total / 2)}`,
    '',
    `Nome: ${f.nome.value.trim()}`,
    `Retirada: ${f.dia.value}${f.hora.value ? `, por volta das ${f.hora.value}` : ''}`,
  ];
  if (f.obs.value.trim()) linhas.push(`Observação: ${f.obs.value.trim()}`);
  const texto = linhas.join('\n');

  if (WHATSAPP_NUMBER) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    return;
  }
  try {
    await navigator.clipboard.writeText(texto);
    avisar('Pedido copiado! Cole na conversa do WhatsApp.');
  } catch {
    avisar('Abra o WhatsApp e mande o seu pedido.');
  }
  setTimeout(() => window.open(WHATSAPP_LINK_CURTO, '_blank', 'noopener'), 900);
});

render();
pintarSacola();

/* ---------- sacolinha aparece depois da abertura (ou se já tiver itens) ---------- */
(() => {
  const botao = $('#abrir-sacola');
  const cine = document.querySelector('.cine');
  let naAbertura = !!cine;
  const atualizar = () => botao.classList.toggle('visivel', !naAbertura || totalItens() > 0);
  if (cine) {
    new IntersectionObserver(([e]) => {
      // ainda na abertura enquanto o fim da .cine estiver abaixo do meio da tela
      naAbertura = e.isIntersecting && e.boundingClientRect.bottom > innerHeight * 0.5;
      atualizar();
    }, { threshold: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1] }).observe(cine);
    addEventListener('scroll', () => {
      naAbertura = cine.getBoundingClientRect().bottom > innerHeight * 0.5;
      atualizar();
    }, { passive: true });
  }
  const pintarOriginal = pintarSacola;
  pintarSacola = function () { pintarOriginal(); atualizar(); };
  atualizar();
})();
