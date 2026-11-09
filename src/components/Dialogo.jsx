import { useEffect, useRef } from "react";

/* Envoltura de <dialog> nativo: se abre con showModal() cuando abierto = true */
export default function Dialogo({ abierto, onCerrar, children, ...resto }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog ref={ref} onClose={onCerrar} {...resto}>
      {children}
    </dialog>
  );
}
