import { CATEGORIAS, REGIONES, TIPOS_USUARIO } from "../lib/data.js";
import { CODIGO_PROMO, Usuarios } from "../lib/store.js";
import { DOMINIOS_PERMITIDOS, Validar, calcularEdad } from "../lib/validaciones.js";
import { useFormulario } from "../hooks/useFormulario.js";
import Campo from "./Campo.jsx";

/* =========================================================
   Formulario de usuario compartido por:
     · Registro de usuario (tienda)            modo="registro"
     · Mi perfil (tienda)                      modo="perfil"
     · Nuevo / Editar usuario (administrador)  modo="admin"
   Reglas: RUN, nombre, apellidos, correo, fecha de nacimiento,
   tipo de usuario (solo admin), región/comuna y dirección.
   onGuardar(datos) recibe los datos ya validados.
   ========================================================= */
export default function FormularioUsuario({ modo, editando = null, onGuardar, textoBoton, pie }) {
  const esRegistro = modo === "registro";
  const esPerfil = modo === "perfil";
  const esAdmin = modo === "admin";
  const passOpcional = esAdmin && Boolean(editando);

  const inicial = {
    run: "", nombre: "", apellidos: "", correo: "", correo2: "", password: "", password2: "",
    fechaNacimiento: "", telefono: "", codigoPromo: "", tipo: "", region: "", comuna: "", direccion: "",
    preferencias: [], terminos: false
  };
  if (editando) {
    ["run", "nombre", "apellidos", "correo", "fechaNacimiento", "telefono", "direccion", "codigoPromo", "tipo", "region", "comuna"]
      .forEach(k => (inicial[k] = editando[k] || ""));
    inicial.preferencias = editando.preferencias || [];
  }

  /* ----- Reglas de validación ----- */
  const reglas = {
    nombre: v => Validar.requerido(v, "El nombre") || Validar.maxLargo(v, 50, "El nombre") ||
      (/\d/.test(v) ? "El nombre no debe contener números." : ""),
    apellidos: v => Validar.requerido(v, "Los apellidos") || Validar.maxLargo(v, 100, "Los apellidos") ||
      (/\d/.test(v) ? "Los apellidos no deben contener números." : ""),
    fechaNacimiento: v => Validar.fechaNacimiento(v),
    telefono: v => Validar.telefono(v),
    region: v => Validar.requerido(v, "La región"),
    comuna: v => Validar.requerido(v, "La comuna"),
    direccion: v => Validar.requerido(v, "La dirección") || Validar.maxLargo(v, 300, "La dirección")
  };
  if (!esPerfil) {
    reglas.run = v => Validar.requerido(v, "El RUN") || Validar.run(v) ||
      (!editando && Usuarios.buscarPorRun(v.trim()) ? "Ya existe un usuario con este RUN." : "");
    reglas.correo = v => {
      const err = Validar.requerido(v, "El correo") || Validar.maxLargo(v, 100, "El correo") || Validar.correo(v);
      if (err) return err;
      const u = Usuarios.buscarPorCorreo(v.trim());
      return u && (!editando || u.run !== editando.run) ? "Este correo ya está registrado." : "";
    };
    reglas.password = v => (passOpcional && !v ? "" : Validar.requerido(v, "La contraseña") || Validar.password(v));
    reglas.password2 = (v, vals) => {
      if (passOpcional && !vals.password && !v) return "";
      return Validar.requerido(v, "La confirmación") || (v !== vals.password ? "Las contraseñas no coinciden." : "");
    };
    reglas.codigoPromo = v => (!v.trim() || v.trim().toUpperCase() === CODIGO_PROMO ? "" : "Código no válido. El código vigente es FELICES50.");
  }
  if (esRegistro) {
    reglas.correo2 = (v, vals) => Validar.requerido(v, "La confirmación del correo") ||
      (v.trim().toLowerCase() !== vals.correo.trim().toLowerCase() ? "Los correos no coinciden." : "");
    reglas.terminos = v => (v ? "" : "Debes aceptar los términos y condiciones.");
  }
  if (esAdmin) reglas.tipo = v => Validar.requerido(v, "El tipo de usuario");

  const f = useFormulario(inicial, reglas, { correo: ["correo2"], password: ["password2"] });
  const { valores: v, errores, campo, enviar, cambiarValor, setValores, setErrores } = f;

  /* Región → Comuna: al cambiar la región se recargan las comunas */
  const comunas = REGIONES.find(r => r.region === v.region)?.comunas || [];
  const cambiarRegion = e => {
    const nuevos = cambiarValor("region", e.target.value);
    setValores({ ...nuevos, comuna: "" });
    setErrores(prev => { const c = { ...prev }; delete c.comuna; return c; });
  };

  /* Sugerencia de dominios de correo mientras se escribe (autocompletar) */
  const usuarioCorreo = v.correo.split("@")[0];

  /* Sugerencia en vivo con los beneficios que obtendrá el usuario */
  const beneficios = (() => {
    const codigo = esPerfil ? (editando && editando.codigoPromo) || "" : v.codigoPromo;
    const msgs = [];
    const edad = calcularEdad(v.fechaNacimiento);
    if (edad !== null && edad >= 50) msgs.push("🎉 Tendrás 50% de descuento en todos los productos por ser mayor de 50 años.");
    else if (String(codigo).trim().toUpperCase() === CODIGO_PROMO) msgs.push("🎉 Código FELICES50: 10% de descuento de por vida.");
    if (v.correo.trim().toLowerCase().endsWith("@duoc.cl")) {
      msgs.push(v.fechaNacimiento
        ? "🎂 Como estudiante Duoc recibirás una torta gratis el día de tu cumpleaños."
        : "🎂 ¿Eres estudiante Duoc? Agrega tu fecha de nacimiento para recibir una torta gratis en tu cumpleaños.");
    }
    return msgs.join(" ");
  })();

  const togglePreferencia = c => {
    setValores(prev => ({
      ...prev,
      preferencias: prev.preferencias.includes(c) ? prev.preferencias.filter(x => x !== c) : [...prev.preferencias, c]
    }));
  };

  const guardar = enviar(vals => {
    const datos = {
      run: vals.run.trim().toUpperCase(),
      nombre: vals.nombre.trim(),
      apellidos: vals.apellidos.trim(),
      correo: vals.correo.trim().toLowerCase(),
      fechaNacimiento: vals.fechaNacimiento,
      telefono: vals.telefono.trim(),
      region: vals.region,
      comuna: vals.comuna,
      direccion: vals.direccion.trim()
    };
    if (!esPerfil) datos.codigoPromo = vals.codigoPromo.trim().toUpperCase();
    if (!esPerfil && vals.password) datos.password = vals.password;
    if (esPerfil) datos.preferencias = vals.preferencias;
    if (esAdmin) datos.tipo = vals.tipo;
    onGuardar(datos);
  });

  /* ----- Campos (se reutilizan en los tres modos) ----- */
  const cRun = (
    <Campo id="run" label={esPerfil ? "RUN" : "RUN *"} ayuda={!esPerfil && "Sin puntos ni guion."} error={errores.run}>
      {esPerfil
        ? <input type="text" id="run" value={v.run} readOnly />
        : <input type="text" maxLength={9} placeholder="Ej: 190110222" autoComplete="off" readOnly={esAdmin && Boolean(editando)} {...campo("run")} />}
    </Campo>
  );
  const cCorreo = (
    <Campo id="correo" label={esPerfil ? "Correo" : "Correo *"} className={esRegistro ? "completo" : ""}
      ayuda={esRegistro && "Solo @duoc.cl, @profesor.duoc.cl o @gmail.com."} error={errores.correo}>
      {esPerfil
        ? <input type="email" id="correo" value={v.correo} readOnly />
        : <>
            <input type="email" list="dominios" placeholder={esRegistro ? "nombre@duoc.cl" : undefined} autoComplete={esRegistro ? "email" : "off"} {...campo("correo")} />
            <datalist id="dominios">
              {usuarioCorreo && DOMINIOS_PERMITIDOS.map(d => <option key={d} value={usuarioCorreo + d} />)}
            </datalist>
          </>}
    </Campo>
  );
  const cFecha = (
    <Campo id="fechaNacimiento" label="Fecha de nacimiento" opcional={!esPerfil && "(opcional)"} error={errores.fechaNacimiento}>
      <input type="date" autoComplete="bday" {...campo("fechaNacimiento")} />
    </Campo>
  );
  const cNombre = (
    <Campo id="nombre" label="Nombre *" error={errores.nombre} max={50} largo={v.nombre.length}>
      <input type="text" maxLength={esRegistro ? 60 : undefined} autoComplete={esAdmin ? "off" : "given-name"} {...campo("nombre")} />
    </Campo>
  );
  const cApellidos = (
    <Campo id="apellidos" label="Apellidos *" error={errores.apellidos} max={100} largo={v.apellidos.length}>
      <input type="text" maxLength={esRegistro ? 110 : undefined} autoComplete={esAdmin ? "off" : "family-name"} {...campo("apellidos")} />
    </Campo>
  );
  const cPassword = (
    <>
      <Campo id="password" label="Contraseña" opcional={esAdmin && editando ? "(opcional)" : "*"}
        ayuda={esAdmin ? "Entre 4 y 10 caracteres. Al editar, déjala vacía para no cambiarla." : "Entre 4 y 10 caracteres."} error={errores.password}>
        <input type="password" maxLength={10} autoComplete="new-password" {...campo("password")} />
      </Campo>
      <Campo id="password2" label={esRegistro ? "Confirmar contraseña *" : "Confirmar contraseña"} error={errores.password2}>
        <input type="password" maxLength={10} autoComplete="new-password" {...campo("password2")} />
      </Campo>
    </>
  );
  const cTelefono = (
    <Campo id="telefono" label="Teléfono" opcional="(opcional)" error={errores.telefono}>
      <input type="tel" placeholder={esRegistro ? "+56 9 1234 5678" : undefined} autoComplete="tel" {...campo("telefono")} />
    </Campo>
  );
  const cPromo = (
    <Campo id="codigoPromo" label="Código promocional" opcional="(opcional)" error={errores.codigoPromo}>
      <input type="text" placeholder={esRegistro ? "FELICES50" : undefined} autoComplete="off" {...campo("codigoPromo")} />
    </Campo>
  );
  const cRegionComuna = (
    <>
      <Campo id="region" label="Región *" error={errores.region}>
        <select autoComplete="address-level1" {...campo("region")} onChange={cambiarRegion}>
          <option value="">-- Seleccione la región --</option>
          {REGIONES.map(r => <option key={r.region}>{r.region}</option>)}
        </select>
      </Campo>
      <Campo id="comuna" label="Comuna *" error={errores.comuna}>
        <select autoComplete="address-level2" disabled={!comunas.length} {...campo("comuna")}>
          <option value="">-- Seleccione la comuna --</option>
          {comunas.map(c => <option key={c}>{c}</option>)}
        </select>
      </Campo>
    </>
  );
  const cDireccion = (
    <Campo id="direccion" label="Dirección *" className="completo" error={errores.direccion} max={300} largo={v.direccion.length}>
      <input type="text" placeholder={esRegistro ? "Calle, número, depto." : undefined} autoComplete="street-address" {...campo("direccion")} />
    </Campo>
  );
  const cajaBeneficios = <div className="sugerencia" aria-live="polite">{beneficios}</div>;

  return (
    <>
      {esPerfil && cajaBeneficios}
      <form noValidate onSubmit={guardar}>
        <p className="resumen-errores" hidden={!f.resumen}>{f.resumen}</p>
        <div className="form-grid">
          {esRegistro && <>
            {cRun}{cFecha}{cNombre}{cApellidos}{cCorreo}
            <Campo id="correo2" label="Confirmar correo *" className="completo" error={errores.correo2}>
              <input type="email" autoComplete="off" {...campo("correo2")} />
            </Campo>
            {cPassword}{cTelefono}{cPromo}{cRegionComuna}{cDireccion}
            <div className="campo campo-check completo">
              <input type="checkbox" id="terminos" checked={v.terminos} className={errores.terminos ? "invalido" : undefined}
                onChange={e => { cambiarValor("terminos", e.target.checked); }} />
              <label htmlFor="terminos">Acepto los términos y condiciones de la tienda *</label>
            </div>
            <div className="campo completo" style={{ marginTop: -12 }}>
              <small className="error" aria-live="polite">{errores.terminos}</small>
            </div>
          </>}

          {esPerfil && <>
            {cRun}{cCorreo}{cNombre}{cApellidos}{cFecha}{cTelefono}{cRegionComuna}{cDireccion}
            <fieldset className="campo completo" style={{ border: 0, padding: 0 }}>
              <legend style={{ fontWeight: 700, marginBottom: 6 }}>Mis categorías favoritas</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
                {CATEGORIAS.map((c, i) => (
                  <label key={c} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 400 }}>
                    <input type="checkbox" id={`pref-${i}`} checked={v.preferencias.includes(c)} onChange={() => togglePreferencia(c)} /> {c}
                  </label>
                ))}
              </div>
            </fieldset>
          </>}

          {esAdmin && <>
            {cRun}
            <Campo id="tipo" label="Tipo de usuario *" error={errores.tipo}>
              <select {...campo("tipo")}>
                <option value="">-- Seleccione el tipo --</option>
                {TIPOS_USUARIO.map(t => <option key={t}>{t}</option>)}
              </select>
            </Campo>
            {cNombre}{cApellidos}{cCorreo}{cFecha}{cPassword}{cTelefono}{cPromo}{cRegionComuna}{cDireccion}
          </>}
        </div>
        {!esPerfil && cajaBeneficios}
        <button className="btn btn-bloque" type="submit">{textoBoton}</button>
        {pie}
      </form>
    </>
  );
}
