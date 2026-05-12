from rest_framework import serializers
from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua, SensorConfig

class SensorConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorConfig
        fields = '__all__'

class HumedadTierraSerializer(serializers.ModelSerializer):
    # Formateamos la fecha para que sea fácil de leer
    fecha = serializers.DateTimeField(source='ts_server', format="%d/%m %H:%M", read_only=True)
    
    class Meta:
        model = HumedadTierra
        fields = '__all__'

class AmbienteSerializer(serializers.ModelSerializer):
    fecha = serializers.DateTimeField(source='ts_server', format="%d/%m %H:%M", read_only=True)
    
    class Meta:
        model = Ambiente
        fields = '__all__'

class EstadoBombaSerializer(serializers.ModelSerializer):
    fecha = serializers.DateTimeField(source='ts_server', format="%d/%m %H:%M", read_only=True)
    
    class Meta:
        model = EstadoBomba
        fields = '__all__'

class NivelAguaSerializer(serializers.ModelSerializer):
    fecha = serializers.DateTimeField(source='ts_server', format="%d/%m %H:%M", read_only=True)
    
    class Meta:
        model = NivelAgua
        fields = '__all__'