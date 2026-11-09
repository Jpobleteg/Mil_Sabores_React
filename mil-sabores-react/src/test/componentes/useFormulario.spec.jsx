/* Pruebas de ESTADO de formularios: hook useFormulario + página Login */
import { fireEvent, render, screen } from "@testing-library/react";
import { useFormulario } from "../../hooks/useFormulario.js";
import { Validar } from "../../lib/validaciones.js";
import { Sesion } from "../../lib/store.js";
import Login from "../../pages/Login.jsx";
import { datosLimpios, esperar, renderizar, rutaActual } from "../helpers.jsx";

/* Componente mínimo para probar el hook */
function FormPrueba({ onEnviar }) {
  const { valores, errores, campo, enviar } = useFormulario(
    { nombre: "" },
    { nombre: v => Validar.requerido(v, "El nombre") || Validar.maxLargo(v, 5, "El nombre") }
  );
  return (
    <form onSubmit={enviar(onEnviar)} noValidate>
      <input aria-label="nombre" {...campo("nombre")} />
      <span data-testid="valor">{valores.nombre}</span>
      {errores.nombre && <p role="alert">{errores.nombre}</p>}
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("useFormulario — gestión del estado del formulario", () => {
  it("el estado cambia cuando el usuario escribe", () => {
    render(<FormPrueba onEnviar={() => {}} />);
    fireEvent.change(screen.getByLabelText("nombre"), { target: { value: "Ana" } });
    expect(screen.getByTestId("valor").textContent).toBe("Ana");
    expect(screen.getByLabelText("nombre").className).toContain("is-valid");
  });

  it("valida al escribir y muestra el error solo si el valor es inválido", () => {
    render(<FormPrueba onEnviar={() => {}} />);
    const input = screen.getByLabelText("nombre");
    fireEvent.change(input, { target: { value: "Demasiado largo" } });
    expect(screen.getByRole("alert").textContent).toContain("no puede superar los 5");
    expect(input.className).toContain("is-invalid");
    fireEvent.change(input, { target: { value: "Ana" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("no envía si hay errores y sí envía con datos válidos", () => {
    const onEnviar = jasmine.createSpy("onEnviar");
    render(<FormPrueba onEnviar={onEnviar} />);
    fireEvent.click(screen.getByText("Enviar"));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Debes completar el nombre.");
    fireEvent.change(screen.getByLabelText("nombre"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByText("Enviar"));
    expect(onEnviar.calls.mostRecent().args[0]).toEqual({ nombre: "Ana" });
  });
});

describe("<Login />", () => {
  beforeEach(datosLimpios);

  it("muestra errores de validación al enviar vacío", () => {
    renderizar(<Login />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByText("Debes completar el correo.")).toBeTruthy();
    expect(screen.getByText("Debes completar la contraseña.")).toBeTruthy();
  });

  it("rechaza credenciales incorrectas y limpia la contraseña", () => {
    renderizar(<Login />);
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "rosa@gmail.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "mala1" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByText(/Correo o contraseña incorrectos/)).toBeTruthy();
    expect(screen.getByLabelText("Contraseña").value).toBe("");
    expect(Sesion.actual()).toBeNull();
  });

  it("inicia sesión y redirige al panel si es administrador", async () => {
    renderizar(<Login />, { ruta: "/login" });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@duoc.cl" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(Sesion.actual().tipo).toBe("Administrador");
    expect(await esperar(() => rutaActual() === "/admin")).toBeTrue();
  });
});
