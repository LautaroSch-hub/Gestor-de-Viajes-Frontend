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

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Link to="/" className="text-sm font-semibold text-accent hover:underline">← Volver a los viajes</Link>
      <header className="mb-8 mt-5 rounded-2xl bg-brand-light p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Viajes con Karen</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-dark">Política de privacidad</h1>
        <p className="mt-3 text-sm text-stone-600">Última actualización: {updated}</p>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Esta política explica qué datos podemos recibir cuando usás este sitio, para qué los usamos y cómo podés ejercer tus derechos.
        </p>
      </header>

      <div className="space-y-7 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <Section title="Quién trata los datos">
          <p>El sitio es operado bajo el nombre comercial Viajes con Karen. Para consultas sobre privacidad podés escribir a <a className="font-medium text-accent hover:underline" href="mailto:viajesconkaren.asesora@gmail.com">viajesconkaren.asesora@gmail.com</a>.</p>
        </Section>

        <Section title="Qué información recibimos y para qué">
          <p>Cuando completás una consulta podemos recibir tu nombre, teléfono, correo electrónico, destino de interés y el texto del mensaje. Usamos esos datos para responderte, preparar una propuesta y, si decidís avanzar, gestionar los pasos de tu viaje.</p>
          <p>El sitio también puede recibir datos técnicos básicos necesarios para funcionar y protegerse, como información del navegador y registros de errores. No solicites ni envíes por el formulario datos sensibles, claves, información de tarjetas o documentos que no sean necesarios para tu consulta.</p>
        </Section>

        <Section title="Con quién se pueden compartir">
          <p>No comercializamos tus datos. Para cotizar o gestionar un servicio, podremos comunicar a aerolíneas, alojamientos, operadores turísticos u otros prestadores únicamente la información necesaria para esa gestión y de acuerdo con lo que te informemos. También pueden intervenir proveedores técnicos que alojan o mantienen el sitio, sujetos a deberes de confidencialidad y seguridad.</p>
          <p>Algunos prestadores tecnológicos o turísticos pueden operar desde otros países. Si una gestión requiere comunicar datos fuera de Argentina, se aplicarán las garantías y condiciones previstas por la normativa vigente.</p>
        </Section>

        <Section title="Conservación y seguridad">
          <p>Conservamos la información durante el tiempo necesario para responder la consulta, administrar la relación y cumplir obligaciones legales. Aplicamos medidas razonables para protegerla; ningún sistema de transmisión o almacenamiento puede garantizar seguridad absoluta.</p>
        </Section>

        <Section title="Tus derechos">
          <p>Podés solicitar acceso, actualización, rectificación o supresión de tus datos, y retirar tu consentimiento cuando corresponda, escribiendo al correo indicado arriba. La Ley 25.326 reconoce el derecho de acceso y los derechos de rectificación, actualización y supresión, sujetos a sus condiciones y excepciones.</p>
          <p>La Agencia de Acceso a la Información Pública es el órgano de control de la Ley 25.326 y recibe consultas o reclamos vinculados con la protección de datos personales.</p>
          <p><a className="font-medium text-accent hover:underline" href="https://www.argentina.gob.ar/aaip/datospersonales" target="_blank" rel="noreferrer">Información oficial sobre protección de datos personales</a></p>
        </Section>

        <Section title="Cambios y contacto">
          <p>Podemos actualizar esta política para reflejar cambios en el sitio, en la forma de tratar datos o en la normativa. Publicaremos aquí la versión vigente y su fecha de actualización. Si tenés preguntas, escribinos a <a className="font-medium text-accent hover:underline" href="mailto:viajesconkaren.asesora@gmail.com">viajesconkaren.asesora@gmail.com</a>.</p>
        </Section>
      </div>
    </article>
  )
}
