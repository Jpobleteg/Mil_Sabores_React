

export const DOMINIOS_PERMITIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];

export const Validar = {
  requerido(valor, campo = "Este campo") {
    return String(valor ?? "").trim() === "" ? `Debes completar ${campo.charAt(0).toLowerCase() + campo.slice(1)}.` : "";
  },

  maxLargo(valor, max, campo = "Este campo") {
    return String(valor ?? "").trim().length > max ? `${campo} no puede superar los ${max} caracteres.` : "";
  },

  minLargo(valor, min, campo = "Este campo") {
    return String(valor ?? "").trim().length < min ? `${campo} debe tener al menos ${min} caracteres.` : "";
  },

  /* Correo: formato válido y solo dominios @duoc.cl, @profesor.duoc.cl y @gmail.com */
  correo(valor) {
    const v = String(valor ?? "").trim().toLowerCase();
    if (!v) return "";
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formato.test(v)) return "Ingresa un correo con formato válido, por ejemplo nombre@duoc.cl.";
    if (!DOMINIOS_PERMITIDOS.some(d => v.endsWith(d))) {
      return "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    return "";
  },

  /* RUN chileno sin puntos ni guion (ej: 190110222). Verifica el dígito verificador con módulo 11 */
  run(valor) {
    const v = String(valor ?? "").trim().toUpperCase();
    if (!v) return "";
    if (/[.\-]/.test(v)) return "Escribe el RUN sin puntos ni guion (ej: 190110222).";
    if (v.length < 7 || v.length > 9) return "El RUN debe tener entre 7 y 9 caracteres.";
    if (!/^\d{6,8}[0-9K]$/.test(v)) return "El RUN solo puede tener números y terminar en un dígito o K.";
    const cuerpo = v.slice(0, -1);
    const dv = v.slice(-1);
    return calcularDV(cuerpo) === dv ? "" : "El RUN no es válido: el dígito verificador no coincide.";
  },

  password(valor) {
    const v = String(valor ?? "");
    if (!v) return "";
    return v.length < 4 || v.length > 10 ? "La contraseña debe tener entre 4 y 10 caracteres." : "";
  },

  numero(valor, { min = null, entero = false, campo = "El valor" } = {}) {
    const v = String(valor ?? "").trim();
    if (v === "") return "";
    const n = Number(v.replace(",", "."));
    if (Number.isNaN(n)) return `${campo} debe ser un número.`;
    if (entero && !Number.isInteger(n)) return `${campo} debe ser un número entero (sin decimales).`;
    if (min !== null && n < min) return `${campo} no puede ser menor que ${min}.`;
    return "";
  },

  /* Teléfono chileno opcional: 9 dígitos, puede empezar con +56 */
  telefono(valor) {
    const v = String(valor ?? "").replace(/\s/g, "");
    if (!v) return "";
    return /^(\+?56)?9\d{8}$/.test(v) ? "" : "Ingresa un celular válido, por ejemplo +56 9 1234 5678.";
  },

  /* Tarjeta: 13 a 19 dígitos (se aceptan espacios) y dígito de control Luhn */
  tarjeta(valor) {
    const v = String(valor ?? "").replace(/\s/g, "");
    if (!v) return "";
    if (!/^\d{13,19}$/.test(v)) return "El número de tarjeta debe tener entre 13 y 19 dígitos.";
    return luhn(v) ? "" : "El número de tarjeta no es válido.";
  },

  /* Vencimiento MM/AA, no puede estar vencida */
  vencimiento(valor, hoy = new Date()) {
    const v = String(valor ?? "").trim();
    if (!v) return "";
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
    if (!m) return "Usa el formato MM/AA, por ejemplo 08/28.";
    const mes = Number(m[1]), anio = 2000 + Number(m[2]);
    const fin = new Date(anio, mes, 0, 23, 59, 59);
    return fin < hoy ? "La tarjeta está vencida." : "";
  },

  cvv(valor) {
    const v = String(valor ?? "").trim();
    if (!v) return "";
    return /^\d{3,4}$/.test(v) ? "" : "El CVV tiene 3 o 4 dígitos.";
  },

  fechaNacimiento(valor) {
    if (!valor) return "";
    const f = new Date(valor + "T00:00:00");
    if (Number.isNaN(f.getTime())) return "Fecha no válida.";
    if (f > new Date()) return "La fecha de nacimiento no puede estar en el futuro.";
    if (calcularEdad(valor) > 120) return "Revisa el año de nacimiento.";
    return "";
  }
};

export function calcularDV(cuerpo) {
  let suma = 0, mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const r = 11 - (suma % 11);
  return r === 11 ? "0" : r === 10 ? "K" : String(r);
}

export function calcularEdad(fechaISO) {
  if (!fechaISO) return null;
  const hoy = new Date();
  const f = new Date(fechaISO + "T00:00:00");
  let edad = hoy.getFullYear() - f.getFullYear();
  const m = hoy.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
  return edad;
}

/* Algoritmo de Luhn (dígito de control de tarjetas) */
export function luhn(numero) {
  let suma = 0, doble = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let d = Number(numero[i]);
    if (doble) { d *= 2; if (d > 9) d -= 9; }
    suma += d;
    doble = !doble;
  }
  return suma % 10 === 0;
}
