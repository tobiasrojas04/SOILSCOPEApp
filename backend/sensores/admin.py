from django.contrib import admin
from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua
from .models import SensorConfig

# Register your models here.


@admin.register(HumedadTierra)
class HumedadTierraAdmin(admin.ModelAdmin):
    list_display = ("valor", "ts_sensor", "ts_server")

@admin.register(Ambiente)
class AmbienteAdmin(admin.ModelAdmin):
    list_display = ("temperatura", "humedad", "ts_sensor", "ts_server")

@admin.register(EstadoBomba)
class EstadoBombaAdmin(admin.ModelAdmin):
    list_display = ("estado", "ts_sensor", "ts_server")

@admin.register(NivelAgua)
class NivelAguaAdmin(admin.ModelAdmin):
    list_display = ("distancia", "ts_sensor", "ts_server")

@admin.register(SensorConfig)
class SensorConfigAdmin(admin.ModelAdmin):
    list_display = ("sensor_id", "planta", "sector")
