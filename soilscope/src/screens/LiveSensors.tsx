import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import SensorCard from "../components/SensorCard";
import { useSettings } from "../context/SettingsContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { colors } from "../theme/colors";

export default function LiveSensors() {
  const [valores, setValores] = useState<Record<string, number>>({});
  const [cargandoBomba, setCargandoBomba] = useState(false); // Para mostrar spinner mientras carga

  const { host, getBaseUrl } = useSettings();
  const isFocused = useIsFocused();

  const wsUrl = host ? `${getBaseUrl("ws")}/ws/sensores/` : "";

  // 1. WebSocket (Lectura)
  const { status, manualReconnect } = useWebSocket(
    wsUrl,
    (data) => {
      if (data && data.sensor_id && data.valor !== undefined) {
        setValores((prev) => ({
          ...prev,
          [data.sensor_id]: Number(data.valor),
        }));
      }
    },
    5000,
    5,
    isFocused
  );

  // 2. Función para Prender/Apagar (Escritura)
  const toggleBomba = async () => {
    // Si no tenemos IP, no hacemos nada
    if (!host) return;

    // Estado actual (si es 1 es true, si no es false)
    const estadoActual = valores["actuador_bomba"] === 1;
    const nuevoEstado = !estadoActual; // Lo opuesto

    setCargandoBomba(true);

    try {
      // Hacemos el POST al Backend
      const response = await fetch(`${getBaseUrl("http")}/api/control-bomba/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error("Error en servidor");
      }

      console.log("Comando enviado: ", nuevoEstado);
      // Nota: No cambiamos 'setValores' manualmente acá.
      // Esperamos a que el ESP32 confirme el cambio por WebSocket. Magia pura.
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el actuador.");
      console.error(error);
    } finally {
      setCargandoBomba(false);
    }
  };

  const bombaPrendida = valores["actuador_bomba"] === 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Control 🚜</Text>

      <View style={styles.headerInfo}>
        <Text style={{ fontSize: 12, color: "gray" }}>IP: {host || "--"}</Text>
        <Text
          style={{
            color: status.includes("🟢") ? "#4caf50" : "#f44336",
            fontWeight: "bold",
          }}
        >
          {status}
        </Text>
      </View>

      {(status.includes("❌") || status.includes("🔴")) && isFocused && (
        <Button
          title="Reconectar WS"
          onPress={manualReconnect}
          color="#2196F3"
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FILA 1 */}
        <View style={styles.row}>
          <SensorCard
            label="Humedad Suelo"
            value={valores["sensor_humedad"] ?? "--"}
            unit="%"
            color="#4caf50"
            subtitle="Sector A"
          />
          <SensorCard
            label="Temperatura"
            value={valores["sensor_temp"] ?? "--"}
            unit="°C"
            color="#FFC107"
            subtitle="Ambiente"
          />
        </View>

        {/* FILA 2 */}
        <View style={styles.row}>
          <SensorCard
            label="Nivel Tanque"
            value={valores["sensor_nivel"] ?? "--"}
            unit="cm"
            color="#2196F3"
            subtitle="Reserva"
          />

          {/* --- TARJETA DE BOMBA INTERACTIVA --- */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Bomba Riego</Text>
              <Text style={styles.cardSubtitle}>Control Manual</Text>
            </View>

            <View style={styles.controlContainer}>
              {cargandoBomba ? (
                <ActivityIndicator color="white" />
              ) : (
                <Switch
                  trackColor={{ false: "#767577", true: "#f44336" }} // Rojo cuando prende
                  thumbColor={bombaPrendida ? "#ffeba9" : "#f4f3f4"}
                  onValueChange={toggleBomba}
                  value={bombaPrendida}
                />
              )}
              <Text
                style={{ color: "white", fontWeight: "bold", marginTop: 5 }}
              >
                {bombaPrendida ? "ENCENDIDA 🔥" : "APAGADA 💤"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos un poco más personalizados para la tarjeta de la bomba
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg || "#121212",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    color: colors.text || "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "center",
  },
  scrollContent: { paddingBottom: 50 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  // Estilos manuales para simular SensorCard pero con Switch
  cardContainer: {
    width: "48%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    elevation: 3,
  },
  cardHeader: { marginBottom: 10 },
  cardLabel: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  cardSubtitle: { color: "#666", fontSize: 11 },
  controlContainer: { alignItems: "center", justifyContent: "center" },
});
