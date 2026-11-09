import { createContext, useCallback, useContext, useRef, useState } from "react";

/* Avisos flotantes (toast) disponibles en toda la app: const avisar = useAvisos(); */
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
      <div id="avisos" role="status" aria-live="polite">
        {avisos.map(a => (
          <div key={a.id} className={`aviso aviso-${a.tipo}${a.saliendo ? " salir" : ""}`}>{a.mensaje}</div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export const useAvisos = () => useContext(AvisosContext);
