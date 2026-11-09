import { Link, useNavigate, useParams } from "react-router-dom";
import { Usuarios } from "../../lib/store.js";
import { useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import FormularioUsuario from "../../components/FormularioUsuario.jsx";

export default function UsuarioForm() {
  const { run } = useParams();
  const editando = run ? Usuarios.buscarPorRun(run) : null;
  useTitulo(`${run ? "Editar" : "Nuevo"} usuario | Administrador Mil Sabores`);
  const avisar = useAvisos();
  const navigate = useNavigate();

  const guardar = datos => {
    Usuarios.guardar(editando ? { ...editando, ...datos } : datos, editando && editando.run);
    avisar(editando ? "Usuario actualizado." : "Usuario creado.");
    setTimeout(() => navigate("/admin/usuarios"), 700);
  };

  return (
    <>
      <CabeceraAdmin titulo={run ? "Editar usuario" : "Nuevo usuario"}>
        <Link className="btn btn-outline-primary" to="/admin/usuarios">← Volver</Link>
      </CabeceraAdmin>
      <section className="card shadow-sm" style={{ maxWidth: 900 }}><div className="card-body p-4">
        {run && !editando ? (
          <>
            <div className="alert alert-warning">El usuario no existe.</div>
            <Link className="btn btn-primary" to="/admin/usuarios">Volver</Link>
          </>
        ) : (
          <FormularioUsuario key={run || "nuevo"} modo="admin" editando={editando} onGuardar={guardar} textoBoton="Guardar usuario" />
        )}
      </div></section>
    </>
  );
}
