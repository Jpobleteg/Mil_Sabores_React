/* Pruebas de lógica: reglas de validación (sin componentes) */
import { Validar, calcularDV, calcularEdad, luhn } from "../../lib/validaciones.js";

describe("Validaciones (lib/validaciones.js)", () => {
  describe("RUN chileno", () => {
    it("acepta un RUN válido sin puntos ni guion", () => {
      expect(Validar.run("190110222")).toBe("");
      expect(Validar.run("76543216")).toBe("");
    });

    it("calcula el dígito verificador con módulo 11 (incluida la K)", () => {
      expect(calcularDV("19011022")).toBe("2");
      expect(calcularDV("10000013")).toBe("K");
    });

    it("rechaza RUN con puntos o guion", () => {
      expect(Validar.run("19.011.022-2")).toContain("sin puntos ni guion");
    });

    it("rechaza un dígito verificador incorrecto", () => {
      expect(Validar.run("190110223")).toContain("dígito verificador");
    });
  });

  describe("Correo", () => {
    it("acepta solo los dominios permitidos", () => {
      expect(Validar.correo("ana@duoc.cl")).toBe("");
      expect(Validar.correo("profe@profesor.duoc.cl")).toBe("");
      expect(Validar.correo("rosa@gmail.com")).toBe("");
      expect(Validar.correo("rosa@hotmail.com")).toContain("Solo se aceptan");
    });

    it("rechaza formatos inválidos", () => {
      expect(Validar.correo("sin-arroba.cl")).toContain("formato válido");
    });
  });

  describe("Contraseña, largo y números", () => {
    it("exige entre 4 y 10 caracteres", () => {
      expect(Validar.password("abc")).not.toBe("");
      expect(Validar.password("abcd")).toBe("");
      expect(Validar.password("12345678901")).not.toBe("");
    });

    it("requerido devuelve mensaje solo si el valor está vacío", () => {
      expect(Validar.requerido("   ", "El nombre")).toBe("Debes completar el nombre.");
      expect(Validar.requerido("Ana", "El nombre")).toBe("");
    });

    it("número: valida enteros y mínimos", () => {
      expect(Validar.numero("2.5", { entero: true, campo: "El stock" })).toContain("entero");
      expect(Validar.numero("-1", { min: 0, campo: "El precio" })).toContain("menor que 0");
      expect(Validar.numero("10", { min: 0 })).toBe("");
    });
  });

  describe("Pago", () => {
    it("valida tarjetas con el algoritmo de Luhn", () => {
      expect(luhn("4111111111111111")).toBeTrue();
      expect(luhn("4111111111111112")).toBeFalse();
      expect(Validar.tarjeta("4111 1111 1111 1111")).toBe("");
      expect(Validar.tarjeta("1234")).toContain("entre 13 y 19");
    });

    it("rechaza tarjetas vencidas o con formato incorrecto", () => {
      const hoy = new Date(2026, 10, 9);
      expect(Validar.vencimiento("10/26", hoy)).toBe("La tarjeta está vencida.");
      expect(Validar.vencimiento("11/26", hoy)).toBe("");
      expect(Validar.vencimiento("13/30", hoy)).toContain("MM/AA");
    });

    it("CVV de 3 o 4 dígitos", () => {
      expect(Validar.cvv("123")).toBe("");
      expect(Validar.cvv("12a")).not.toBe("");
    });
  });

  it("calcula la edad a partir de la fecha de nacimiento", () => {
    const anio = new Date().getFullYear();
    expect(calcularEdad(`${anio - 30}-01-01`)).toBe(30);
    expect(calcularEdad("")).toBeNull();
  });
});
