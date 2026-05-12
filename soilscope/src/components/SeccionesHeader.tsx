import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

type Props = {
  total: number;
  max: number;
  onAdd: () => void;
  onRemove: () => void;
};

export default function SeccionesHeader({ total, max, onAdd, onRemove }: Props) {
  const atMax = total >= max;
  const atMin = total <= 0;

  return (
    <View style={styles.wrap}>
      {/* Fila 1: título + contador */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Mis secciones de riego</Text>
        <Text style={styles.counter}>({total}/{max})</Text>
      </View>

      {/* Fila 2: acciones */}
      <View style={styles.actions}>
        <Pressable
          onPress={onAdd}
          disabled={atMax}
          style={({ pressed }) => [
            styles.btn,
            styles.btnAdd,
            (pressed || atMax) && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.btnAddText}>Agregar sección</Text>
        </Pressable>

        <Pressable
          onPress={onRemove}
          disabled={atMin}
          style={({ pressed }) => [
            styles.btn,
            styles.btnDel,
            (pressed || atMin) && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.btnDelText}>Eliminar sección</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 14,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 10, // 👈 deja aire con los botones
  },
  title: {
    color: "#e5fbea",
    fontSize: 20,
    fontWeight: "800",
  },
  counter: {
    color: "rgba(229,251,234,0.8)",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",     // 👈 si no entra, baja a nueva línea
    gap: 10,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 150,        // 👈 evita que el texto se corte
    alignItems: "center",
  },
  // Primario (Agregar)
  btnAdd: {
    backgroundColor: "#1db954",
  },
  btnAddText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  // Outline (Eliminar) – SIEMPRE visible sobre fondo oscuro
  btnDel: {
    backgroundColor: "rgba(232,93,117,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(232,93,117,0.8)",
  },
  btnDelText: {
    color: "#e85d75",
    fontWeight: "800",
    fontSize: 13,
  },
});
