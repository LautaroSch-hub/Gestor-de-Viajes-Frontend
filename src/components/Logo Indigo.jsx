// Logo de la marca sobre su propio fondo marfil (el logo tiene texto azul oscuro,
// así que se muestra en un recuadro claro cuando va sobre el azul del header/footer).
export default function IndigoLogo({ className = 'h-16' }) {
  return (
    <span className="inline-block rounded-xl p-1.5 shadow-sm">
      <img src="/indigo.png" alt="Viajes con Karen" className={`block w-auto ${className}`} />
    </span>
  )
}
