/* Pruebas de reglas de negocio: carrito, descuentos, ofertas, categorías, pago y órdenes */
import {
  Carrito, Categorias, Ordenes, Pasarela, Productos, Reportes, Usuarios,
  beneficiosUsuario, enOferta, precioFinal, porcentajeOferta, slug
} from "../../lib/store.js";
import { datosLimpios, iniciarSesionComo } from "../helpers.jsx";

describe("Reglas de negocio (lib/store.js)", () => {
  beforeEach(datosLimpios);

  describe("Carrito", () => {
    it("agrega productos y suma la cantidad total", () => {
      expect(Carrito.agregar("PI001", 2).ok).toBeTrue();
      expect(Carrito.agregar("PI001", 1).ok).toBeTrue();
      expect(Carrito.cantidadTotal()).toBe(3);
      expect(Carrito.items().length).toBe(1);
    });

    it("no permite superar el stock disponible", () => {
      const r = Carrito.agregar("TE002", 4); // stock 3
      expect(r.ok).toBeFalse();
      expect(r.msg).toContain("Solo quedan 3");
    });

    it("no permite más de 10 unidades por línea", () => {
      Carrito.agregar("PT001", 10);
      expect(Carrito.agregar("PT001", 1).msg).toContain("Máximo 10");
    });

    it("rechaza productos agotados o inexistentes", () => {
      Productos.actualizar("PI001", { stock: 0 });
      expect(Carrito.agregar("PI001").msg).toContain("agotado");
      expect(Carrito.agregar("NOEXISTE").ok).toBeFalse();
    });

    it("cambiar la cantidad a 0 quita la línea", () => {
      Carrito.agregar("PI001", 1);
      const clave = Carrito.items()[0].clave;
      Carrito.cambiarCantidad(clave, 0);
      expect(Carrito.items().length).toBe(0);
    });

    it("usa el precio de oferta y el factor de tamaño", () => {
      Carrito.agregar("TC002", 1, "M"); // oferta 42000 × 1.5
      expect(Carrito.resumen().subtotal).toBe(63000);
    });
  });

  describe("Descuentos", () => {
    it("50% para usuarios de 50 años o más", () => {
      iniciarSesionComo("rosa@gmail.com");
      Carrito.agregar("TC001", 1);
      const r = Carrito.resumen();
      expect(r.porcentaje).toBe(50);
      expect(r.total).toBe(22500);
    });

    it("cupón FELICES50 da 10% si no hay un descuento mayor", () => {
      Carrito.agregar("TC001", 1);
      expect(Carrito.aplicarCupon("felices50").ok).toBeTrue();
      expect(Carrito.resumen().total).toBe(40500);
      expect(Carrito.aplicarCupon("OTRO").ok).toBeFalse();
    });

    it("torta gratis para estudiantes Duoc en su cumpleaños", () => {
      const hoy = new Date();
      const fecha = `2000-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
      const b = beneficiosUsuario({ correo: "estudiante@duoc.cl", fechaNacimiento: fecha });
      expect(b.tortaGratis).toBeTrue();
      expect(beneficiosUsuario({ correo: "x@gmail.com", fechaNacimiento: fecha }).tortaGratis).toBeFalse();
    });
  });

  describe("Ofertas", () => {
    it("detecta productos en oferta y calcula el porcentaje", () => {
      const p = Productos.buscar("TC002");
      expect(enOferta(p)).toBeTrue();
      expect(precioFinal(p)).toBe(42000);
      expect(porcentajeOferta(p)).toBe(16);
      expect(enOferta(Productos.buscar("TC001"))).toBeFalse();
      expect(Productos.ofertas().length).toBe(6);
    });
  });

  describe("Categorías (CRUD con reglas)", () => {
    it("crea categorías con id a partir del nombre", () => {
      const c = Categorias.crear({ nombre: "Kuchen Sureños", descripcion: "" });
      expect(c.id).toBe("kuchen-surenos");
      expect(slug("Tortas Cuadradas")).toBe("tortas-cuadradas");
      expect(() => Categorias.crear({ nombre: "Kuchen Sureños" })).toThrowError(/Ya existe/);
    });

    it("al renombrar actualiza la categoría de sus productos", () => {
      Categorias.actualizar("veganos", { nombre: "Veganos 100%" });
      expect(Productos.buscar("PV001").categoria).toBe("Veganos 100%");
    });

    it("no elimina categorías que tienen productos", () => {
      expect(Categorias.eliminar("veganos").ok).toBeFalse();
      Categorias.crear({ nombre: "Vacía" });
      expect(Categorias.eliminar("vacia").ok).toBeTrue();
    });
  });

  describe("Pasarela de pago simulada y órdenes", () => {
    it("aprueba tarjetas válidas y rechaza las que empiezan con 4000", () => {
      expect(Pasarela.procesar({ tarjeta: "4111 1111 1111 1111", total: 1000 }).aprobado).toBeTrue();
      const r = Pasarela.procesar({ tarjeta: "4000 0000 0000 0002", total: 1000 });
      expect(r.aprobado).toBeFalse();
      expect(r.motivo).toContain("rechazó");
    });

    it("rechaza el pago si ya no hay stock suficiente", () => {
      Carrito.agregar("TE002", 2);
      const { lineas } = Carrito.resumen();
      Productos.actualizar("TE002", { stock: 1 });
      expect(Pasarela.procesar({ tarjeta: "4111111111111111", total: 1 }, lineas).aprobado).toBeFalse();
    });

    it("crear una orden descuenta stock, vacía el carrito y numera la boleta", () => {
      Carrito.agregar("PI001", 3);
      const orden = Ordenes.crear(Carrito.resumen(), { fecha: "2026-12-01", calle: "Calle 1", comuna: "Santiago" },
        { nombre: "Ana", apellidos: "Soto", correo: "ana@gmail.com" });
      expect(orden.numero).toBe("B00001");
      expect(Productos.buscar("PI001").stock).toBe(27);
      expect(Carrito.items().length).toBe(0);
      expect(Ordenes.delCliente("ana@gmail.com").length).toBe(1);
      expect(Reportes.masVendidos()[0]).toEqual({ codigo: "PI001", nombre: "Mousse de Chocolate", unidades: 3 });
    });

    it("solo acepta estados válidos al cambiar el estado", () => {
      Carrito.agregar("PI001", 1);
      Ordenes.crear(Carrito.resumen(), { fecha: "2026-12-01", calle: "x", comuna: "y" });
      expect(Ordenes.cambiarEstado("B00001", "Entregado").estado).toBe("Entregado");
      expect(Ordenes.cambiarEstado("B00001", "Perdido")).toBeNull();
    });
  });

  it("Usuarios.guardar actualiza sin perder los demás campos", () => {
    Usuarios.guardar({ run: "76543216", telefono: "+56911112222" });
    const u = Usuarios.buscarPorRun("76543216");
    expect(u.telefono).toBe("+56911112222");
    expect(u.correo).toBe("rosa@gmail.com");
  });
});
