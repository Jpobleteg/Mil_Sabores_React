/* Badge de color según el estado de una orden */
export default function Estado({ estado }) {
  return <span className={`badge estado-${estado.replace(/\s/g, "-")}`}>{estado}</span>;
}
