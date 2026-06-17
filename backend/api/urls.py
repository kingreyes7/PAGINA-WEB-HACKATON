from django.urls import path
from . import views

urlpatterns = [
    path("sitios/", views.SitioListView.as_view()),         # GET  lista de sitios
    path("recorridos/", views.RecorridoCreateView.as_view()),# POST la app envía datos
    path("estadisticas/", views.estadisticas),               # GET  la web pide gráficas
    path("mapa/", views.mapa),                                # GET  sitios + balizas para el mapa
    path("diagnostico/", views.diagnostico),                  # GET  estado de balizas por sitio
    path("login/", views.login),                             # POST login del panel
]
