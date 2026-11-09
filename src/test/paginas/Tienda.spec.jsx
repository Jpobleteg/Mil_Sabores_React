/* Pruebas de páginas de la tienda: Productos, Categorías, Ofertas, Detalle y Carrito */
import { fireEvent, screen, within } from "@testing-library/react";
import Productos from "../../pages/Productos.jsx";
import Categorias from "../../pages/Categorias.jsx";
import Ofertas from "../../pages/Ofertas.jsx";
import Detalle from "../../pages/Detalle.jsx";
import Carrito from "../../pages/Carrito.jsx";
import { Carrito as CarritoStore, Productos as ProductosStore } from "../../lib/store.js";
import { datosLimpios, esperar, renderizar, rutaActual } from "../helpers.jsx";

const tarjetas = () => screen.queryAllByTestId("tarjeta-producto");

describe("Páginas de la tienda", () => {
  beforeEach(datosLimpios);

  describe("<Productos /> — filtros", () => {
    it("muestra todos los productos del catálogo", () => {
      renderizar(<Productos />);
      expect(tarjetas().length).toBe(16);
      expect(screen.getByTestId("resultado").textContent).toBe("16 productos encontrados");
    });

    it("filtra al escribir en el buscador y al elegir categoría", () => {
      renderizar(<Productos />);
      fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "avena" } });
      expect(tarjetas().length).toBe(1);
      fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "" } });
      fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "Postres Individuales" } });
      expect(tarjetas().length).toBe(2);
    });

    it("lee la búsqueda desde la URL y 'Limpiar filtros' restablece todo", () => {
      renderizar(<Productos />, { ruta: "/productos?q=chocolate" });
      expect(screen.getByLabelText("Buscar").value).toBe("chocolate");
      expect(tarjetas().length).toBeLessThan(16);
      fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
      expect(tarjetas().length).toBe(16);
    });

    it("el interruptor 'Solo ofertas' deja solo productos en oferta", () => {
      renderizar(<Productos />);
      fireEvent.click(screen.getByLabelText("Solo ofertas"));
      expect(tarjetas().length).toBe(ProductosStore.ofertas().length);
    });

    it("muestra un mensaje cuando no hay resultados", () => {
      renderizar(<Productos />);
      fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "pizza" } });
      expect(screen.getByText(/No encontramos productos/)).toBeTruthy();
    });
  });

  describe("<Categorias /> y <Ofertas />", () => {
    it("separa los productos por categoría", () => {
      renderizar(<Categorias />, { ruta: "/categorias", path: "/categorias" });
      expect(screen.getAllByRole("heading", { level: 2 }).length).toBe(8);
      expect(tarjetas().length).toBe(16);
    });

    it("con /categorias/:id muestra solo esa categoría", () => {
      renderizar(<Categorias />, { ruta: "/categorias/veganos", path: "/categorias/:id" });
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Productos Vegana");
      expect(tarjetas().length).toBe(2);
    });

    it("Ofertas lista solo productos con precio de oferta", () => {
      renderizar(<Ofertas />);
      expect(screen.getByTestId("cantidad-ofertas").textContent).toBe("6 productos en oferta");
      expect(tarjetas().length).toBe(6);
    });
  });

  describe("<Detalle />", () => {
    it("muestra el producto de la URL y valida el mensaje (máx. 50)", () => {
      renderizar(<Detalle />, { ruta: "/productos/TT002", path: "/productos/:codigo" });
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Torta Circular de Manjar");
      fireEvent.change(screen.getByLabelText(/Mensaje especial/), { target: { value: "x".repeat(51) } });
      expect(screen.getByText("El mensaje no puede superar los 50 caracteres.")).toBeTruthy();
    });

    it("cambiar el tamaño actualiza el precio y añade al carrito", () => {
      renderizar(<Detalle />, { ruta: "/productos/TT002", path: "/productos/:codigo" });
      fireEvent.change(screen.getByLabelText("Tamaño"), { target: { value: "M" } });
      expect(screen.getByText("$63.000 CLP")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));
      expect(CarritoStore.items()[0]).toEqual(jasmine.objectContaining({ codigo: "TT002", tamano: "M", cantidad: 1 }));
    });

    it("muestra 'Producto no encontrado' con un código inexistente", () => {
      renderizar(<Detalle />, { ruta: "/productos/XX", path: "/productos/:codigo" });
      expect(screen.getByText("Producto no encontrado")).toBeTruthy();
    });
  });

  describe("<Carrito />", () => {
    it("muestra el mensaje de carrito vacío", () => {
      renderizar(<Carrito />);
      expect(screen.getByTestId("carrito-vacio")).toBeTruthy();
    });

    it("suma unidades con + y actualiza el total", () => {
      CarritoStore.agregar("PI001", 1);
      renderizar(<Carrito />);
      fireEvent.click(screen.getByRole("button", { name: "Agregar una unidad de Mousse de Chocolate" }));
      expect(CarritoStore.cantidadTotal()).toBe(2);
      expect(within(screen.getByTestId("resumen-compra")).getByTestId("total").textContent).toBe("$10.000 CLP");
    });

    it("Limpiar pide confirmación (mock de window.confirm)", () => {
      CarritoStore.agregar("PI001", 1);
      const confirmar = spyOn(window, "confirm").and.returnValue(false);
      renderizar(<Carrito />);
      fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
      expect(confirmar).toHaveBeenCalled();
      expect(CarritoStore.items().length).toBe(1);
      confirmar.and.returnValue(true);
      fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
      expect(CarritoStore.items().length).toBe(0);
    });

    it("aplica el cupón válido y muestra error con uno inválido", () => {
      CarritoStore.agregar("TC001", 1);
      renderizar(<Carrito />);
      const cupon = screen.getByLabelText("Cupón de descuento");
      fireEvent.change(cupon, { target: { value: "NOVALE" } });
      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
      expect(screen.getByRole("alert").textContent).toContain("Cupón no válido");
      fireEvent.change(cupon, { target: { value: "FELICES50" } });
      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
      expect(screen.getByTestId("total").textContent).toBe("$40.500 CLP");
    });

    it("Comprar ahora lleva al checkout", async () => {
      CarritoStore.agregar("PI001", 1);
      renderizar(<Carrito />, { ruta: "/carrito" });
      fireEvent.click(screen.getByRole("button", { name: "Comprar ahora" }));
      expect(await esperar(() => rutaActual() === "/checkout")).toBeTrue();
    });
  });
});
