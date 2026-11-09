import { Link, useOutletContext } from "react-router-dom";
import { Ordenes, Productos, Reportes, Usuarios, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";
import Estado from "../../components/admin/Estado.jsx";
import { menuPara } from "../../components/admin/menuAdmin.js";

/* Dashboard (Figura 9): tarjetas de resumen + accesos a cada sección */
export default function Dashboard() {
  useStore();
  useTitulo("Dashboard | Administrador Mil Sabores");
  const { sesion, esAdmin } = useOutletContext();
  const ordenes = Ordenes.todas();
  const criticos = Productos.criticos();
  const ultimas = ordenes.slice(-5).reverse();

  const stats = [
    { titulo: "Compras", valor: ordenes.length, detalle: `Ventas totales: ${formatoCLP(Reportes.ventasTotales())}`, color: "bg-primary", icono: "🛒" },
    { titulo: "Productos", valor: Productos.todos().length, detalle: `Inventario actual: ${Reportes.unidadesEnStock()} unidades`, color: "bg-success", icono: "📦" },
    esAdmin
      ? { titulo: "Usuarios", valor: Usuarios.todos().length, detalle: `Clientes: ${Usuarios.todos().filter(u => u.tipo === "Cliente").length}`, color: "bg-warning", icono: "👥" }
      : { titulo: "Stock crítico", valor: criticos.length, detalle: "Productos bajo el mínimo", color: "bg-warning", icono: "⚠️" }
  ];

  return (
    <>
      <CabeceraAdmin titulo="Dashboard" subtitulo={`¡Hola ${sesion.nombre}! Resumen de las actividades diarias`}>
        <span className="text-body-secondary small align-self-center">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </CabeceraAdmin>

      <section className="row g-3 mb-4" aria-label="Resumen">
        {stats.map(s => (
          <div className="col-12 col-md-4" key={s.titulo}>
            <article className={`card stat-ms ${s.color} h-100 shadow-sm`} data-testid="estadistica">
              <div className="card-body d-flex align-items-center gap-3">
                <span className="fs-1" aria-hidden="true">{s.icono}</span>
                <div>
                  <h2 className="h6 mb-0 text-white" style={{ fontFamily: "inherit", fontWeight: 700 }}>{s.titulo}</h2>
                  <span className="display-6">{s.valor}</span>
                </div>
              </div>
              <div className="card-footer border-0 bg-transparent text-white small fw-bold">{s.detalle}</div>
            </article>
          </div>
        ))}
      </section>

      <section className="row g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4 mb-4" aria-label="Accesos rápidos">
        {[...menuPara(sesion.tipo), { to: "/", icono: "🏪", texto: "Tienda", detalle: "Visualiza tu tienda en tiempo real." }].map(m => (
          <div className="col" key={m.to}>
            <Link to={m.to} className="card acceso-ms h-100 text-center p-3">
              <span className="icono" aria-hidden="true">{m.icono}</span>
              <strong className="mt-1">{m.texto}</strong>
              <small className="text-body-secondary">{m.detalle}</small>
            </Link>
          </div>
        ))}
      </section>

      <div className="row g-3">
        <section className="col-12 col-xl-5" aria-labelledby="titulo-alertas">
          <div className="card h-100 shadow-sm"><div className="card-body">
            <h2 id="titulo-alertas" className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Alertas de stock crítico</h2>
            {criticos.length ? (
              <>
                {criticos.slice(0, 4).map(p => (
                  <div key={p.codigo} className="alert alert-warning py-2 mb-2 small">⚠️ <strong>{p.nombre}</strong> ({p.codigo}): stock {p.stock}, crítico {p.stockCritico}.</div>
                ))}
                <Link to="/admin/productos/criticos" className="btn btn-outline-primary btn-sm">Ver listado de críticos</Link>
              </>
            ) : <p className="mb-0">Todo en orden: ningún producto está bajo su stock crítico.</p>}
          </div></div>
        </section>
        <section className="col-12 col-xl-7" aria-labelledby="titulo-ultimas">
          <div className="card h-100 shadow-sm"><div className="card-body">
            <h2 id="titulo-ultimas" className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Últimas órdenes</h2>
            {ultimas.length ? (
              <div className="table-responsive">
                <table className="table table-hover table-sm align-middle mb-0">
                  <thead><tr><th>N°</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody>
                    {ultimas.map(o => (
                      <tr key={o.numero}>
                        <td><Link to={`/admin/ordenes/${o.numero}`}>{o.numero}</Link></td><td>{o.cliente}</td>
                        <td>{formatoCLP(o.total)}</td><td><Estado estado={o.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mb-0">Aún no hay órdenes. Haz una compra en la tienda para verla aquí.</p>}
          </div></div>
        </section>
      </div>
    </>
  );
}
