/* Pruebas de ESTADO y EVENTOS: Header (menú, categorías, buscador, sesión) */
import { act, fireEvent, screen } from "@testing-library/react";
import Header from "../../components/Header.jsx";
import { Carrito } from "../../lib/store.js";
import { datosLimpios, esperar, iniciarSesionComo, renderizar, rutaActual } from "../helpers.jsx";

describe("<Header />", () => {
  beforeEach(datosLimpios);

  it("muestra la cantidad del carrito y se actualiza en tiempo real", () => {
    renderizar(<Header />);
    const boton = () => screen.getByRole("link", { name: /Ver carrito/ });
    expect(boton().getAttribute("aria-label")).toBe("Ver carrito: 0 productos");
    act(() => { Carrito.agregar("PI001", 2); });
    expect(boton().getAttribute("aria-label")).toBe("Ver carrito: 2 productos");
  });

  it("el botón ☰ abre y cierra el menú (estado 'abierto')", () => {
    const { container } = renderizar(<Header />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    const menu = container.querySelector("#menu-principal");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("show")).toBeFalse();
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(menu.classList.contains("show")).toBeTrue();
    fireEvent.click(toggle);
    expect(menu.classList.contains("show")).toBeFalse();
  });

  it("el desplegable de Categorías lista todas las categorías", () => {
    renderizar(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Categorías" }));
    expect(screen.getByRole("link", { name: "Productos Vegana" }).getAttribute("href")).toBe("/categorias/veganos");
  });

  it("el buscador navega al catálogo con el texto en la URL", async () => {
    renderizar(<Header />);
    const input = screen.getAllByPlaceholderText("Buscar…")[0];
    fireEvent.change(input, { target: { value: "manjar" } });
    expect(input.value).toBe("manjar");
    fireEvent.submit(input.closest("form"));
    expect(await esperar(() => rutaActual() === "/productos?q=manjar")).toBeTrue();
  });

  it("muestra Iniciar sesión sin usuario y el nombre con sesión iniciada", () => {
    const { unmount } = renderizar(<Header />);
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeTruthy();
    unmount();
    iniciarSesionComo("admin@duoc.cl");
    renderizar(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /Ana/ }));
    expect(screen.getByRole("link", { name: "Panel administrador" })).toBeTruthy();
  });
});
