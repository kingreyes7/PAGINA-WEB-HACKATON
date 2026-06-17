# Huella Sonora — Página Web del Proyecto

Sitio web del proyecto **Huella Sonora** (Hackathon Nacional "Sin Barreras", equipo **LND**):
turismo accesible para personas con discapacidad visual mediante narraciones de audio
activadas por balizas BLE.

Esta web cumple dos funciones:
1. **Landing / presentación** del proyecto (`index.html`).
2. **Dashboard de estadísticas** del recorrido (`statistics.html`) — gráficas como el lugar
   más visitado, mapa de calor y puntos de abandono. *(Funcionalidad a desarrollar al final.)*

---

## Estructura de carpetas

```
huella-sonora-web/
├── index.html               # Página principal (landing)
├── statistics.html          # Dashboard de gráficas e impacto
├── README.md                # Este archivo
├── .gitignore
│
├── assets/                  # Todo lo estático
│   ├── css/
│   │   ├── styles.css        # Estilos de index.html
│   │   └── statistics.css    # Estilos de statistics.html
│   ├── js/
│   │   ├── main.js           # Lógica de index.html
│   │   └── statistics.js     # Lógica de statistics.html (si aplica)
│   └── images/               # Imágenes (exportaciones de diseño)
│
├── data/
│   └── statistics.sample.json  # Datos de EJEMPLO para las gráficas (placeholder)
│
├── backend/                 # Reservado. Backend aún no decidido (ver backend/README.md)
│
└── docs/                    # Documentación de diseño
    ├── DESIGN-HANDOFF.md
    └── DESIGN-MANIFEST.json
```

---

## Cómo abrir el proyecto

Para que se vean bien los estilos y (a futuro) los datos, **no abras el HTML con doble clic**.
Usa un servidor local:

- **VS Code:** instala la extensión **Live Server** → clic derecho en `index.html` → *Open with Live Server*.
- **O por terminal** (si tienes Python):
  ```bash
  python -m http.server 5500
  ```
  y abre `http://localhost:5500`.

---

## Estado actual y siguientes pasos

- [x] Estructura de carpetas ordenada.
- [x] CSS y JS separados del HTML.
- [ ] Conectar `statistics.html` con datos reales (por ahora usa `data/statistics.sample.json`).
- [ ] Definir e implementar el **backend** (candidato: Django REST + PostgreSQL).
- [ ] Gráficas: lugar más visitado, mapa de calor, puntos de abandono.

## Equipo
- Favinovech — App móvil + balizas BLE
- Manuel — Backend + datos (Línea 2)
- Sandro — Frontend web y dashboard
- José — Diseño (Figma)
- Karen — UX, accesibilidad y validación
