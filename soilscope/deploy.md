# 🚀 GUÍA DE DESPLIEGUE - LABORATORIO (Soilscope)

**Objetivo:** Levantar el proyecto en la máquina del laboratorio clonando los últimos cambios.

---

## PASO 0: OBTENER EL CÓDIGO

Abrir una terminal en la carpeta del proyecto y traer lo último:

```bash
git pull origin main
PASO 1: BACKEND (Django)
1. Ir a la carpeta del backend:

Bash

cd backend
2. Activar el entorno virtual: En Windows:

PowerShell

.\venv\Scripts\activate
# Si la carpeta se llama distinto (ej: env): .\env\Scripts\activate
⚠️ ¿Error en rojo de seguridad? Si PowerShell no te deja activar, ejecutá esto y poné "S": Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

3. Instalar dependencias nuevas: Hemos agregado una librería para manejar la configuración.

pip install -r requirements.txt

Bash

pip install python-decouple
4. Crear el archivo de configuración .env:

Creá un archivo nuevo sin nombre (solo extensión .env) en la misma carpeta donde está manage.py.

Pegale este contenido y editá la IP:

Ini, TOML

DEBUG=True
# IP de la máquina de TOBI (donde corre el Broker Mosquitto)
MQTT_BROKER_IP=192.168.X.X
MQTT_BROKER_PORT=1883
5. Iniciar el servidor:

Bash

python manage.py runserver
📝 IMPORTANTE: Averiguá la dirección IP de TU máquina (ej: ejecutando ipconfig en otra terminal). La vas a necesitar para la App.

PASO 2: FRONTEND (React Native)
1. Ir a la carpeta del frontend: (Abrir una terminal nueva)

Bash

cd soilscope
2. Instalar dependencias (CRÍTICO): Como borramos carpetas y cambiamos versiones, usá este comando exacto para evitar conflictos:

Bash

npm install --legacy-peer-deps
3. Iniciar Expo limpiando caché: Esto es fundamental para que tome los arreglos de la librería de animación (Reanimated).

Bash

npx expo start -c
PASO 3: CONFIGURACIÓN EN LA APP
Abrir Expo Go en el celular y escanear el QR.

Ir a la pestaña Configuración.

En el campo de "Conexión Servidor", ingresá la IP de TU MÁQUINA (donde corre Django).

Formato: IP_DE_TU_PC:8000 (Ej: 192.168.1.45:8000).

Dale al botón Guardar IP.

Andá a Sensores en Vivo y verificá que el estado pase a "Conectado 🟢".

🆘 SOLUCIÓN DE PROBLEMAS COMUNES
A. VS Code marca todo el código en rojo: Si el editor dice que faltan librerías pero la app funciona bien:

Presionar Ctrl + Shift + P.

Escribir Reload Window y dar Enter.

B. Pantalla roja en el celular "Cannot find module worklets/plugin": Significa que quedó caché vieja.

Cerrar la terminal de Expo (Ctrl + C).

Ejecutar de nuevo: npx expo start -c.

C. Django no conecta al Broker:

Verificar que en el archivo .env pusiste la IP correcta de la máquina de Tobi.

Asegurarse que ambas máquinas estén en la misma red Wi-Fi.

python manage.py mqtt_subscriber

python manage.py runserver 0.0.0.0:8000
```
