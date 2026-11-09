import { Link, useNavigate } from "react-router-dom";
import { Sesion, Usuarios } from "../lib/store.js";
import { useTitulo } from "../hooks/useStore.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import FormularioUsuario from "../components/FormularioUsuario.jsx";
import TarjetaFormulario from "../components/TarjetaFormulario.jsx";

export default function Registro() {
  useTitulo("Registro | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const navigate = useNavigate();

  const guardar = datos => {
    const nuevo = { ...datos, tipo: "Cliente" };
    Usuarios.crear(nuevo);
    Sesion.iniciar(nuevo);
    avisar("¡Cuenta creada con éxito! Bienvenido/a a Mil Sabores.");
    setTimeout(() => navigate("/"), 900);
  };

  return (
    <TarjetaFormulario titulo="Registro de usuario" subtitulo="Los campos con * son obligatorios." idTitulo="titulo-registro">
      <FormularioUsuario modo="registro" onGuardar={guardar} textoBoton="Registrar"
        pie={<p className="text-center mt-3 mb-0">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>} />
    </TarjetaFormulario>
  );
}
