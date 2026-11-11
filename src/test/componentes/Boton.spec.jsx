import { fireEvent, render, screen } from "@testing-library/react";
import Boton from "../../components/Boton.jsx";

describe("<Boton /> — propiedades y eventos", () => {
  it("Muestra la etiqueta recibida por props", () => {
    render(<Boton etiqueta="Comprar ahora" />);
    expect(screen.getByRole("button").textContent).toBe("Comprar ahora");
  });

  it("Ejecuta la función onClick al hacer clic (mock con jasmine.createSpy)", () => {
    const alHacerClic = jasmine.createSpy("onClick");
    render(<Boton etiqueta="Pagar" onClick={alHacerClic} />);
    fireEvent.click(screen.getByText("Pagar"));
    expect(alHacerClic).toHaveBeenCalledTimes(1);
  });

  it("No ejecuta onClick cuando está deshabilitado", () => {
    const alHacerClic = jasmine.createSpy("onClick");
    render(<Boton etiqueta="Pagar" onClick={alHacerClic} deshabilitado />);
    const boton = screen.getByRole("button");
    expect(boton.disabled).toBeTrue();
    fireEvent.click(boton);
    expect(alHacerClic).not.toHaveBeenCalled();
  });

  it("Arma las clases de Bootstrap según variante y tamaño", () => {
    render(<Boton etiqueta="Eliminar" variante="outline-danger" tamano="sm" tipo="submit" />);
    const boton = screen.getByRole("button");
    expect(boton.className).toBe("btn btn-outline-danger btn-sm");
    expect(boton.getAttribute("type")).toBe("submit");
  });
});
