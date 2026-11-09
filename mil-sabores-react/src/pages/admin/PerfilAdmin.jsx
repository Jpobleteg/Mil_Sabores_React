import { Sesion, Usuarios } from "../../lib/store.js";
import { Validar } from "../../lib/validaciones.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useFormulario } from "../../hooks/useFormulario.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import Campo from "../../components/Campo.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Perfil del administrador / vendedor: datos personales y cambio de contraseña */
export default function PerfilAdmin() {
  useStore();
  useTitulo("Perfil | Administrador Mil Sabores");
  const avisar = useAvisos();
  const u = Sesion.usuario();

  const { errores, campo, enviar, resumen, reiniciar } = useFormulario(
    { nombre: u.nombre, apellidos: u.apellidos, telefono: u.telefono || "", actual: "", nueva: "", nueva2: "" },
    {
      nombre: val => Validar.requerido(val, "El nombre") || Validar.maxLargo(val, 50, "El nombre"),
      apellidos: val => Validar.requerido(val, "Los apellidos") || Validar.maxLargo(val, 100, "Los apellidos"),
      telefono: val => Validar.telefono(val),
      actual: (val, vals) => (vals.nueva && val !== u.password ? "La contraseña actual no es correcta." : ""),
      nueva: val => Validar.password(val),
      nueva2: (val, vals) => (vals.nueva && val !== vals.nueva ? "Las contraseñas no coinciden." : "")
    },
    { nueva: ["nueva2", "actual"] }
  );

  const guardar = enviar(d => {
    const cambios = { nombre: d.nombre.trim(), apellidos: d.apellidos.trim(), telefono: d.telefono.trim() };
    if (d.nueva) cambios.password = d.nueva;
    Usuarios.guardar({ ...u, ...cambios }, u.run);
    Sesion.iniciar({ ...u, ...cambios });
    avisar(d.nueva ? "Perfil y contraseña actualizados." : "Perfil actualizado.");
    reiniciar({ ...d, actual: "", nueva: "", nueva2: "" });
  });

  return (
    <>
      <CabeceraAdmin titulo="Perfil" subtitulo={`${u.correo} · ${u.tipo}`} />
      <section className="card shadow-sm" style={{ maxWidth: 820 }}><div className="card-body p-4">
        <form noValidate onSubmit={guardar} className="row g-3">
          {resumen && <div className="col-12"><div className="alert alert-danger mb-0">{resumen}</div></div>}
          <Campo id="run" label="RUN" className="col-12 col-md-6"><input id="run" className="form-control bg-body-tertiary" value={u.run} readOnly /></Campo>
          <Campo id="correo" label="Correo" className="col-12 col-md-6"><input id="correo" className="form-control bg-body-tertiary" value={u.correo} readOnly /></Campo>
          <Campo id="nombre" label="Nombre *" error={errores.nombre} className="col-12 col-md-6"><input type="text" {...campo("nombre")} /></Campo>
          <Campo id="apellidos" label="Apellidos *" error={errores.apellidos} className="col-12 col-md-6"><input type="text" {...campo("apellidos")} /></Campo>
          <Campo id="telefono" label="Teléfono" opcional="(opcional)" error={errores.telefono} className="col-12 col-md-6"><input type="tel" {...campo("telefono")} /></Campo>
          <div className="col-12"><h2 className="h5 mt-2" style={{ fontFamily: "inherit", fontWeight: 700 }}>Cambiar contraseña <small className="text-body-secondary fw-normal">(opcional)</small></h2></div>
          <Campo id="actual" label="Contraseña actual" error={errores.actual} className="col-12 col-md-4"><input type="password" autoComplete="current-password" {...campo("actual")} /></Campo>
          <Campo id="nueva" label="Nueva contraseña" error={errores.nueva} className="col-12 col-md-4"><input type="password" maxLength={10} autoComplete="new-password" {...campo("nueva")} /></Campo>
          <Campo id="nueva2" label="Confirmar nueva" error={errores.nueva2} className="col-12 col-md-4"><input type="password" maxLength={10} autoComplete="new-password" {...campo("nueva2")} /></Campo>
          <div className="col-12"><button type="submit" className="btn btn-primary w-100">Guardar cambios</button></div>
        </form>
      </div></section>
    </>
  );
}
