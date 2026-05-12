import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { useFetch } from "../hooks/useFetch";
import { colors } from "../theme/colors";

type SensorType = "humedad" | "ambiente" | "bomba" | "nivel";

interface Registro {
  id: number;
  ts_sensor: string;
  ts_server: string;
  valor?: number;
  temperatura?: number;
  humedad?: number;
  estado?: boolean;
  distancia?: number;
}

const filtros = [
  { label: "24h" },
  { label: "Semana" },
  { label: "Mes" },
  { label: "Todo" },
];

export default function History() {
  const [tipo, setTipo] = useState<SensorType>("humedad");
  const [filtro, setFiltro] = useState("24h");

  // 1. OBTENER URL BASE DEL CONTEXTO
  const { getBaseUrl, host } = useSettings();
  const baseUrl = getBaseUrl("http");

  // 2. CONSTRUCCIÓN DE LA URL (MODO SEGURO)
  // Para evitar el Error 500, pedimos siempre la lista limpia sin filtros de fecha.
  // Django nos va a devolver los últimos datos paginados (por defecto los últimos 10-50).
  const endpoint = host ? `${baseUrl}/api/${tipo}/` : null;

  // 3. FETCH DE DATOS
  // Dejamos 'tipo' en las dependencias para que recargue al cambiar de pestaña.
  // Quitamos 'filtro' de las dependencias de red porque ahora filtramos visualmente nada más.
  const { data, loading, error } = useFetch<any>(endpoint, [tipo, host]);

  // 4. EXTRACCIÓN INTELIGENTE DE DATOS
  // Si viene con paginación (Django Rest Framework standard) usa .results
  // Si viene como array directo, usa data.
  // Si es null, usa array vacío.
  const registros: Registro[] = data?.results
    ? data.results
    : Array.isArray(data)
    ? data
    : [];

  const renderFila = (item: Registro) => {
    // Intentamos usar ts_server, si falla usamos la fecha actual
    const fechaStr = item.ts_server || new Date().toISOString();
    const fecha = new Date(fechaStr).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (tipo) {
      case "humedad":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.valor}%</Text>
          </View>
        );
      case "ambiente":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.temperatura}°C</Text>
            <Text style={styles.cell}>{item.humedad}%</Text>
          </View>
        );
      case "bomba":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text
              style={[styles.cell, { color: item.estado ? "green" : "red" }]}
            >
              {item.estado ? "ENCENDIDA" : "APAGADA"}
            </Text>
          </View>
        );
      case "nivel":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.distancia} cm</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Sensores</Text>

      <Text style={{ fontSize: 10, color: "gray", marginBottom: 10 }}>
        Conectado a: {host || "Sin configurar"}
      </Text>

      {/* BOTONES DE TIPO DE SENSOR */}
      <View style={styles.selector}>
        {["humedad", "ambiente", "bomba", "nivel"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTipo(t as SensorType)}>
            <Text
              style={[styles.selectorText, tipo === t && styles.selectorActive]}
            >
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTONES DE FILTRO (VISUALES POR AHORA) */}
      <View style={styles.filterBar}>
        {filtros.map((f) => (
          <TouchableOpacity key={f.label} onPress={() => setFiltro(f.label)}>
            <Text
              style={[
                styles.filterText,
                filtro === f.label && styles.filterActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ESTADO DE CARGA Y ERROR */}
      {loading && (
        <ActivityIndicator size="large" color={colors.text || "black"} />
      )}
      {error && (
        <View style={{ padding: 10, backgroundColor: "#ffebee" }}>
          <Text style={{ color: "red", fontWeight: "bold" }}>
            Error de conexión:
          </Text>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      )}

      {/* LISTA DE DATOS */}
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderFila(item)}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No hay datos registrados.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg || "#fff", padding: 16 },
  title: {
    color: colors.text || "#000",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 5,
  },
  selectorText: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  selectorActive: {
    color: colors.primary || "#007bff",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterText: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  filterActive: {
    color: colors.text || "#000",
    fontWeight: "bold",
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    paddingVertical: 12,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
    color: colors.text || "#000",
    fontSize: 14,
  },
});
