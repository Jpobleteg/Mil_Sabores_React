import { Link, useParams } from "react-router-dom";
import { Ordenes, Usuarios, beneficiosUsuario, formatoCLP } from "../../lib/store.js";
import { calcularEdad } from "../../lib/validaciones.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

export default function UsuarioDetalle() {
  useStore();
  useTitulo("Detalle del usuario | Administrador Mil Sabores");
  const { run } = useParams();
  const u = Usuarios.buscarPorRun(run);
  const b = u ? beneficiosUsuario(u) : null;
  const compras = u ? Ordenes.todas().filter(o => o.correo === u.correo) : [];

  return (
    <>
      <CabeceraAdmin titulo="Detalle del usuario">
        <Link className="btn btn-borde" to="/admin/usuarios">← Volver</Link>
      </CabeceraAdmin>
      <article className="panel">
        {!u ? <p>Usuario no encontrado.</p> : (
          <>
            <h2>{u.nombre} {u.apellidos}</h2>
            <div className="ficha" style={{ gridTemplateColumns: "1fr" }}>
              <dl>
                <dt>RUN</dt><dd>{u.run}</dd>
                <dt>Correo</dt><dd>{u.correo}</dd>
                <dt>Tipo de usuario</dt><dd>{u.tipo}</dd>
                <dt>Fecha de nacimiento</dt><dd>{u.fechaNacimiento ? `${u.fechaNacimiento} (${calcularEdad(u.fechaNacimiento)} años)` : "—"}</dd>
                <dt>Teléfono</dt><dd>{u.telefono || "—"}</dd>
                <dt>Dirección</dt><dd>{u.direccion}, {u.comuna}, {u.region}</dd>
                <dt>Beneficio</dt><dd>{b.motivo || "Sin descuento"}</dd>
                <dt>Preferencias</dt><dd>{(u.preferencias || []).join(", ") || "—"}</dd>
                <dt>Compras</dt><dd>{compras.length} ({formatoCLP(compras.reduce((s, o) => s + o.total, 0))})</dd>
              </dl>
            </div>
            <p style={{ marginTop: 18 }}><Link className="btn" to={`/admin/usuarios/${encodeURIComponent(u.run)}/editar`}>Editar</Link></p>
          </>
        )}
      </article>
    </>
  );
}
