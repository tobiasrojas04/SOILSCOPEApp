import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SensorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Agregamos el cliente a un grupo para poder enviarle eventos luego
        await self.channel_layer.group_add("sensores_group", self.channel_name)
        await self.accept()
        # Mensaje de bienvenida
        await self.send(text_data=json.dumps({
            "mensaje": "Conectado al servidor WebSocket ✅"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("sensores_group", self.channel_name)

    async def receive(self, text_data):
        # Si en el futuro querés recibir datos desde la app
        data = json.loads(text_data)
        print("📩 Mensaje desde app:", data)

    # Este método se dispara cuando desde el backend hacemos group_send()
    async def send_sensor_data(self, event):
        await self.send(text_data=json.dumps(event["data"]))
