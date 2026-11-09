/* Pruebas de RENDERIZADO, PROPS, EVENTOS y MOCKS: TarjetaProducto y Precio */
import { fireEvent, screen } from "@testing-library/react";
import TarjetaProducto from "../../components/TarjetaProducto.jsx";
import Precio from "../../components/Precio.jsx";
import { Carrito, Productos } from "../../lib/store.js";
import { datosLimpios, renderizar } from "../helpers.jsx";

describe("<TarjetaProducto />", () => {
  beforeEach(datosLimpios);

  it("renderiza nombre, categoría, imagen y precio del producto recibido", () => {
    renderizar(<TarjetaProducto producto={Productos.buscar("TC001")} />);
    expect(screen.getByText("Torta Cuadrada de Chocolate")).toBeTruthy();
    expect(screen.getByText("Tortas Cuadradas")).toBeTruthy();
    expect(screen.getByAltText("Torta Cuadrada de Chocolate").getAttribute("src")).toBe("/img/productos/TC001.svg");
    expect(screen.getByText("$45.000 CLP")).toBeTruthy();
  });

  it("muestra la insignia Oferta y el precio anterior tachado solo si está en oferta", () => {
    renderizar(<TarjetaProducto producto={Productos.buscar("TC002")} />);
    expect(screen.getByText("Oferta")).toBeTruthy();
    expect(screen.getByTestId("precio-anterior").textContent).toBe("$50.000 CLP");
  });

  it("deshabilita el botón y muestra Agotado cuando no hay stock", () => {
    renderizar(<TarjetaProducto producto={{ ...Productos.buscar("PI001"), stock: 0 }} />);
    expect(screen.getByText("Agotado")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Añadir/ }).disabled).toBeTrue();
  });

  it("al hacer clic en Añadir llama a Carrito.agregar (espía/mock)", () => {
    const espia = spyOn(Carrito, "agregar").and.returnValue({ ok: true, msg: "Añadido" });
    renderizar(<TarjetaProducto producto={Productos.buscar("TC001")} />);
    fireEvent.click(screen.getByRole("button", { name: "Añadir Torta Cuadrada de Chocolate al carrito" }));
    expect(espia).toHaveBeenCalledOnceWith("TC001", 1, "S", ""); // torta personalizable → tamaño S
    expect(screen.getByText("Añadido")).toBeTruthy(); // aviso visible
  });

  it("si recibe onAgregar por props, usa esa función en vez del carrito", () => {
    const onAgregar = jasmine.createSpy("onAgregar");
    const espia = spyOn(Carrito, "agregar");
    const p = Productos.buscar("PI001");
    renderizar(<TarjetaProducto producto={p} onAgregar={onAgregar} />);
    fireEvent.click(screen.getByRole("button", { name: /Añadir/ }));
    expect(onAgregar).toHaveBeenCalledWith(p);
    expect(espia).not.toHaveBeenCalled();
  });

  it("<Precio /> aplica el factor de tamaño y muestra FREE si cuesta 0", () => {
    const { container, rerender } = renderizar(<Precio producto={{ precio: 40000 }} factor={1.5} />);
    expect(container.querySelector(".precio").textContent).toBe("$60.000 CLP");
    rerender(<Precio producto={{ precio: 0 }} />);
    expect(screen.getByText("FREE")).toBeTruthy();
  });
});
