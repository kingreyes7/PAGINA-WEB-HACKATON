/* ============================================================================
   Huella Sonora — Tema (theme.js)
   Modo día/noche + modo daltonismo. Se recuerda en el navegador.
   ============================================================================ */
function _estadoTema() {
  return {
    tema: localStorage.getItem('hs_tema') || 'dark',
    cb: localStorage.getItem('hs_daltonismo') === 'on',
  };
}

function aplicarTema() {
  const { tema, cb } = _estadoTema();
  document.body.setAttribute('data-theme', tema);
  document.body.setAttribute('data-cb', cb ? 'on' : 'off');
  const bt = document.getElementById('btnTema');
  if (bt) bt.textContent = tema === 'dark' ? '☀️ Día' : '🌙 Noche';
  const bc = document.getElementById('btnDaltonismo');
  if (bc) bc.classList.toggle('activo', cb);
}

// aplicar de inmediato (antes de que se rendericen las gráficas)
aplicarTema();

document.addEventListener('DOMContentLoaded', () => {
  aplicarTema();
  document.getElementById('btnTema')?.addEventListener('click', () => {
    localStorage.setItem('hs_tema', _estadoTema().tema === 'dark' ? 'light' : 'dark');
    aplicarTema();
    window.reRenderDashboard?.(); // re-pinta las gráficas con los colores del tema
  });
  document.getElementById('btnDaltonismo')?.addEventListener('click', () => {
    localStorage.setItem('hs_daltonismo', _estadoTema().cb ? 'off' : 'on');
    aplicarTema();
    window.reRenderDashboard?.();
  });
});
