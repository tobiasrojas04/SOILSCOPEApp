import { useEffect, useRef, useState } from "react";

export function useWebSocket(
  url: string,
  onMessage: (data: any) => void,
  retryDelay = 5000,
  maxRetries = 5,
  isEnabled = true // <--- 1. NUEVO PARÁMETRO (Por defecto true)
) {
  const [status, setStatus] = useState("⚪ Esperando...");
  const [retries, setRetries] = useState(0);
  
  const retriesRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);

  // Función de conexión
  const connect = () => {
    // Si no está habilitado o no hay URL, no hacemos nada
    if (!isEnabled || !url) return;

    setStatus("⏳ Conectando...");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("🟢 Conectado");
      setRetries(0);
      retriesRef.current = 0;
      console.log("✅ WebSocket conectado");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("❌ Error parseando mensaje WS:", err);
      }
    };

    ws.onerror = (err) => {
      // Solo mostramos error si sigue habilitado
      if (isEnabled) {
        console.log("⚠️ Error WS");
        setStatus("🔴 Error de conexión");
      }
    };

    ws.onclose = () => {
      // Si se cerró pero seguíamos habilitados, intentamos reconectar
      if (isEnabled && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setRetries(retriesRef.current);
        setStatus(`⚪ Reintentando... (${retriesRef.current}/${maxRetries})`);
        retryRef.current = setTimeout(connect, retryDelay);
      } else if (isEnabled) {
        setStatus("❌ Sin conexión");
      } else {
        setStatus("⚪ Desconectado (Inactivo)");
      }
    };
  };

  const disconnect = () => {
    if (retryRef.current) clearTimeout(retryRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const manualReconnect = () => {
    disconnect();
    retriesRef.current = 0;
    setRetries(0);
    connect();
  };

  // Efecto principal: Reacciona a cambios de URL o de isEnabled
  useEffect(() => {
    if (isEnabled && url) {
      connect();
    } else {
      disconnect(); // Si pasamos a false, cortamos todo
      setStatus("⚪ En espera (Pausa)");
    }

    // Cleanup al desmontar
    return () => disconnect();
  }, [url, isEnabled]); // <--- Se ejecuta cuando cambia esto

  return { status, retries, manualReconnect };
}