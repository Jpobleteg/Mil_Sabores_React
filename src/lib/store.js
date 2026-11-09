/* =========================================================
   store.js — Persistencia en localStorage, sesión, carrito,
   descuentos y utilidades compartidas por todas las páginas.

   Cada vez que se guarda algo se avisa a los componentes
   suscritos (ver hooks/useStore.js) para que React vuelva a
   dibujar con los datos nuevos.
   ========================================================= */
import { PRODUCTOS_BASE, USUARIOS_BASE, TAMANOS } from "./data.js";
import { calcularEdad } from "./validaciones.js";

export const LS = {
  PRODUCTOS: "ms_productos",
  USUARIOS: "ms_usuarios",
  SESION: "ms_sesion",
  CARRITO: "ms_carrito",
  ORDENES: "ms_ordenes",
  MENSAJES: "ms_mensajes"
};

/* ---------------- Suscripción (para React) ---------------- */
let version = 0;
const oyentes = new Set();
export const suscribir = fn => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};
export const obtenerVersion = () => version;
const notificar = () => {
  version++;
  oyentes.forEach(fn => fn());
};
/* Cambios hechos en otra pestaña del navegador */
if (typeof window !== "undefined") {
  window.addEventListener("storage", e => { if (e.key && e.key.startsWith("ms_")) notificar(); });
}

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

/* Carga inicial: si no hay datos, copia los datos base */
if (!localStorage.getItem(LS.PRODUCTOS)) localStorage.setItem(LS.PRODUCTOS, JSON.stringify(PRODUCTOS_BASE));
if (!localStorage.getItem(LS.USUARIOS)) localStorage.setItem(LS.USUARIOS, JSON.stringify(USUARIOS_BASE));

/* ---------------- Formato ---------------- */
export const formatoCLP = n =>
  "$" + Math.round(Number(n) || 0).toLocaleString("es-CL") + " CLP";

export const precioTexto = p => (p.precio === 0 ? "FREE" : formatoCLP(p.precio));

/* ---------------- Productos ---------------- */
export const Productos = {
  todos: () => leer(LS.PRODUCTOS, []),
  buscar: codigo => Productos.todos().find(p => p.codigo === codigo),
  guardarTodos: lista => guardar(LS.PRODUCTOS, lista),
  guardar(producto, codigoOriginal = null) {
    const lista = Productos.todos();
    const i = lista.findIndex(p => p.codigo === (codigoOriginal || producto.codigo));
    if (i >= 0) lista[i] = producto; else lista.push(producto);
    Productos.guardarTodos(lista);
  },
  eliminar(codigo) {
    Productos.guardarTodos(Productos.todos().filter(p => p.codigo !== codigo));
  },
  esTorta: p => /torta|cheesecake/i.test(p.nombre) || /^Tortas/.test(p.categoria),
  /* Las imágenes base viven en /public/img; las subidas por el admin son dataURL */
  imagen: p => (p.imagen && p.imagen.startsWith("data:") ? p.imagen : "/" + (p.imagen || "img/logo.svg").replace(/^\/+/, "")),
  esCritico: p => p.stockCritico !== "" && p.stockCritico !== null && p.stockCritico !== undefined && p.stock <= Number(p.stockCritico)
};

/* ---------------- Usuarios ---------------- */
export const Usuarios = {
  todos: () => leer(LS.USUARIOS, []),
  buscarPorCorreo: correo => Usuarios.todos().find(u => u.correo.toLowerCase() === String(correo).toLowerCase()),
  buscarPorRun: run => Usuarios.todos().find(u => u.run.toUpperCase() === String(run).toUpperCase()),
  guardar(usuario, runOriginal = null) {
    const lista = Usuarios.todos();
    const i = lista.findIndex(u => u.run === (runOriginal || usuario.run));
    if (i >= 0) lista[i] = { ...lista[i], ...usuario }; else lista.push(usuario);
    guardar(LS.USUARIOS, lista);
  },
  eliminar(run) {
    guardar(LS.USUARIOS, Usuarios.todos().filter(u => u.run !== run));
  }
};

/* ---------------- Sesión ---------------- */
export const Sesion = {
  actual: () => leer(LS.SESION, null),
  usuario() {
    const s = Sesion.actual();
    return s ? Usuarios.buscarPorCorreo(s.correo) : null;
  },
  iniciar(usuario) {
    guardar(LS.SESION, { correo: usuario.correo, nombre: usuario.nombre, tipo: usuario.tipo });
  },
  cerrar() {
    localStorage.removeItem(LS.SESION);
    notificar();
  }
};

