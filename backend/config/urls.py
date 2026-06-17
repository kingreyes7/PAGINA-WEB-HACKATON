from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),       # panel de administración de Django
    path("api/v1/", include("api.urls")),  # nuestra API
]
