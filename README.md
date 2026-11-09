# Pastelería Mil Sabores — Versión React

Migración a **React + Vite** del sitio original hecho con HTML, CSS y JavaScript.
Se mantiene el mismo diseño (`styles.css` y `admin.css`), los mismos datos, las mismas
validaciones y las mismas reglas de negocio; los datos siguen guardándose en `localStorage`.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (recomendado 20 LTS o 22 LTS)
- Visual Studio Code

## Cómo ejecutarlo en VS Code

1. Descomprime la carpeta y ábrela en VS Code (*Archivo → Abrir carpeta…*).
2. Abre la terminal integrada (`Ctrl + ñ` o *Terminal → Nueva terminal*).
3. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Se abrirá el navegador en `http://localhost:5173`. Los cambios en el código se ven al instante.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` para probarla |

Para reiniciar los datos: DevTools → *Application* → *Local Storage* → borra las claves `ms_*`.

### Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | vende123 |
| Cliente (65 años, 50% dcto.) | rosa@gmail.com | rosa1234 |

## Estructura

```
mil-sabores-react/
├── index.html                 Punto de entrada (Vite)
├── package.json
├── vite.config.js
├── public/img/                Logo e ilustraciones SVG (se sirven en /img/...)
└── src/
    ├── main.jsx               Monta <App/> con el router y los avisos
    ├── App.jsx                Rutas de la tienda y del panel admin
    ├── styles/                styles.css (tienda) y admin.css (panel)
    ├── lib/
    │   ├── data.js            Productos, categorías, tamaños, regiones/comunas, usuarios base
    │   ├── validaciones.js    Reglas de validación (RUN módulo 11, correo, teléfono, etc.)
    │   └── store.js           localStorage, sesión, carrito, descuentos y órdenes
    ├── hooks/
    │   ├── useStore.js        Redibuja los componentes cuando cambian los datos
    │   └── useFormulario.js   Validación al escribir, al salir del campo y al enviar
    ├── context/
    │   └── AvisosContext.jsx  Avisos flotantes (toast)
    ├── components/
    │   ├── Header.jsx, Footer.jsx, LayoutTienda.jsx
    │   ├── TarjetaProducto.jsx, Campo.jsx, Dialogo.jsx, Boleta.jsx
    │   ├── FormularioUsuario.jsx   Registro, perfil y usuario del admin
    │   └── admin/             LayoutAdmin, RequiereRol (control por rol), CabeceraAdmin, Paginacion
    └── pages/
        ├── Inicio, Productos, Detalle, Carrito, Login, Registro, Perfil,
        │   Nosotros, Blogs, BlogDetalle, Contacto, NoEncontrado
        └── admin/             Dashboard, AdminOrdenes, AdminProductos, ProductoForm,
                               ProductoDetalle, AdminUsuarios, UsuarioForm, UsuarioDetalle
```

## Rutas

| Antes (HTML) | Ahora (React Router) |
|---|---|
| index.html | `/` |
| productos.html?categoria=… | `/productos?categoria=…` |
| detalle.html?codigo=TC001 | `/productos/TC001` |
| carrito.html | `/carrito` |
| login.html / registro.html / perfil.html | `/login` · `/registro` · `/perfil` |
| nosotros.html / contacto.html | `/nosotros` · `/contacto` |
| blogs.html | `/blogs` |
| blog-detalle-1.html / blog-detalle-2.html | `/blogs/torta-mas-grande` · `/blogs/torta-de-manjar` |
| admin/index.html | `/admin` |
| admin/ordenes.html | `/admin/ordenes` |
| admin/productos.html | `/admin/productos` |
| admin/producto-form.html(?codigo=) | `/admin/productos/nuevo` · `/admin/productos/:codigo/editar` |
| admin/producto-detalle.html?codigo= | `/admin/productos/:codigo` |
| admin/usuarios.html | `/admin/usuarios` |
| admin/usuario-form.html(?run=) | `/admin/usuarios/nuevo` · `/admin/usuarios/:run/editar` |
| admin/usuario-detalle.html?run= | `/admin/usuarios/:run` |

## Qué cambió respecto a la versión HTML

- Las páginas son componentes React; el header, la barra de sesión y el footer se escriben una sola vez.
- El HTML que antes se armaba con `innerHTML` ahora es JSX (React escapa el texto solo, ya no hace falta `escapar()`).
- La validación se hace con el hook `useFormulario`, con los mismos mensajes y momentos de validación.
- El control de acceso por rol del panel se hace con el componente `<RequiereRol>` en las rutas.
- La lógica de negocio (`store.js`, `validaciones.js`, `data.js`) es la misma, ahora como módulos ES.

## Reglas de negocio implementadas

| Regla | Dónde |
|---|---|
| 50% de descuento a usuarios de 50 años o más | `lib/store.js → beneficiosUsuario()` |
| 10% de por vida al registrarse con el código `FELICES50` | Registro + carrito |
| Torta gratis a estudiantes Duoc (@duoc.cl) el día de su cumpleaños, una vez al año | Carrito |
| Los porcentajes no se acumulan: se aplica el mayor | `lib/store.js` |
| Carrito: no supera el stock, máximo 10 unidades por producto, se guarda en `localStorage` | `lib/store.js → Carrito` |
| Entrega: mínimo 2 días, máximo 60, sin domingos | `pages/Carrito.jsx` |
| Al pagar se genera boleta, se descuenta stock y se crea la orden | `lib/store.js → Ordenes` |
| Alerta cuando el stock es igual o menor al stock crítico | Admin |

## Roles

- **Administrador:** acceso total.
- **Vendedor:** ve dashboard, productos (lista y detalle) y órdenes; las rutas restringidas lo redirigen.
- **Cliente:** solo accede a la tienda.
