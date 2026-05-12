// screens/Home.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Modal, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../components/Header";
import SeccionesHeader from "../components/SeccionesHeader";
import CardSeccion from "../components/CardSeccion";
import ScreenBackground from "../components/ScreenBackground";
import AddSectionModal from "../components/AddSectionModal";
import { colors } from "../theme/colors";

/* ----------------------------- Tipos de datos ----------------------------- */
type Seccion = {
  id: string;
  nombre: string;
  conectado: boolean;
  regando: boolean;
  nivelBomba: number;              // 0..100
  humedades: { etiqueta: string; valor: number }[]; // 0..100
  ultimoRiego?: number;            // timestamp
};

const MAX_SECCIONES = 10;
const TAB_MASK_H = 88; // alto aprox. de la tabbar curva
const STORAGE_KEYS = {
  secciones: "soilscope:sections",
  lastUpdate: "soilscope:lastUpdate",
};

/* ------------------- Modal simple para ELIMINAR secciones ------------------ */
function RemoveSectionModal({
  visible,
  secciones,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  secciones: { id: string; nombre: string }[];
  onCancel: () => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.removeCard}>
          <Text style={styles.removeTitle}>Eliminar sección</Text>
          <Text style={styles.removeSub}>Elegí cuál querés borrar.</Text>

          <View style={{ marginTop: 10 }}>
            {secciones.map((s) => (
              <Pressable key={s.id} onPress={() => onConfirm(s.id)} style={styles.removeRow}>
                <Text style={styles.removeRowText}>{s.nombre}</Text>
                <Text style={styles.removeHint}>Eliminar</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ alignItems: "flex-end", marginTop: 12 }}>
            <Pressable onPress={onCancel} style={styles.removeCancel}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "800" }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* --------------------------------- Screen --------------------------------- */
export default function Home() {
  const userEmail = "Sebastián Clement";
  const insets = useSafeAreaInsets();
  const [headerH, setHeaderH] = useState(0);

  // Estado base (si no hay nada guardado)
  const defaultSections: Seccion[] = [
    {
      id: "cocina",
      nombre: "Plantas cocina",
      conectado: false,
      regando: false,
      nivelBomba: 0,
      humedades: [
        { etiqueta: "Albahaca", valor: 0 },
        { etiqueta: "Áloe", valor: 0 },
        { etiqueta: "Cinta", valor: 0 },
      ],
      ultimoRiego: undefined,
    },
  ];

  const [secciones, setSecciones] = useState<Seccion[]>(defaultSections);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false); // para no pisar al cargar

  /* ------------------------ Persistencia: load & save ----------------------- */
  useEffect(() => {
    (async () => {
      try {
        const [rawSec, rawUpd] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.secciones),
          AsyncStorage.getItem(STORAGE_KEYS.lastUpdate),
        ]);
        if (rawSec) {
          const parsed: Seccion[] = JSON.parse(rawSec);
          if (Array.isArray(parsed) && parsed.length) setSecciones(parsed);
        }
        if (rawUpd) setLastUpdate(new Date(JSON.parse(rawUpd)));
      } catch (e) {
        // si falla, seguimos con defaults
        console.warn("No se pudo leer AsyncStorage:", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Guarda secciones cada vez que cambian (una vez hidratado)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.secciones, JSON.stringify(secciones)).catch(() => {});
  }, [secciones, hydrated]);

  // Guarda lastUpdate
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.lastUpdate, JSON.stringify(lastUpdate)).catch(() => {});
  }, [lastUpdate, hydrated]);

  /* ------------------------ Acciones del encabezado ------------------------ */
  function handleAdd() {
    if (secciones.length >= MAX_SECCIONES) return;
    setAddOpen(true);
  }
  function handleRemove() {
    if (secciones.length === 0) return;
    setRemoveOpen(true);
  }

  /* ------------------------ Confirmaciones de modales ---------------------- */
  function handleAddConfirm(data: { nombre: string; cuarto?: string; plantas: string[] }) {
    const { nombre, plantas } = data;
    const etiquetas = (plantas.length > 0 ? plantas : ["Albahaca", "Áloe", "Cinta"]).slice(0, 6);
    const humedades = etiquetas.map((e) => ({ etiqueta: e, valor: 0 }));

    setSecciones((prev) => [
      ...prev,
      {
        id: `sec_${Date.now()}`,
        nombre,
        conectado: false,
        regando: false,
        nivelBomba: 0,
        humedades,
      },
    ]);
    setAddOpen(false);
    setLastUpdate(new Date());
  }

  function confirmRemove(id: string) {
    setSecciones((prev) => prev.filter((s) => s.id !== id));
    setRemoveOpen(false);
    setLastUpdate(new Date());
  }

  /* --------------------------- Acciones por card --------------------------- */
  function toggleConexion(id: string, next: boolean) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              conectado: next,
              humedades: next
                ? s.humedades.map((h) => ({ ...h, valor: Math.max(h.valor, 20) }))
                : s.humedades,
              nivelBomba: next ? s.nivelBomba : 0,
            }
          : s
      )
    );
    setLastUpdate(new Date());
  }

  function toggleRiego(id: string) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              regando: !s.regando,
              nivelBomba: !s.regando ? 100 : 0,
              ultimoRiego: !s.regando ? Date.now() : s.ultimoRiego,
            }
          : s
      )
    );
    setLastUpdate(new Date());
  }

  /* --------------------------------- Render -------------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenBackground />

      {/* ===== TopMask: tapa el scroll detrás del header ===== */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + headerH,
          backgroundColor: colors.bg,
          zIndex: 8,
        }}
      />

      {/* ===== Header fijo ===== */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
        <View
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height + 6)}
          style={{
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <Header userEmail={userEmail} lastUpdate={lastUpdate ?? undefined} />
        </View>
      </View>

      {/* ===== Contenido scrolleable ===== */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + headerH,
          paddingBottom: insets.bottom + TAB_MASK_H,
        }}
      >
        <SeccionesHeader
          total={secciones.length}
          max={MAX_SECCIONES}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        <View style={{ marginHorizontal: 12, marginTop: 8 }}>
          {secciones.map((s) => (
            <CardSeccion
              key={s.id}
              titulo={s.nombre}
              conectado={s.conectado}
              onToggleConexion={(next) => toggleConexion(s.id, next)}
              regando={s.regando}
              onToggleRiego={() => toggleRiego(s.id)}
              nivelBomba={s.nivelBomba}
              humedades={s.humedades}
              ultimoRiego={s.ultimoRiego}
            />
          ))}
        </View>
      </ScrollView>

      {/* ===== BottomMask: tapa el scroll detrás de la tabbar ===== */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + TAB_MASK_H,
          backgroundColor: colors.bg,
          zIndex: 5,
        }}
      />

      {/* Modal: Agregar */}
      <AddSectionModal
        visible={addOpen}
        onCancel={() => setAddOpen(false)}
        onConfirm={handleAddConfirm}
      />

      {/* Modal: Eliminar */}
      <RemoveSectionModal
        visible={removeOpen}
        secciones={secciones.map(({ id, nombre }) => ({ id, nombre }))}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={confirmRemove}
      />
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  removeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  removeTitle: { color: "#eafff3", fontSize: 18, fontWeight: "800" },
  removeSub: { color: "rgba(234,255,243,0.75)", marginTop: 4, fontSize: 12 },
  removeRow: {
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
  removeRowText: { color: "white", fontWeight: "700" },
  removeHint: { color: "rgba(255,120,120,0.9)", fontWeight: "800" },
  removeCancel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
});
