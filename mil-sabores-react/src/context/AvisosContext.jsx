import { createContext, useCallback, useContext, useRef, useState } from "react";

/* Avisos flotantes (toast de Bootstrap) disponibles en toda la app:
   const avisar = useAvisos();  avisar("Mensaje", "ok" | "error") */
const AvisosContext = createContext(() => {});

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const siguienteId = useRef(1);

  const avisar = useCallback((mensaje, tipo = "ok") => {
    const id = siguienteId.current++;
    setAvisos(a => [...a, { id, mensaje, tipo, saliendo: false }]);
    setTimeout(() => setAvisos(a => a.map(x => (x.id === id ? { ...x, saliendo: true } : x))), 2600);
    setTimeout(() => setAvisos(a => a.filter(x => x.id !== id)), 3100);
  }, []);

  return (
    <AvisosContext.Provider value={avisar}>
      {children}
      <div className="avisos-ms" role="status" aria-live="polite" id="avisos">
        {avisos.map(a => (
          <div key={a.id} className={`toast align-items-center border-0 text-white ${a.tipo === "error" ? "bg-danger" : "bg-success"}${a.saliendo ? " salir" : ""}`}>
            <div className="toast-body fw-bold">{a.mensaje}</div>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export const useAvisos = () => useContext(AvisosContext);
