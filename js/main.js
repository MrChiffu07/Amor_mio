const $ = (id) => document.getElementById(id);
const INICIO = new Date(CONFIG.inicio);
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLarga(d) {
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function sumarMeses(fecha, n) {
  const d = new Date(fecha);
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return d;
}

// ---------- Nombres y textos ----------
function pintarTextos() {
  document.querySelectorAll('.n1').forEach((e) => (e.textContent = CONFIG.nombre1));
  document.querySelectorAll('.n2').forEach((e) => (e.textContent = CONFIG.nombre2));
  document.title = `${CONFIG.nombre1} & ${CONFIG.nombre2} 💖`;
  $('fechaTexto').textContent = `Juntos desde el ${fechaLarga(INICIO)}`;
  $('fechaFooter').textContent = fechaLarga(INICIO);
  $('textoSorpresa').textContent = CONFIG.textoSorpresa;

  $('cartaCompleta').innerHTML = '';
  CONFIG.carta.forEach((p) => {
    const el = document.createElement('p');
    el.textContent = p;
    $('cartaCompleta').appendChild(el);
  });

  CONFIG.historia.forEach((h, i) => {
    const item = document.createElement('div');
    item.className = 'tl-item' + (i % 2 ? ' right' : '');
    item.dataset.aos = i % 2 ? 'fade-left' : 'fade-right';
    item.innerHTML = '<div class="tl-card"><h5></h5><p class="mb-0"></p></div>';
    item.querySelector('h5').textContent = h.titulo;
    item.querySelector('p').textContent = h.texto;
    $('timeline').appendChild(item);
  });
}

// ---------- Contador en vivo ----------
function actualizarContador() {
  const ahora = new Date();
  let meses = 0, dias = 0, h = 0, m = 0, s = 0, total = 0;

  if (ahora > INICIO) {
    meses = (ahora.getFullYear() - INICIO.getFullYear()) * 12 + (ahora.getMonth() - INICIO.getMonth());
    if (sumarMeses(INICIO, meses) > ahora) meses--;
    const resto = Math.floor((ahora - sumarMeses(INICIO, meses)) / 1000);
    dias = Math.floor(resto / 86400);
    h = Math.floor((resto % 86400) / 3600);
    m = Math.floor((resto % 3600) / 60);
    s = resto % 60;
    total = Math.floor((ahora - INICIO) / 86400000);
  }

  $('c-meses').textContent = meses;
  $('c-dias').textContent = dias;
  $('c-horas').textContent = String(h).padStart(2, '0');
  $('c-minutos').textContent = String(m).padStart(2, '0');
  $('c-segundos').textContent = String(s).padStart(2, '0');
  $('totalDias').textContent = total.toLocaleString('es');
}

// ---------- Galería (carrusel) ----------
function cargarConRespaldo(img, fuentes) {
  let i = 0;
  img.onerror = () => { if (++i < fuentes.length) img.src = fuentes[i]; else img.onerror = null; };
  img.src = fuentes[0];
}

function crearGaleria() {
  const total = CONFIG.fotos.length;

  CONFIG.fotos.forEach((f, i) => {
    const respaldo = `https://picsum.photos/seed/amor${i + 1}/1200/800`;
    const mini = f.src.replace(/\.(webp|jpe?g|png)$/i, '-mini.$1');
    const alt = f.alt || f.texto;

    const ind = document.createElement('button');
    ind.type = 'button';
    ind.dataset.bsTarget = '#carrusel';
    ind.dataset.bsSlideTo = i;
    ind.setAttribute('aria-label', `Foto ${i + 1} de ${total}: ${f.texto}`);
    if (i === 0) { ind.className = 'active'; ind.setAttribute('aria-current', 'true'); }
    $('carruselIndicadores').appendChild(ind);

    const item = document.createElement('div');
    item.className = 'carousel-item' + (i === 0 ? ' active' : '');
    item.setAttribute('role', 'group');
    item.setAttribute('aria-roledescription', 'foto');
    item.setAttribute('aria-label', `${i + 1} de ${total}`);
    item.innerHTML =
      '<img class="d-block w-100" width="1600" height="1067" decoding="async">' +
      '<div class="carousel-caption"><span class="foto-fecha"></span><p class="script"></p></div>';
    const img = item.querySelector('img');
    img.alt = alt;
    // Las dos primeras fotos se cargan de inmediato; las demás solo cuando se van a mostrar
    if (i === 0) img.setAttribute('fetchpriority', 'high');
    else if (i > 1) img.loading = 'lazy';
    cargarConRespaldo(img, [f.src, respaldo]);
    // Fotos verticales: se ven completas sobre un fondo difuminado de la misma foto
    img.addEventListener('load', () => {
      const vertical = img.naturalHeight > img.naturalWidth;
      item.classList.toggle('vertical', vertical);
      if (vertical) item.style.setProperty('--fondo', `url("${img.currentSrc || img.src}")`);
    });
    const fecha = item.querySelector('.foto-fecha');
    if (f.fecha) fecha.innerHTML = '<i class="bi bi-calendar-heart"></i> ';
    fecha.append(f.fecha || '');
    item.querySelector('p').textContent = f.texto;
    $('carruselItems').appendChild(item);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb-btn' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Ver foto ${i + 1}: ${f.texto}`);
    btn.innerHTML = '<img class="thumb" width="70" height="70" loading="lazy" decoding="async" alt="">';
    cargarConRespaldo(btn.querySelector('img'), [mini, f.src, `https://picsum.photos/seed/amor${i + 1}/160/160`]);
    btn.addEventListener('click', () => bootstrap.Carousel.getOrCreateInstance($('carrusel')).to(i));
    $('miniaturas').appendChild(btn);
  });

  const imgs = () => document.querySelectorAll('#carruselItems img');
  $('carrusel').addEventListener('slide.bs.carousel', (e) => {
    document.querySelectorAll('.thumb-btn').forEach((t, i) => t.classList.toggle('active', i === e.to));
    document.querySelectorAll('#carruselIndicadores button').forEach((b, i) => {
      if (i === e.to) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    // Precarga la foto siguiente para que no aparezca en blanco
    const sig = imgs()[(e.to + 1) % total];
    if (sig) sig.loading = 'eager';
    const f = CONFIG.fotos[e.to];
    $('fotoActual').textContent = `Foto ${e.to + 1} de ${total}: ${f.texto}${f.fecha ? ', ' + f.fecha : ''}`;
  });

  // Flechas del teclado en toda la página mientras la galería está a la vista
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe($('carrusel'));
  document.addEventListener('keydown', (e) => {
    if (!visible || document.querySelector('.modal.show') || $('intro')) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.closest('#carrusel')) return;
    const c = bootstrap.Carousel.getOrCreateInstance($('carrusel'));
    if (e.key === 'ArrowLeft') { e.preventDefault(); c.prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); c.next(); }
  });
}

// ---------- Música (YouTube) ----------
let yt = null;
let ytListo = false;
let sonando = false;
let quiereSonar = false;
let reproductorAbierto = false;

function actualizarBotonMusica() {
  $('btnMusica').classList.toggle('playing', sonando);
  $('btnMusica').innerHTML = sonando
    ? '<i class="bi bi-music-note-beamed"></i>'
    : '<i class="bi bi-youtube"></i>';
}

function mostrarReproductor(abrir) {
  reproductorAbierto = abrir;
  $('musicBox').classList.toggle('abierto', abrir);
}

function reproducirMusica() {
  quiereSonar = true;
  if (!ytListo) return; // sonará en onReady
  // Se llama dentro del clic del usuario: el navegador permite activar el sonido
  if (yt.isMuted()) yt.seekTo(0, true);
  yt.unMute();
  yt.setVolume(70);
  yt.playVideo();
}

function iniciarMusica() {
  $('musicaLink').href = 'https://www.youtube.com/watch?v=' + CONFIG.youtube;
  if (location.protocol === 'file:') {
    console.warn('YouTube no funciona abriendo el archivo directamente: usa abrir-pagina.bat o publica la página.');
  }
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('ytPlayer', {
      width: '100%', height: '190', videoId: CONFIG.youtube,
      playerVars: {
        autoplay: 1, mute: 1, controls: 1, loop: 1, playlist: CONFIG.youtube,
        playsinline: 1, rel: 0, origin: location.origin
      },
      events: {
        onReady: () => {
          ytListo = true;
          if (quiereSonar) reproducirMusica();
          else { yt.mute(); yt.playVideo(); } // precarga en silencio
        },
        onStateChange: (e) => {
          sonando = e.data === YT.PlayerState.PLAYING && !yt.isMuted();
          actualizarBotonMusica();
        },
        onError: () => mostrarReproductor(true)
      }
    });
  };
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

// ---------- Mensaje de bienvenida ----------
function escribir(texto, el, alTerminar) {
  let i = 0;
  const t = setInterval(() => {
    if (!el.isConnected) return clearInterval(t);
    el.textContent = texto.slice(0, ++i);
    if (i >= texto.length) { clearInterval(t); alTerminar(); }
  }, 45);
}

function entrar() {
  reproducirMusica();
  mostrarReproductor(true);
  // Si la canción arrancó sola, esconde el reproductor; si no, lo deja visible para darle play
  setTimeout(() => { if (sonando) mostrarReproductor(false); }, 7000);
  $('intro').classList.add('oculto');
  document.body.classList.remove('bloqueado');
  setTimeout(() => $('intro').remove(), 1200);
  $('musicaInfo').classList.add('visible');
  setTimeout(() => $('musicaInfo').classList.remove('visible'), 5000);
  AOS.refreshHard();
  for (let i = 0; i < 30; i++) setTimeout(crearCorazon, i * 80);
}

// ---------- Razón del día y 100 razones ----------
let razonActual = 0;

function mostrarRazon(i) {
  razonActual = i;
  const t = $('razonTexto');
  t.classList.remove('aparecer');
  void t.offsetWidth; // reinicia la animación
  t.textContent = CONFIG.razones[i];
  t.classList.add('aparecer');
  $('razonNum').textContent = i + 1;
}

function iniciarRazones() {
  const total = CONFIG.razones.length;
  $('razonTotal').textContent = total;

  // Cambia una vez al día (a medianoche), avanzando en orden desde el día en que empezaron
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy - new Date(INICIO).setHours(0, 0, 0, 0)) / 86400000);
  const delDia = ((dias % total) + total) % total;
  mostrarRazon(delDia);

  $('otraRazon').addEventListener('click', () => {
    let n;
    do { n = Math.floor(Math.random() * total); } while (total > 1 && n === razonActual);
    mostrarRazon(n);
    $('razonHoy').textContent = n === delDia ? 'Esta es la razón de hoy 💌' : 'Una razón más, porque una sola no alcanza 💕';
  });
}

