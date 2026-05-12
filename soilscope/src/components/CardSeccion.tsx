import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from "react-native";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";

type HumedadDato = { etiqueta: string; valor: number };

type Props = {
  titulo: string;
  conectado: boolean;
  onToggleConexion: (next: boolean) => void;
  regando: boolean;
  onToggleRiego: () => void;
  nivelBomba: number;                 // 0..100
  humedades: HumedadDato[];           // 0..100
  ultimoRiego?: Date | string | number | null;
};

export default function CardSeccion({
  titulo,
  conectado,
  onToggleConexion,
  regando,
  onToggleRiego,
  nivelBomba,
  humedades,
  ultimoRiego,
}: Props) {
  const pump = clamp(nivelBomba, 0, 100);
  const [chartW, setChartW] = useState<number>(220);

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setChartW(Math.max(180, Math.floor(w - 8)));
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <View style={styles.row}>
        {/* Columna izquierda */}
        <View style={styles.leftCol}>
          {/* 👉 Botones en la MISMA fila e IGUAL ancho */}
          <View style={styles.buttonsRow}>
            <Pressable
              onPress={() => onToggleConexion(!conectado)}
              style={[styles.btnEqual, conectado ? styles.pillOn : styles.pillOff]}
            >
              <View style={[styles.dot, { backgroundColor: conectado ? "#a7f3d0" : "#fca5a5" }]} />
              <Text style={styles.connText} numberOfLines={1}>
                {conectado ? "Conectado" : "Desconectado"}
              </Text>
            </Pressable>

            <Pressable
              onPress={onToggleRiego}
              style={[styles.btnEqual, regando ? styles.btnDanger : styles.btnPrimary]}
            >
              <Text style={styles.actionText} numberOfLines={1}>
                {regando ? "Desactivar riego" : "Activar riego"}
              </Text>
            </Pressable>
          </View>

          {/* Barra estado bomba */}
          <View style={{ marginTop: 8 }}>
            <Text style={styles.smallLabel}>Estado bomba</Text>
            <View style={styles.progressWrap}>
              <View style={[styles.progressFill, { width: `${pump}%` }]} />
            </View>
          </View>

          <Text style={styles.footerText}>
            Último riego: {formatLast(ultimoRiego)}
          </Text>
        </View>

        {/* Columna derecha: gráfico humedad */}
        <View style={styles.chartBox} onLayout={onChartLayout}>
          <Text style={styles.chartTitle}>Humedad</Text>
          <Bars
            width={chartW}
            labels={humedades.map(h => h.etiqueta)}
            values={humedades.map(h => clamp(h.valor, 0, 100))}
            connected={conectado}
          />
        </View>
      </View>
    </View>
  );
}

/** Gráfico de barras con ejes 0..100 y grilla (ancho responsivo) */
function Bars({
  width,
  labels,
  values,
  connected,
}: {
  width: number;
  labels: string[];
  values: number[];
  connected: boolean;
}) {
  const W = width;
  const H = 140;
  const padL = 28;
  const padR = 10;
  const padT = 8;
  const padB = 22;
  const maxY = 100;
  const ticks = [0, 20, 40, 60, 80, 100];

  const n = Math.max(values.length, 1);
  const gap = 12;
  const barW = Math.max(8, (W - padL - padR - gap * (n - 1)) / n);
  const safeVals = connected ? values : values.map(() => 0);

  const yFromVal = (v: number) => {
    const plotH = H - padT - padB;
    return padT + plotH * (1 - v / maxY);
  };

  return (
    <Svg width={W} height={H}>
      {ticks.map((t, i) => {
        const y = yFromVal(t);
        return (
          <React.Fragment key={i}>
            <Line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth={i === 0 ? 2 : 1} />
            <SvgText x={padL - 6} y={y + 4} fontSize="9" fill="rgba(255,255,255,0.65)" textAnchor="end">{t}</SvgText>
          </React.Fragment>
        );
      })}

      {safeVals.map((v, i) => {
        const x = padL + i * (barW + gap);
        const y = yFromVal(v);
        const h = H - padB - y;
        return <Rect key={i} x={x} y={y} width={barW} height={Math.max(0, h)} rx={6} fill={connected ? "#7ee4c9" : "rgba(255,255,255,0.10)"} />;
      })}

      {labels.map((t, i) => {
        const x = padL + i * (barW + gap) + barW / 2;
        return <SvgText key={i} x={x} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.8)" textAnchor="middle">{t}</SvgText>;
      })}
    </Svg>
  );
}

function formatLast(v?: Date | string | number | null) {
  if (!v && v !== 0) return "—";
  const d = new Date(v);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const now = new Date();
  const same = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const y = new Date(now); y.setDate(now.getDate() - 1);
  const isY = d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
  if (same) return `Hoy, ${hh}:${mm}`;
  if (isY) return `Ayer, ${hh}:${mm}`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}, ${hh}:${mm}`;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/* --------------------------------- styles --------------------------------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0b281e",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  title: {
    color: "#d8ffe7",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  leftCol: { flexGrow: 1, flexBasis: 180, minWidth: 160 },

  /* --- Botones en una línea e igual ancho --- */
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  btnEqual: {
    flex: 1,                 // 👈 ambos ocupan el mismo ancho
    minWidth: 140,
    flexDirection: "row",    // para el botón de conexión (dot + texto)
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pillOn: { backgroundColor: "rgba(16,185,129,0.25)" },
  pillOff: { backgroundColor: "rgba(120,72,72,0.55)" },
  btnPrimary: { backgroundColor: "#1db954" },
  btnDanger: { backgroundColor: "#933" },

  dot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  connText: { color: "white", fontWeight: "700", fontSize: 12 },
  actionText: { color: "white", fontWeight: "800", fontSize: 13, textAlign: "center" },

  smallLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 6 },
  progressWrap: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#7ee4c9" },
  footerText: { color: "rgba(216,255,231,0.7)", marginTop: 8, fontSize: 12 },

  // Gráfico
  chartBox: {
    flexGrow: 1.2,
    flexBasis: 220,
    minWidth: 180,
    alignItems: "center",
    marginTop: 6,
  },
  chartTitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    marginBottom: 6,
  },
});
