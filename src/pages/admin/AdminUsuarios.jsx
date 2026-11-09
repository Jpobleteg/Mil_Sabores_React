import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TIPOS_USUARIO } from "../../lib/data.js";
import { Usuarios } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";

export default function AdminUsuarios() {
  useStore();
  useTitulo("Usuarios | Administrador Mil Sabores");
  const { sesion } = useOutletContext();
  const avisar = useAvisos();
  const [buscar, setBuscar] = useState("");
  const [tipo, setTipo] = useState("");
  const [pagina, setPagina] = useState(1);

  const t = buscar.trim().toLowerCase();
  const lista = Usuarios.todos().filter(u =>
    (!t || `${u.run} ${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase().includes(t)) && (!tipo || u.tipo === tipo));
  const pag = paginar(lista, pagina, 8);

  const eliminar = run => {
    if (window.confirm(`¿Eliminar al usuario con RUN ${run}?`)) {
      Usuarios.eliminar(run);
      avisar("Usuario eliminado.");
    }
  };

  return (
    <>
      <CabeceraAdmin titulo="Usuarios">
        <Link className="btn" to="/admin/usuarios/nuevo">+ Nuevo usuario</Link>
      </CabeceraAdmin>
      <section className="panel">
        <div className="herramientas">
          <label htmlFor="buscar-usuario" className="oculto-visual">Buscar usuario</label>
          <input type="search" id="buscar-usuario" placeholder="Buscar por RUN, nombre o correo" value={buscar}
            onChange={e => { setBuscar(e.target.value); setPagina(1); }} />
          <label htmlFor="filtro-tipo" className="oculto-visual">Tipo de usuario</label>
          <select id="filtro-tipo" value={tipo} onChange={e => { setTipo(e.target.value); setPagina(1); }}>
            <option value="">Todos los tipos</option>
            {TIPOS_USUARIO.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Comuna</th><th>Acciones</th></tr></thead>
            <tbody>
              {pag.visibles.length ? pag.visibles.map(u => (
                <tr key={u.run}>
                  <td>{u.run}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>{u.correo}</td>
                  <td><span className="estado">{u.tipo}</span></td>
                  <td>{u.comuna}</td>
                  <td className="acciones">
                    <Link className="btn btn-borde btn-chico" to={`/admin/usuarios/${encodeURIComponent(u.run)}`}>Ver</Link>
                    <Link className="btn btn-chico" to={`/admin/usuarios/${encodeURIComponent(u.run)}/editar`}>Editar</Link>
                    {u.correo !== sesion.correo && (
                      <button className="btn btn-peligro btn-chico" type="button" onClick={() => eliminar(u.run)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan="6">No hay usuarios que coincidan.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacion total={pag.total} pagina={pag.pagina} onCambiar={setPagina} />
      </section>
    </>
  );
}
