/* ============================================================================
   Huella Sonora — Dashboard de Estadísticas (statistics.js)
   ----------------------------------------------------------------------------
   Renderiza las gráficas del panel del gestor a partir de los datos anónimos
   del recorrido (Línea 2): lugares más visitados, puntos de abandono y mapa
   de calor.

   ⚠️  IMPORTANTE — CONEXIÓN A BASE DE DATOS (PENDIENTE)
   ----------------------------------------------------------------------------
   Por ahora se usan DATOS ALEATORIOS de demostración (función generarDatosDemo).

   👉 AQUÍ se hará la conexión con la base de datos / backend.
      Cuando el backend (candidato: Django REST + PostgreSQL) esté listo,
      reemplaza el contenido de obtenerDatos() por una llamada a la API. Ej:

          async function obtenerDatos() {
            const res = await fetch('http://localhost:8000/api/v1/estadisticas/');
            return await res.json();   // <- datos reales desde PostgreSQL
          }

      El JSON que devuelva la API debe tener LA MISMA ESTRUCTURA que
      generarDatosDemo() para que las gráficas no se rompan.
   ============================================================================ */

// ---------- Utilidades para datos random ----------
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generarDatosDemo() {
  const lugares = [
    'Machu Picchu', 'Museo Larco', 'Huaca Pucllana',
    'Chan Chan', 'Caral', 'Sacsayhuamán'
  ];
  const estaciones = [
    'Entrada', 'Templo del Sol', 'Plaza principal',
    'Terrazas', 'Mirador', 'Salida'
  ];

  return {
    // Tarjetas superiores
    resumen: {
      usuariosActivos: rnd(800, 2500),
      sitiosCubiertos: rnd(8, 20),
      recorridos: rnd(3000, 9000),
      tasaFinalizacion: rnd(55, 90) // %
    },
    // Gráfica 1: lugares más visitados
    lugaresMasVisitados: lugares
      .map(nombre => ({ nombre, visitas: rnd(120, 900) }))
      .sort((a, b) => b.visitas - a.visitas),
    // Gráfica 2: puntos de abandono por estación
    puntosDeAbandono: estaciones
      .map(estacion => ({ estacion, abandonos: rnd(2, 60) })),
    // Gráfica 3: mapa de calor (coordenadas reales + intensidad)
    mapaCalor: [
      { nombre: 'Machu Picchu', ciudad: 'Cusco', latitud: -13.1631, longitud: -72.5450, intensidad: rnd(60, 100) },
      { nombre: 'Museo Larco', ciudad: 'Lima', latitud: -12.0707, longitud: -77.0717, intensidad: rnd(40, 90) },
      { nombre: 'Chan Chan', ciudad: 'La Libertad', latitud: -8.1060, longitud: -79.0747, intensidad: rnd(30, 80) },
      { nombre: 'Kuélap', ciudad: 'Amazonas', latitud: -6.4200, longitud: -77.9220, intensidad: rnd(20, 70) },
      { nombre: 'Sillustani', ciudad: 'Puno', latitud: -15.7167, longitud: -70.1583, intensidad: rnd(20, 60) }
    ]
  };
}

// ============================================================================
//  CONEXIÓN CON EL BACKEND (sincronización con Django)
//  - Si Django está corriendo  -> muestra DATOS REALES.
//  - Si Django NO está corriendo -> muestra datos de demo (la web nunca se rompe).
//  Para apagar la sincronización y usar solo demo: pon USAR_BACKEND en false.
// ============================================================================
const USAR_BACKEND = true;
const API_BASE = 'https://pagina-web-hackaton.onrender.com/api/v1';

async function obtenerDatos() {
  if (!USAR_BACKEND) return generarDatosDemo();
  try {
    const res = await fetch(`${API_BASE}/estadisticas/`);
    if (!res.ok) throw new Error('respuesta no OK');
    return await res.json();                 // datos REALES desde Django
  } catch (e) {
    console.warn('No se pudo conectar a Django; mostrando datos de demo.', e);
    return generarDatosDemo();               // respaldo: nunca queda vacío
  }
}

