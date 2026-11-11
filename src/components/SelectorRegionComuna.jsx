import { REGIONES } from "../lib/data.js";
import Campo from "./Campo.jsx";


export default function SelectorRegionComuna({ form, deshabilitado = false, columnas = "col-12 col-md-6" }) {
  const { valores: v, errores, campo, cambiarValor, setValores, setErrores } = form;
  const comunas = REGIONES.find(r => r.region === v.region)?.comunas || [];

  /* Al cambiar la región se limpia la comuna y su estado de validación */
  const cambiarRegion = e => {
    const nuevos = cambiarValor("region", e.target.value);
    setValores({ ...nuevos, comuna: "" });
    setErrores(prev => { const c = { ...prev }; delete c.comuna; return c; });
  };

  return (
    <>
      <Campo id="region" label="Región *" error={errores.region} className={columnas}>
        <select autoComplete="address-level1" disabled={deshabilitado} {...campo("region", "form-select")} onChange={cambiarRegion}>
          <option value="">-- Seleccione la región --</option>
          {REGIONES.map(r => <option key={r.region}>{r.region}</option>)}
        </select>
      </Campo>
      <Campo id="comuna" label="Comuna *" error={errores.comuna} className={columnas}>
        <select autoComplete="address-level2" disabled={deshabilitado || !comunas.length} {...campo("comuna", "form-select")}>
          <option value="">-- Seleccione la comuna --</option>
          {comunas.map(c => <option key={c}>{c}</option>)}
        </select>
      </Campo>
    </>
  );
}