// ---------- Carta letra por letra ----------
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cartaTimer = null;

function terminarCarta() {
  clearTimeout(cartaTimer);
  $('cartaTexto').innerHTML = $('cartaCompleta').innerHTML;
  $('cartaFirma').classList.add('visible');
  $('cartaSaltar').classList.add('d-none');
  $('cartaRepetir').classList.remove('d-none');
}

function escribirCarta() {
  if (reducirMovimiento) return terminarCarta();
  clearTimeout(cartaTimer);
  const cont = $('cartaTexto');
  cont.innerHTML = '';
  $('cartaFirma').classList.remove('visible');
  $('cartaSaltar').classList.remove('d-none');
  $('cartaRepetir').classList.add('d-none');

  let p = 0, c = 0, parrafo = null;
  const cursor = document.createElement('span');
  cursor.className = 'cursor-carta';

  const paso = () => {
    if (p >= CONFIG.carta.length) { cursor.remove(); return terminarCarta(); }
    const texto = CONFIG.carta[p];
    if (!parrafo) {
      parrafo = document.createElement('p');
      parrafo.appendChild(document.createTextNode(''));
      parrafo.appendChild(cursor);
      cont.appendChild(parrafo);
    }
    parrafo.firstChild.textContent = texto.slice(0, ++c);
    let espera = 35;
    const letra = texto[c - 1];
    if ('.!?'.includes(letra)) espera = 380;
    else if (',;:'.includes(letra)) espera = 160;
    if (c >= texto.length) { p++; c = 0; parrafo = null; espera = 650; }
    cartaTimer = setTimeout(paso, espera);
  };
  paso();
}

