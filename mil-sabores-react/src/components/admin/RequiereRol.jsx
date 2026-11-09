import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { Sesion } from "../../lib/store.js";
import { useStore } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";

/* Control de acceso por rol.
     · Administrador: acceso total.
     · Vendedor: solo ve productos (lista y detalle) y órdenes.
     · Cliente: no entra al panel (solo tienda). */
export default function RequiereRol({ roles, children }) {
  useStore();
  const avisar = useAvisos();
  const avisado = useRef(false);
  const s = Sesion.actual();
  const permitido = Boolean(s && roles.includes(s.tipo));
  /* Si tenía permiso al entrar y luego cerró sesión, se redirige sin aviso */
  const permitidoAlEntrar = useRef(permitido);

  useEffect(() => {
    if (!permitido && !permitidoAlEntrar.current && !avisado.current) {
      avisado.current = true;
      avisar(s ? "No tienes permisos para ver esta sección." : "Debes iniciar sesión para entrar al panel.", "error");
    }
  }, [permitido, s, avisar]);

  if (!permitido) {
    return <Navigate to={s && s.tipo === "Vendedor" ? "/admin" : "/login"} replace />;
  }
  return children;
}
