import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import sensores.routing  # 👈 este lo tenés que crear (routing.py en la app sensores)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "soilscope.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            sensores.routing.websocket_urlpatterns
        )
    ),
})
