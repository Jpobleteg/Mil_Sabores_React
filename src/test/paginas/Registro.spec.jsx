/* Pruebas del formulario de registro (FormularioUsuario modo "registro") */
import { fireEvent, screen } from "@testing-library/react";
import Registro from "../../pages/Registro.jsx";
import { Sesion, Usuarios } from "../../lib/store.js";
import { datosLimpios, renderizar } from "../helpers.jsx";

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

describe("<Registro />", () => {
  beforeEach(datosLimpios);

  it("valida el RUN mientras se escribe", () => {
    renderizar(<Registro />);
    escribir(/^RUN/, "190110223");
    expect(screen.getByText(/dígito verificador no coincide/)).toBeTruthy();
    escribir(/^RUN/, "190110222");
    expect(screen.getByText("Ya existe un usuario con este RUN.")).toBeTruthy();
  });

  it("la comuna se habilita al elegir región y se reinicia al cambiarla", () => {
    renderizar(<Registro />);
    const comuna = screen.getByLabelText(/^Comuna/);
    expect(comuna.disabled).toBeTrue();
    fireEvent.change(screen.getByLabelText(/^Región/), { target: { value: "Región de Valparaíso" } });
    expect(comuna.disabled).toBeFalse();
    fireEvent.change(comuna, { target: { value: "Viña del Mar" } });
    fireEvent.change(screen.getByLabelText(/^Región/), { target: { value: "Región del Biobío" } });
    expect(screen.getByLabelText(/^Comuna/).value).toBe("");
  });

  it("muestra los beneficios según los datos ingresados", () => {
    renderizar(<Registro />);
    expect(screen.queryByTestId("beneficios")).toBeNull();
    escribir(/^Código promocional/, "FELICES50");
    expect(screen.getByTestId("beneficios").textContent).toContain("10% de descuento de por vida");
  });

  it("exige aceptar los términos y que los correos coincidan", () => {
    renderizar(<Registro />);
    escribir(/^Correo \*/, "nuevo@gmail.com");
    escribir(/^Confirmar correo/, "otro@gmail.com");
    expect(screen.getByText("Los correos no coinciden.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText("Debes aceptar los términos y condiciones.")).toBeTruthy();
  });

  it("registra un usuario válido e inicia sesión", () => {
    renderizar(<Registro />);
    escribir(/^RUN/, "123456785");
    escribir(/^Nombre/, "Juan");
    escribir(/^Apellidos/, "Pérez");
    escribir(/^Correo \*/, "juan@duoc.cl");
    escribir(/^Confirmar correo/, "juan@duoc.cl");
    escribir(/^Contraseña/, "abcd1");
    escribir(/^Confirmar contraseña/, "abcd1");
    fireEvent.change(screen.getByLabelText(/^Región/), { target: { value: "Región de Valparaíso" } });
    escribir(/^Comuna/, "Viña del Mar");
    escribir(/^Dirección/, "Calle 1");
    fireEvent.click(screen.getByLabelText(/Acepto los términos/));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(Usuarios.buscarPorRun("123456785").tipo).toBe("Cliente");
    expect(Sesion.actual().correo).toBe("juan@duoc.cl");
  });
});
