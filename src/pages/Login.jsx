import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sesion, Usuarios } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";

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
    <section className="tarjeta-form angosta" aria-labelledby="titulo-login">
      <header className="marca">
        <img src="/img/logo.svg" alt="Logo Pastelería Mil Sabores" width="80" height="80" />
        <p style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", color: "var(--chocolate)", margin: 0 }}>Pastelería Mil Sabores</p>
        <h1 id="titulo-login" style={{ fontFamily: "var(--fuente-texto)", fontWeight: 700, fontSize: "1.2rem", color: "var(--texto)" }}>Inicio de sesión</h1>
      </header>
      <form noValidate onSubmit={ingresar}>
        <p className="resumen-errores" hidden={!resumen}>{resumen}</p>
        <Campo id="correo" label="Correo" error={errores.correo}>
          <input type="email" maxLength={100} placeholder="nombre@duoc.cl" autoComplete="username" {...campo("correo")} />
        </Campo>
        <Campo id="password" label="Contraseña" error={errores.password}>
          <input type="password" maxLength={10} autoComplete="current-password" {...campo("password")} />
        </Campo>
        <button className="btn btn-bloque" type="submit">Iniciar sesión</button>
        <p className="form-pie">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        <details className="sugerencia" style={{ marginTop: 14 }}>
          <summary>Cuentas de prueba</summary>
          <p style={{ margin: ".5em 0 0" }}>Administrador: admin@duoc.cl / admin123<br />Vendedor: vendedor@duoc.cl / vende123<br />Cliente: rosa@gmail.com / rosa1234</p>
        </details>
      </form>
    </section>
  );
}
