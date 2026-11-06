import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const updated = '23 de octubre de 2026'

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
      <div className="space-y-2 text-sm leading-7 text-stone-600">{children}</div>
    </section>
  )
}

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Link to="/" className="text-sm font-semibold text-accent hover:underline">← Volver a los viajes</Link>
      <header className="mb-8 mt-5 rounded-2xl bg-brand-light p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Viajes con Karen</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-dark">Términos y condiciones</h1>
        <p className="mt-3 text-sm text-stone-600">Última actualización: {updated}</p>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Estas condiciones describen el uso del sitio y el proceso general de consulta. Las condiciones particulares de cada viaje se informan antes de confirmar una contratación.
        </p>
      </header>

      <div className="space-y-7 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <Section title="Uso del sitio y consultas">
          <p>Podés explorar los viajes publicados y enviar consultas por los medios disponibles. Enviar una consulta no constituye una reserva, compra ni confirmación de disponibilidad. La contratación solo queda confirmada cuando recibís una confirmación expresa con el itinerario, los servicios incluidos, el precio final, la forma de pago y las condiciones aplicables.</p>
          <p>Actualmente este sitio no procesa pagos ni emite pasajes o vouchers. No envíes datos de tarjetas o claves por sus formularios.</p>
        </Section>

        <Section title="Información, precios y disponibilidad">
          <p>La información publicada es orientativa y puede estar sujeta a disponibilidad, fechas, cupos, cambios de tarifas, impuestos y condiciones del prestador. Antes de contratar, solicitá la cotización final y verificá por escrito moneda, vigencia, servicios incluidos y excluidos, equipaje, escalas, alojamiento, régimen de comidas, traslados, tasas y cargos adicionales.</p>
          <p>Una publicación o cotización no reemplaza la confirmación del proveedor. Si hubiera una diferencia o un cambio, se te informará antes de confirmar la contratación para que puedas decidir cómo continuar.</p>
        </Section>

        <Section title="Prestadores y condiciones del viaje">
          <p>Los viajes pueden incluir servicios de aerolíneas, hoteles, navieras, operadores, transportistas y otros prestadores. Cada servicio puede tener reglas propias sobre documentación, horarios, equipaje, cambios, cancelaciones y reembolsos. Esas reglas y el rol de cada parte se informarán con la propuesta y la documentación de viaje. Se aplican sin limitar los derechos que reconoce la legislación de defensa del consumidor.</p>
          <p>La persona viajera debe revisar que los nombres y datos de la documentación coincidan con sus documentos, y consultar con anticipación los requisitos de ingreso, visados, vacunas y documentación del destino. Los requisitos pueden cambiar; verificá la información oficial correspondiente antes de viajar.</p>
        </Section>

        <Section title="Cambios, cancelaciones e imprevistos">
          <p>Para solicitar un cambio o cancelación, contactanos cuanto antes por el mismo canal de atención. Los costos, plazos y reembolsos dependerán de las condiciones confirmadas de cada servicio y de la normativa aplicable. Te informaremos cualquier cargo del prestador antes de gestionarlo cuando sea posible.</p>
          <p>Si un prestador modifica o cancela un servicio, te comunicaremos las alternativas disponibles conforme a las condiciones contratadas y los derechos legales que correspondan. Estas condiciones no eliminan garantías o derechos irrenunciables de consumidores.</p>
        </Section>

        <Section title="Contrataciones a distancia y derecho de arrepentimiento">
          <p>Cuando corresponda legalmente, se respetará el derecho de revocación o arrepentimiento en contrataciones a distancia y sus plazos. Para determinados servicios turísticos con fecha determinada pueden existir requisitos especiales de notificación. Consultanos antes de contratar sobre el procedimiento aplicable a tu servicio.</p>
          <p>La normativa argentina exige mecanismos específicos para ejercer este derecho cuando se comercializan servicios a distancia. Si el sitio incorpora reservas o compras en línea, se habilitará el canal correspondiente de acuerdo con la regulación vigente.</p>
          <p><a className="font-medium text-accent hover:underline" href="https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-954-2025-417152/texto" target="_blank" rel="noreferrer">Consultar normativa oficial sobre el derecho de arrepentimiento</a></p>
        </Section>

        <Section title="Atención y legislación aplicable">
          <p>Para consultas sobre estas condiciones o sobre un viaje, escribinos a <a className="font-medium text-accent hover:underline" href="mailto:viajesconkaren.asesora@gmail.com">viajesconkaren.asesora@gmail.com</a> o al WhatsApp indicado en el pie del sitio. Se aplican las leyes de la República Argentina, incluida la normativa de defensa del consumidor. Podés acudir a los canales oficiales de defensa del consumidor de tu jurisdicción.</p>
          <p><a className="font-medium text-accent hover:underline" href="https://www.argentina.gob.ar/produccion/defensadelconsumidor" target="_blank" rel="noreferrer">Canales oficiales de Defensa del Consumidor</a></p>
        </Section>
      </div>
    </article>
  )
}
