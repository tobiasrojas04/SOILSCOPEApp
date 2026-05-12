#include <Arduino.h>
#include <WiFi.h>
#include "esp_timer.h"
#include "DHT.h"
#include <PubSubClient.h>

// =======================
// ----- CONFIGURACIÓN WI-FI ----
// =======================
const char* ssid = "UNRaf_Docentes";
const char* password = "UNRaf.#2021";

void conectarWiFi() {
    Serial.println("\nConectando a WiFi...");
    WiFi.begin(ssid, password);

    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 20) {
        delay(500);
        Serial.print(".");
        intentos++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi conectado.");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nNo se pudo conectar a WiFi.");
    }
}

// =======================
// --- TIMER WIFI (esp_timer) ---
// =======================
esp_timer_handle_t wifiTimer;
volatile bool checkWifiFlag = false;

void wifiTimerCallback(void* arg) {
    checkWifiFlag = true;
}

void reporteWifi() {
    wl_status_t st = WiFi.status();

    Serial.print("WiFi Estado → ");

    switch (st) {
        case WL_CONNECTED:
            Serial.println("CONECTADO");
            break;
        case WL_DISCONNECTED:
            Serial.println("DESCONECTADO");
            conectarWiFi();
            break;
        case WL_CONNECT_FAILED:
            Serial.println("FALLO DE CONEXIÓN");
            break;
        case WL_IDLE_STATUS:
            Serial.println("ESPERANDO...");
            break;
        default:
            Serial.println("OTRO ESTADO");
            break;
    }
}

// =======================
// ----- CONFIGURACIÓN MQTT ------
// =======================

WiFiClient espClient;
PubSubClient client(espClient);

const char* mqtt_server = "10.102.0.20";  // IP de tu Raspberry Pi

void reconnectMQTT() {
    while (!client.connected()) {
        Serial.print("Conectando a MQTT...");
        if (client.connect("ESP32_SistemaRiego1")) {

            Serial.println(" conectado!");

            // Suscripción al tópico de comando de bomba
            client.subscribe("sistemaRiego1/commBomba");

        } else {
            Serial.print("Fallo, rc=");
            Serial.print(client.state());
            Serial.println(" — Reintentando en 3s");
            delay(3000);
        }
    }
}

// =======================
// ----- CONFIG ADC ------
// =======================
const int pinSoil1 = 34;
const int pinSoil2 = 35;

float humedad1 = 0;
float humedad2 = 0;
float promHumedad = 0;

// =======================
// ------ CONFIG DHT ------
// =======================
#define DHTPIN 15
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// =======================
// ---- CONFIG ULTRA ------
// =======================
#define TRIG_PIN 12
#define ECHO_PIN 14

const float profundidad = 20.0;
float nAgua = 0.0;
String estadoAgua = "desconocido";

// =======================
// --- BOMBA & LED --------
// =======================
#define PIN_RELE 2
#define PIN_LED 19
int estadoBomba = 0;
int ultimoEstadoBomba = -1;

// =======================
// ---- TIMERS ------------
// =======================
unsigned long tSuelo = 0;
unsigned long tUltra = 0;
unsigned long tAmb   = 0;
unsigned long tBomba = 0;
unsigned long tLed = 0;

unsigned long INT_SUELO = 3000;
unsigned long INT_AMB   = 8000;
unsigned long INT_ULTRA = 1000;
unsigned long INT_BOMBA = 1000;
unsigned long INT_LED = 1000;

// =======================
// --- CALIBRACIÓN HUMEDAD ---
// =======================
const int S1_SECO   = 2460;
const int S1_HUMEDO = 1033;

const int S2_SECO   = 3400;
const int S2_HUMEDO = 1910;

// Para interpolación lineal
float mapSoil(int raw, int seco, int humedo) {
    raw = constrain(raw, humedo, seco);
    float porc = (float)(seco - raw) / (float)(seco - humedo) * 100.0;
    return constrain(porc, 0.0, 100.0);
}


