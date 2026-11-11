
import { TAMANOS } from "./data.js";
import { calcularEdad } from "./validaciones.js";
import { db, LS, leer, guardar, notificar } from "./db.js";

export { LS, leer, guardar, suscribir, obtenerVersion, db, reiniciarDatos } from "./db.js";

/* ---------------- Formato ---------------- */
export const formatoCLP = n =>
  "$" + Math.round(Number(n) || 0).toLocaleString("es-CL") + " CLP";

export const precioTexto = p => (precioFinal(p) === 0 ? "FREE" : formatoCLP(precioFinal(p)));

/* Convierte un texto en identificador para URL: "Tortas Cuadradas" → "tortas-cuadradas" */
export const slug = texto =>
  String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* ---------------- Productos ---------------- */
export const enOferta = p =>
  p.precioOferta !== undefined && p.precioOferta !== null && p.precioOferta !== "" && Number(p.precioOferta) < Number(p.precio);

export const precioFinal = p => (enOferta(p) ? Number(p.precioOferta) : Number(p.precio));

export const porcentajeOferta = p => (enOferta(p) && p.precio > 0 ? Math.round((1 - p.precioOferta / p.precio) * 100) : 0);

export const Productos = {
  todos: () => db.productos.listar(),
  buscar: codigo => db.productos.obtener(codigo) || undefined,
  crear: p => db.productos.crear(p),
  actualizar: (codigo, cambios) => db.productos.actualizar(codigo, cambios),
  eliminar: codigo => db.productos.eliminar(codigo),
  guardarTodos: lista => db.productos.reemplazar(lista),
  /* Crea o actualiza (si se indica el código original) */
  guardar(producto, codigoOriginal = null) {
    if (codigoOriginal && db.productos.existe(codigoOriginal)) return db.productos.actualizar(codigoOriginal, producto);
    return db.productos.crear(producto);
  },
  porCategoria: nombre => Productos.todos().filter(p => p.categoria === nombre),
  ofertas: () => Productos.todos().filter(enOferta),
  criticos: () => Productos.todos().filter(Productos.esCritico),
  esTorta: p => /torta|cheesecake/i.test(p.nombre) || /^Tortas/.test(p.categoria),
  /* Las imágenes base viven en /public/img; las subidas por el admin son dataURL */
  imagen: p => (p.imagen && p.imagen.startsWith("data:") ? p.imagen : "/" + (p.imagen || "img/logo.svg").replace(/^\/+/, "")),
  esCritico: p => p.stockCritico !== "" && p.stockCritico !== null && p.stockCritico !== undefined && p.stock <= Number(p.stockCritico)
};

/* ---------------- Categorías ---------------- */
export const Categorias = {
  todas: () => db.categorias.listar(),
  nombres: () => Categorias.todas().map(c => c.nombre),
  obtener: id => db.categorias.obtener(id),
  porNombre: nombre => Categorias.todas().find(c => c.nombre === nombre) || null,
  contarProductos: nombre => Productos.porCategoria(nombre).length,
  /* Imagen representativa: la del primer producto de la categoría */
  imagen(c) {
    const p = Productos.porCategoria(c.nombre)[0];
    return p ? Productos.imagen(p) : "/img/logo.svg";
  },
  crear({ nombre, descripcion = "" }) {
    const n = nombre.trim();
    if (Categorias.porNombre(n)) throw new Error("Ya existe una categoría con ese nombre.");
    return db.categorias.crear({ id: slug(n), nombre: n, descripcion: descripcion.trim() });
  },
  /* Al renombrar, los productos de la categoría se actualizan */
  actualizar(id, { nombre, descripcion = "" }) {
    const actual = db.categorias.obtener(id);
    if (!actual) throw new Error("La categoría no existe.");
    const n = nombre.trim();
    const otra = Categorias.porNombre(n);
    if (otra && otra.id !== actual.id) throw new Error("Ya existe una categoría con ese nombre.");
    if (n !== actual.nombre) {
      db.productos.reemplazar(Productos.todos().map(p => (p.categoria === actual.nombre ? { ...p, categoria: n } : p)));
    }
    return db.categorias.actualizar(id, { nombre: n, descripcion: descripcion.trim() });
  },
  /* No se puede eliminar una categoría que tiene productos */
  eliminar(id) {
    const c = db.categorias.obtener(id);
    if (!c) return { ok: false, msg: "La categoría no existe." };
    const n = Categorias.contarProductos(c.nombre);
    if (n > 0) return { ok: false, msg: `No se puede eliminar: tiene ${n} producto${n === 1 ? "" : "s"}.` };
    db.categorias.eliminar(id);
    return { ok: true, msg: "Categoría eliminada." };
  }
};

