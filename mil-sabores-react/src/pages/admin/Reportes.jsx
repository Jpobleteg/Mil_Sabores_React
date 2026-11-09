import { Categorias, Ordenes, Productos, Reportes as R, formatoCLP } from "../../lib/store.js";
import { useStore, useTitulo } from "../../hooks/useStore.js";
import CabeceraAdmin from "../../components/admin/CabeceraAdmin.jsx";

/* Barra horizontal simple con el componente progress de Bootstrap */
function Barra({ etiqueta, valor, maximo, texto, color = "bg-primary" }) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small"><span>{etiqueta}</span><strong>{texto}</strong></div>
      <div className="progress" role="progressbar" aria-label={etiqueta} aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" style={{ height: 10 }}>
        <div className={`progress-bar ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* Reportes: ventas, productos más vendidos, estados de órdenes e inventario */
export default function Reportes() {
  useStore();
  useTitulo("Reportes | Administrador Mil Sabores");
  const porCategoria = R.ventasPorCategoria();
  const masVendidos = R.masVendidos();
  const porEstado = R.ordenesPorEstado();
  const ordenes = Ordenes.todas();
  const ticket = ordenes.length ? R.ventasTotales() / ordenes.length : 0;
  const stockPorCategoria = Categorias.todas().map(c => ({
    nombre: c.nombre, unidades: Productos.porCategoria(c.nombre).reduce((s, p) => s + Number(p.stock || 0), 0)
  }));

  const kpis = [
    ["Ventas totales", formatoCLP(R.ventasTotales())],
    ["Órdenes", ordenes.length],
    ["Ticket promedio", formatoCLP(ticket)],
    ["Inventario valorizado", formatoCLP(R.inventarioValorizado())]
  ];

  return (
    <>
      <CabeceraAdmin titulo="Reportes" subtitulo="Generado con los datos actuales del sistema">
        <button type="button" className="btn btn-outline-primary no-imprimir" onClick={() => window.print()}>Imprimir reporte</button>
      </CabeceraAdmin>
      <div className="row g-3 mb-3">
        {kpis.map(([t, v]) => (
          <div className="col-6 col-xl-3" key={t}>
            <div className="card shadow-sm h-100"><div className="card-body">
              <small className="text-body-secondary">{t}</small>
              <div className="fs-5 fw-bold" data-testid="kpi">{v}</div>
            </div></div>
          </div>
        ))}
      </div>
      <div className="row g-3">
        <section className="col-12 col-lg-6">
          <div className="card shadow-sm h-100"><div className="card-body">
            <h2 className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Ventas por categoría</h2>
            {porCategoria.length
              ? porCategoria.map(x => <Barra key={x.categoria} etiqueta={x.categoria} valor={x.monto} maximo={porCategoria[0].monto} texto={formatoCLP(x.monto)} />)
              : <p className="mb-0 text-body-secondary">Sin ventas registradas.</p>}
          </div></div>
        </section>
        <section className="col-12 col-lg-6">
          <div className="card shadow-sm h-100"><div className="card-body">
            <h2 className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Productos más vendidos</h2>
            {masVendidos.length
              ? masVendidos.map(x => <Barra key={x.codigo} etiqueta={x.nombre} valor={x.unidades} maximo={masVendidos[0].unidades} texto={`${x.unidades} u.`} color="bg-success" />)
              : <p className="mb-0 text-body-secondary">Sin ventas registradas.</p>}
          </div></div>
        </section>
        <section className="col-12 col-lg-6">
          <div className="card shadow-sm h-100"><div className="card-body">
            <h2 className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Órdenes por estado</h2>
            {porEstado.map(x => <Barra key={x.estado} etiqueta={x.estado} valor={x.cantidad} maximo={Math.max(1, ordenes.length)} texto={x.cantidad} color="bg-info" />)}
          </div></div>
        </section>
        <section className="col-12 col-lg-6">
          <div className="card shadow-sm h-100"><div className="card-body">
            <h2 className="h5" style={{ fontFamily: "inherit", fontWeight: 700 }}>Stock por categoría</h2>
            {stockPorCategoria.map(x => <Barra key={x.nombre} etiqueta={x.nombre} valor={x.unidades} maximo={Math.max(1, ...stockPorCategoria.map(s => s.unidades))} texto={`${x.unidades} u.`} color="bg-warning" />)}
          </div></div>
        </section>
      </div>
    </>
  );
}
