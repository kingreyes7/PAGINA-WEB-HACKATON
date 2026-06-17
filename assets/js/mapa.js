/* ============================================================================
   Huella Sonora — Mapa de ubicación de balizas (mapa.js)
   Dibuja los pines sobre una silueta SVG del Perú (funciona SIN internet).
   - Si Django está corriendo -> datos reales.
   - Si no                     -> datos de demo (el mapa nunca queda vacío).
   ============================================================================ */
const USAR_BACKEND = true;
const API_BASE = 'http://localhost:8000/api/v1';

// Datos de respaldo (por si Django no está corriendo)
function datosDemo() {
  const est = [
    { orden: 1, nombre: 'Entrada' }, { orden: 2, nombre: 'Templo del Sol' },
    { orden: 3, nombre: 'Plaza principal' }, { orden: 4, nombre: 'Terrazas' },
    { orden: 5, nombre: 'Mirador' }, { orden: 6, nombre: 'Salida' },
  ];
  const s = (nombre, ciudad, tipo, latitud, longitud) =>
    ({ nombre, ciudad, tipo, latitud, longitud, total_balizas: est.length, balizas: est });
  return [
    s('Museo Larco', 'Lima', 'museo', -12.0707, -77.0717),
    s('Huaca Pucllana', 'Lima', 'arqueologico', -12.1109, -77.0339),
    s('Museo de la Nación', 'Lima', 'museo', -12.0855, -77.0028),
    s('Huaca Huallamarca', 'Lima', 'arqueologico', -12.0975, -77.0386),
    s('Santuario de Pachacámac', 'Lima', 'arqueologico', -12.2575, -76.8990),
    s('Ciudad Sagrada de Caral', 'Lima', 'arqueologico', -10.8936, -77.5206),
    s('Machu Picchu', 'Cusco', 'arqueologico', -13.1631, -72.5450),
    s('Sacsayhuamán', 'Cusco', 'arqueologico', -13.5089, -71.9817),
    s('Ollantaytambo', 'Cusco', 'arqueologico', -13.2586, -72.2636),
    s('Chan Chan', 'La Libertad', 'arqueologico', -8.1060, -79.0747),
    s('Huacas del Sol y la Luna', 'La Libertad', 'arqueologico', -8.1340, -78.9870),
    s('Museo Tumbas Reales de Sipán', 'Lambayeque', 'museo', -6.7011, -79.9061),
    s('Complejo Arqueológico Túcume', 'Lambayeque', 'arqueologico', -6.5031, -79.8430),
    s('Fortaleza de Kuélap', 'Amazonas', 'arqueologico', -6.4200, -77.9220),
    s('Chavín de Huántar', 'Áncash', 'arqueologico', -9.5928, -77.1786),
    s('Líneas de Nazca', 'Ica', 'arqueologico', -14.7390, -75.1300),
    s('Monasterio de Santa Catalina', 'Arequipa', 'museo', -16.3958, -71.5369),
    s('Complejo de Sillustani', 'Puno', 'arqueologico', -15.7167, -70.1583),
  ];
}

async function obtenerSitios() {
  if (!USAR_BACKEND) return datosDemo();
  try {
    const res = await fetch(`${API_BASE}/mapa/`);
    if (!res.ok) throw new Error('respuesta no OK');
    return await res.json();
  } catch (e) {
    console.warn('No se pudo conectar a Django; mostrando datos de demo.', e);
    return datosDemo();
  }
}

// ── Proyección: convierte (lng,lat) a coordenadas del SVG del Perú ──
const PROJ = {
  minLng: -81.410943, K: 0.98713, lngRange: 12.5818,
  maxLat: -0.057205, latRange: 18.29077,
  PAD: 18, W: 360, H: 523.3,
};
function proj(lng, lat) {
  const x = PROJ.PAD + ((lng - PROJ.minLng) * PROJ.K) / PROJ.lngRange * PROJ.W;
  const y = PROJ.PAD + (PROJ.maxLat - lat) / PROJ.latRange * PROJ.H;
  return { x, y };
}

const NS = 'http://www.w3.org/2000/svg';

function seleccionar(s, pinEl) {
  // resaltar el pin elegido
  document.querySelectorAll('.pin-activo').forEach(p => p.classList.remove('pin-activo'));
  pinEl.classList.add('pin-activo');

  const tipoTxt = s.tipo === 'museo' ? 'Museo' : 'Centro arqueológico';
  const lista = (s.balizas || []).map(b => `<li>${b.orden}. ${b.nombre}</li>`).join('');
  document.getElementById('infoPanel').innerHTML = `
    <h3>${s.nombre}</h3>
    <p class="info-tipo">${tipoTxt} · ${s.ciudad}</p>
    <p class="info-count">${s.total_balizas} balizas instaladas</p>
    <ul>${lista}</ul>`;
}

async function iniciarMapa() {
  const sitios = await obtenerSitios();
  const grupo = document.getElementById('pines');

  sitios.forEach(s => {
    const { x, y } = proj(s.longitud, s.latitud);
    const esMuseo = s.tipo === 'museo';
    const color = esMuseo ? '#7aa59b' : '#d68a78';
    const r = 4 + Math.min(s.total_balizas, 8) * 0.5;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pin');
    g.style.cursor = 'pointer';

    // halo
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('cx', x); halo.setAttribute('cy', y);
    halo.setAttribute('r', r + 4);
    halo.setAttribute('fill', color); halo.setAttribute('opacity', '0.25');

    // punto
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'pin-dot');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    dot.setAttribute('r', r);
    dot.setAttribute('fill', color);
    dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', '1.2');

    // tooltip nativo al pasar el mouse
    const title = document.createElementNS(NS, 'title');
    title.textContent = `${s.nombre} — ${s.total_balizas} balizas`;

    g.appendChild(halo); g.appendChild(dot); g.appendChild(title);
    g.addEventListener('click', () => seleccionar(s, g));
    grupo.appendChild(g);
  });
}

document.addEventListener('DOMContentLoaded', iniciarMapa);