// =======================
// --- HUMEDAD SUELO ------
// =======================
void leerHumedadSuelo() {
    if (millis() - tSuelo < INT_SUELO) return;
    tSuelo = millis();

    int raw1 = analogRead(pinSoil1);
    int raw2 = analogRead(pinSoil2);

    humedad1 = mapSoil(raw1, S1_SECO, S1_HUMEDO);
    humedad2 = mapSoil(raw2, S2_SECO, S2_HUMEDO);

    promHumedad = (humedad1 + humedad2) / 2.0;
}

// =======================
// ------ ULTRASONICO ------
// =======================
float medirDistanciaCM() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duracion = pulseIn(ECHO_PIN, HIGH, 30000);
    if (duracion == 0) return -1;
    return duracion * 0.0343 / 2.0;
}

void leerUltrasonico() {
    if (millis() - tUltra < INT_ULTRA) return;
    tUltra = millis();

    float distancia = medirDistanciaCM();
    if (distancia < 0) {
        Serial.println("ERROR: No se detecta eco");
        return;
    }

    nAgua = profundidad - distancia;
    nAgua = constrain(nAgua, 0, profundidad);

    float porcentaje = (nAgua / profundidad) * 100.0;

    if (porcentaje >= 75) estadoAgua = "lleno";
    else if (porcentaje >= 35) estadoAgua = "medio";
    else if (porcentaje >= 10) estadoAgua = "bajo";
    else estadoAgua = "vacio";
}

// =======================
// ----- MANEJO BOMBA -----
// =======================
void manejoBomba() {
    if (millis() - tBomba < INT_BOMBA) return;
    tBomba = millis();

    int nuevoEstado = estadoBomba;

    if (estadoAgua == "desconocido") {
        digitalWrite(PIN_RELE, LOW);
        nuevoEstado = 0;
    }
    else if (estadoAgua != "vacio") {
        if (promHumedad < 50.0) {
            digitalWrite(PIN_RELE, HIGH);
            nuevoEstado = 1;
        } else {
            digitalWrite(PIN_RELE, LOW);
            nuevoEstado = 0;
        }
    }
    else {
        digitalWrite(PIN_RELE, LOW);
        nuevoEstado = 0;
    }

    if (nuevoEstado != ultimoEstadoBomba) {
        ultimoEstadoBomba = nuevoEstado;
        estadoBomba = nuevoEstado;

        Serial.print("SistemaRiego1/estadoBomba: {estadoBomba: ");
        Serial.print(estadoBomba);
        Serial.println("}");
    }
}

// =======================
// ------- AMBIENTE -------
// =======================
void leerAmbiente() {
    if (millis() - tAmb < INT_AMB) return;
    tAmb = millis();

    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();
}

// =======================
// --------- LED ---------
// =======================
void manejoLED() {
    if (estadoAgua != "vacio") {
        digitalWrite(PIN_LED, LOW);
        return;
    }
    if (millis() - tLed < INT_LED) return;
    tLed = millis();
    digitalWrite(PIN_LED, !digitalRead(PIN_LED));
}

// =======================
// --------- SETUP --------
// =======================
void setup() {
    Serial.begin(115200);
    analogReadResolution(12);

    analogSetPinAttenuation(pinSoil1, ADC_11db);
    analogSetPinAttenuation(pinSoil2, ADC_11db);

    dht.begin();

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(PIN_RELE, OUTPUT);
    pinMode(PIN_LED, OUTPUT);

    digitalWrite(PIN_RELE, LOW);
    digitalWrite(PIN_LED, LOW);

    Serial.println("Sistema inicializado.");

    // ---- Conectar WiFi ----
    conectarWiFi();

    // ---- Crear timer WiFi cada 3 segundos ----
    const esp_timer_create_args_t wifiTimerArgs = {
        .callback = &wifiTimerCallback,
        .arg = NULL,
        .dispatch_method = ESP_TIMER_TASK,
        .name = "wifi_timer"
    };

    esp_timer_create(&wifiTimerArgs, &wifiTimer);
    esp_timer_start_periodic(wifiTimer, 3000000);  // 3s

    client.setServer(mqtt_server, 1883);
    client.setCallback(callbackMQTT);

}

