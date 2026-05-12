import threading
import json
import time
import os
import paho.mqtt.client as mqtt
from django.apps import AppConfig
from decouple import config
from asgiref.sync import async_to_sync

class SensoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sensores'

    def ready(self):
        if os.environ.get('RUN_MAIN') != 'true':
            return

        mqtt_thread = threading.Thread(target=self.start_mqtt_client)
        mqtt_thread.daemon = True
        mqtt_thread.start()

    def start_mqtt_client(self):
        from channels.layers import get_channel_layer
        from .models import HumedadTierra, Ambiente, EstadoBomba, NivelAgua
        from django.utils import timezone

        BROKER_HOST = config('MQTT_BROKER_IP', default='127.0.0.1')
        BROKER_PORT = config('MQTT_BROKER_PORT', default=1883, cast=int)
        GROUP_NAME = "sensores_group"
        
        TOPICS = [
            ("sistemaRiego1/humSuelo", 0),
            ("sistemaRiego1/ambiente", 0),
            ("sistemaRiego1/estadoBomba", 0), # Escuchamos si cambia la bomba
            ("sistemaRiego1/nivelAgua", 0)
        ]

        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print(f"✅ [MQTT] Conectado a {BROKER_HOST}")
                client.subscribe(TOPICS)
            else:
                print(f"❌ [MQTT] Error conexión: {rc}")

        def on_message(client, userdata, msg):
            try:
                channel_layer = get_channel_layer()
                topic = msg.topic
                ts = timezone.now()
                
                # --- INTENTO DE DECODIFICAR (JSON o TEXTO) ---
                raw_payload = msg.payload.decode()
                payload = {}
                
                # Intentamos leer como JSON, si falla, usamos el texto crudo
                try:
                    payload = json.loads(raw_payload)
                except json.JSONDecodeError:
                    # Si no es JSON, asumimos que es un valor suelto (ej: "BON")
                    payload = {"raw_value": raw_payload}

                ws_sensor_id = None
                ws_valor = None

                # --- 1. HUMEDAD ---
                if topic == "sistemaRiego1/humSuelo":
                    valor = payload.get("Promedio")
                    if valor is not None:
                        HumedadTierra.objects.create(valor=valor, ts_sensor=ts)
                        ws_sensor_id = "sensor_humedad"
                        ws_valor = valor
                        print(f"💧 Suelo: {valor}%")

                # --- 2. AMBIENTE ---
                elif topic == "sistemaRiego1/ambiente":
                    temp = payload.get("Temperatura")
                    hum = payload.get("Humedad_Relativa")
                    if temp is not None:
                        Ambiente.objects.create(temperatura=temp, humedad=hum, ts_sensor=ts)
                        ws_sensor_id = "sensor_temp"
                        ws_valor = temp
                        print(f"🌡️ Temp: {temp}°C")

                # --- 3. BOMBA (LÓGICA TOBI: BON/BOFF) ---
                elif topic == "sistemaRiego1/estadoBomba":
                    # Buscamos en JSON o usamos el texto crudo
                    val = payload.get("estadoBomba") or payload.get("estado") or payload.get("raw_value")
                    
                    # Normalizamos a mayúsculas y quitamos espacios
                    val_str = str(val).strip().upper()
                    
                    # Detectamos ON
                    estado_bool = val_str in ["BON", "ON", "TRUE", "1"]
                    
                    EstadoBomba.objects.create(estado=estado_bool, ts_sensor=ts)
                    ws_sensor_id = "actuador_bomba"
                    ws_valor = 1 if estado_bool else 0
                    print(f"⛽ Bomba: {val_str} -> {'ON' if estado_bool else 'OFF'}")

                # --- 4. NIVEL AGUA ---
                elif topic == "sistemaRiego1/nivelAgua":
                    dist = payload.get("Nivel_de_Agua")
                    if dist is not None:
                        NivelAgua.objects.create(distancia=dist, ts_sensor=ts)
                        ws_sensor_id = "sensor_nivel"
                        ws_valor = dist
                        print(f"🌊 Nivel: {dist}cm")

                # --- ENVIAR AL APP ---
                if ws_sensor_id:
                    async_to_sync(channel_layer.group_send)(
                        GROUP_NAME,
                        {
                            "type": "send_sensor_data",
                            "data": { "sensor_id": ws_sensor_id, "valor": ws_valor }
                        }
                    )

            except Exception as e:
                print(f"⚠️ Error procesando mensaje: {e}")

        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        while True:
            try:
                client.connect(BROKER_HOST, BROKER_PORT, 60)
                client.loop_forever()
            except:
                time.sleep(5)