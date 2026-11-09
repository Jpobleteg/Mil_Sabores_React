import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useStore.js";

export default function NoEncontrado() {
  useTitulo("Página no encontrada | Pastelería Mil Sabores");
  return (
    <section className="py-5">
      <div className="container text-center">
        <p style={{ fontSize: "3rem", margin: 0 }}>🍰</p>
        <h1>Página no encontrada</h1>
        <p>La página que buscas no existe o cambió de lugar.</p>
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
