/* Pruebas de RENDERIZADO CONDICIONAL: componente Campo */
import { render, screen } from "@testing-library/react";
import Campo from "../../components/Campo.jsx";

describe("<Campo /> — renderizado condicional", () => {
  it("asocia la etiqueta con el control (accesibilidad)", () => {
    render(<Campo id="nombre" label="Nombre *"><input id="nombre" /></Campo>);
    expect(screen.getByLabelText(/Nombre/).id).toBe("nombre");
  });

  it("NO muestra mensaje de error cuando no hay error", () => {
    render(<Campo id="nombre" label="Nombre"><input id="nombre" /></Campo>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("muestra el mensaje de error solo cuando existe", () => {
    render(<Campo id="nombre" label="Nombre" error="Debes completar el nombre."><input id="nombre" /></Campo>);
    expect(screen.getByRole("alert").textContent).toBe("Debes completar el nombre.");
  });

  it("muestra la ayuda y el texto opcional", () => {
    render(<Campo id="tel" label="Teléfono" opcional="(opcional)" ayuda="Ej: +56 9 1234 5678"><input id="tel" /></Campo>);
    expect(screen.getByText("(opcional)")).toBeTruthy();
    expect(screen.getByText("Ej: +56 9 1234 5678")).toBeTruthy();
  });

  it("marca el contador como excedido al superar el máximo", () => {
    const { rerender } = render(<Campo id="m" label="Mensaje" max={50} largo={10}><input id="m" /></Campo>);
    const contador = screen.getByTestId("contador-m");
    expect(contador.textContent).toBe("10/50");
    expect(contador.classList.contains("excedido")).toBeFalse();
    rerender(<Campo id="m" label="Mensaje" max={50} largo={55}><input id="m" /></Campo>);
    expect(screen.getByTestId("contador-m").classList.contains("excedido")).toBeTrue();
  });
});
