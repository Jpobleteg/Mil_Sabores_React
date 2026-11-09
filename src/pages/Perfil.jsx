import { Navigate } from "react-router-dom";
import { Sesion, Usuarios } from "../lib/store.js";
import { useStore, useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import FormularioUsuario from "../components/FormularioUsuario.jsx";

export default function Perfil() {
  useStore();
  useTitulo("Mi perfil | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const usuario = Sesion.usuario();

  if (!usuario) return <Navigate to="/login?volver=/perfil" replace />;

  const guardar = datos => {
    Usuarios.guardar({ ...usuario, ...datos, run: usuario.run, correo: usuario.correo }, usuario.run);
    Sesion.iniciar({ ...usuario, ...datos });
    avisar("Perfil actualizado.");
  };

  return (
    <section className="tarjeta-form" aria-labelledby="titulo-perfil">
      <header className="marca">
        <h1 id="titulo-perfil">Mi perfil</h1>
        <p className="texto-secundario">Actualiza tu información personal y tus preferencias de compra.</p>
      </header>
      <FormularioUsuario key={usuario.run} modo="perfil" editando={usuario} onGuardar={guardar} textoBoton="Guardar cambios" />
    </section>
  );
}