/* ---------------- Descuentos (reglas de negocio del caso) ----------------
   1. Usuarios de 50 años o más: 50% en todos los productos.
   2. Registro con el código "FELICES50": 10% de por vida.
   3. Estudiantes Duoc (correo @duoc.cl) en su cumpleaños: una torta gratis
      (la de mayor valor en el carrito, 1 unidad, una vez al año).
   Los porcentajes NO se acumulan: se aplica el mayor.                      */
export const CODIGO_PROMO = "FELICES50";

export function esCumpleanosHoy(fechaISO) {
  if (!fechaISO) return false;
  const hoy = new Date();
  const [, m, d] = fechaISO.split("-").map(Number);
  return hoy.getMonth() + 1 === m && hoy.getDate() === d;
}

export function beneficiosUsuario(usuario) {
  const b = { porcentaje: 0, motivo: "", tortaGratis: false };
  if (!usuario) return b;
  const edad = calcularEdad(usuario.fechaNacimiento);
  if (edad !== null && edad >= 50) {
    b.porcentaje = 50;
    b.motivo = "Descuento 50% por ser mayor de 50 años";
  } else if (String(usuario.codigoPromo || "").toUpperCase() === CODIGO_PROMO) {
    b.porcentaje = 10;
    b.motivo = "Descuento 10% de por vida (código FELICES50)";
  }
  const anio = new Date().getFullYear();
  if (usuario.correo.toLowerCase().endsWith("@duoc.cl") &&
      esCumpleanosHoy(usuario.fechaNacimiento) &&
      usuario.tortaGratisAnio !== anio) {
    b.tortaGratis = true;
  }
  return b;
}

/* ---------------- Carrito ---------------- */
export const MAX_POR_ITEM = 10;

export const Carrito = {
  items: () => leer(LS.CARRITO, []),
  guardar: items => guardar(LS.CARRITO, items),
  clave: (codigo, tamano, mensaje) => `${codigo}|${tamano || ""}|${(mensaje || "").trim()}`,

  /* Reglas: el producto debe existir y tener stock; la cantidad total por
     producto no supera el stock ni el máximo de 10 unidades por línea. */
  agregar(codigo, cantidad = 1, tamano = "", mensaje = "") {
    const p = Productos.buscar(codigo);
    if (!p) return { ok: false, msg: "El producto ya no está disponible." };
    if (p.stock <= 0) return { ok: false, msg: `${p.nombre} está agotado.` };
    const items = Carrito.items();
    const clave = Carrito.clave(codigo, tamano, mensaje);
    const enCarrito = items.filter(i => i.codigo === codigo).reduce((s, i) => s + i.cantidad, 0);
    if (enCarrito + cantidad > p.stock) {
      return { ok: false, msg: `Solo quedan ${p.stock} unidades de ${p.nombre}.` };
    }
    const existente = items.find(i => i.clave === clave);
    if (existente) {
      if (existente.cantidad + cantidad > MAX_POR_ITEM) {
        return { ok: false, msg: `Máximo ${MAX_POR_ITEM} unidades por producto.` };
      }
      existente.cantidad += cantidad;
    } else {
      items.push({ clave, codigo, cantidad, tamano, mensaje: mensaje.trim() });
    }
    Carrito.guardar(items);
    return { ok: true, msg: `${p.nombre} se añadió al carrito.` };
  },

  cambiarCantidad(clave, cantidad) {
    const items = Carrito.items();
    const item = items.find(i => i.clave === clave);
    if (!item) return { ok: false };
    const p = Productos.buscar(item.codigo);
    const otros = items.filter(i => i.codigo === item.codigo && i.clave !== clave).reduce((s, i) => s + i.cantidad, 0);
    if (cantidad < 1) return Carrito.quitar(clave);
    if (cantidad > MAX_POR_ITEM) return { ok: false, msg: `Máximo ${MAX_POR_ITEM} unidades por producto.` };
    if (p && otros + cantidad > p.stock) return { ok: false, msg: `Solo hay ${p.stock} unidades en stock.` };
    item.cantidad = cantidad;
    Carrito.guardar(items);
    return { ok: true };
  },

  quitar(clave) {
    Carrito.guardar(Carrito.items().filter(i => i.clave !== clave));
    return { ok: true };
  },

  vaciar: () => Carrito.guardar([]),

  cantidadTotal: () => Carrito.items().reduce((s, i) => s + i.cantidad, 0),

  precioUnitario(item) {
    const p = Productos.buscar(item.codigo);
    if (!p) return 0;
    const t = TAMANOS.find(t => t.id === item.tamano);
    return Math.round(p.precio * (t ? t.factor : 1));
  },

  /* Calcula el resumen con descuentos del usuario y el cupón ingresado */
  resumen(cupon = "") {
    const usuario = Sesion.usuario();
    const b = beneficiosUsuario(usuario);
    const lineas = Carrito.items()
      .map(i => ({ ...i, producto: Productos.buscar(i.codigo), unitario: Carrito.precioUnitario(i) }))
      .filter(l => l.producto)
      .map(l => ({ ...l, subtotal: l.unitario * l.cantidad }));

    const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);

    let descuentoTorta = 0, tortaGratisNombre = "";
    if (b.tortaGratis) {
      const tortas = lineas.filter(l => Productos.esTorta(l.producto));
      if (tortas.length) {
        const mayor = tortas.reduce((a, c) => (c.unitario > a.unitario ? c : a));
        descuentoTorta = mayor.unitario;
        tortaGratisNombre = mayor.producto.nombre;
      }
    }

    let porcentaje = b.porcentaje, motivo = b.motivo;
    if (cupon && cupon.toUpperCase() === CODIGO_PROMO && porcentaje < 10) {
      porcentaje = 10;
      motivo = "Cupón FELICES50 (10%)";
    }
    const descuentoPct = Math.round((subtotal - descuentoTorta) * porcentaje / 100);
    const total = Math.max(0, subtotal - descuentoTorta - descuentoPct);
    return { lineas, subtotal, descuentoTorta, tortaGratisNombre, porcentaje, motivo, descuentoPct, total, usuario, beneficios: b };
  }
};