// ---------- Estilo común para Chart.js (tema oscuro) ----------
const TEAL = 'rgba(120, 165, 155, 0.85)';
const TEAL_SOFT = 'rgba(120, 165, 155, 0.25)';
const CORAL = 'rgba(214, 138, 120, 0.85)';
function cssVar(name, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

function baseOptions(extra = {}) {
  const GRID = cssVar('--chart-grid', 'rgba(255, 255, 255, 0.06)');
  const TEXT = cssVar('--chart-text', 'rgba(255, 255, 255, 0.6)');
  return Object.assign({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: GRID }, ticks: { color: TEXT, font: { family: 'Inter' } } },
      y: { grid: { color: GRID }, ticks: { color: TEXT, font: { family: 'Inter' } }, beginAtZero: true }
    }
  }, extra);
}

// ---------- Render de cada parte ----------
function pintarResumen(d) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpiUsuarios', d.resumen.usuariosActivos.toLocaleString('es-PE'));
  set('kpiSitios', d.resumen.sitiosCubiertos);
  set('kpiRecorridos', d.resumen.recorridos.toLocaleString('es-PE'));
  set('kpiFinalizacion', d.resumen.tasaFinalizacion + '%');
}

function coloresBarras(n) {
  // degradado de azul intenso (más visitado) a celeste (menos visitado)
  const c = [];
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    const r = Math.round(30 + t * (125 - 30));
    const g = Math.round(64 + t * (211 - 64));
    const b = Math.round(175 + t * (252 - 175));
    c.push(`rgb(${r},${g},${b})`);
  }
  return c;
}

let HEATMAP = { puntos: [], svg: null };

function pintarLugares(d) {
  const el = document.getElementById('chartVisitas');
  if (!el) return;
  Chart.getChart(el)?.destroy();
  const nombres = d.lugaresMasVisitados.map(x => x.nombre);
  new Chart(el, {
    type: 'bar',
    data: {
      labels: nombres,
      datasets: [{
        data: d.lugaresMasVisitados.map(x => x.visitas),
        backgroundColor: coloresBarras(nombres.length),
        borderRadius: 6, barThickness: 22
      }]
    },
    options: baseOptions({
      indexAxis: 'y',
      onClick: (evt, els) => { if (els.length) resaltarPuntoMapa(nombres[els[0].index]); }
    })
  });
}

function pintarAbandono(d) {
  const el = document.getElementById('chartAbandono');
  if (!el) return; // solo se dibuja en el panel privado del gestor
  Chart.getChart(el)?.destroy();
  new Chart(el, {
    type: 'bar',
    data: {
      labels: d.puntosDeAbandono.map(x => x.estacion),
      datasets: [{
        data: d.puntosDeAbandono.map(x => x.abandonos),
        backgroundColor: CORAL, borderRadius: 6
      }]
    },
    options: baseOptions()
  });
}

