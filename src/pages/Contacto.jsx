import { Mensajes, Sesion } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";

/* Contacto
   Nombre: requerido, máx. 100
   Correo: opcional, máx. 100, dominios permitidos
   Comentario: requerido, máx. 500 (mínimo 10, regla adicional) */
export default function Contacto() {
  useTitulo("Contacto | Pastelería Mil Sabores");
  const avisar = useAvisos();
  const s = Sesion.usuario();

  const { valores, errores, resumen, campo, enviar, reiniciar } = useFormulario(
    { nombre: s ? `${s.nombre} ${s.apellidos}` : "", correo: s ? s.correo : "", comentario: "" },
    {
      nombre: v => Validar.requerido(v, "El nombre") || Validar.maxLargo(v, 100, "El nombre"),
      correo: v => Validar.maxLargo(v, 100, "El correo") || Validar.correo(v),
      comentario: v => Validar.requerido(v, "El comentario") || Validar.maxLargo(v, 500, "El comentario") ||
        (v.trim().length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." : "")
    }
  );

  const enviarMensaje = enviar(v => {
    Mensajes.agregar({ nombre: v.nombre.trim(), correo: v.correo.trim(), comentario: v.comentario.trim() });
    avisar("¡Mensaje enviado! Te responderemos pronto.");
    reiniciar({ nombre: "", correo: "", comentario: "" });
  });

  return (
    <section className="tarjeta-form" aria-labelledby="titulo-contacto">
      <header className="marca">
        <img src="/img/logo.svg" alt="Logo Pastelería Mil Sabores" width="80" height="80" />
        <p style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", color: "var(--chocolate)", margin: 0 }}>Pastelería Mil Sabores</p>
        <h1 id="titulo-contacto" style={{ fontFamily: "var(--fuente-texto)", fontWeight: 700, fontSize: "1.2rem", color: "var(--texto)" }}>Formulario de contacto</h1>
      </header>
      <form noValidate onSubmit={enviarMensaje}>
        <p className="resumen-errores" hidden={!resumen}>{resumen}</p>
        <Campo id="nombre" label="Nombre completo *" error={errores.nombre} max={100} largo={valores.nombre.length}>
          <input type="text" autoComplete="name" {...campo("nombre")} />
        </Campo>
        <Campo id="correo" label="Correo" opcional="(opcional, para responderte)" error={errores.correo}>
          <input type="email" placeholder="nombre@gmail.com" autoComplete="email" {...campo("correo")} />
        </Campo>
        <Campo id="comentario" label="Comentario *" error={errores.comentario} max={500} largo={valores.comentario.length}>
          <textarea rows="5" placeholder="Cuéntanos en qué te podemos ayudar" {...campo("comentario")} />
        </Campo>
        <button className="btn btn-bloque" type="submit">Enviar mensaje</button>
      </form>
    </section>
  );
}
