import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { colors } from "../theme/colors";

type SeccionL = { id: string; nombre: string };

type Props = {
  visible: boolean;
  secciones: SeccionL[];
  onCancel: () => void;
  onConfirm: (id: string) => void;
};

export default function RemoveSectionModal({ visible, secciones, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Eliminar sección</Text>
          <Text style={styles.subtitle}>Elegí cuál querés borrar.</Text>

          <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
            {secciones.map((s) => (
              <Pressable key={s.id} onPress={() => onConfirm(s.id)} style={styles.row}>
                <Text style={styles.rowText}>{s.nombre}</Text>
                <Text style={styles.deleteHint}>Eliminar</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "#eafff3", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "rgba(234,255,243,0.75)", marginTop: 4, fontSize: 12 },
  row: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowText: { color: "white", fontWeight: "700" },
  deleteHint: { color: "rgba(255,120,120,0.9)", fontWeight: "800" },
  actions: { marginTop: 10, alignItems: "flex-end" },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnGhost: { borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  btnGhostText: { color: "rgba(255,255,255,0.95)", fontWeight: "800" },
});
