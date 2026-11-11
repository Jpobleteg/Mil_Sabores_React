import { useState } from "react";

export function useFormulario(inicial, reglas, dependientes = {}) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [resumen, setResumen] = useState("");

  const calcular = (id, vals) => (reglas[id] ? reglas[id](vals[id] ?? "", vals) : "");
  const alSalir = e => validarCampo(e.target.id);
   
  const validarCampo = (id, vals = valores) => {
    if (!reglas[id]) return true;
    const msg = calcular(id, vals);
    setErrores(e => ({ ...e, [id]: msg }));
    return !msg;
  };

  const cambiarValor = (id, valor) => {
    const nuevos = { ...valores, [id]: valor };
    setValores(nuevos);
    const extra = {};
    (dependientes[id] || []).forEach(dep => {
      if (nuevos[dep]) extra[dep] = calcular(dep, nuevos);
    });
    if (reglas[id]) extra[id] = calcular(id, nuevos);
    if (Object.keys(extra).length) setErrores(e => ({ ...e, ...extra }));
    return nuevos;
  };

  const alCambiar = e => {
    const { id, type, value, checked } = e.target;
    cambiarValor(id, type === "checkbox" ? checked : value);
  };

  const clase = id => {
    if (!(id in errores)) return "";
    if (errores[id]) return "is-invalid";
    return String(valores[id] ?? "").trim() !== "" ? "is-valid" : "";
  };

  const campo = (id, base = "form-control") => ({
    id,
    value: valores[id] ?? "",
    onChange: alCambiar,
    onBlur: alSalir,
    className: `${base} ${clase(id)}`.trim(),
    "aria-invalid": errores[id] ? "true" : "false"
  });

  const enviar = alEnviar => e => {
    e.preventDefault();
    const form = e.currentTarget;
    const nuevos = {};
    Object.keys(reglas).forEach(id => (nuevos[id] = calcular(id, valores)));
    setErrores(prev => ({ ...prev, ...nuevos }));
    const ok = Object.values(nuevos).every(m => !m);
    if (!ok) {
      setResumen("Revisa los campos marcados en rojo antes de continuar.");
      setTimeout(() => form.querySelector(".is-invalid")?.focus());
      return;
    }
    setResumen("");
    alEnviar(valores, form);
  };

  const reiniciar = (vals = inicial) => {
    setValores(vals);
    setErrores({});
    setResumen("");
  };

  return { valores, setValores, cambiarValor, errores, setErrores, resumen, setResumen, campo, clase, validarCampo, enviar, reiniciar };
}