// proyección lat/lng -> coordenadas del SVG del Perú (misma silueta del mapa)
const HPROJ = { minLng: -81.410943, K: 0.98713, lngRange: 12.5818, maxLat: -0.057205, latRange: 18.29077, PAD: 18, W: 360, H: 523.3 };
function hproj(lng, lat) {
  return {
    x: HPROJ.PAD + ((lng - HPROJ.minLng) * HPROJ.K) / HPROJ.lngRange * HPROJ.W,
    y: HPROJ.PAD + (HPROJ.maxLat - lat) / HPROJ.latRange * HPROJ.H,
  };
}
const HEAT_PERU_PATH = "M 351.9,519.4 L 344.3,534.0 L 329.8,541.3 L 301.5,524.9 L 299.0,513.2 L 243.0,484.4 L 192.4,453.2 L 170.6,435.5 L 158.9,411.9 L 163.5,403.6 L 139.6,366.1 L 111.7,313.3 L 85.1,256.3 L 73.5,243.3 L 64.6,222.2 L 42.7,203.5 L 22.5,192.0 L 31.7,179.2 L 18.0,151.9 L 26.8,131.9 L 49.3,113.8 L 52.7,125.7 L 44.6,132.5 L 45.4,143.0 L 57.0,140.7 L 68.4,143.8 L 80.3,158.3 L 96.3,146.5 L 101.6,127.2 L 118.9,102.3 L 152.9,91.0 L 183.7,61.0 L 192.5,42.4 L 188.5,20.7 L 196.1,18.0 L 214.8,31.6 L 223.9,45.1 L 236.9,52.4 L 253.6,82.4 L 274.6,86.0 L 290.2,78.4 L 300.4,83.4 L 317.3,80.9 L 338.9,94.3 L 320.7,123.5 L 329.2,124.1 L 343.3,139.3 L 317.8,138.0 L 314.1,142.3 L 290.9,147.8 L 258.6,167.3 L 256.6,180.6 L 249.4,190.6 L 252.2,206.1 L 235.1,214.3 L 235.1,226.4 L 227.7,231.6 L 239.4,257.4 L 255.1,274.8 L 249.2,287.1 L 267.9,288.8 L 278.6,304.0 L 303.5,304.8 L 326.7,287.9 L 324.8,331.4 L 337.6,334.7 L 353.6,329.7 L 378.0,375.8 L 371.9,385.5 L 370.5,405.6 L 370.0,429.9 L 359.0,444.2 L 364.0,454.8 L 357.5,464.4 L 369.7,488.5 L 351.9,519.4 Z";

function pintarMapaCalor(d) {
  const cont = document.getElementById('mapaCalor');
  if (!cont) return;
  const NS = 'http://www.w3.org/2000/svg';
  cont.innerHTML = '';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 396 559.3');
  svg.setAttribute('class', 'heatmap-svg');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', HEAT_PERU_PATH);
  path.setAttribute('class', 'peru-shape');
  svg.appendChild(path);

  HEATMAP.puntos = [];
  (d.mapaCalor || []).forEach(p => {
    if (p.latitud == null) return; // ignora datos viejos sin coordenadas
    const { x, y } = hproj(p.longitud, p.latitud);
    const r = 6 + (p.intensidad / 100) * 18;
    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', x); glow.setAttribute('cy', y); glow.setAttribute('r', r);
    glow.setAttribute('class', 'hot-glow');
    glow.style.opacity = 0.2 + p.intensidad / 200;
    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('cx', x); core.setAttribute('cy', y);
    core.setAttribute('r', Math.max(3, r * 0.35));
    core.setAttribute('class', 'hot-core');
    const t = document.createElementNS(NS, 'title');
    t.textContent = `${p.nombre || p.ciudad}: ${p.intensidad}% de actividad`;
    glow.appendChild(t);
    svg.appendChild(glow); svg.appendChild(core);
    HEATMAP.puntos.push({ nombre: p.nombre || p.ciudad, glow, core });
  });
  cont.appendChild(svg);
  HEATMAP.svg = svg;
}

// al hacer click en una barra de "lugares más visitados", resalta su punto en el mapa
function resaltarPuntoMapa(nombre) {
  if (!HEATMAP.svg) return;
  HEATMAP.puntos.forEach(p => {
    const activo = p.nombre === nombre;
    p.glow.classList.toggle('hot-activo', activo);
    p.core.classList.toggle('hot-activo', activo);
  });
}

// ---------- Arranque ----------
async function iniciarDashboard() {
  try {
    const datos = await obtenerDatos();
    pintarResumen(datos);
    pintarLugares(datos);
    pintarAbandono(datos);
    pintarMapaCalor(datos);
  } catch (e) {
    console.error('Error cargando el dashboard:', e);
  }
}

