import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos y Condiciones" };

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

export default function TerminosPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="kicker text-accent">Legales</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">
          Términos y Condiciones
        </h1>
        <p className="mt-4 text-sm text-muted">
          Última actualización: {LAST_UPDATED}
        </p>
      </header>

      <div className="max-w-3xl">
        <Section title="1. Aceptación de los términos">
          <p>
            Los presentes Términos y Condiciones regulan el acceso y la
            utilización del sitio web de Ecuestre (en adelante, el
            &laquo;Sitio&raquo;), operado por <strong>[Razón social]</strong>,
            CUIT <strong>[CUIT]</strong>, con domicilio legal en{" "}
            <strong>[Domicilio legal]</strong>. Al navegar, registrarte o
            realizar una compra en el Sitio, declarás haber leído, comprendido y
            aceptado en su totalidad estos Términos y Condiciones. Si no estás de
            acuerdo con alguna de sus cláusulas, te pedimos que no utilices el
            Sitio.
          </p>
        </Section>

        <Section title="2. Uso del Sitio">
          <p>
            Te comprometés a utilizar el Sitio de conformidad con la ley, la
            moral, el orden público y las presentes condiciones. Está prohibido
            emplear el Sitio con fines ilícitos, lesivos de los derechos e
            intereses de terceros, o que de cualquier forma puedan dañar,
            inutilizar o sobrecargar el Sitio, o impedir su normal uso por parte
            de otros usuarios.
          </p>
          <p>
            Debés ser mayor de edad y contar con capacidad legal suficiente para
            contratar. Sos responsable de la veracidad de la información que
            proporciones y del uso que hagas de tu conexión y de tus
            dispositivos al acceder al Sitio.
          </p>
        </Section>

        <Section title="3. Cuenta y pedidos">
          <p>
            Para realizar una compra podés hacerlo como invitado o creando una
            cuenta. En caso de registrarte, sos responsable de mantener la
            confidencialidad de tus credenciales de acceso y de todas las
            operaciones que se realicen desde tu cuenta. Notificanos de
            inmediato ante cualquier uso no autorizado.
          </p>
          <p>
            Cada pedido constituye una oferta de compra sujeta a nuestra
            aceptación. Nos reservamos el derecho de rechazar o cancelar un
            pedido ante errores de precio o de descripción, indisponibilidad de
            stock, sospecha de fraude o imposibilidad de validar los datos de
            pago o envío. En tales casos, si el pago ya se hubiera efectuado, se
            procederá al reintegro correspondiente.
          </p>
        </Section>

        <Section title="4. Precios y disponibilidad">
          <p>
            Todos los precios se expresan en pesos argentinos (ARS) e incluyen
            los impuestos aplicables, salvo que se indique lo contrario. Los
            precios y las promociones pueden variar sin previo aviso; el precio
            vigente será el exhibido al momento de confirmar la compra. Los
            costos de envío, cuando correspondan, se informan antes de finalizar
            el pedido.
          </p>
          <p>
            La disponibilidad de los productos está sujeta a stock. Realizamos
            esfuerzos razonables para que la información de disponibilidad sea
            precisa, pero no garantizamos que todos los artículos exhibidos se
            encuentren disponibles en todo momento.
          </p>
        </Section>

        <Section title="5. Proceso de compra">
          <p>
            El proceso de compra consiste en seleccionar los productos, agregarlos
            al carrito, indicar los datos de envío y facturación, elegir el medio
            de pago y confirmar el pedido. Una vez confirmada y acreditada la
            operación, recibirás un correo electrónico con el detalle de tu
            compra. Ese comprobante no implica la aceptación definitiva del
            pedido, la cual queda sujeta a la validación del pago y a la
            disponibilidad de stock.
          </p>
        </Section>

        <Section title="6. Medios de pago">
          <p>
            Los pagos se procesan a través de plataformas de terceros, como{" "}
            <strong>Mercado Pago</strong> y <strong>PayPal</strong>. Estas
            plataformas cuentan con sus propios términos y políticas de
            privacidad, que te recomendamos leer. Ecuestre no almacena los datos
            completos de tu tarjeta ni de tus medios de pago: dicha información es
            gestionada de forma segura por el proveedor de pago seleccionado.
          </p>
        </Section>

        <Section title="7. Propiedad intelectual">
          <p>
            Todos los contenidos del Sitio —incluyendo, sin limitación, la marca
            &laquo;Ecuestre&raquo;, logotipos, textos, imágenes, fotografías,
            diseños, gráficos y el software— son propiedad de{" "}
            <strong>[Razón social]</strong> o de sus licenciantes y se encuentran
            protegidos por la normativa de propiedad intelectual e industrial.
            Queda prohibida su reproducción, distribución, comunicación pública o
            transformación total o parcial sin autorización previa y por escrito
            de su titular.
          </p>
        </Section>

        <Section title="8. Responsabilidad">
          <p>
            Ecuestre no será responsable por daños o perjuicios derivados de
            interrupciones, fallas o errores en el acceso al Sitio, ni por la
            presencia de virus u otros elementos lesivos ajenos a nuestro control.
            Realizamos esfuerzos razonables para que la información publicada
            (descripciones, colores, medidas e imágenes) sea correcta, aunque
            pueden existir diferencias menores respecto del producto real. Nuestra
            responsabilidad se limita, en todos los casos, al valor del producto
            adquirido, en la medida permitida por la legislación vigente.
          </p>
        </Section>

        <Section title="9. Modificaciones de los términos">
          <p>
            Podemos modificar estos Términos y Condiciones en cualquier momento.
            Las modificaciones entrarán en vigencia desde su publicación en el
            Sitio. A las compras ya confirmadas se les aplicará la versión vigente
            al momento de la operación. Te sugerimos revisar esta página
            periódicamente.
          </p>
        </Section>

        <Section title="10. Ley aplicable y jurisdicción">
          <p>
            Estos Términos y Condiciones se rigen por las leyes de la República
            Argentina. Para cualquier controversia derivada del uso del Sitio o de
            las compras realizadas, las partes se someten a la jurisdicción de los
            tribunales ordinarios competentes de{" "}
            <strong>[Ciudad/Provincia]</strong>, sin perjuicio de la jurisdicción
            que pudiera corresponder por normas de defensa del consumidor.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p>
            Ante cualquier consulta sobre estos Términos y Condiciones, podés
            escribirnos a <strong>[Email de contacto]</strong> o comunicarte al{" "}
            <strong>[Teléfono]</strong>.
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
