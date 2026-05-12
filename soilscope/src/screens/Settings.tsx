import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar } from "react-native";
import { useFetch } from "../hooks/useFetch";
// 1. IMPORTAMOS EL CONTEXTO
import { useSettings } from "../context/SettingsContext";
 

interface SensorConfig {
  id: number;
  sensor_id: string;
  planta: string;
  sector: string;
}

export default function Configuracion() {
  // 2. OBTENEMOS DATOS Y FUNCIONES DEL CONTEXTO
  const { host, saveSettings, getBaseUrl } = useSettings();
  
  // Estado local para el input de la IP (para poder escribir sin guardar a cada letra)
  const [ipInput, setIpInput] = useState(host);

  // Estados del formulario de sensores (lo que ya tenías)
  const [sensorId, setSensorId] = useState("");
  const [planta, setPlanta] = useState("");
  const [sector, setSector] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // Sincronizar input si el host cambia externamente (buena práctica)
  useEffect(() => {
    setIpInput(host);
  }, [host]);

  // 3. DEFINIMOS LA URL BASE DINÁMICA
  const apiUrl = `${getBaseUrl('http')}/api/sensores-config/`;

  // 4. PASAMOS apiUrl COMO DEPENDENCIA (Para que recargue si cambia la IP)
  const { data, loading, error, refetch } = useFetch<SensorConfig[]>(
    apiUrl, 
    [apiUrl] 
  );

  // Función para guardar la nueva IP en la memoria del celu
  const handleGuardarIp = async () => {
    if(!ipInput.trim()) {
        Alert.alert("Error", "La IP no puede estar vacía");
        return;
    }
    await saveSettings(ipInput);
    Alert.alert("Conexión", "IP Actualizada. Se intentará reconectar.");
    // Al cambiar el contexto, 'apiUrl' cambia y useFetch se dispara solo.
  };

  // Crear o editar (Ahora usa apiUrl dinámica)
  const guardarConfig = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${apiUrl}${editId}/`
      : apiUrl;

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sensor_id: sensorId, planta, sector }),
        });
        
        if (res.ok) {
            limpiarFormulario();
            refetch(); // Recargar lista
        } else {
            Alert.alert("Error", "No se pudo guardar el sensor");
        }
    } catch (e) {
        Alert.alert("Error de Conexión", "Verificá la IP configurada arriba.");
    }
  };

  const eliminarConfig = async (id: number) => {
    try {
        await fetch(`${apiUrl}${id}/`, { method: "DELETE" });
        refetch();
    } catch (e) {
        Alert.alert("Error", "No se pudo eliminar");
    }
  };

  // ... (Esta parte queda igual a tu código original)
  const cargarEnFormulario = (cfg: SensorConfig) => {
    setSensorId(cfg.sensor_id);
    setPlanta(cfg.planta);
    setSector(cfg.sector);
    setEditId(cfg.id);
  };

  const limpiarFormulario = () => {
    setSensorId("");
    setPlanta("");
    setSector("");
    setEditId(null);
  };

  return (
    <View style={styles.container}>
      
      {/* --- SECCIÓN NUEVA: CONFIGURACIÓN IP --- */}
      <View style={styles.connectionCard}>
        <Text style={styles.subtitle}>📡 Conexión Servidor (Django)</Text>
        <Text style={styles.helperText}>Ej: 192.168.1.55:8000</Text>
        <View style={{flexDirection: 'row', gap: 10}}>
            <TextInput 
                value={ipInput} 
                onChangeText={setIpInput} 
                style={[styles.input, {flex: 1, backgroundColor: 'white'}]}
                placeholder="IP:PUERTO"
                autoCapitalize="none"
            />
            <Button title="Guardar IP" onPress={handleGuardarIp} color="#2196F3" />
        </View>
      </View>
      {/* --------------------------------------- */}

      <View style={styles.divider} />

      <Text style={styles.title}>Alta de Sensores</Text>

      {/* Formulario */}
      <TextInput placeholder="Sensor ID (ej: sensor_01)" value={sensorId} onChangeText={setSensorId} style={styles.input}/>
      <TextInput placeholder="Planta (ej: Tomate)" value={planta} onChangeText={setPlanta} style={styles.input}/>
      <TextInput placeholder="Sector (ej: Invernadero A)" value={sector} onChangeText={setSector} style={styles.input}/>
      
      <View style={{marginTop: 10, marginBottom: 20}}>
          <Button title={editId ? "Actualizar Datos" : "Crear Sensor"} onPress={guardarConfig} color={editId ? "orange" : "#4CAF50"} />
          {editId && <View style={{marginTop:10}}><Button title="Cancelar Edición" color="gray" onPress={limpiarFormulario} /></View>}
      </View>

      {/* Feedback de carga */}
      {loading && <Text>Cargando lista de sensores...</Text>}
      {error && <Text style={{color:"red"}}>Error: No se pudo conectar a {host}</Text>}

      {/* Lista */}
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.item}>
              <Text style={{fontWeight:'bold'}}>{item.planta}</Text> ({item.sector}){"\n"}
              <Text style={{fontSize: 12, color: 'gray'}}>ID: {item.sensor_id}</Text>
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => cargarEnFormulario(item)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarConfig(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,  backgroundColor: '#f5f5f5' },
  // Estilos nuevos para la tarjeta de conexión
  connectionCard: {
      backgroundColor: '#e3e3e3',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#ccc'
  },
  subtitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: '#333' },
  helperText: { fontSize: 12, color: '#666', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 10 },
  
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: '#333' },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 6, borderColor: '#bbb', backgroundColor: 'white' },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5, padding: 10, backgroundColor: 'white', borderRadius: 8, elevation: 1 },
  item: { fontSize: 16, flex: 1 },
  actions: { flexDirection: "row", gap: 15 },
  edit: { fontSize: 22 },
  delete: { fontSize: 22 },
});