from django.contrib import admin
from .models import Sitio, Baliza, Recorrido, RegistroEstacion

# Esto hace que los datos aparezcan en el panel de Django (http://localhost:8000/admin/)
admin.site.register(Sitio)
admin.site.register(Baliza)
admin.site.register(Recorrido)
admin.site.register(RegistroEstacion)
