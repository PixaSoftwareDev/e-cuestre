import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cambios y Devoluciones" };

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

export default function DevolucionesPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="kicker text-accent">Legales</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">
          Cambios y Devoluciones
        </h1>
        <p className="mt-4 text-sm text-muted">
          Última actualización: {LAST_UPDATED}
        </p>
      </header>

      <div className="max-w-3xl">
        <Section title="1. Derecho de arrepentimiento (10 días)">
          <p>
            Si realizaste tu compra a través del Sitio, tenés derecho a revocarla
            dentro de los <strong>10 (diez) días corridos</strong> contados a
            partir de la recepción del producto, sin necesidad de expresar el
            motivo y sin penalidad alguna. Este derecho está previsto en el{" "}
            <strong>artículo 34 de la Ley 24.240 de Defensa del Consumidor</strong>{" "}
            y en el <strong>artículo 1110 del Código Civil y Comercial de la
            Nación</strong> para las operaciones celebradas fuera de los locales
            comerciales y a distancia.
          </p>
          <p>
            Para ejercerlo, alcanza con que nos comuniques tu decisión dentro del
            plazo indicado. El producto deberá restituirse en las condiciones
            detalladas en el punto siguiente.
          </p>
        </Section>

        <Section title="2. Condiciones para la devolución">
          <p>
            Para aceptar una devolución o cambio, el producto debe cumplir las
            siguientes condiciones:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Estar sin uso, sin lavar y sin señales de haber sido utilizado.</li>
            <li>
              Conservar sus etiquetas originales, envases y accesorios tal como
              fue recibido.
            </li>
            <li>
              Presentarse junto con el comprobante de compra o número de pedido.
            </li>
          </ul>
          <p>
            No se aceptan devoluciones de productos de uso íntimo o de aquellos que
            por razones de higiene no puedan ser reintegrados una vez abiertos,
            salvo defecto de fabricación.
          </p>
        </Section>

        <Section title="3. Cómo iniciar el pedido">
          <p>
            Para iniciar un cambio o una devolución, escribinos a{" "}
            <strong>[Email de contacto]</strong> indicando tu número de pedido, el
            producto involucrado y el motivo. Te responderemos con los pasos a
            seguir y la dirección a la que deberás enviar el producto o el punto de
            entrega correspondiente.
          </p>
        </Section>

        <Section title="4. Costos de envío de la devolución">
          <p>
            Cuando la devolución se origine en el ejercicio del derecho de
            arrepentimiento, y conforme a la normativa de defensa del consumidor,
            el consumidor no debe soportar gasto alguno por la restitución de la
            mercadería; el costo del envío de retorno queda a cargo de{" "}
            <strong>[Razón social]</strong>. En los cambios por talle o
            preferencia, el costo del envío de la devolución podrá quedar a cargo
            del cliente, según se acuerde al iniciar el pedido. En caso de producto
            fallado o error en el envío, todos los costos son cubiertos por
            nosotros.
          </p>
        </Section>

        <Section title="5. Plazos de reintegro">
          <p>
            Una vez recibido el producto y verificado que cumple con las
            condiciones establecidas, procesaremos el reintegro dentro de un plazo
            estimado de <strong>[cantidad de días hábiles]</strong>. El reembolso
            se realizará por el mismo medio de pago utilizado en la compra; los
            plazos de acreditación pueden variar según la entidad bancaria o el
            proveedor de pago.
          </p>
        </Section>

        <Section title="6. Cambios por talle o preferencia">
          <p>
            Podés solicitar el cambio de un producto por otro talle, color o
            modelo, sujeto a disponibilidad de stock, siempre que el artículo
            cumpla las condiciones del punto 2. Si el nuevo producto tuviera un
            valor diferente, se ajustará la diferencia a favor de la parte que
            corresponda.
          </p>
        </Section>

        <Section title="7. Productos con falla o defecto">
          <p>
            Si recibiste un producto con un defecto de fabricación o distinto al
            solicitado, contactanos dentro de los plazos legales de garantía. Nos
            haremos cargo de la reparación, el cambio o la devolución del importe,
            según corresponda, sin costo de envío para vos, de acuerdo con lo
            previsto en la Ley 24.240 de Defensa del Consumidor.
          </p>
        </Section>

        <Section title="8. Contacto">
          <p>
            Para cualquier consulta sobre cambios y devoluciones, escribinos a{" "}
            <strong>[Email de contacto]</strong> o comunicate al{" "}
            <strong>[Teléfono]</strong>. Estamos para ayudarte.
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
