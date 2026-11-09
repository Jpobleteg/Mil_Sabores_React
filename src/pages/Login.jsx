import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sesion, Usuarios } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";
import TarjetaFormulario from "../components/TarjetaFormulario.jsx";

/* Inicio de sesión
   Correo: requerido, máx. 100, solo @duoc.cl / @profesor.duoc.cl / @gmail.com
   Contraseña: requerida, entre 4 y 10 caracteres */
export default function Login() {
  useTitulo("Iniciar sesión | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { valores, setValores, errores, resumen, setResumen, campo, enviar } = useFormulario(
    { correo: "", password: "" },
    {
      correo: v => Validar.requerido(v, "El correo") || Validar.maxLargo(v, 100, "El correo") || Validar.correo(v),
      password: v => Validar.requerido(v, "La contraseña") || Validar.password(v)
    }
  );

  const ingresar = enviar((v, form) => {
    const usuario = Usuarios.buscarPorCorreo(v.correo.trim());
    if (!usuario || usuario.password !== v.password) {
      setResumen("Correo o contraseña incorrectos. Revisa tus datos o regístrate.");
      setValores({ ...valores, password: "" });
      form.querySelector("#password").focus();
      return;
    }
    Sesion.iniciar(usuario);
    avisar(`¡Bienvenido/a, ${usuario.nombre}!`);
    /* Administrador y vendedor van al panel; el cliente vuelve a la tienda */
    const destino = usuario.tipo === "Cliente" ? params.get("volver") || "/" : "/admin";
    setTimeout(() => navigate(destino), 700);
  });

  return (
    <TarjetaFormulario titulo="Inicio de sesión" subtitulo="Pastelería Mil Sabores" ancho={460} idTitulo="titulo-login">
      <form noValidate onSubmit={ingresar} className="row g-3">
        {resumen && <div className="col-12"><div className="alert alert-danger mb-0" role="alert">{resumen}</div></div>}
        <Campo id="correo" label="Correo" error={errores.correo}>
          <input type="email" maxLength={100} placeholder="nombre@duoc.cl" autoComplete="username" {...campo("correo")} />
        </Campo>
        <Campo id="password" label="Contraseña" error={errores.password}>
          <input type="password" maxLength={10} autoComplete="current-password" {...campo("password")} />
        </Campo>
        <div className="col-12">
          <button className="btn btn-primary btn-lg w-100" type="submit">Iniciar sesión</button>
          <p className="text-center mt-3 mb-0">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </div>
        <details className="col-12 small text-body-secondary">
          <summary>Cuentas de prueba</summary>
          <p className="mt-2 mb-0">Administrador: admin@duoc.cl / admin123<br />Vendedor: vendedor@duoc.cl / vende123<br />Cliente: rosa@gmail.com / rosa1234</p>
        </details>
      </form>
    </TarjetaFormulario>
  );
}