function iniciarCarta() {
  $('cartaSaltar').addEventListener('click', terminarCarta);
  $('cartaRepetir').addEventListener('click', escribirCarta);
  // Empieza a escribirse cuando la carta aparece en pantalla
  const obs = new IntersectionObserver((entradas) => {
    if (entradas[0].isIntersecting) { obs.disconnect(); escribirCarta(); }
  }, { threshold: 0.35 });
  obs.observe(document.querySelector('.letter'));
}

// ---------- Pétalos y corazones cayendo sobre la carta ----------
function iniciarPetalos() {
  if (reducirMovimiento) return;
  const zona = $('petalos');
  let timer = null;

  const crear = () => {
    if (document.hidden || zona.childElementCount > 40) return;
    const el = document.createElement('span');
    const esCorazon = Math.random() < 0.35;
    el.className = esCorazon ? 'cae corazon-cae bi bi-heart-fill' : 'cae petalo';
    const tam = esCorazon ? 12 + Math.random() * 14 : 10 + Math.random() * 12;
    if (esCorazon) el.style.fontSize = tam + 'px';
    else { el.style.width = tam + 'px'; el.style.height = tam * 1.3 + 'px'; }
    el.style.left = Math.random() * 100 + '%';
    const dur = 7 + Math.random() * 6;
    el.style.animationDuration = `${dur}s, ${2 + Math.random() * 2}s`;
    el.style.setProperty('--giro', (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360) + 'deg');
    el.style.setProperty('--deriva', (Math.random() * 120 - 60) + 'px');
    zona.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000);
  };

  // Solo caen mientras la carta está visible, para no gastar batería
  new IntersectionObserver((entradas) => {
    if (entradas[0].isIntersecting) {
      if (!timer) { for (let i = 0; i < 6; i++) setTimeout(crear, i * 150); timer = setInterval(crear, 450); }
    } else { clearInterval(timer); timer = null; }
  }).observe($('carta'));
}

