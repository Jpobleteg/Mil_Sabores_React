/* Pruebas del flujo de compra: Checkout, Compra exitosa y Pago con error.
   La pasarela de pago se reemplaza con un MOCK (spyOn) para controlar el resultado. */
import { fireEvent, screen } from "@testing-library/react";
import Checkout from "../../pages/Checkout.jsx";
import CompraExitosa from "../../pages/CompraExitosa.jsx";
import PagoFallido from "../../pages/PagoFallido.jsx";
import { Carrito, Ordenes, Pasarela } from "../../lib/store.js";
import { IntentoPago, rangoEntrega, validarFechaEntrega } from "../../lib/checkout.js";
import { datosLimpios, esperar, iniciarSesionComo, renderizar, rutaActual } from "../helpers.jsx";

/* Próxima fecha válida (no domingo) para la entrega */
function fechaValida() {
  const d = new Date(rangoEntrega().min + "T00:00:00");
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function completarPago(tarjeta = "4111 1111 1111 1111") {
  const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  escribir(/Fecha de entrega/, fechaValida());
  escribir(/Número de tarjeta/, tarjeta);
  escribir(/Vencimiento/, "12/30");
  escribir(/CVV/, "123");
}

describe("Flujo de compra", () => {
  beforeEach(() => {
    datosLimpios();
    Carrito.agregar("PI001", 2);
  });

  it("valida la fecha de entrega (mínimo 2 días y sin domingos)", () => {
    const hoy = new Date(2026, 10, 9); // lunes
    expect(validarFechaEntrega("2026-11-10", hoy)).toContain("al menos en 2 días");
    expect(validarFechaEntrega("2026-11-15", hoy)).toContain("domingos");
    expect(validarFechaEntrega("2026-11-12", hoy)).toBe("");
  });

  it("si hay sesión, completa automáticamente los datos del cliente", () => {
    iniciarSesionComo("rosa@gmail.com");
    renderizar(<Checkout />);
    expect(screen.getByLabelText(/^Nombre/).value).toBe("Rosa");
    expect(screen.getByLabelText(/^Correo/).value).toBe("rosa@gmail.com");
    expect(screen.getByLabelText(/^Comuna/).value).toBe("Concepción");
    expect(screen.getByTestId("total-a-pagar").textContent).toContain("$5.000 CLP"); // 50% de descuento
  });

  it("muestra errores y no llama a la pasarela si faltan datos", () => {
    const pasarela = spyOn(Pasarela, "procesar");
    renderizar(<Checkout />);
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(screen.getByText("Revisa los campos marcados en rojo antes de continuar.")).toBeTruthy();
    expect(screen.getByText("Debes completar la calle.")).toBeTruthy();
    expect(pasarela).not.toHaveBeenCalled();
  });

  it("pago aprobado: crea la orden y navega a compra exitosa", async () => {
    spyOn(Pasarela, "procesar").and.returnValue({ aprobado: true, autorizacion: "AUT123" });
    iniciarSesionComo("rosa@gmail.com");
    renderizar(<Checkout />, { ruta: "/checkout" });
    completarPago();
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(await esperar(() => rutaActual() === "/compra/exitosa/B00001")).toBeTrue();
    expect(Ordenes.obtener("B00001").autorizacion).toBe("AUT123");
    expect(Carrito.items().length).toBe(0);
  });

  it("pago rechazado: guarda el intento y navega a la página de error", async () => {
    spyOn(Pasarela, "procesar").and.returnValue({ aprobado: false, motivo: "Fondos insuficientes." });
    iniciarSesionComo("rosa@gmail.com");
    renderizar(<Checkout />, { ruta: "/checkout" });
    completarPago("4000 0000 0000 0002");
    fireEvent.click(screen.getByRole("button", { name: /Pagar ahora/ }));
    expect(await esperar(() => rutaActual() === "/compra/error")).toBeTrue();
    const intento = IntentoPago.leer();
    expect(intento.motivo).toBe("Fondos insuficientes.");
    expect(intento.datos.tarjeta).toBeUndefined(); // no guarda datos de la tarjeta
    expect(Carrito.items().length).toBe(1); // el carrito se conserva
  });

  it("<PagoFallido /> muestra el motivo y permite reintentar", () => {
    IntentoPago.guardar({ numero: "I123", motivo: "El banco rechazó la transacción.", datos: { nombre: "Ana", apellidos: "Soto", correo: "a@gmail.com", calle: "X", comuna: "Y" } });
    renderizar(<PagoFallido />);
    expect(screen.getByText(/No se pudo realizar el pago. nro #I123/)).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("El banco rechazó la transacción.");
    expect(screen.getByRole("link", { name: "Volver a realizar el pago" }).getAttribute("href")).toBe("/checkout");
  });

  it("<CompraExitosa /> muestra la orden en solo lectura y el total pagado", () => {
    const orden = Ordenes.crear(Carrito.resumen(), { fecha: "2026-12-01", calle: "Los crisantemos", departamento: "603", region: "RM", comuna: "Cerrillos" },
      { nombre: "Pedro", apellidos: "Soto", correo: "pedro@gmail.com" }, "AUT9");
    renderizar(<CompraExitosa />, { ruta: `/compra/exitosa/${orden.numero}`, path: "/compra/exitosa/:numero" });
    expect(screen.getByText(/Se ha realizado la compra. nro #B00001/)).toBeTruthy();
    expect(screen.getByLabelText("Calle").readOnly).toBeTrue();
    expect(screen.getByTestId("total-pagado").textContent).toBe("$10.000 CLP");
  });
});
