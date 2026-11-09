import { Mensajes, Sesion } from "../lib/store.js";
import { Validar } from "../lib/validaciones.js";
import { useTitulo } from "../hooks/useStore.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useAvisos } from "../context/AvisosContext.jsx";
import Campo from "../components/Campo.jsx";
import TarjetaFormulario from "../components/TarjetaFormulario.jsx";

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
    <TarjetaFormulario titulo="Formulario de contacto" subtitulo="Pastelería Mil Sabores" ancho={640} idTitulo="titulo-contacto">
      <form noValidate onSubmit={enviarMensaje} className="row g-3">
        {resumen && <div className="col-12"><div className="alert alert-danger mb-0" role="alert">{resumen}</div></div>}
        <Campo id="nombre" label="Nombre completo *" error={errores.nombre} max={100} largo={valores.nombre.length} className="col-12 col-md-6">
          <input type="text" autoComplete="name" {...campo("nombre")} />
        </Campo>
        <Campo id="correo" label="Correo" opcional="(opcional)" error={errores.correo} className="col-12 col-md-6">
          <input type="email" placeholder="nombre@gmail.com" autoComplete="email" {...campo("correo")} />
        </Campo>
        <Campo id="comentario" label="Comentario *" error={errores.comentario} max={500} largo={valores.comentario.length}>
          <textarea rows="5" placeholder="Cuéntanos en qué te podemos ayudar" {...campo("comentario")} />
        </Campo>
        <div className="col-12"><button className="btn btn-primary btn-lg w-100" type="submit">Enviar mensaje</button></div>
      </form>
    </TarjetaFormulario>
  );
}
