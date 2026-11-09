import { Navigate } from "react-router-dom";
import { Ordenes, Sesion, Usuarios, formatoCLP } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import FormularioUsuario from "../components/FormularioUsuario.jsx";
import TarjetaFormulario from "../components/TarjetaFormulario.jsx";

export default function Perfil() {
  useStore();
  useTitulo("Mi perfil | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const usuario = Sesion.usuario();

  if (!usuario) return <Navigate to="/login?volver=/perfil" replace />;

  const compras = Ordenes.delCliente(usuario.correo).reverse();

  const guardar = datos => {
    Usuarios.guardar({ ...usuario, ...datos, run: usuario.run, correo: usuario.correo }, usuario.run);
    Sesion.iniciar({ ...usuario, ...datos });
    avisar("Perfil actualizado.");
  };

  return (
    <TarjetaFormulario titulo="Mi perfil" subtitulo="Actualiza tu información personal y tus preferencias de compra." logo={false} ancho={820} idTitulo="titulo-perfil">
      <FormularioUsuario key={usuario.run} modo="perfil" editando={usuario} onGuardar={guardar} textoBoton="Guardar cambios" />
      <h2 className="h4 mt-5">Mis compras</h2>
      {compras.length ? (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead><tr><th>N°</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {compras.map(o => (
                <tr key={o.numero}>
                  <td>{o.numero}</td><td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{formatoCLP(o.total)}</td>
                  <td><span className={`badge estado-${o.estado.replace(/\s/g, "-")}`}>{o.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-body-secondary">Aún no tienes compras.</p>}
    </TarjetaFormulario>
  );
}
