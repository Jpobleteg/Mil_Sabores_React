import { useOutletContext } from "react-router-dom";
import { Ordenes, Productos, Usuarios, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

export const claseEstado = estado => `estado estado-${estado.replace(/\s/g, "-")}`;

export default function Dashboard() {
  useStore();
  useTitulo("Dashboard | Administrador Mil Sabores");
  const { sesion, esAdmin } = useOutletContext();
  const productos = Productos.todos();
  const ordenes = Ordenes.todas();
  const ventas = ordenes.reduce((s, o) => s + o.total, 0);
  const criticos = productos.filter(Productos.esCritico);
  const tarjetas = [
    ["Productos", productos.length],
    ["Órdenes", ordenes.length],
    ["Ventas totales", formatoCLP(ventas)],
    esAdmin ? ["Usuarios", Usuarios.todos().length] : ["Stock crítico", criticos.length]
  ];
  const ultimas = ordenes.slice(-5).reverse();

  return (
    <>
      <CabeceraAdmin titulo={`¡Hola ${sesion.nombre}!`}>
        <span className="texto-secundario">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </CabeceraAdmin>

      <section className="estadisticas" aria-label="Resumen">
        {tarjetas.map(([t, v]) => (
          <article key={t} className="estadistica"><span>{t}</span><strong>{v}</strong></article>
        ))}
      </section>

      <section className="panel" aria-labelledby="titulo-alertas">
        <h2 id="titulo-alertas">Alertas de stock crítico</h2>
        {criticos.length ? criticos.map(p => (
          <p key={p.codigo} className="alerta">⚠️ <strong>{p.nombre}</strong> ({p.codigo}) tiene stock {p.stock}, igual o bajo el crítico ({p.stockCritico}).</p>
        )) : <p>Todo en orden: ningún producto está bajo su stock crítico.</p>}
      </section>

      <section className="panel" aria-labelledby="titulo-ultimas">
        <h2 id="titulo-ultimas">Últimas órdenes</h2>
        <div className="tabla-scroll">
          {ultimas.length ? (
            <table className="tabla">
              <thead><tr><th>N°</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {ultimas.map(o => (
                  <tr key={o.numero}>
                    <td>{o.numero}</td><td>{o.cliente}</td><td>{formatoCLP(o.total)}</td>
                    <td><span className={claseEstado(o.estado)}>{o.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Aún no hay órdenes. Haz una compra en la tienda para verla aquí.</p>}
        </div>
      </section>
    </>
  );
}
