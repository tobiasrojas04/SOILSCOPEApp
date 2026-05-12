import json
import time
import paho.mqtt.client as mqtt
from decouple import config
from django.core.management.base import BaseCommand
from django.utils import timezone

# --- IMPORTS PARA EL PUENTE (DB y WEBSOCKETS) ---
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
# Usamos el import absoluto para evitar problemas de rutas
from sensores.models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua

# Configuración del Broker
BROKER_HOST = config('MQTT_BROKER_IP', default='127.0.0.1')
BROKER_PORT = config('MQTT_BROKER_PORT', default=1883, cast=int)

class Command(BaseCommand):
    help = "Suscriptor MQTT: Guarda en DB y avisa al Frontend en tiempo real (Con reconexión automática)"

    def handle(self, *args, **kwargs):
        # 1. Obtenemos la capa de canales
        channel_layer = get_channel_layer()
        GROUP_NAME = "sensores_group" 

        self.stdout.write(self.style.WARNING(f"--- INICIANDO PUENTE MQTT <-> WEBSOCKET ---"))
        self.stdout.write(f"Objetivo: {BROKER_HOST}:{BROKER_PORT}")

        # Callback de conexión
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                self.stdout.write(self.style.SUCCESS("✅ Conectado al Broker MQTT"))
                topics = [
                    ("sistemaRiego1/humSuelo", 0),
                    ("sistemaRiego1/ambiente", 0),
                    ("sistemaRiego1/estadoBomba", 0),
                    ("sistemaRiego1/nivelAgua", 0)
                ]
                client.subscribe(topics)
            else:
                self.stdout.write(self.style.ERROR(f"❌ Falló conexión MQTT. Código: {rc}"))

        # Callback de mensaje
        def on_message(client, userdata, msg):
            try:
                payload_str = msg.payload.decode()
                payload = json.loads(payload_str)
                topic = msg.topic
                ts_sensor = timezone.now()

                ws_sensor_id = None
                ws_valor = None

                # --- LÓGICA DE PROCESAMIENTO ---

                # 1. HUMEDAD SUELO
                if topic == "sistemaRiego1/humSuelo":
                    valor = payload.get("Promedio")
                    if valor is not None:
                        HumedadTierra.objects.create(valor=valor, ts_sensor=ts_sensor)
                        ws_sensor_id = "sensor_humedad"
                        ws_valor = valor
                        print(f"💧 Suelo: {valor}%")

                # 2. AMBIENTE
                elif topic == "sistemaRiego1/ambiente":
                    temp = payload.get("Temperatura")
                    hum = payload.get("Humedad_Relativa")
                    if temp is not None:
                        Ambiente.objects.create(temperatura=temp, humedad=hum, ts_sensor=ts_sensor)
                        ws_sensor_id = "sensor_temp"
                        ws_valor = temp
                        print(f"🌡️ Ambiente: {temp}°C")

                # 3. BOMBA
                elif topic == "sistemaRiego1/estadoBomba":
                    raw_state = payload.get("estadoBomba") or payload.get("estado")
                    estado_bool = False
                    if isinstance(raw_state, (bool, int)):
                         estado_bool = bool(raw_state)
                    elif isinstance(raw_state, str):
                        estado_bool = raw_state.strip().lower() in ["on", "true", "1"]
                    
                    EstadoBomba.objects.create(estado=estado_bool, ts_sensor=ts_sensor)
                    ws_sensor_id = "actuador_bomba"
                    ws_valor = 1 if estado_bool else 0
                    print(f"⛽ Bomba: {estado_bool}")

                # 4. NIVEL AGUA
                elif topic == "sistemaRiego1/nivelAgua":
                    dist = payload.get("Nivel_de_Agua")
                    if dist is not None:
                        NivelAgua.objects.create(distancia=dist, ts_sensor=ts_sensor)
                        ws_sensor_id = "sensor_nivel"
                        ws_valor = dist
                        print(f"🌊 Nivel: {dist}cm")

                # --- ENVIAR AL WEBSOCKET ---
                if ws_sensor_id is not None:
                    mensaje_ws = {
                        "type": "send_sensor_data", 
                        "data": {
                            "sensor_id": ws_sensor_id,
                            "valor": ws_valor
                        }
                    }
                    async_to_sync(channel_layer.group_send)(GROUP_NAME, mensaje_ws)

            except json.JSONDecodeError:
                print(f"⚠️ Error JSON en {msg.topic}")
            except Exception as e:
                print(f"❌ Error procesando mensaje: {e}")

        # --- BUCLE DE RECONEXIÓN "INMORTAL" ---
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        while True:
            try:
                self.stdout.write("⏳ Intentando conectar...")
                client.connect(BROKER_HOST, BROKER_PORT, 60)
                # Si conecta, se queda aquí bloqueado escuchando
                client.loop_forever()
            except Exception as e:
                # Si falla (o se desconecta el cable), cae acá
                self.stdout.write(self.style.ERROR(f"⚠️ Sin conexión ({e}). Reintentando en 5s..."))
                time.sleep(5)