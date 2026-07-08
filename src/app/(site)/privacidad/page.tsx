import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidad" };

const LAST_UPDATED = "8 de julio de 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-2xl md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="kicker text-accent">Legales</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-sm text-muted">
          Última actualización: {LAST_UPDATED}
        </p>
      </header>

      <div className="max-w-3xl">
        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de tus datos personales es{" "}
            <strong>[Razón social]</strong>, CUIT <strong>[CUIT]</strong>, con
            domicilio en <strong>[Domicilio legal]</strong> (en adelante,
            &laquo;Ecuestre&raquo;). Esta Política describe qué datos recolectamos,
            con qué finalidad, con quién los compartimos y qué derechos te asisten.
          </p>
        </Section>

        <Section title="2. Datos que recolectamos">
          <p>
            Recolectamos únicamente los datos necesarios para gestionar tu compra
            y brindarte una mejor experiencia:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Datos de identificación y contacto: nombre y apellido, correo
              electrónico y teléfono.
            </li>
            <li>
              Dirección de envío y de facturación necesarias para procesar y
              entregar tus pedidos.
            </li>
            <li>
              Datos de tu pedido: productos adquiridos, historial de compras y
              comunicaciones que mantengas con nosotros.
            </li>
            <li>
              Datos de navegación: información técnica y de uso del Sitio recogida
              mediante cookies y herramientas de analítica.
            </li>
          </ul>
          <p>
            <strong>
              Los pagos son procesados por terceros y no almacenamos datos de tu
              tarjeta.
            </strong>{" "}
            La información sensible de pago es gestionada de forma segura por los
            proveedores correspondientes (por ejemplo, Mercado Pago o PayPal).
          </p>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <p>Utilizamos tus datos personales para:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Procesar, gestionar y entregar tus pedidos.</li>
            <li>
              Gestionar pagos, facturación, cambios, devoluciones y garantías.
            </li>
            <li>
              Comunicarnos con vos respecto del estado de tu compra y responder
              tus consultas.
            </li>
            <li>
              Enviarte novedades y promociones, únicamente si prestaste tu
              consentimiento, pudiendo darte de baja en cualquier momento.
            </li>
            <li>
              Mejorar el Sitio, prevenir fraudes y cumplir con obligaciones
              legales.
            </li>
          </ul>
        </Section>

        <Section title="4. Cookies y analítica">
          <p>
            El Sitio utiliza cookies y tecnologías similares para su correcto
            funcionamiento, para recordar tus preferencias y para analizar de
            forma estadística el comportamiento de navegación. Podés configurar tu
            navegador para bloquear o eliminar las cookies; sin embargo, algunas
            funciones del Sitio podrían dejar de operar correctamente. Las
            herramientas de analítica nos ayudan a comprender cómo se usa el Sitio
            para poder mejorarlo.
          </p>
        </Section>

        <Section title="5. Con quién compartimos tus datos">
          <p>
            No vendemos ni cedemos tus datos personales. Solo los compartimos con
            terceros cuando resulta necesario para prestar el servicio:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Proveedores de pago</strong> (como Mercado Pago o PayPal),
              para procesar las transacciones.
            </li>
            <li>
              <strong>Proveedores de envío y logística</strong>, para entregar tus
              pedidos en la dirección indicada.
            </li>
            <li>
              Autoridades u organismos públicos, cuando exista una obligación
              legal de informar.
            </li>
          </ul>
          <p>
            Estos terceros solo acceden a los datos indispensables para cumplir su
            función y están obligados a tratarlos de forma confidencial.
          </p>
        </Section>

        <Section title="6. Conservación de los datos">
          <p>
            Conservamos tus datos personales durante el tiempo necesario para
            cumplir con las finalidades descriptas y con las obligaciones legales,
            contables y fiscales que correspondan. Una vez cumplidos dichos
            plazos, los datos son suprimidos o anonimizados de forma segura.
          </p>
        </Section>

        <Section title="7. Seguridad">
          <p>
            Adoptamos medidas técnicas y organizativas razonables para proteger
            tus datos personales contra el acceso no autorizado, la pérdida, la
            alteración o la divulgación indebida. Ninguna transmisión por internet
            es completamente segura, por lo que no podemos garantizar una
            seguridad absoluta, aunque trabajamos para minimizar los riesgos.
          </p>
        </Section>

        <Section title="8. Tus derechos (Ley 25.326)">
          <p>
            De acuerdo con la <strong>Ley 25.326 de Protección de Datos
            Personales</strong> de la República Argentina, como titular de los
            datos tenés derecho a acceder, rectificar, actualizar y suprimir tu
            información personal, así como a solicitar su confidencialidad. El
            titular de los datos personales tiene la facultad de ejercer el
            derecho de acceso en forma gratuita a intervalos no inferiores a seis
            meses, salvo que se acredite un interés legítimo al efecto.
          </p>
          <p>
            Para ejercer estos derechos, escribinos a{" "}
            <strong>[Email de contacto]</strong>. La{" "}
            <strong>
              Agencia de Acceso a la Información Pública (AAIP)
            </strong>
            , en su carácter de órgano de control de la Ley 25.326, tiene la
            atribución de atender las denuncias y reclamos que se interpongan con
            relación al incumplimiento de las normas sobre protección de datos
            personales.
          </p>
        </Section>

        <Section title="9. Cambios en esta Política">
          <p>
            Podemos actualizar esta Política de Privacidad para reflejar cambios
            legales u operativos. Publicaremos la versión vigente en esta página,
            indicando la fecha de última actualización.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p>
            Ante cualquier consulta sobre el tratamiento de tus datos personales,
            podés escribirnos a <strong>[Email de contacto]</strong> o comunicarte
            al <strong>[Teléfono]</strong>.
          </p>
        </Section>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted">
          Este texto es un modelo orientativo y no constituye asesoramiento
          legal. Debe ser revisado y adaptado por un profesional del derecho
          antes de su uso definitivo.
        </p>
      </div>
    </div>
  );
}
