
import { render } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AvisosProvider } from "../context/AvisosContext.jsx";
import { reiniciarDatos, Sesion, Usuarios } from "../lib/store.js";

const FUTURO = { v7_startTransition: true, v7_relativeSplatPath: true };

/* Muestra la ruta actual para comprobar redirecciones */
export function Ubicacion() {
  const { pathname, search } = useLocation();
  return <output data-testid="ubicacion">{pathname + search}</output>;
}
export const rutaActual = () => document.querySelector("[data-testid=ubicacion]").textContent;

/* Renderiza un componente dentro de un router en memoria y del proveedor de avisos.
   ruta: URL inicial · path: patrón de la ruta del componente (para useParams).
   Se usa la opción "wrapper" para que rerender() conserve el router. */
export function renderizar(ui, { ruta = "/", path = "*" } = {}) {
  function Envoltura({ children }) {
    return (
      <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
        <AvisosProvider>
          <Routes>
            <Route path={path} element={children} />
            {path !== "*" && <Route path="*" element={<p>Otra página</p>} />}
          </Routes>
          <Ubicacion />
        </AvisosProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Envoltura });
}

/* Igual que renderizar, pero entrega el contexto que da LayoutAdmin (useOutletContext) */
export function renderizarAdmin(ui, { ruta = "/admin", path = "/admin", esAdmin = true } = {}) {
  const sesion = Sesion.actual() || { nombre: "Ana", tipo: esAdmin ? "Administrador" : "Vendedor", correo: "admin@duoc.cl" };
  const contexto = { abrirMenu: () => {}, menuAbierto: false, sesion, esAdmin };
  function Envoltura({ children }) {
    return (
      <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
        <AvisosProvider>
          <Routes>
            <Route element={<Outlet context={contexto} />}>
              <Route path={path} element={children} />
            </Route>
            <Route path="*" element={<p>Otra página</p>} />
          </Routes>
          <Ubicacion />
        </AvisosProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Envoltura });
}

/* Deja los datos de ejemplo limpios antes de cada prueba */
export function datosLimpios() {
  sessionStorage.clear();
  reiniciarDatos();
}

/* Inicia sesión con un usuario de prueba (admin, vendedor o rosa) */
export function iniciarSesionComo(correo) {
  Sesion.iniciar(Usuarios.buscarPorCorreo(correo));
}

/* Espera hasta que la condición sea verdadera (para navegaciones/transiciones) */
export async function esperar(condicion, ms = 1500) {
  const inicio = Date.now();
  while (Date.now() - inicio < ms) {
    if (condicion()) return true;
    await new Promise(r => setTimeout(r, 15));
  }
  return condicion();
}
