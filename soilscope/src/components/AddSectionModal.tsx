import React, { useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (data: { nombre: string; cuarto?: string; plantas: string[] }) => void;
};

const CUARTOS = ["Cocina", "Living", "Dormitorio", "Baño", "Balcón/Patio", "Otro"];

export default function AddSectionModal({ visible, onCancel, onConfirm }: Props) {
  const [nombre, setNombre] = useState("");
  const [cuarto, setCuarto] = useState<string>("");
  const [plantasStr, setPlantasStr] = useState("");

  // resetea al abrir/cerrar
  useMemo(() => {
    if (!visible) {
      setNombre("");
      setCuarto("");
      setPlantasStr("");
    }
  }, [visible]);

  const plantas = plantasStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6); // límite sano para no romper layout inicial

  const disabled = nombre.trim().length < 2;

  function handleConfirm() {
    if (disabled) return;
    onConfirm({ nombre: nombre.trim(), cuarto: cuarto || undefined, plantas });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingKeyboard modalContent={(
        <View style={styles.card}>
          <Text style={styles.title}>Agregar sección</Text>
          <Text style={styles.subtitle}>Creá un nuevo grupo de riego (p. ej. “Plantas Cocina”).</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre de la sección *</Text>
            <TextInput
              placeholder="Plantas Cocina"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cuarto (opcional)</Text>
            <TextInput
              placeholder="Cocina / Living / Dormitorio..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={cuarto}
              onChangeText={setCuarto}
              style={styles.input}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
            {/* Sugerencias táctiles */}
            <View style={styles.suggestions}>
              {CUARTOS.map((q) => (
                <Pressable key={q} onPress={() => setCuarto(q)} style={styles.suggestionPill}>
                  <Text style={styles.suggestionText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Plantas iniciales (opcional)</Text>
            <TextInput
              placeholder="Albahaca, Aloe, Cinta"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={plantasStr}
              onChangeText={setPlantasStr}
              style={[styles.input, { minHeight: 48 }]}
              multiline
              returnKeyType="done"
            />
            {plantas.length > 0 ? (
              <Text style={styles.helper}>Se agregarán: {plantas.join(" · ")}</Text>
            ) : (
              <Text style={styles.helper}>Ingresá nombres separados por comas</Text>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} disabled={disabled} style={[styles.btn, styles.btnPrimary, disabled && { opacity: 0.5 }]}>
              <Text style={styles.btnPrimaryText}>Agregar</Text>
            </Pressable>
          </View>
        </View>
      )} />
    </Modal>
  );
}

/** Contenedor con fondo oscurecido + KeyboardAvoiding listo */
function KeyboardAvoidingKeyboard({ modalContent }: { modalContent: React.ReactNode }) {
  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        {modalContent}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  title: {
    color: "#eafff3",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(234,255,243,0.75)",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 12,
  },
  field: { marginTop: 10 },
  label: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 6, fontWeight: "700" },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  helper: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 6 },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  suggestionPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  suggestionText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  btnGhostText: { color: "rgba(255,255,255,0.95)", fontWeight: "800" },
  btnPrimary: { backgroundColor: "#1db954" },
  btnPrimaryText: { color: "white", fontWeight: "800" },
});
