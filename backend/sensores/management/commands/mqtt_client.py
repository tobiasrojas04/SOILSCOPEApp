import paho.mqtt.client as mqtt
from decouple import config

BROKER_HOST = config('MQTT_BROKER_IP', default='127.0.0.1')
BROKER_PORT = config('MQTT_BROKER_PORT', default=1883, cast=int)
TOPIC_COMANDO = "commBomba" 

def publicar_comando(estado: bool):
    """
    Publica BON para encender y BOFF para apagar.
    """
    try:
        client = mqtt.Client()
        client.connect(BROKER_HOST, BROKER_PORT, 60)
        
        # --- LÓGICA TOBI ---
        # Si estado es True (Prender) -> mensaje = "BON"
        # Si estado es False (Apagar) -> mensaje = "BOFF"
        mensaje = "BON" if estado else "BOFF"
        
        # Publicamos el mensaje DIRECTO (sin json.dumps)
        client.publish(TOPIC_COMANDO, mensaje, qos=1)
        
        client.disconnect()
        print(f"📤 [API] Comando enviado a {TOPIC_COMANDO}: {mensaje}")
    except Exception as e:
        print(f"❌ [API] Error enviando comando: {e}")