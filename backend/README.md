# Backend — Huella Sonora (Django REST + SQLite)

API que conecta la **app móvil** y la **página web**. La app envía datos anónimos
del recorrido (Línea 2), se guardan en SQLite, y la web pide esos datos para las gráficas.

> Base de datos: **SQLite** (ya viene con Django, no se instala nada).
> Para producción se migra a **PostgreSQL** cambiando solo la sección `DATABASES` en `config/settings.py`.

---

## ▶️ Cómo correrlo (copiar y pegar, en orden)

Abre una terminal **dentro de la carpeta `backend/`** y ejecuta:

**1. Crear el entorno virtual**
```bash
python -m venv .venv
```

**2. Activarlo**
- Windows:  `.venv\Scripts\activate`
- Mac/Linux: `source .venv/bin/activate`

**3. Instalar lo necesario**
```bash
pip install -r requirements.txt
```

**4. Crear la base de datos**
```bash
python manage.py migrate
```

**5. Cargar datos de ejemplo + crear el usuario admin**
```bash
python manage.py seed
```

**6. Levantar el servidor**
```bash
python manage.py runserver
```

Listo. El backend queda corriendo en **http://localhost:8000**

---

## 🔑 Accesos

- Panel de administración de Django: http://localhost:8000/admin/
  - Usuario: **admin** · Contraseña: **huella2026**
  - (Aquí Manuel puede ver TODOS los datos en tablas, sin programar nada.)

---

## 🔌 Endpoints de la API

| Método | URL                          | Para qué sirve                                  |
|--------|------------------------------|-------------------------------------------------|
| GET    | `/api/v1/sitios/`            | Lista de sitios turísticos (para la app)        |
| POST   | `/api/v1/recorridos/`        | La **app** envía los datos de un recorrido      |
| GET    | `/api/v1/estadisticas/`      | La **web** pide los datos para las gráficas     |
| POST   | `/api/v1/login/`             | Login del panel privado                         |

**Ejemplo de lo que envía la app** (`POST /api/v1/recorridos/`):
```json
{
  "sitio": 1,
  "duracion_total_seg": 540,
  "completado": true,
  "baliza_abandono": null,
  "registros": [
    {"baliza": 1, "tiempo_seg": 60, "repeticiones_narracion": 1},
    {"baliza": 2, "tiempo_seg": 75, "repeticiones_narracion": 2}
  ]
}
```

---

## 🔗 Conectar la página web con este backend

Por defecto la web usa datos random (funciona sola). Para que use los datos REALES:

1. Ten el backend corriendo (paso 6).
2. En `../assets/js/statistics.js` cambia:  `const USAR_BACKEND = false;`  →  `true`
3. En `../assets/js/login.js` haz lo mismo:  `const USAR_BACKEND = false;`  →  `true`
4. Recarga la web. Ahora las gráficas y el login salen del backend.

---

## 🗂️ Estructura

```
backend/
├── manage.py            # comando principal de Django
├── requirements.txt     # librerías necesarias
├── db.sqlite3           # la base de datos (se crea con migrate)
├── config/              # configuración del proyecto
│   ├── settings.py       # aquí está la config de la base de datos
│   └── urls.py
└── api/                 # nuestra app
    ├── models.py         # las tablas de la base de datos
    ├── serializers.py    # validación / conversión a JSON
    ├── views.py          # la lógica de cada endpoint
    ├── urls.py           # las rutas de la API
    ├── admin.py          # para ver los datos en el panel de Django
    └── management/commands/seed.py   # carga los datos de ejemplo
```
