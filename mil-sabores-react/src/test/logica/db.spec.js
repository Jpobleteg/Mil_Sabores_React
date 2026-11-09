/* Pruebas de la fuente de datos simulada: operaciones CRUD */
import { crearColeccion, db } from "../../lib/db.js";
import { datosLimpios } from "../helpers.jsx";

describe("Fuente de datos (lib/db.js) — CRUD", () => {
  let col;

  beforeEach(() => {
    localStorage.removeItem("ms_prueba");
    col = crearColeccion("ms_prueba", "id", [{ id: "A", nombre: "Uno" }]);
  });

  afterAll(() => localStorage.removeItem("ms_prueba"));

  it("Read: carga la semilla y permite listar y obtener", () => {
    expect(col.listar().length).toBe(1);
    expect(col.obtener("a").nombre).toBe("Uno"); // no distingue mayúsculas
    expect(col.obtener("Z")).toBeNull();
  });

  it("Create: agrega registros y rechaza ids duplicados", () => {
    col.crear({ id: "B", nombre: "Dos" });
    expect(col.listar().length).toBe(2);
    expect(() => col.crear({ id: "B", nombre: "Otro" })).toThrowError(/Ya existe/);
    expect(() => col.crear({ nombre: "Sin id" })).toThrowError(/debe tener id/);
  });

  it("Update: modifica solo los campos indicados", () => {
    const r = col.actualizar("A", { nombre: "Uno editado" });
    expect(r).toEqual({ id: "A", nombre: "Uno editado" });
    expect(() => col.actualizar("NO", { nombre: "x" })).toThrowError(/No existe/);
  });

  it("Delete: elimina y devuelve false si no existe", () => {
    expect(col.eliminar("A")).toBeTrue();
    expect(col.eliminar("A")).toBeFalse();
    expect(col.listar().length).toBe(0);
  });

  it("las colecciones del sistema parten con los datos de ejemplo", () => {
    datosLimpios();
    expect(db.productos.listar().length).toBe(16);
    expect(db.categorias.listar().length).toBe(8);
    expect(db.usuarios.obtener("190110222").correo).toBe("admin@duoc.cl");
    expect(db.ordenes.listar()).toEqual([]);
  });
});
