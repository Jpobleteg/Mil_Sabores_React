import { Link, useParams } from "react-router-dom";
import { Ordenes, Usuarios, beneficiosUsuario, formatoCLP } from "../../lib/store.js";
import { calcularEdad } from "../../lib/validaciones.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Mostrar usuario: datos, beneficio activo y accesos a editar e historial */
export default function UsuarioDetalle() {
  useStore();
  useTitulo("Detalle del usuario | Administrador Mil Sabores");
  const { run } = useParams();
  const u = Usuarios.buscarPorRun(run);
  const b = u ? beneficiosUsuario(u) : null;
  const compras = u ? Ordenes.delCliente(u.correo) : [];

  return (
    <>
      <CabeceraAdmin titulo="Mostrar usuario">
        <Link className="btn btn-outline-primary" to="/admin/usuarios">← Volver</Link>
        {u && <>
          <Link className="btn btn-outline-primary" to={`/admin/usuarios/${encodeURIComponent(u.run)}/compras`}>🧾 Historial de compras</Link>
          <Link className="btn btn-primary" to={`/admin/usuarios/${encodeURIComponent(u.run)}/editar`}>Editar usuario</Link>
        </>}
      </CabeceraAdmin>
      <article className="card shadow-sm"><div className="card-body">
        {!u ? <p className="mb-0">Usuario no encontrado.</p> : (
          <>
            <h2 className="h3">{u.nombre} {u.apellidos}</h2>
            <dl className="row mb-0">
              <dt className="col-sm-4">RUN</dt><dd className="col-sm-8">{u.run}</dd>
              <dt className="col-sm-4">Correo</dt><dd className="col-sm-8">{u.correo}</dd>
              <dt className="col-sm-4">Tipo de usuario</dt><dd className="col-sm-8">{u.tipo}</dd>
              <dt className="col-sm-4">Fecha de nacimiento</dt><dd className="col-sm-8">{u.fechaNacimiento ? `${u.fechaNacimiento} (${calcularEdad(u.fechaNacimiento)} años)` : "—"}</dd>
              <dt className="col-sm-4">Teléfono</dt><dd className="col-sm-8">{u.telefono || "—"}</dd>
              <dt className="col-sm-4">Dirección</dt><dd className="col-sm-8">{u.direccion}, {u.comuna}, {u.region}</dd>
              <dt className="col-sm-4">Beneficio</dt><dd className="col-sm-8">{b.motivo || "Sin descuento"}</dd>
              <dt className="col-sm-4">Preferencias</dt><dd className="col-sm-8">{(u.preferencias || []).join(", ") || "—"}</dd>
              <dt className="col-sm-4">Compras</dt><dd className="col-sm-8">{compras.length} ({formatoCLP(compras.reduce((s, o) => s + o.total, 0))})</dd>
            </dl>
          </>
        )}
      </div></article>
    </>
  );
}
