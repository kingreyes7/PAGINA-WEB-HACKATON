"""
Configuración de Django para el backend de Huella Sonora.
Base de datos: SQLite (por defecto, sin instalar nada).
Para migrar a PostgreSQL en producción: solo se cambia la sección DATABASES.
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ⚠️ Clave de demo. En producción se cambia por una secreta y oculta.
SECRET_KEY = "demo-huella-sonora-no-usar-en-produccion"

DEBUG = True
ALLOWED_HOSTS = ["*"]  # demo: permite el acceso desde el celular y la web

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # externos
    "rest_framework",
    "corsheaders",
    # nuestra app
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # debe ir arriba
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Demo: permite que la web y la app llamen al backend sin bloqueos.
CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ---- BASE DE DATOS: SQLite (un solo archivo, cero configuración) ----
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
# Para PostgreSQL en producción, se reemplaza por:
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": "huella_sonora",
#         "USER": "postgres",
#         "PASSWORD": "...",
#         "HOST": "localhost",
#         "PORT": "5432",
#     }
# }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "es"
TIME_ZONE = "America/Lima"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
}
