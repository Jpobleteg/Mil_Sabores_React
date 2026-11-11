import { useSyncExternalStore, useEffect } from "react";
import { suscribir, obtenerVersion } from "../lib/store.js";

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
   
export function useStore() {
  return useSyncExternalStore(suscribir, obtenerVersion);
}

}