// ---------- Nuestra luna ----------
const MES_LUNAR = 29.530588853;
const LUNA_NUEVA_REF = Date.UTC(2000, 0, 6, 18, 14); // luna nueva conocida

// Devuelve la fase entre 0 y 1 (0 = nueva, 0.5 = llena)
function faseLunar(fecha) {
  const dias = (fecha - LUNA_NUEVA_REF) / 86400000;
  return (((dias % MES_LUNAR) + MES_LUNAR) % MES_LUNAR) / MES_LUNAR;
}

function nombreFase(f) {
  const nombres = ['Luna nueva', 'Luna creciente', 'Cuarto creciente', 'Gibosa creciente',
    'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Luna menguante'];
  return nombres[Math.round(f * 8) % 8];
}

function dibujarLuna(f) {
  const r = 90, c = 100;
  const k = Math.cos(2 * Math.PI * f);
  const rx = Math.abs(r * k).toFixed(2);
  const creciente = f < 0.5;
  // Borde iluminado + línea de sombra (terminador) como elipse
  const borde = `A ${r} ${r} 0 0 ${creciente ? 1 : 0} ${c} ${c + r}`;
  const sombra = `A ${rx} ${r} 0 0 ${creciente ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0)} ${c} ${c - r}`;
  const iluminada = Math.round(((1 - k) / 2) * 100);
  const crateres = [[70, 70, 14], [125, 60, 9], [120, 125, 18], [75, 135, 10], [150, 100, 8], [95, 100, 7], [50, 105, 9]]
    .map(([x, y, cr]) => `<circle cx="${x}" cy="${y}" r="${cr}" fill="#d9d2b4" opacity=".55"/>`).join('');
  const id = 'l' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="${id}g" cx="40%" cy="35%"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#e9e0bd"/></radialGradient>
      <clipPath id="${id}c"><path d="M ${c} ${c - r} ${borde} ${sombra} Z"/></clipPath>
    </defs>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#2a2d4a"/>
    <g clip-path="url(#${id}c)">
      <circle cx="${c}" cy="${c}" r="${r}" fill="url(#${id}g)"/>${crateres}
    </g>
  </svg>`.replace(/\n\s*/g, '') + `<span class="visually-hidden">${nombreFase(f)}, ${iluminada}% iluminada</span>`;
}

function iniciarLuna() {
  $('lunaFrase').textContent = CONFIG.luna.frase;

  const pintar = (fecha, svg, fase, detalle, texto) => {
    const f = faseLunar(fecha);
    const ilum = Math.round(((1 - Math.cos(2 * Math.PI * f)) / 2) * 100);
    $(svg).innerHTML = dibujarLuna(f);
    $(fase).textContent = nombreFase(f);
    $(detalle).textContent = `${texto} · ${ilum}% iluminada`;
    return f;
  };

  const fIni = pintar(INICIO, 'lunaInicio', 'faseInicio', 'detalleInicio', fechaLarga(INICIO));
  if (fIni < 0.07 || fIni > 0.93) {
    $('detalleInicio').textContent += ' · el comienzo de un nuevo ciclo, como nosotros ✨';
  }
  pintar(new Date(), 'lunaHoy', 'faseHoy', 'detalleHoy', fechaLarga(new Date()));

  // Próxima luna llena
  const f = faseLunar(new Date());
  let faltan = (0.5 - f) * MES_LUNAR;
  if (faltan < -0.5) faltan += MES_LUNAR;
  const llena = new Date(Date.now() + Math.max(faltan, 0) * 86400000);
  $('lunaLlena').innerHTML = '';
  const b = document.createElement('strong');
  b.textContent = Math.abs(faltan) < 0.5 ? '¡Hoy hay luna llena! 🌕' : `Próxima luna llena: ${fechaLarga(llena)}.`;
  $('lunaLlena').append(b, document.createElement('br'), CONFIG.luna.llena);

  // Cielo estrellado
  const cielo = $('estrellas');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('span');
    s.className = 'estrella';
    const t = Math.random() * 2.2 + 1;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${t}px;height:${t}px;animation-delay:${Math.random() * 4}s;animation-duration:${2 + Math.random() * 3}s`;
    cielo.appendChild(s);
  }
}

