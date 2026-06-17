"""
Serializers: convierten los modelos a JSON y validan lo que envía la app.
"""
from rest_framework import serializers
from .models import Sitio, Baliza, Recorrido, RegistroEstacion


class RegistroEstacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroEstacion
        fields = ["baliza", "tiempo_seg", "repeticiones_narracion"]


class RecorridoSerializer(serializers.ModelSerializer):
    """
    Permite que la app envíe un recorrido con sus registros anidados en un solo POST.
    Ejemplo de lo que manda la app:
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
    """
    registros = RegistroEstacionSerializer(many=True, required=False)

    class Meta:
        model = Recorrido
        fields = ["id", "sitio", "duracion_total_seg", "completado",
                  "baliza_abandono", "registros", "creado"]
        read_only_fields = ["id", "creado"]

    def create(self, validated_data):
        registros_data = validated_data.pop("registros", [])
        recorrido = Recorrido.objects.create(**validated_data)
        for reg in registros_data:
            RegistroEstacion.objects.create(recorrido=recorrido, **reg)
        return recorrido


class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = ["id", "nombre", "ciudad", "tipo"]
