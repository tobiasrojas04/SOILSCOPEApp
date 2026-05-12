import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Reutilizá tu componente Logo ya adaptado de tamaño
import Logo from "./SoilscopeLogo";

type Props = {
  userEmail: string;
  lastUpdate?: Date | string | number; // timestamp del último mensaje del broker
};

export default function Header({ userEmail, lastUpdate }: Props) {
  const formatted = formatLastUpdate(lastUpdate);

  return (
    <LinearGradient
      colors={["#67e8f9", "#34d399", "#22c55e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      {/* Columna izquierda: Logo + lema */}
      <View style={styles.left}>
        <Logo width={120} /> 
        <Text style={styles.tagline}>Monitoreo inteligente para plantas indoor.</Text>

        <View style={styles.updateRow}>
          <Text style={styles.updateLabel}>Última actualización</Text>
          <Text style={styles.updateValue}>{formatted}</Text>
        </View>
      </View>

      {/* Columna derecha: Bienvenida + usuario */}
      <View style={styles.right}>
        <Text style={styles.welcome}>BIENVENIDO</Text>
        <Text style={styles.user} numberOfLines={1}>
          {userEmail}
        </Text>
      </View>
    </LinearGradient>
  );
}

/** “Hoy, 14:35” / “Ayer, 09:12” / “dd/mm, HH:mm” */
function formatLastUpdate(value?: Date | string | number) {
  if (!value) return "—";
  const d = new Date(value);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  if (sameDay) return `Hoy, ${hh}:${mm}`;
  if (isYesterday) return `Ayer, ${hh}:${mm}`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}, ${hh}:${mm}`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  left: {
    flex: 1.2,
    gap: 6,
  },
  tagline: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  updateRow: {
    marginTop: 8,
  },
  updateLabel: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 11,
  },
  updateValue: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  welcome: {
    color: "#052e16",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  user: {
    color: "#0f172a",
    fontSize: 13,
    marginTop: 4,
    maxWidth: 180,
    fontWeight: "600",
  },
});
