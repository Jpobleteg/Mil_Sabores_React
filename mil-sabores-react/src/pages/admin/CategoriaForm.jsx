import { Link, useNavigate, useParams } from "react-router-dom";
import { Categorias } from "../../lib/store.js";
import { Validar } from "../../lib/validaciones.js";
import { useTitulo } from "../../hooks/useStore.js";
import { useFormulario } from "../../hooks/useFormulario.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import Campo from "../../components/Campo.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Nueva categoría / Editar categoría */
export default function CategoriaForm() {
  const { id } = useParams();
  const editando = id ? Categorias.obtener(id) : null;
  useTitulo(`${id ? "Editar" : "Nueva"} categoría | Administrador Mil Sabores`);
  const avisar = useAvisos();
  const navigate = useNavigate();

  const { valores: v, errores, campo, enviar, resumen } = useFormulario(
    { nombre: editando ? editando.nombre : "", descripcion: editando ? editando.descripcion || "" : "" },
    {
      nombre: val => {
        const err = Validar.requerido(val, "El nombre") || Validar.minLargo(val, 3, "El nombre") || Validar.maxLargo(val, 50, "El nombre");
        if (err) return err;
        const otra = Categorias.porNombre(val.trim());
        return otra && (!editando || otra.id !== editando.id) ? "Ya existe una categoría con ese nombre." : "";
      },
      descripcion: val => Validar.maxLargo(val, 200, "La descripción")
    }
  );

  const guardar = enviar(datos => {
    try {
      if (editando) Categorias.actualizar(editando.id, datos);
      else Categorias.crear(datos);
    } catch (e) {
      avisar(e.message, "error");
      return;
    }
    avisar(editando ? "Categoría actualizada." : "Categoría creada.");
    navigate("/admin/categorias");
  });

  return (
    <>
      <CabeceraAdmin titulo={editando ? "Editar categoría" : "Nueva categoría"}>
        <Link className="btn btn-outline-primary" to="/admin/categorias">← Volver</Link>
      </CabeceraAdmin>
      {id && !editando ? <div className="alert alert-warning">La categoría no existe.</div> : (
        <section className="card shadow-sm" style={{ maxWidth: 640 }}><div className="card-body p-4">
          <form noValidate onSubmit={guardar} className="row g-3">
            {resumen && <div className="col-12"><div className="alert alert-danger mb-0">{resumen}</div></div>}
            <Campo id="nombre" label="Nombre *" error={errores.nombre} max={50} largo={v.nombre.length}
              ayuda={editando ? "Si cambias el nombre, sus productos se actualizan automáticamente." : undefined}>
              <input type="text" autoComplete="off" {...campo("nombre")} />
            </Campo>
            <Campo id="descripcion" label="Descripción" opcional="(opcional)" error={errores.descripcion} max={200} largo={v.descripcion.length}>
              <textarea rows="3" {...campo("descripcion")} />
            </Campo>
            <div className="col-12"><button type="submit" className="btn btn-primary w-100">Guardar categoría</button></div>
          </form>
        </div></section>
      )}
    </>
  );
}
