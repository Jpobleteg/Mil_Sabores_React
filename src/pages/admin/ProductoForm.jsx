import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIAS } from "../../lib/data.js";
import { Productos } from "../../lib/store.js";
import { Validar } from "../../lib/validaciones.js";
import { useTitulo } from "../../hooks/useStore.js";
import { useFormulario } from "../../hooks/useFormulario.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import Campo from "../../components/Campo.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

export default function ProductoForm() {
  const { codigo } = useParams();
  const editando = codigo ? Productos.buscar(codigo) : null;
  useTitulo(`${editando ? "Editar" : "Nuevo"} producto | Administrador Mil Sabores`);

  if (codigo && !editando) {
    return (
      <>
        <CabeceraAdmin titulo="Editar producto"><Link className="btn btn-borde" to="/admin/productos">← Volver</Link></CabeceraAdmin>
        <section className="panel"><p>Producto no encontrado.</p></section>
      </>
    );
  }
  return <Formulario key={codigo || "nuevo"} editando={editando} />;
}

function Formulario({ editando }) {
  const avisar = useAvisos();
  const navigate = useNavigate();
  const [imagenData, setImagenData] = useState(editando ? editando.imagen : "");
  const [vistaPrevia, setVistaPrevia] = useState(editando ? Productos.imagen(editando) : "");

  const inicial = { codigo: "", nombre: "", descripcion: "", precio: "", stock: "", stockCritico: "", categoria: "", personalizable: false };
  if (editando) {
    ["codigo", "nombre", "descripcion", "precio", "stock", "stockCritico", "categoria"].forEach(k => (inicial[k] = String(editando[k] ?? "")));
    inicial.personalizable = Boolean(editando.personalizable);
  }

  const { valores: v, errores, setErrores, campo, cambiarValor, resumen, enviar } = useFormulario(inicial, {
    codigo: val => Validar.requerido(val, "El código") || Validar.minLargo(val, 3, "El código") ||
      (/\s/.test(val.trim()) ? "El código no debe tener espacios." : "") ||
      ((!editando || editando.codigo !== val.trim().toUpperCase()) && Productos.buscar(val.trim().toUpperCase()) ? "Ya existe un producto con ese código." : ""),
    nombre: val => Validar.requerido(val, "El nombre") || Validar.maxLargo(val, 100, "El nombre"),
    descripcion: val => Validar.maxLargo(val, 500, "La descripción"),
    precio: val => Validar.requerido(val, "El precio") || Validar.numero(val, { min: 0, campo: "El precio" }),
    stock: val => Validar.requerido(val, "El stock") || Validar.numero(val, { min: 0, entero: true, campo: "El stock" }),
    stockCritico: val => Validar.numero(val, { min: 0, entero: true, campo: "El stock crítico" }),
    categoria: val => Validar.requerido(val, "La categoría")
  });

  /* Imagen: se lee como dataURL para guardarla en localStorage */
  const cambiarImagen = e => {
    const archivo = e.target.files[0];
    let err = "";
    if (archivo && !archivo.type.startsWith("image/")) err = "El archivo debe ser una imagen.";
    else if (archivo && archivo.size > 1024 * 1024) err = "La imagen no puede pesar más de 1 MB.";
    setErrores(prev => ({ ...prev, imagen: err }));
    if (err || !archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      setImagenData(lector.result);
      setVistaPrevia(lector.result);
    };
    lector.readAsDataURL(archivo);
  };

  /* Sugerencia en vivo sobre el stock crítico */
  const avisoStock = v.stock !== "" && v.stockCritico !== "" && Number(v.stock) <= Number(v.stockCritico)
    ? `⚠️ El stock (${v.stock}) está igual o bajo el stock crítico (${v.stockCritico}). Se mostrará una alerta en el panel.` : "";

  const guardar = enviar(val => {
    const producto = {
      codigo: val.codigo.trim().toUpperCase(),
      nombre: val.nombre.trim(),
      descripcion: val.descripcion.trim(),
      precio: Number(String(val.precio).replace(",", ".")),
      stock: parseInt(val.stock, 10),
      stockCritico: val.stockCritico === "" ? "" : parseInt(val.stockCritico, 10),
      categoria: val.categoria,
      personalizable: val.personalizable,
      imagen: imagenData || "img/logo.svg"
    };
    try {
      Productos.guardar(producto, editando && editando.codigo);
    } catch {
      avisar("No hay espacio para guardar la imagen. Prueba con una más liviana.", "error");
      return;
    }
    avisar(editando ? "Producto actualizado." : "Producto creado.");
    setTimeout(() => navigate("/admin/productos"), 700);
  });

  return (
    <>
      <CabeceraAdmin titulo={editando ? "Editar producto" : "Nuevo producto"}>
        <Link className="btn btn-borde" to="/admin/productos">← Volver</Link>
      </CabeceraAdmin>
      <section className="tarjeta-form">
        <form noValidate onSubmit={guardar}>
          <p className="resumen-errores" hidden={!resumen}>{resumen}</p>
          <div className="form-grid">
            <Campo id="codigo" label="Código producto *" ayuda="Mínimo 3 caracteres." error={errores.codigo}>
              <input type="text" placeholder="Ej: TC003" autoComplete="off" {...campo("codigo")} />
            </Campo>
            <Campo id="categoria" label="Categoría *" error={errores.categoria}>
              <select {...campo("categoria")}>
                <option value="">-- Seleccione la categoría --</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo id="nombre" label="Nombre *" className="completo" error={errores.nombre} max={100} largo={v.nombre.length}>
              <input type="text" autoComplete="off" {...campo("nombre")} />
            </Campo>
            <Campo id="descripcion" label="Descripción" opcional="(opcional)" className="completo" error={errores.descripcion} max={500} largo={v.descripcion.length}>
              <textarea rows="4" {...campo("descripcion")} />
            </Campo>
            <Campo id="precio" label="Precio (CLP) *" ayuda="0 = producto gratis (FREE). Acepta decimales." error={errores.precio}>
              <input type="number" min="0" step="any" placeholder="Ej: 45000" {...campo("precio")} />
            </Campo>
            <Campo id="stock" label="Stock *" error={errores.stock}>
              <input type="number" min="0" step="1" placeholder="Ej: 10" {...campo("stock")} />
            </Campo>
            <Campo id="stockCritico" label="Stock crítico" opcional="(opcional)" ayuda="Se mostrará una alerta cuando el stock sea igual o menor." error={errores.stockCritico}>
              <input type="number" min="0" step="1" placeholder="Ej: 3" {...campo("stockCritico")} />
            </Campo>
            <Campo id="imagen" label="Imagen" opcional="(opcional)" ayuda="JPG, PNG o SVG de hasta 1 MB." error={errores.imagen}>
              <input type="file" id="imagen" accept="image/*" onChange={cambiarImagen} className={errores.imagen ? "invalido" : undefined} />
              {vistaPrevia && <img className="vista-previa" src={vistaPrevia} alt="Vista previa de la imagen" />}
            </Campo>
            <div className="campo campo-check completo">
              <input type="checkbox" id="personalizable" checked={v.personalizable} onChange={e => cambiarValor("personalizable", e.target.checked)} />
              <label htmlFor="personalizable">Permite mensaje personalizado y selección de tamaño</label>
            </div>
          </div>
          <div className="sugerencia" aria-live="polite">{avisoStock}</div>
          <button className="btn btn-bloque" type="submit">Guardar producto</button>
        </form>
      </section>
    </>
  );
}