// ---------- Corazones flotantes ----------
function crearCorazon() {
  const h = document.createElement('i');
  h.className = 'bi bi-heart-fill heart';
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = 12 + Math.random() * 22 + 'px';
  const dur = 6 + Math.random() * 6;
  h.style.animationDuration = dur + 's';
  $('hearts').appendChild(h);
  setTimeout(() => h.remove(), dur * 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  pintarTextos();
  crearGaleria();
  iniciarRazones();
  iniciarLuna();
  iniciarCarta();
  iniciarPetalos();
  AOS.init({ duration: 900, once: true });

  actualizarContador();
  setInterval(actualizarContador, 1000);
  setInterval(crearCorazon, 800);

  iniciarMusica();
  $('tituloCancion').textContent = CONFIG.tituloCancion;
  $('btnMusica').addEventListener('click', () => mostrarReproductor(!reproductorAbierto));
  $('cerrarMusica').addEventListener('click', () => mostrarReproductor(false));

  escribir(CONFIG.mensajeIntro, $('mensajeIntro'), () => $('btnEntrar').classList.remove('invisible'));
  $('btnEntrar').addEventListener('click', entrar);

  $('btnSorpresa').addEventListener('click', () => {
    new bootstrap.Modal($('modalSorpresa')).show();
    for (let i = 0; i < 40; i++) setTimeout(crearCorazon, i * 60);
  });
});