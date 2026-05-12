from rest_framework.decorators import api_view
from rest_framework.response import Response

# CAMBIO AQUÍ: Usamos la ruta completa 'sensores.mqtt_client'
from sensores.management.commands.mqtt_client import publicar_comando

@api_view(["POST"])
def control_bomba(request):
    try:
        estado = request.data.get("estado")
        if estado is None:
            return Response({"error": "Falta parámetro 'estado'"}, status=400)
        
        # Convertimos a booleano
        estado_bool = str(estado).lower() in ["true", "on", "1"]
        
        # Llamamos al MQTT
        publicar_comando(estado_bool)
        
        return Response({"mensaje": f"Bomba accionada: {estado_bool}"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)