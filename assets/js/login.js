/* ============================================================================
   Huella Sonora — Login del panel privado (login.js)
   ----------------------------------------------------------------------------
   ⚠️  ESTO ES SOLO PARA LA DEMO. NO es seguridad real.
       Las credenciales están escritas aquí a propósito para la presentación.

   👉 AQUÍ se conectará la AUTENTICACIÓN real del backend.
      Cuando exista Django REST, en lugar de comparar texto fijo se hará algo así:

          const res = await fetch('http://localhost:8000/api/v1/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, clave })
          });
          if (res.ok) { ... guardar token ... redirigir }

      Django ya trae sistema de usuarios, login y permisos incorporado,
      así que la verificación real se hace en el servidor, no en el navegador.
   ============================================================================ */

// --- Credenciales de DEMO (se usan solo cuando USAR_BACKEND = false) ---
const USUARIO_DEMO = 'admin';
const CLAVE_DEMO = 'huella2026';

// Login real contra Django. Si Django está apagado, usa el modo demo (respaldo).
const USAR_BACKEND = true;
const API_BASE = 'https://pagina-web-hackaton.onrender.com/api/v1';

async function intentarIngresar() {
  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value;
  const error = document.getElementById('error');
  error.textContent = '';

  let ok = false;

  if (USAR_BACKEND) {
    // --- Validación REAL contra Django ---
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave })
      });
      ok = res.ok; // 200 = correcto · 401 = incorrecto
    } catch (e) {
      // Django no está corriendo -> respaldo demo (para no romper la presentación)
      console.warn('Django no disponible; validando en modo demo.', e);
      ok = (usuario === USUARIO_DEMO && clave === CLAVE_DEMO);
    }
  } else {
    // --- Validación DEMO (en el navegador) ---
    ok = (usuario === USUARIO_DEMO && clave === CLAVE_DEMO);
  }

  if (ok) {
    sessionStorage.setItem('hs_logueado', 'si');
    window.location.href = 'panel.html';
  } else {
    error.textContent = 'Usuario o contraseña incorrectos.';
  }
}

document.getElementById('btnIngresar').addEventListener('click', intentarIngresar);

// permitir ingresar con la tecla Enter
document.getElementById('clave').addEventListener('keydown', e => {
  if (e.key === 'Enter') intentarIngresar();
});
