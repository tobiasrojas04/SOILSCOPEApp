from django.urls import path, include
from rest_framework import routers

# 1. Importamos los ViewSets desde views
from .views import (
    HumedadTierraViewSet,
    AmbienteViewSet,
    EstadoBombaViewSet,
    NivelAguaViewSet,
    SensorConfigViewSet
)

# 2. IMPORTAMOS LA BOMBA DESDE EL ARCHIVO NUEVO
# (Esto evita el error circular que te estaba volviendo loco)
from .api_bomba import control_bomba

router = routers.DefaultRouter()
router.register(r"humedad", HumedadTierraViewSet)
router.register(r"ambiente", AmbienteViewSet)
router.register(r"bomba", EstadoBombaViewSet)
router.register(r"nivel", NivelAguaViewSet)
router.register(r"sensores-config", SensorConfigViewSet)

urlpatterns = [
    # Ruta manual usando el archivo nuevo
    path("control-bomba/", control_bomba, name="control_bomba"),
    
    # Rutas automáticas
    path("", include(router.urls)), 
]