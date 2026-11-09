/* Pruebas del panel administrador: control de acceso, dashboard, CRUD de productos y categorías */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AvisosProvider } from "../../context/AvisosContext.jsx";
import RequiereRol from "../../components/admin/RequiereRol.jsx";
import Dashboard from "../../pages/admin/Dashboard.jsx";
import AdminProductos from "../../pages/admin/AdminProductos.jsx";
import ProductosCriticos from "../../pages/admin/ProductosCriticos.jsx";
import { FormularioProducto } from "../../pages/admin/ProductoForm.jsx";
import AdminCategorias from "../../pages/admin/AdminCategorias.jsx";
import CategoriaForm from "../../pages/admin/CategoriaForm.jsx";
import Reportes from "../../pages/admin/Reportes.jsx";
import { Categorias, Productos } from "../../lib/store.js";
import { Ubicacion, datosLimpios, esperar, iniciarSesionComo, renderizarAdmin, rutaActual } from "../helpers.jsx";

/* Rutas mínimas para probar el control de acceso */
function renderizarProtegido(ruta, roles) {
  return render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AvisosProvider>
        <Routes>
          <Route path="/admin" element={<p>Panel</p>} />
          <Route path="/admin/privado" element={<RequiereRol roles={roles}><p>Contenido privado</p></RequiereRol>} />
          <Route path="/login" element={<p>Login</p>} />
        </Routes>
        <Ubicacion />
      </AvisosProvider>
    </MemoryRouter>
  );
}

describe("Panel administrador", () => {
  beforeEach(datosLimpios);

  describe("<RequiereRol /> — control de acceso", () => {
    it("sin sesión redirige a /login", async () => {
      renderizarProtegido("/admin/privado", ["Administrador"]);
      expect(await esperar(() => rutaActual() === "/login")).toBeTrue();
      expect(screen.queryByText("Contenido privado")).toBeNull();
    });

    it("el vendedor no entra a secciones solo de administrador", async () => {
      iniciarSesionComo("vendedor@duoc.cl");
      renderizarProtegido("/admin/privado", ["Administrador"]);
      expect(await esperar(() => rutaActual() === "/admin")).toBeTrue();
    });

    it("el administrador sí ve el contenido", () => {
      iniciarSesionComo("admin@duoc.cl");
      renderizarProtegido("/admin/privado", ["Administrador"]);
      expect(screen.getByText("Contenido privado")).toBeTruthy();
    });
  });

  it("<Dashboard /> muestra 3 tarjetas de resumen y los accesos según el rol", () => {
    iniciarSesionComo("admin@duoc.cl");
    renderizarAdmin(<Dashboard />);
    expect(screen.getAllByTestId("estadistica").length).toBe(3);
    expect(screen.getByRole("link", { name: /Categorías/ })).toBeTruthy();
  });

  it("<Dashboard /> del vendedor no muestra Usuarios ni Reportes", () => {
    iniciarSesionComo("vendedor@duoc.cl");
    renderizarAdmin(<Dashboard />, { esAdmin: false });
    expect(screen.queryByRole("link", { name: /Usuarios/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Reportes/ })).toBeNull();
  });

  it("<AdminProductos /> pagina de a 8 y elimina con confirmación", () => {
    spyOn(window, "confirm").and.returnValue(true);
    renderizarAdmin(<AdminProductos />, { ruta: "/admin/productos", path: "/admin/productos" });
    expect(screen.getAllByRole("row").length).toBe(9); // encabezado + 8
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    expect(Productos.buscar("TC001")).toBeUndefined();
  });

  it("<AdminProductos /> oculta Editar/Eliminar al vendedor", () => {
    renderizarAdmin(<AdminProductos />, { ruta: "/admin/productos", path: "/admin/productos", esAdmin: false });
    expect(screen.queryAllByRole("button", { name: "Eliminar" }).length).toBe(0);
    expect(screen.queryByRole("link", { name: "+ Nuevo producto" })).toBeNull();
  });

  it("<ProductosCriticos /> lista solo productos con stock bajo el crítico", () => {
    Productos.actualizar("TC001", { stock: 1 });
    renderizarAdmin(<ProductosCriticos />, { ruta: "/x", path: "/x" });
    expect(screen.getByText("Torta Cuadrada de Chocolate")).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(2);
  });

  describe("Formulario de producto (Create / Update)", () => {
    it("valida código duplicado y precio de oferta mayor al precio", () => {
      renderizarAdmin(<FormularioProducto editando={null} />, { ruta: "/x", path: "/x" });
      fireEvent.change(screen.getByLabelText(/Código producto/), { target: { value: "TC001" } });
      expect(screen.getByText("Ya existe un producto con ese código.")).toBeTruthy();
      fireEvent.change(screen.getByLabelText(/^Precio \(CLP\)/), { target: { value: "1000" } });
      fireEvent.change(screen.getByLabelText(/Precio de oferta/), { target: { value: "2000" } });
      expect(screen.getByText("El precio de oferta debe ser menor que el precio normal.")).toBeTruthy();
    });

    it("crea un producto nuevo con datos válidos", () => {
      renderizarAdmin(<FormularioProducto editando={null} />, { ruta: "/x", path: "/x" });
      const escribir = (e, v) => fireEvent.change(screen.getByLabelText(e), { target: { value: v } });
      escribir(/Código producto/, "kc001");
      escribir(/^Categoría/, "Tortas Especiales");
      escribir(/^Nombre/, "Kuchen de Murta");
      escribir(/^Precio \(CLP\)/, "18000");
      escribir(/^Stock \*/, "5");
      fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
      expect(Productos.buscar("KC001")).toEqual(jasmine.objectContaining({ nombre: "Kuchen de Murta", precio: 18000, stock: 5 }));
    });

    it("al editar carga los datos actuales y guarda los cambios", () => {
      renderizarAdmin(<FormularioProducto editando={Productos.buscar("PI001")} />, { ruta: "/x", path: "/x" });
      expect(screen.getByLabelText(/^Nombre/).value).toBe("Mousse de Chocolate");
      fireEvent.change(screen.getByLabelText(/^Stock \*/), { target: { value: "99" } });
      fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
      expect(Productos.buscar("PI001").stock).toBe(99);
    });
  });

  describe("Categorías", () => {
    it("<CategoriaForm /> crea una categoría y vuelve al listado", async () => {
      renderizarAdmin(<CategoriaForm />, { ruta: "/admin/categorias/nueva", path: "/admin/categorias/nueva" });
      fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: "Kuchen" } });
      fireEvent.click(screen.getByRole("button", { name: "Guardar categoría" }));
      expect(Categorias.obtener("kuchen").nombre).toBe("Kuchen");
      expect(await esperar(() => rutaActual() === "/admin/categorias")).toBeTrue();
    });

    it("<AdminCategorias /> no elimina categorías con productos", () => {
      spyOn(window, "confirm").and.returnValue(true);
      renderizarAdmin(<AdminCategorias />, { ruta: "/x", path: "/x" });
      fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
      expect(screen.getByText(/No se puede eliminar/)).toBeTruthy();
      expect(Categorias.todas().length).toBe(8);
    });
  });

  it("<Reportes /> muestra los indicadores principales", () => {
    renderizarAdmin(<Reportes />, { ruta: "/x", path: "/x" });
    expect(screen.getAllByTestId("kpi").length).toBe(4);
    expect(screen.getAllByText("Sin ventas registradas.").length).toBe(2);
  });
});
