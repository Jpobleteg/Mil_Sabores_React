# Pastelería Mil Sabores — Versión React

Migración a **React + Vite** del sitio original hecho con HTML, CSS y JavaScript.
Se mantiene el mismo diseño (`styles.css` y `admin.css`), los mismos datos, las mismas
validaciones y las mismas reglas de negocio; los datos siguen guardándose en `localStorage`.

## Requisitos

- [Node.js](https://nodejs.org/) 
- Visual Studio Code

## Cómo ejecutarlo en VS Code

1. Descomprime la carpeta y ábrela en VS Code (*Archivo → Abrir carpeta…*).
2. Abre la terminal integrada (*Terminal → Nueva terminal*).
3. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Se abrirá el navegador en (http://localhost:5174/). Los cambios en el código se ven al instante.


### Cuentas de prueba

Rol / Correo / Contraseña 

Administrador /  admin@duoc.cl / admin123 
Vendedor / vendedor@duoc.cl / vende123 
Cliente (65 años, 50% dcto.) / rosa@gmail.com / rosa1234 



## Qué cambió respecto a la versión HTML

- Las páginas son componentes React; el header, la barra de sesión y el footer se escriben una sola vez.
- El HTML que antes se armaba con `innerHTML` ahora es JSX (React escapa el texto solo, ya no hace falta `escapar()`).
- La validación se hace con el hook `useFormulario`, con los mismos mensajes y momentos de validación.
- El control de acceso por rol del panel se hace con el componente `<RequiereRol>` en las rutas.
- La lógica de negocio (`store.js`, `validaciones.js`, `data.js`) es la misma, ahora como módulos ES.


## Roles

- **Administrador:** acceso total.
- **Vendedor:** ve dashboard, productos (lista y detalle) y órdenes; las rutas restringidas lo redirigen.
- **Cliente:** solo accede a la tienda.