/* ---------------- Usuarios ---------------- */
export const Usuarios = {
  todos: () => db.usuarios.listar(),
  buscarPorCorreo: correo => Usuarios.todos().find(u => u.correo.toLowerCase() === String(correo).toLowerCase()),
  buscarPorRun: run => db.usuarios.obtener(run) || undefined,
  crear: u => db.usuarios.crear(u),
  guardar(usuario, runOriginal = null) {
    const id = runOriginal || usuario.run;
    if (db.usuarios.existe(id)) return db.usuarios.actualizar(id, usuario);
    return db.usuarios.crear(usuario);
  },
  eliminar: run => db.usuarios.eliminar(run)
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

export function esCumpleanosHoy(fechaISO, hoy = new Date()) {
  if (!fechaISO) return false;
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

  vaciar() {
    localStorage.removeItem(LS.CUPON);
    Carrito.guardar([]);
  },

  /* Cupón aplicado (se conserva entre el carrito y el checkout) */
  cupon: () => leer(LS.CUPON, ""),
  aplicarCupon(codigo) {
    const c = String(codigo || "").trim().toUpperCase();
    if (!c) return { ok: false, msg: "Debes completar el cupón." };
    if (c !== CODIGO_PROMO) return { ok: false, msg: "Cupón no válido. Prueba con FELICES50." };
    guardar(LS.CUPON, c);
    return { ok: true, msg: "Cupón aplicado: 10% de descuento." };
  },

  cantidadTotal: () => Carrito.items().reduce((s, i) => s + i.cantidad, 0),

  /* Precio unitario: precio de oferta si existe × factor de tamaño */
  precioUnitario(item) {
    const p = Productos.buscar(item.codigo);
    if (!p) return 0;
    const t = TAMANOS.find(t => t.id === item.tamano);
    return Math.round(precioFinal(p) * (t ? t.factor : 1));
  },

  /* Calcula el resumen con descuentos del usuario y el cupón ingresado */
  resumen(cupon = Carrito.cupon()) {
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

/* ---------------- Pasarela de pago simulada ----------------
   No se conecta a ningún banco. Reglas para probar ambos caminos:
     · Tarjetas que empiezan con 4000 → pago RECHAZADO (fondos insuficientes).
     · Cualquier otra tarjeta válida   → pago APROBADO.
   También rechaza si algún producto ya no tiene stock suficiente. */
export const TARJETA_APROBADA = "4111 1111 1111 1111";
export const TARJETA_RECHAZADA = "4000 0000 0000 0002";

export const Pasarela = {
  procesar({ tarjeta, total }, lineas = []) {
    const numero = String(tarjeta || "").replace(/\s/g, "");
    const sinStock = lineas.find(l => {
      const p = Productos.buscar(l.codigo);
      return !p || p.stock < l.cantidad;
    });
    if (sinStock) return { aprobado: false, motivo: `No hay stock suficiente de ${sinStock.producto ? sinStock.producto.nombre : sinStock.codigo}.` };
    if (numero.startsWith("4000")) return { aprobado: false, motivo: "El banco rechazó la transacción (fondos insuficientes)." };
    if (!(total >= 0)) return { aprobado: false, motivo: "Monto inválido." };
    return { aprobado: true, autorizacion: "AUT" + String(Date.now()).slice(-6) };
  }
};

/* ---------------- Órdenes / boletas ---------------- */
export const ESTADOS = ["En preparación", "Listo", "En camino", "Entregado"];

export const Ordenes = {
  todas: () => db.ordenes.listar(),
  obtener: numero => db.ordenes.obtener(numero),
  delCliente: correo => Ordenes.todas().filter(o => o.correo && o.correo.toLowerCase() === String(correo).toLowerCase()),
  cambiarEstado(numero, estado) {
    if (!ESTADOS.includes(estado) || !db.ordenes.existe(numero)) return null;
    return db.ordenes.actualizar(numero, { estado });
  },
  siguienteNumero: () => "B" + String(Ordenes.todas().length + 1).padStart(5, "0"),

  /* Crea la orden, descuenta stock, marca la torta de cumpleaños y vacía el carrito.
     cliente: { nombre, apellidos, correo } · entrega: { fecha, calle, departamento, region, comuna, indicaciones } */
  crear(resumen, entrega, cliente = null, autorizacion = "") {
    const u = resumen.usuario;
    const datosCliente = cliente || (u ? { nombre: u.nombre, apellidos: u.apellidos, correo: u.correo } : { nombre: "Invitado", apellidos: "", correo: "" });
    const direccion = entrega.direccion ||
      [entrega.calle, entrega.departamento].filter(Boolean).join(", ") + (entrega.comuna ? `, ${entrega.comuna}` : "");
    const orden = {
      numero: Ordenes.siguienteNumero(),
      fecha: new Date().toISOString(),
      cliente: `${datosCliente.nombre} ${datosCliente.apellidos}`.trim(),
      datosCliente,
      correo: datosCliente.correo,
      items: resumen.lineas.map(l => ({
        codigo: l.codigo, nombre: l.producto.nombre, categoria: l.producto.categoria,
        cantidad: l.cantidad, unitario: l.unitario, tamano: l.tamano, mensaje: l.mensaje
      })),
      subtotal: resumen.subtotal,
      descuento: resumen.descuentoTorta + resumen.descuentoPct,
      total: resumen.total,
      entrega: { ...entrega, direccion },
      autorizacion,
      estado: "En preparación"
    };
    db.ordenes.crear(orden);

    /* Descuenta stock */
    db.productos.reemplazar(Productos.todos().map(p => {
      const vendidos = orden.items.filter(it => it.codigo === p.codigo).reduce((s, it) => s + it.cantidad, 0);
      return vendidos ? { ...p, stock: Math.max(0, p.stock - vendidos) } : p;
    }));

    /* Marca la torta de cumpleaños como usada este año */
    if (resumen.descuentoTorta && u) {
      Usuarios.guardar({ ...u, tortaGratisAnio: new Date().getFullYear() });
    }
    Carrito.vaciar();
    return orden;
  }
};

/* ---------------- Reportes ---------------- */
export const Reportes = {
  ventasTotales: () => Ordenes.todas().reduce((s, o) => s + o.total, 0),
  ventasPorCategoria() {
    const mapa = {};
    Ordenes.todas().forEach(o => o.items.forEach(i => {
      const cat = i.categoria || (Productos.buscar(i.codigo) || {}).categoria || "Sin categoría";
      mapa[cat] = (mapa[cat] || 0) + i.unitario * i.cantidad;
    }));
    return Object.entries(mapa).map(([categoria, monto]) => ({ categoria, monto })).sort((a, b) => b.monto - a.monto);
  },
  masVendidos(limite = 5) {
    const mapa = {};
    Ordenes.todas().forEach(o => o.items.forEach(i => {
      mapa[i.codigo] = mapa[i.codigo] || { codigo: i.codigo, nombre: i.nombre, unidades: 0 };
      mapa[i.codigo].unidades += i.cantidad;
    }));
    return Object.values(mapa).sort((a, b) => b.unidades - a.unidades).slice(0, limite);
  },
  ordenesPorEstado: () => ESTADOS.map(estado => ({ estado, cantidad: Ordenes.todas().filter(o => o.estado === estado).length })),
  inventarioValorizado: () => Productos.todos().reduce((s, p) => s + precioFinal(p) * p.stock, 0),
  unidadesEnStock: () => Productos.todos().reduce((s, p) => s + Number(p.stock || 0), 0)
};

/* ---------------- Mensajes de contacto ---------------- */
export const Mensajes = {
  todos: () => db.mensajes.listar(),
  agregar(m) {
    return db.mensajes.crear({ ...m, id: String(Date.now()) + Math.random().toString(16).slice(2, 6), fecha: new Date().toISOString() });
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
