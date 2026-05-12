from django.urls import path, include
from rest_framework import routers
from .views import (
    HumedadTierraViewSet,
    AmbienteViewSet,
    EstadoBombaViewSet,
    NivelAguaViewSet,
    control_bomba,
)

router = routers.DefaultRouter()
router.register(r"humedad", HumedadTierraViewSet)
router.register(r"ambiente", AmbienteViewSet)
router.register(r"bomba", EstadoBombaViewSet)
router.register(r"nivel", NivelAguaViewSet)

urlpatterns = [
    path("", include(router.urls)),                   # todas las rutas del router
    path("control-bomba/", control_bomba, name="control_bomba"),  # 👈 ahora sí fijo
]