// =======================
// ----- FUNCIONES DE ENVÍO y RECEPCIÓN POR MQTT ------
// =======================
// HUMEDAD DEL SUELO
unsigned long tMQTTsuelo = 0;

void envioHumSuelo() {
    if (millis() - tMQTTsuelo < 5000) return;
    tMQTTsuelo = millis();

    String json = "{ \"Promedio\": " + String(promHumedad, 2) + " }";

    client.publish("sistemaRiego1/humSuelo", json.c_str());

    Serial.print("SistemaRiego1/humSuelo: {Sensor1: ");
    Serial.print(humedad1, 2);
    Serial.print(" ; Sensor2: ");
    Serial.print(humedad2, 2);
    Serial.print(" ; Promedio: ");
    Serial.print(promHumedad, 2);
    Serial.println("}");
}

// FACTORES AMBIENTALES
unsigned long tMQTTamb = 0;

void envioAmbiente() {
    if (millis() - tMQTTamb < 20000) return;
    tMQTTamb = millis();

    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();

    String json = "{ \"Temperatura\": " + String(temp, 1) +
                  ", \"Humedad_Relativa\": " + String(hum, 1) +
                  " }";

    client.publish("sistemaRiego1/ambiente", json.c_str());

    Serial.print("SistemaRiego1/ambiente: {Temperatura: ");
    Serial.print(temp);
    Serial.print(" ; Humedad_Relativa: ");
    Serial.print(hum);
    Serial.println("}");
}

// NIVEL DEL AGUA EN EL TANQUE
unsigned long tMQTTagua = 0;

void envioNivelAgua() {
    if (millis() - tMQTTagua < 8000) return;
    tMQTTagua = millis();

    String json = "{ \"Nivel_de_Agua\": " + String(nAgua, 1) +
                  ", \"Estado\": \"" + estadoAgua + "\" }";

    client.publish("sistemaRiego1/nivelAgua", json.c_str());

    Serial.print("SistemaRiego1/nivelAgua: {Nivel_de_Agua: ");
    Serial.print(nAgua);
    Serial.print(" ; Estado: ");
    Serial.print(estadoAgua);
    Serial.println("}");
}

// ESTADO DE LA BOMBA
unsigned long tMQTTbomba = 0;

void envioEstadoBomba() {
    if (millis() - tMQTTbomba < 15000) return;
    tMQTTbomba = millis();

    String json = "{ \"estadoBomba\": " + String(estadoBomba) + " }";

    client.publish("sistemaRiego1/estadoBomba", json.c_str());
}

// RECEPCIÓN DEL COMANDO BOMBA
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
    String msg = "";
    for (int i = 0; i < length; i++) msg += (char)payload[i];

    if (String(topic) == "sistemaRiego1/commBomba") {

        if (msg == "BON") {
            digitalWrite(PIN_RELE, HIGH);
            estadoBomba = 1;
          	Serial.print("Comando recibido -> ");
          	Serial.print(msg);
          	Serial.println ("; BOMBA PRENDIDA");
        }
        else if (msg == "BOFF") {
            digitalWrite(PIN_RELE, LOW);
            estadoBomba = 0;
          	Serial.print("Comando recibido -> ");
        	Serial.print(msg);
        	Serial.println ("; BOMBA APAGADA!");
        }

        Serial.print("Comando recibido -> ");
        Serial.println(msg);
    }
}


// =======================
// ---------- LOOP --------
// =======================
void loop() {

    leerHumedadSuelo();
    leerUltrasonico();
    manejoBomba();
    leerAmbiente();
    manejoLED();

    if (checkWifiFlag) {
        checkWifiFlag = false;
        reporteWifi();
    }

    if (!client.connected()) reconnectMQTT();
    client.loop();

    envioHumSuelo();
    envioAmbiente();
    envioNivelAgua();
    envioEstadoBomba();

}
