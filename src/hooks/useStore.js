import { useSyncExternalStore, useEffect } from "react";
import { suscribir, obtenerVersion } from "../lib/store.js";

/* Vuelve a dibujar el componente cada vez que cambia algo en localStorage
   (productos, usuarios, sesión, carrito u órdenes). */
export function useStore() {
  return useSyncExternalStore(suscribir, obtenerVersion);
}

/* Cambia el título de la pestaña */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
