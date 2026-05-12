from rest_framework import viewsets
from sensores.models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua, SensorConfig
from sensores.serializers import (
    HumedadTierraSerializer,
    AmbienteSerializer,
    EstadoBombaSerializer,
    NivelAguaSerializer,
    SensorConfigSerializer
)

# --- VISTAS SIMPLIFICADAS (SIN FILTRO DE FECHA POR AHORA) ---

class SensorConfigViewSet(viewsets.ModelViewSet):
    queryset = SensorConfig.objects.all().order_by('id') 
    serializer_class = SensorConfigSerializer

class HumedadTierraViewSet(viewsets.ReadOnlyModelViewSet):
    # Trae todo ordenado por fecha (el más nuevo arriba)
    queryset = HumedadTierra.objects.all().order_by('-ts_server')
    serializer_class = HumedadTierraSerializer

class AmbienteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ambiente.objects.all().order_by('-ts_server')
    serializer_class = AmbienteSerializer

class EstadoBombaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EstadoBomba.objects.all().order_by('-ts_server')
    serializer_class = EstadoBombaSerializer

class NivelAguaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NivelAgua.objects.all().order_by('-ts_server')
    serializer_class = NivelAguaSerializer