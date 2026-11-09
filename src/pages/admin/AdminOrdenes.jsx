import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ESTADOS, Ordenes, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import { useAvisos } from "../../context/AvisosContext.jsx";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Dialogo from "../../components/Dialogo.jsx";
import Boleta from "../../components/Boleta.jsx";
import { claseEstado } from "./Dashboard.jsx";

export default function AdminOrdenes() {
  useStore();
  useTitulo("Órdenes | Administrador Mil Sabores");
  const { esAdmin } = useOutletContext();
  const avisar = useAvisos();
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [verNumero, setVerNumero] = useState(null);

  const todas = Ordenes.todas();
  const t = buscar.trim().toLowerCase();
  const lista = todas.filter(o =>
    (!t || `${o.numero} ${o.cliente}`.toLowerCase().includes(t)) && (!estado || o.estado === estado)).reverse();
  const ordenVista = verNumero ? todas.find(o => o.numero === verNumero) : null;

  const cambiarEstado = (numero, nuevo) => {
    const o = Ordenes.cambiarEstado(numero, nuevo);
    if (o) avisar(`Orden ${o.numero}: ${o.estado}. Se notificará al cliente.`);
  };

  return (
    <>
      <CabeceraAdmin titulo="Órdenes" />
      <section className="panel">
        <div className="herramientas">
          <label htmlFor="buscar-orden" className="oculto-visual">Buscar orden</label>
          <input type="search" id="buscar-orden" placeholder="Buscar por N° de boleta o cliente" value={buscar} onChange={e => setBuscar(e.target.value)} />
          <label htmlFor="filtro-estado" className="oculto-visual">Estado</label>
          <select id="filtro-estado" value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead><tr><th>N° boleta</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.length ? lista.map(o => (
                <tr key={o.numero}>
                  <td>{o.numero}</td>
                  <td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{o.cliente}</td>
                  <td>{o.entrega.fecha}</td>
                  <td>{formatoCLP(o.total)}</td>
                  <td>
                    {esAdmin ? (
                      <>
                        <label className="oculto-visual" htmlFor={`estado-${o.numero}`}>Estado</label>
                        <select id={`estado-${o.numero}`} value={o.estado} onChange={e => cambiarEstado(o.numero, e.target.value)}>
                          {ESTADOS.map(e => <option key={e}>{e}</option>)}
                        </select>
                      </>
                    ) : <span className={claseEstado(o.estado)}>{o.estado}</span>}
                  </td>
                  <td><button className="btn btn-borde btn-chico" type="button" onClick={() => setVerNumero(o.numero)}>Ver detalle</button></td>
                </tr>
              )) : <tr><td colSpan="7">No hay órdenes todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <Dialogo abierto={Boolean(ordenVista)} onCerrar={() => setVerNumero(null)} aria-label="Detalle de la orden">
        {ordenVista && <Boleta orden={ordenVista} modo="admin" />}
      </Dialogo>
    </>
  );
}
