/* Pruebas de RENDERIZADO de listas: GrillaProductos, TablaCarrito y Paginacion */
import { fireEvent, render, screen } from "@testing-library/react";
import GrillaProductos from "../../components/GrillaProductos.jsx";
import TablaCarrito from "../../components/TablaCarrito.jsx";
import Paginacion, { paginar } from "../../components/admin/Paginacion.jsx";
import { Carrito, Productos } from "../../lib/store.js";
import { datosLimpios, renderizar } from "../helpers.jsx";

describe("Componentes de lista", () => {
  beforeEach(datosLimpios);

  it("<GrillaProductos /> renderiza una tarjeta por cada producto del conjunto", () => {
    const productos = Productos.todos();
    renderizar(<GrillaProductos productos={productos} />);
    expect(screen.getAllByTestId("tarjeta-producto").length).toBe(productos.length);
  });

  it("<GrillaProductos /> muestra el mensaje 'vacio' si la lista está vacía", () => {
    renderizar(<GrillaProductos productos={[]} vacio="Sin resultados" />);
    expect(screen.getByText("Sin resultados")).toBeTruthy();
    expect(screen.queryByTestId("grilla-productos")).toBeNull();
  });

  it("<TablaCarrito /> muestra una fila por línea y botones solo si es editable", () => {
    Carrito.agregar("PI001", 2);
    Carrito.agregar("PT001", 1);
    const { lineas } = Carrito.resumen();
    const { rerender } = renderizar(<TablaCarrito lineas={lineas} />);
    expect(screen.getAllByTestId("fila-carrito").length).toBe(2);
    expect(screen.queryByRole("button", { name: /Eliminar/ })).toBeNull();
    rerender(<TablaCarrito lineas={lineas} editable onCambiar={() => {}} onEliminar={() => {}} />);
    expect(screen.getAllByRole("button", { name: /Eliminar/ }).length).toBe(2);
  });

  it("<TablaCarrito /> emite onCambiar con la nueva cantidad al presionar +", () => {
    Carrito.agregar("PI001", 2);
    const { lineas } = Carrito.resumen();
    const onCambiar = jasmine.createSpy("onCambiar");
    renderizar(<TablaCarrito lineas={lineas} editable onCambiar={onCambiar} onEliminar={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Agregar una unidad de Mousse de Chocolate" }));
    expect(onCambiar).toHaveBeenCalledWith(lineas[0].clave, 3);
  });

  it("paginar() divide la lista y <Paginacion /> avisa la página elegida", () => {
    const r = paginar([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2, 4);
    expect(r).toEqual({ visibles: [5, 6, 7, 8], total: 3, pagina: 2 });
    const onCambiar = jasmine.createSpy("onCambiar");
    render(<Paginacion total={3} pagina={2} onCambiar={onCambiar} />);
    expect(screen.getByRole("button", { name: "2" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onCambiar).toHaveBeenCalledWith(3);
  });

  it("<Paginacion /> no se muestra si hay una sola página", () => {
    const { container } = render(<Paginacion total={1} pagina={1} onCambiar={() => {}} />);
    expect(container.innerHTML).toBe("");
  });
});
