import { Link, useNavigate } from "react-router-dom";
import { Sesion, Usuarios } from "../lib/store.js";
import { useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import FormularioUsuario from "../components/FormularioUsuario.jsx";

export default function Registro() {
  useTitulo("Registro | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const navigate = useNavigate();

  const guardar = datos => {
    const nuevo = { ...datos, tipo: "Cliente" };
    Usuarios.guardar(nuevo);
    Sesion.iniciar(nuevo);
    avisar("¡Cuenta creada con éxito! Bienvenido/a a Mil Sabores.");
    setTimeout(() => navigate("/"), 900);
  };

  return (
    <section className="tarjeta-form" aria-labelledby="titulo-registro">
      <header className="marca">
        <img src="/img/logo.svg" alt="" width="80" height="80" />
        <h1 id="titulo-registro">Registro de usuario</h1>
        <p className="texto-secundario">Los campos con * son obligatorios.</p>
      </header>
      <FormularioUsuario modo="registro" onGuardar={guardar} textoBoton="Registrar"
        pie={<p className="form-pie">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>} />
    </section>
  );
}
