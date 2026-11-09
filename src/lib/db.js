/* =========================================================
   db.js — Fuente de datos simulada (como una base de datos).

   Cada "colección" vive en localStorage y expone operaciones CRUD:
     crear(obj)            → Create
     listar() / obtener(id) → Read
     actualizar(id, datos) → Update
     eliminar(id)          → Delete

   Los componentes React no leen localStorage directamente: usan
   estas funciones (o las de store.js, que agregan reglas de negocio).
   Cada escritura avisa a los suscriptores para que la interfaz se
   actualice en tiempo real (ver hooks/useStore.js).
   ========================================================= */
import { PRODUCTOS_BASE, USUARIOS_BASE, CATEGORIAS_BASE } from "./data.js";

/* Versión de los datos base: si cambia, se vuelven a cargar productos y categorías */
export const VERSION_DATOS = "2";

/* ---------------- Suscripción (tiempo real) ---------------- */
let version = 0;
const oyentes = new Set();
export const suscribir = fn => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};
export const obtenerVersion = () => version;
export const notificar = () => {
  version++;
  oyentes.forEach(fn => fn());
};
if (typeof window !== "undefined") {
  window.addEventListener("storage", e => { if (e.key && e.key.startsWith("ms_")) notificar(); });
}

/* ---------------- Lectura / escritura ---------------- */
export const leer = (clave, porDefecto) => {
  try {
    const v = localStorage.getItem(clave);
    return v ? JSON.parse(v) : porDefecto;
  } catch {
    return porDefecto;
  }
};
export const guardar = (clave, valor) => {
  localStorage.setItem(clave, JSON.stringify(valor));
  notificar();
};

/* ---------------- Fábrica de colecciones CRUD ----------------
   clave: nombre en localStorage · campoId: propiedad que identifica cada registro
   semilla: datos iniciales · normalizarId: compara ids sin importar mayúsculas */
export function crearColeccion(clave, campoId, semilla = [], normalizarId = v => String(v).toUpperCase()) {
  const igual = (a, b) => normalizarId(a) === normalizarId(b);

  const col = {
    clave,
    listar: () => leer(clave, []),
    obtener: id => col.listar().find(r => igual(r[campoId], id)) || null,
    existe: id => Boolean(col.obtener(id)),

    crear(registro) {
      if (!registro || registro[campoId] === undefined || registro[campoId] === "") {
        throw new Error(`El registro debe tener ${campoId}.`);
      }
      if (col.existe(registro[campoId])) throw new Error(`Ya existe un registro con ${campoId} ${registro[campoId]}.`);
      guardar(clave, [...col.listar(), registro]);
      return registro;
    },

    /* Actualiza los campos indicados; si cambia el id, revisa que no se repita */
    actualizar(id, cambios) {
      const lista = col.listar();
      const i = lista.findIndex(r => igual(r[campoId], id));
      if (i < 0) throw new Error(`No existe el registro ${id}.`);
      const nuevoId = cambios[campoId];
      if (nuevoId !== undefined && !igual(nuevoId, id) && col.existe(nuevoId)) {
        throw new Error(`Ya existe un registro con ${campoId} ${nuevoId}.`);
      }
      lista[i] = { ...lista[i], ...cambios };
      guardar(clave, lista);
      return lista[i];
    },

    eliminar(id) {
      const lista = col.listar();
      const nueva = lista.filter(r => !igual(r[campoId], id));
      if (nueva.length === lista.length) return false;
      guardar(clave, nueva);
      return true;
    },

    reemplazar: lista => guardar(clave, lista),
    reiniciar: () => guardar(clave, semilla)
  };

  if (typeof localStorage !== "undefined" && !localStorage.getItem(clave)) {
    localStorage.setItem(clave, JSON.stringify(semilla));
  }
  return col;
}

/* ---------------- Colecciones del sistema ---------------- */
export const LS = {
  PRODUCTOS: "ms_productos",
  CATEGORIAS: "ms_categorias",
  USUARIOS: "ms_usuarios",
  SESION: "ms_sesion",
  CARRITO: "ms_carrito",
  CUPON: "ms_cupon",
  ORDENES: "ms_ordenes",
  MENSAJES: "ms_mensajes",
  VERSION: "ms_version"
};

/* Si los datos guardados son de una versión anterior, recarga catálogo y categorías */
if (typeof localStorage !== "undefined" && localStorage.getItem(LS.VERSION) !== VERSION_DATOS) {
  localStorage.setItem(LS.PRODUCTOS, JSON.stringify(PRODUCTOS_BASE));
  localStorage.setItem(LS.CATEGORIAS, JSON.stringify(CATEGORIAS_BASE));
  localStorage.setItem(LS.VERSION, VERSION_DATOS);
}

export const db = {
  productos: crearColeccion(LS.PRODUCTOS, "codigo", PRODUCTOS_BASE),
  categorias: crearColeccion(LS.CATEGORIAS, "id", CATEGORIAS_BASE, v => String(v).toLowerCase()),
  usuarios: crearColeccion(LS.USUARIOS, "run", USUARIOS_BASE),
  ordenes: crearColeccion(LS.ORDENES, "numero", []),
  mensajes: crearColeccion(LS.MENSAJES, "id", [], v => String(v))
};

/* Restablece todos los datos de ejemplo (útil para pruebas y demostraciones) */
export function reiniciarDatos() {
  db.productos.reiniciar();
  db.categorias.reiniciar();
  db.usuarios.reiniciar();
  db.ordenes.reiniciar();
  db.mensajes.reiniciar();
  localStorage.removeItem(LS.SESION);
  localStorage.removeItem(LS.CARRITO);
  localStorage.removeItem(LS.CUPON);
  notificar();
}
