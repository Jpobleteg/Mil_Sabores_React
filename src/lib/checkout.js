/* Utilidades del checkout: fechas de entrega y último intento de pago fallido. */

const CLAVE_INTENTO = "ms_intento_pago";

const aISO = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/* Fecha mínima de entrega: 2 días desde hoy; máxima: 60 días */
export function rangoEntrega(hoy = new Date()) {
  const min = new Date(hoy); min.setDate(hoy.getDate() + 2);
  const max = new Date(hoy); max.setDate(hoy.getDate() + 60);
  return { min: aISO(min), max: aISO(max) };
}

export function validarFechaEntrega(v, hoy = new Date()) {
  const rango = rangoEntrega(hoy);
  if (!v) return "Selecciona una fecha de entrega.";
  if (v < rango.min) return "La entrega debe ser al menos en 2 días más.";
  if (v > rango.max) return "Solo aceptamos pedidos hasta 60 días en adelante.";
  if (new Date(v + "T00:00:00").getDay() === 0) return "No hacemos entregas los domingos. Elige otro día.";
  return "";
}

/* El intento fallido se guarda en sessionStorage (sin datos de la tarjeta)
   para mostrarlo en la página de error y precargar el checkout al reintentar */
export const IntentoPago = {
  guardar: datos => sessionStorage.setItem(CLAVE_INTENTO, JSON.stringify(datos)),
  leer() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_INTENTO)) || null; } catch { return null; }
  },
  limpiar: () => sessionStorage.removeItem(CLAVE_INTENTO)
};
