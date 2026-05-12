import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  label: string;                 // "Humedad 1", "Temperatura"
  value: number | string;        // 52.4 / 21.9
  unit?: string;                 // "%" / "°C"
  color?: string;                // borde y número principal
  subtitle?: string;             // "Sensor suelo A" / "Aire / Suelo"
};

export default function SensorCard({ label, value, unit, color = colors.moisture, subtitle }: Props) {
  // normalizamos la presentación del número
  const str = typeof value === "number" ? value.toFixed(unit === "%" ? 0 : 1) : value;

  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text
          style={[styles.value, { color }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {str}
        </Text>
        {unit ? <Text style={[styles.unit, { color }]}>{unit}</Text> : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 220,
    justifyContent: "space-between",
  },
  label: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  value: {
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 52,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"], // dígitos parejos
    flexShrink: 1,
  },
  unit: {
    marginLeft: 6,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
    opacity: 0.95,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
  },
});
