from rest_framework import viewsets
from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua, SensorConfig
from .serializers import (
    HumedadTierraSerializer,
    AmbienteSerializer,
    EstadoBombaSerializer,
    NivelAguaSerializer,
    SensorConfigSerializer
)

# Create your views here.


class HumedadTierraViewSet(viewsets.ModelViewSet):
    queryset = HumedadTierra.objects.all().order_by("-ts_server")
    serializer_class = HumedadTierraSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        from_date = self.request.query_params.get("from")
        to_date = self.request.query_params.get("to")
        if from_date:
            qs = qs.filter(ts_server__gte=make_aware(parse_datetime(from_date)))
        if to_date:
            qs = qs.filter(ts_server__lte=make_aware(parse_datetime(to_date)))
        return qs


class AmbienteViewSet(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all().order_by("-ts_server")
    serializer_class = AmbienteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        from_date = self.request.query_params.get("from")
        to_date = self.request.query_params.get("to")
        if from_date:
            try:
                qs = qs.filter(ts_server__gte=make_aware(parse_datetime(from_date)))
            except Exception:
                pass
        if to_date:
            try:
                qs = qs.filter(ts_server__lte=make_aware(parse_datetime(to_date)))
            except Exception:
                pass
        return qs


class EstadoBombaViewSet(viewsets.ModelViewSet):
    queryset = EstadoBomba.objects.all().order_by("-ts_server")
    serializer_class = EstadoBombaSerializer


class NivelAguaViewSet(viewsets.ModelViewSet):
    queryset = NivelAgua.objects.all().order_by("-ts_server")
    serializer_class = NivelAguaSerializer

class SensorConfigViewSet(viewsets.ModelViewSet):
    queryset = SensorConfig.objects.all()
    serializer_class = SensorConfigSerializer