import { useSyncExternalStore, useEffect } from "react";
import { suscribir, obtenerVersion } from "../lib/store.js";


export function useStore() {
  return useSyncExternalStore(suscribir, obtenerVersion);
}

/* Cambia el título de la pestaña */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
