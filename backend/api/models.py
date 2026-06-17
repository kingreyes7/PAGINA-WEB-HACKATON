"""
Modelos de la base de datos de Huella Sonora.
Representan los datos ANÓNIMOS del recorrido (Línea 2).
"""
from django.db import models


class Sitio(models.Model):
    """Un atractivo turístico (museo, huaca, centro arqueológico)."""
    TIPO = [
        ("museo", "Museo"),
        ("arqueologico", "Centro arqueológico"),
    ]
    nombre = models.CharField(max_length=120)
    ciudad = models.CharField(max_length=80, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPO, default="arqueologico")
    # coordenadas reales (para el mapa interactivo)
    latitud = models.FloatField(default=-12.0464)
    longitud = models.FloatField(default=-77.0428)
    # posición en % sobre el mapa del Perú (para el mapa de calor del dashboard)
    mapa_top = models.FloatField(default=50)
    mapa_left = models.FloatField(default=50)

    def __str__(self):
        return self.nombre


class Baliza(models.Model):
    """Una baliza BLE = una estación dentro de un sitio."""
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, related_name="balizas")
    nombre = models.CharField(max_length=120)        # ej. "Templo del Sol"
    orden = models.PositiveIntegerField(default=1)   # orden en el recorrido
    ble_id = models.CharField(max_length=60, blank=True)  # identificador de la baliza física
    operativa = models.BooleanField(default=True)    # False = baliza sin señal / con falla

    class Meta:
        ordering = ["sitio", "orden"]

    def __str__(self):
        return f"{self.sitio.nombre} · {self.orden}. {self.nombre}"


class Recorrido(models.Model):
    """Un recorrido anónimo realizado por un usuario en la app."""
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, related_name="recorridos")
    duracion_total_seg = models.PositiveIntegerField(default=0)
    completado = models.BooleanField(default=False)
    # baliza donde abandonó (si no completó). Null = completó o sin dato.
    baliza_abandono = models.ForeignKey(
        Baliza, on_delete=models.SET_NULL, null=True, blank=True, related_name="abandonos"
    )
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        estado = "completo" if self.completado else "incompleto"
        return f"Recorrido #{self.id} · {self.sitio.nombre} ({estado})"


class RegistroEstacion(models.Model):
    """Lo que ocurrió en cada estación durante un recorrido."""
    recorrido = models.ForeignKey(Recorrido, on_delete=models.CASCADE, related_name="registros")
    baliza = models.ForeignKey(Baliza, on_delete=models.CASCADE)
    tiempo_seg = models.PositiveIntegerField(default=0)             # tiempo en el punto
    repeticiones_narracion = models.PositiveIntegerField(default=0) # veces que repitió el audio

    def __str__(self):
        return f"{self.baliza.nombre} · {self.tiempo_seg}s"
