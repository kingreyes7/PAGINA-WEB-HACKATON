/* ============================================================================
   Huella Sonora — "De la teoría a la experiencia real" (experiencia.js)
   Modal con GIF + historia del sitio + audio que lee la historia al abrir
   (usa la voz del navegador, no necesita archivos de audio).
   ============================================================================ */
const HISTORIA = {
  titulo: 'Machu Picchu',
  texto: 'Machu Picchu fue construida alrededor del año 1450, durante el gobierno del inca Pachacútec. Sus muros de piedra encajan con tal precisión que no entra ni una hoja entre ellos. Para los incas, esta montaña era sagrada y se conectaba con el sol y las estrellas.'
};

function leerHistoria(texto) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-PE';
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

function abrirExp() {
  const m = document.getElementById('expModal');
  if (!m) return;
  document.getElementById('expTitulo').textContent = HISTORIA.titulo;
  document.getElementById('expTexto').textContent = HISTORIA.texto;
  m.classList.add('abierto');
  m.setAttribute('aria-hidden', 'false');
  leerHistoria(`${HISTORIA.titulo}. ${HISTORIA.texto}`); // lee al abrir
}

function cerrarExp() {
  const m = document.getElementById('expModal');
  if (!m) return;
  m.classList.remove('abierto');
  m.setAttribute('aria-hidden', 'true');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnExpReal')?.addEventListener('click', abrirExp);
  document.getElementById('expClose')?.addEventListener('click', cerrarExp);
  document.getElementById('expReplay')?.addEventListener('click', () => leerHistoria(`${HISTORIA.titulo}. ${HISTORIA.texto}`));
  document.getElementById('expModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'expModal') cerrarExp(); // cerrar al hacer click fuera
  });
});
