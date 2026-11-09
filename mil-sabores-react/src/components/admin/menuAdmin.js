/* Secciones del panel y roles que pueden verlas.
   Administrador: acceso total · Vendedor: dashboard, órdenes, productos y perfil */
export const ADMIN = ["Administrador"];
export const ADMIN_Y_VENDEDOR = ["Administrador", "Vendedor"];

export const MENU_ADMIN = [
  { to: "/admin", icono: "📊", texto: "Dashboard", detalle: "Visión general de las métricas y estadísticas clave del sistema.", roles: ADMIN_Y_VENDEDOR, end: true },
  { to: "/admin/ordenes", icono: "🧾", texto: "Órdenes", detalle: "Gestión y seguimiento de todas las órdenes de compra realizadas.", roles: ADMIN_Y_VENDEDOR },
  { to: "/admin/productos", icono: "🎂", texto: "Productos", detalle: "Administrar inventario y detalles de los productos disponibles.", roles: ADMIN_Y_VENDEDOR },
  { to: "/admin/categorias", icono: "🏷️", texto: "Categorías", detalle: "Organizar productos en categorías para facilitar su navegación.", roles: ADMIN },
  { to: "/admin/usuarios", icono: "👥", texto: "Usuarios", detalle: "Gestión de cuentas de usuario y sus roles dentro del sistema.", roles: ADMIN },
  { to: "/admin/reportes", icono: "📈", texto: "Reportes", detalle: "Informes de ventas, productos más vendidos e inventario.", roles: ADMIN },
  { to: "/admin/perfil", icono: "👤", texto: "Perfil", detalle: "Administración de la información personal y configuración de cuenta.", roles: ADMIN_Y_VENDEDOR }
];

export const menuPara = tipo => MENU_ADMIN.filter(m => m.roles.includes(tipo));