/* ---------------- Órdenes / boletas ---------------- */
export const ESTADOS = ["En preparación", "Listo", "En camino", "Entregado"];

export const Ordenes = {
  todas: () => leer(LS.ORDENES, []),
  cambiarEstado(numero, estado) {
    const ordenes = Ordenes.todas();
    const o = ordenes.find(x => x.numero === numero);
    if (!o) return null;
    o.estado = estado;
    guardar(LS.ORDENES, ordenes);
    return o;
  },
  crear(resumen, entrega) {
    const ordenes = Ordenes.todas();
    const numero = "B" + String(ordenes.length + 1).padStart(5, "0");
    const orden = {
      numero,
      fecha: new Date().toISOString(),
      cliente: resumen.usuario ? `${resumen.usuario.nombre} ${resumen.usuario.apellidos}` : "Invitado",
      correo: resumen.usuario ? resumen.usuario.correo : "",
      items: resumen.lineas.map(l => ({ codigo: l.codigo, nombre: l.producto.nombre, cantidad: l.cantidad, unitario: l.unitario, tamano: l.tamano, mensaje: l.mensaje })),
      subtotal: resumen.subtotal,
      descuento: resumen.descuentoTorta + resumen.descuentoPct,
      total: resumen.total,
      entrega,
      estado: "En preparación"
    };
    ordenes.push(orden);
    guardar(LS.ORDENES, ordenes);

    /* Descuenta stock */
    const productos = Productos.todos();
    orden.items.forEach(it => {
      const p = productos.find(x => x.codigo === it.codigo);
      if (p) p.stock = Math.max(0, p.stock - it.cantidad);
    });
    Productos.guardarTodos(productos);

    /* Marca la torta de cumpleaños como usada este año */
    if (resumen.descuentoTorta && resumen.usuario) {
      Usuarios.guardar({ ...resumen.usuario, tortaGratisAnio: new Date().getFullYear() });
    }
    Carrito.vaciar();
    return orden;
  }
};

/* ---------------- Mensajes de contacto ---------------- */
export const Mensajes = {
  todos: () => leer(LS.MENSAJES, []),
  agregar(m) {
    guardar(LS.MENSAJES, [...Mensajes.todos(), { ...m, fecha: new Date().toISOString() }]);
  }
};

/* Texto de historia/origen según categoría (información extra para el usuario) */
export function origenReceta(p) {
  const origenes = {
    "Tortas Circulares": "receta de la casa desde 1976; el manjar y la crema pastelera se preparan a diario en nuestro taller.",
    "Tortas Cuadradas": "formato creado para celebraciones grandes, inspirado en la torta récord de 1995.",
    "Pastelería Tradicional": "recetas heredadas de las abuelas fundadoras; la Tarta de Santiago viene de Galicia y llegó con la inmigración española.",
    "Postres Individuales": "desarrollados junto a estudiantes de gastronomía de Duoc UC.",
    "Productos Sin Azúcar": "línea saludable endulzada con fruta y stevia, creada en 2015.",
    "Productos Sin Gluten": "elaborados en una zona separada de nuestra cocina para evitar contaminación cruzada.",
    "Productos Vegana": "sin ingredientes de origen animal; desarrollados con estudiantes de gastronomía de Duoc UC.",
    "Tortas Especiales": "diseñadas a pedido por nuestros maestros pasteleros para tus momentos más importantes."
  };
  return origenes[p.categoria] || "producto elaborado artesanalmente en nuestra pastelería.";
}