document.addEventListener('DOMContentLoaded', iniciarDashboard);
window.reRenderDashboard = iniciarDashboard; // lo usa theme.js al cambiar de tema

// ---------- Cerrar sesión (demo) ----------
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('hs_logueado'); // borra la sesión de demo
    window.location.href = 'login.html';
  });
}

// ============================================================================
//  DIAGNÓSTICO DE BALIZAS (solo en el panel del gestor: panel.html)
//  Muestra, por sitio, el estado de cada baliza (funcionando / alerta / falla).
// ============================================================================
async function obtenerDiagnostico() {
  if (!USAR_BACKEND) return generarDiagnosticoDemo();
  try {
    const res = await fetch(`${API_BASE}/diagnostico/`);
    if (!res.ok) throw new Error('no OK');
    return await res.json();
  } catch (e) {
    console.warn('Sin Django; diagnóstico de demo.', e);
    return generarDiagnosticoDemo();
  }
}

function generarDiagnosticoDemo() {
  const sitios = ['Machu Picchu', 'Museo Larco', 'Huaca Pucllana', 'Chan Chan',
                  'Caral', 'Kuélap', 'Sacsayhuamán', 'Museo Tumbas Reales de Sipán'];
  const estaciones = ['Entrada', 'Templo del Sol', 'Plaza principal', 'Terrazas', 'Mirador', 'Salida'];
  const opciones = ['ok', 'ok', 'ok', 'ok', 'alerta', 'falla'];
  const desc = {
    ok: 'Funcionando correctamente.',
    alerta: 'Alta tasa de abandono: muchas personas dejan el recorrido aquí. Revisar la narración o la ruta.',
    falla: 'Sin señal: la baliza no está siendo detectada. Posible batería agotada o falla del dispositivo.',
  };
  return sitios.map((nombre, i) => ({
    sitio_id: i + 1, sitio: nombre,
    balizas: estaciones.map((nom, j) => {
      const estado = opciones[Math.floor(Math.random() * opciones.length)];
      return { orden: j + 1, nombre: nom, ble_id: `BLE-${i + 1}-0${j + 1}`, estado, descripcion: desc[estado] };
    }),
  }));
}

let DIAGNOSTICO = [];

function etiquetaEstado(e) {
  return e === 'ok' ? 'Funcionando' : e === 'alerta' ? 'Alerta' : 'Falla';
}

function renderBalizas(sitioId) {
  const cont = document.getElementById('listaBalizas');
  if (!cont) return;
  const sitio = DIAGNOSTICO.find(s => String(s.sitio_id) === String(sitioId));
  if (!sitio) { cont.innerHTML = ''; return; }
  cont.innerHTML = sitio.balizas.map(b => `
    <div class="baliza-fila estado-${b.estado}">
      <div class="baliza-cab">
        <span class="baliza-num">Baliza #${b.orden}</span>
        <span class="baliza-nombre">${b.nombre}</span>
        <span class="badge badge-${b.estado}">${etiquetaEstado(b.estado)}</span>
      </div>
      <p class="baliza-desc">${b.descripcion}</p>
      <span class="baliza-id">${b.ble_id || ''}</span>
    </div>`).join('');
}

async function iniciarDiagnostico() {
  const selector = document.getElementById('selectorSitio');
  if (!selector) return; // solo existe en panel.html
  DIAGNOSTICO = await obtenerDiagnostico();
  selector.innerHTML = DIAGNOSTICO
    .map(s => `<option value="${s.sitio_id}">${s.sitio}</option>`).join('');
  selector.addEventListener('change', () => renderBalizas(selector.value));
  if (DIAGNOSTICO.length) renderBalizas(DIAGNOSTICO[0].sitio_id);
}

document.addEventListener('DOMContentLoaded', iniciarDiagnostico);
