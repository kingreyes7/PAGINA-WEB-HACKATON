"""
Comando para cargar datos de DEMO y crear el usuario admin.
Uso:  python manage.py seed
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Sitio, Baliza, Recorrido, RegistroEstacion


class Command(BaseCommand):
    help = "Carga datos de demostración y crea el usuario admin del panel."

    def handle(self, *args, **options):
        # ── Limpiar datos anteriores (para poder correrlo varias veces) ──
        RegistroEstacion.objects.all().delete()
        Recorrido.objects.all().delete()
        Baliza.objects.all().delete()
        Sitio.objects.all().delete()

        # ── Usuario del panel (admin / huella2026) ──
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@huella.pe", "huella2026")
            self.stdout.write("Usuario admin creado (admin / huella2026)")

        # ── Sitios turísticos (coordenadas reales, distribuidos por varias regiones) ──
        #   (nombre, region, tipo, lat, lng)
        sitios_def = [
            # Lima (varios)
            ("Museo Larco", "Lima", "museo", -12.0707, -77.0717),
            ("Huaca Pucllana", "Lima", "arqueologico", -12.1109, -77.0339),
            ("Museo de la Nación", "Lima", "museo", -12.0855, -77.0028),
            ("Huaca Huallamarca", "Lima", "arqueologico", -12.0975, -77.0386),
            ("Santuario de Pachacámac", "Lima", "arqueologico", -12.2575, -76.8990),
            ("Ciudad Sagrada de Caral", "Lima", "arqueologico", -10.8936, -77.5206),
            # Cusco
            ("Machu Picchu", "Cusco", "arqueologico", -13.1631, -72.5450),
            ("Sacsayhuamán", "Cusco", "arqueologico", -13.5089, -71.9817),
            ("Ollantaytambo", "Cusco", "arqueologico", -13.2586, -72.2636),
            # La Libertad
            ("Chan Chan", "La Libertad", "arqueologico", -8.1060, -79.0747),
            ("Huacas del Sol y la Luna", "La Libertad", "arqueologico", -8.1340, -78.9870),
            # Lambayeque
            ("Museo Tumbas Reales de Sipán", "Lambayeque", "museo", -6.7011, -79.9061),
            ("Complejo Arqueológico Túcume", "Lambayeque", "arqueologico", -6.5031, -79.8430),
            # Otras regiones
            ("Fortaleza de Kuélap", "Amazonas", "arqueologico", -6.4200, -77.9220),
            ("Chavín de Huántar", "Áncash", "arqueologico", -9.5928, -77.1786),
            ("Líneas de Nazca", "Ica", "arqueologico", -14.7390, -75.1300),
            ("Monasterio de Santa Catalina", "Arequipa", "museo", -16.3958, -71.5369),
            ("Complejo de Sillustani", "Puno", "arqueologico", -15.7167, -70.1583),
        ]

        # convierte lat/lng a posición aproximada (%) sobre la silueta del Perú
        def to_top(lat):
            return max(0, min(100, round(((-3.4 - lat) / 14.9) * 100, 1)))
        def to_left(lng):
            return max(0, min(100, round(((lng + 81.3) / 12.6) * 100, 1)))

        sitios = []
        for nombre, ciudad, tipo, lat, lng in sitios_def:
            sitios.append(Sitio.objects.create(
                nombre=nombre, ciudad=ciudad, tipo=tipo,
                latitud=lat, longitud=lng,
                mapa_top=to_top(lat), mapa_left=to_left(lng),
            ))

        # ── Balizas (estaciones) para cada sitio ──
        nombres_estaciones = ["Entrada", "Templo del Sol", "Plaza principal",
                              "Terrazas", "Mirador", "Salida"]
        for sitio in sitios:
            for i, nom in enumerate(nombres_estaciones, start=1):
                Baliza.objects.create(
                    sitio=sitio, nombre=nom, orden=i, ble_id=f"BLE-{sitio.id}-{i:02d}",
                    operativa=(random.random() > 0.12),  # ~12% salen con falla (sin señal)
                )

        # ── Recorridos anónimos de ejemplo ──
        for sitio in sitios:
            balizas = list(sitio.balizas.all())
            cantidad = random.randint(20, 80)  # nº de recorridos por sitio
            for _ in range(cantidad):
                completado = random.random() < 0.7  # 70% completa
                abandono = None
                if not completado:
                    abandono = random.choice(balizas[1:])  # abandona en alguna estación
                rec = Recorrido.objects.create(
                    sitio=sitio,
                    duracion_total_seg=random.randint(180, 900),
                    completado=completado,
                    baliza_abandono=abandono,
                )
                # registros por estación (hasta donde llegó)
                hasta = balizas.index(abandono) + 1 if abandono else len(balizas)
                for b in balizas[:hasta]:
                    RegistroEstacion.objects.create(
                        recorrido=rec, baliza=b,
                        tiempo_seg=random.randint(20, 90),
                        repeticiones_narracion=random.randint(0, 3),
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Datos de demo cargados: {Sitio.objects.count()} sitios, "
            f"{Recorrido.objects.count()} recorridos."
        ))
