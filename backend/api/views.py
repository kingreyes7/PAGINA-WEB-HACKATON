"""
Vistas (endpoints) de la API de Huella Sonora.
"""
from django.contrib.auth import authenticate
from django.db.models import Count, Avg
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Sitio, Baliza, Recorrido, RegistroEstacion
from .serializers import RecorridoSerializer, SitioSerializer


# ── La APP envía aquí los datos de un recorrido ──
#    POST /api/v1/recorridos/
class RecorridoCreateView(generics.CreateAPIView):
    queryset = Recorrido.objects.all()
    serializer_class = RecorridoSerializer


# ── Lista de sitios (útil para la app) ──
#    GET /api/v1/sitios/
class SitioListView(generics.ListAPIView):
    queryset = Sitio.objects.all()
    serializer_class = SitioSerializer


# ── La WEB pide aquí los datos para las gráficas ──
#    GET /api/v1/estadisticas/
#    Devuelve EXACTAMENTE la estructura que espera assets/js/statistics.js
@api_view(["GET"])
def estadisticas(request):
    total = Recorrido.objects.count()
    completados = Recorrido.objects.filter(completado=True).count()
    tasa = round((completados / total) * 100) if total else 0

    # Lugares más visitados (sitios ordenados por nº de recorridos)
    lugares = (
        Sitio.objects.annotate(visitas=Count("recorridos"))
        .order_by("-visitas")
    )
    lugares_mas_visitados = [
        {"nombre": s.nombre, "visitas": s.visitas} for s in lugares
    ]

    # Puntos de abandono (agrupados por nombre de estación, sumando todos los sitios)
    abandono = (
        Recorrido.objects.filter(baliza_abandono__isnull=False)
        .values("baliza_abandono__nombre")
        .annotate(abandonos=Count("id"))
        .order_by("-abandonos")
    )
    puntos_de_abandono = [
        {"estacion": a["baliza_abandono__nombre"], "abandonos": a["abandonos"]}
        for a in abandono
    ]

    # Mapa de calor (cada sitio = un foco; intensidad según visitas)
    max_visitas = max([l["visitas"] for l in lugares_mas_visitados], default=1) or 1
    mapa_calor = [
        {
            "ciudad": s.ciudad or s.nombre,
            "nombre": s.nombre,
            "latitud": s.latitud,
            "longitud": s.longitud,
            "top": s.mapa_top,
            "left": s.mapa_left,
            "intensidad": round((s.visitas / max_visitas) * 100),
        }
        for s in lugares
    ]

    return Response({
        "resumen": {
            "usuariosActivos": total,          # anónimo: 1 recorrido ≈ 1 visita
            "sitiosCubiertos": Sitio.objects.count(),
            "recorridos": total,
            "tasaFinalizacion": tasa,
        },
        "lugaresMasVisitados": lugares_mas_visitados,
        "puntosDeAbandono": puntos_de_abandono,
        "mapaCalor": mapa_calor,
    })


# ── Mapa: sitios con coordenadas y sus balizas ──
#    GET /api/v1/mapa/
@api_view(["GET"])
def mapa(request):
    data = []
    for s in Sitio.objects.all():
        balizas = list(s.balizas.all().values("nombre", "orden"))
        data.append({
            "id": s.id,
            "nombre": s.nombre,
            "ciudad": s.ciudad,
            "tipo": s.tipo,
            "latitud": s.latitud,
            "longitud": s.longitud,
            "total_balizas": len(balizas),
            "balizas": balizas,
        })
    return Response(data)


# ── Diagnóstico: estado de cada baliza por sitio (para el panel del gestor) ──
#    GET /api/v1/diagnostico/
@api_view(["GET"])
def diagnostico(request):
    data = []
    for s in Sitio.objects.all():
        balizas_info = []
        for b in s.balizas.all():
            registros = RegistroEstacion.objects.filter(baliza=b)
            visitas = registros.count()
            abandonos = Recorrido.objects.filter(baliza_abandono=b).count()
            rep_prom = registros.aggregate(p=Avg("repeticiones_narracion"))["p"] or 0
            tasa_aband = (abandonos / visitas) if visitas else 0

            if not b.operativa:
                estado = "falla"
                desc = "Sin señal: la baliza no está siendo detectada. Posible batería agotada o falla del dispositivo."
            elif visitas == 0:
                estado = "falla"
                desc = "Sin registros: no se detectan recorridos en esta baliza."
            elif tasa_aband > 0.30:
                estado = "alerta"
                desc = f"Alta tasa de abandono ({round(tasa_aband*100)}%): muchas personas dejan el recorrido aquí. Revisar la narración o la ruta."
            elif rep_prom > 1.8:
                estado = "alerta"
                desc = f"Narración repetida (promedio {round(rep_prom,1)} veces): los usuarios repiten el audio; podría ser confuso o muy largo."
            else:
                estado = "ok"
                desc = "Funcionando correctamente."

            balizas_info.append({
                "orden": b.orden,
                "nombre": b.nombre,
                "ble_id": b.ble_id,
                "estado": estado,
                "visitas": visitas,
                "abandonos": abandonos,
                "repeticiones_prom": round(rep_prom, 1),
                "descripcion": desc,
            })
        data.append({
            "sitio_id": s.id,
            "sitio": s.nombre,
            "tipo": s.tipo,
            "balizas": balizas_info,
        })
    return Response(data)


# ── Login del panel privado ──
#    POST /api/v1/login/   body: {"usuario": "...", "clave": "..."}
@api_view(["POST"])
def login(request):
    usuario = request.data.get("usuario")
    clave = request.data.get("clave")
    user = authenticate(username=usuario, password=clave)
    if user is not None:
        # Demo: confirmamos el acceso. En producción se devolvería un token.
        return Response({"ok": True, "usuario": user.username})
    return Response(
        {"ok": False, "error": "Usuario o contraseña incorrectos."},
        status=status.HTTP_401_UNAUTHORIZED,
    )
