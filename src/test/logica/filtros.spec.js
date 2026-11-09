/* Pruebas de la función pura de filtros del catálogo */
import { filtrarProductos, normalizar } from "../../lib/filtros.js";

const PRODUCTOS = [
  { codigo: "A", nombre: "Torta de Manjar", descripcion: "Con nueces", categoria: "Tortas Circulares", precio: 42000 },
  { codigo: "B", nombre: "Brownie", descripcion: "Chocolate", categoria: "Productos Sin Gluten", precio: 4000, precioOferta: 3000 },
  { codigo: "C", nombre: "Ánfora dulce", descripcion: "", categoria: "Tortas Cuadradas", precio: 50000 }
];

describe("Filtros del catálogo (lib/filtros.js)", () => {
  it("sin filtros devuelve todos los productos", () => {
    expect(filtrarProductos(PRODUCTOS, {}).length).toBe(3);
  });

  it("busca sin importar mayúsculas ni tildes", () => {
    expect(normalizar("Ánfora")).toBe("anfora");
    expect(filtrarProductos(PRODUCTOS, { buscar: "ANFORA" }).map(p => p.codigo)).toEqual(["C"]);
    expect(filtrarProductos(PRODUCTOS, { buscar: "nueces" }).map(p => p.codigo)).toEqual(["A"]);
  });

  it("filtra por categoría, precio máximo y solo ofertas", () => {
    expect(filtrarProductos(PRODUCTOS, { categoria: "Tortas Cuadradas" }).length).toBe(1);
    expect(filtrarProductos(PRODUCTOS, { precio: 45000 }).length).toBe(2);
    expect(filtrarProductos(PRODUCTOS, { soloOfertas: true }).map(p => p.codigo)).toEqual(["B"]);
  });

  it("ordena por precio (usando el precio de oferta) y por nombre", () => {
    expect(filtrarProductos(PRODUCTOS, { orden: "precio-asc" }).map(p => p.codigo)).toEqual(["B", "A", "C"]);
    expect(filtrarProductos(PRODUCTOS, { orden: "precio-desc" })[0].codigo).toBe("C");
    expect(filtrarProductos(PRODUCTOS, { orden: "nombre" }).map(p => p.codigo)).toEqual(["C", "B", "A"]);
  });
});
