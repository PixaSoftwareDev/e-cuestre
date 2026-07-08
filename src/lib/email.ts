import "server-only";
import { formatMoney } from "@/lib/money";

/**
 * Envío de emails transaccionales.
 *
 * Está preparado para Resend (https://resend.com) vía su API HTTP — no necesita
 * instalar dependencias. Mientras no exista `RESEND_API_KEY`, las funciones no
 * envían nada (loguean y siguen), así el checkout funciona igual sin credenciales.
 * Cuando cargues la key, los correos empiezan a salir solos.
 *
 * Variables (.env):
 *   RESEND_API_KEY       clave de Resend (activa el envío)
 *   EMAIL_FROM           remitente, ej. "Ecuestre <ventas@tudominio.com>"
 *   ADMIN_NOTICE_EMAIL   a dónde te avisamos las ventas (si no, usa ADMIN_EMAIL)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Ecuestre <onboarding@resend.dev>";
const ADMIN_NOTICE_EMAIL =
  process.env.ADMIN_NOTICE_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Ecuestre";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** True si el envío de emails está configurado (hay API key). */
export const emailEnabled = Boolean(RESEND_API_KEY);

/** Envía un email vía Resend. No-op (sólo log) si falta RESEND_API_KEY. */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[email] deshabilitado (sin RESEND_API_KEY) · "${subject}" → ${to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] fallo Resend:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] excepción:", err);
    return false;
  }
}

export type OrderForEmail = {
  number: string;
  email: string;
  customerName?: string | null;
  total: number;
  currency: string;
  items: {
    name: string;
    variantName?: string | null;
    quantity: number;
    lineTotal: number;
  }[];
};

// ── Plantillas ─────────────────────────────────────────────────────────────

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f3ec;font-family:Arial,Helvetica,sans-serif;color:#1c1a17">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;font-size:22px;letter-spacing:.02em;color:#1f3d2b;font-weight:bold;margin-bottom:24px">${SITE_NAME}</div>
      <div style="background:#fff;border:1px solid #e7e1d6;border-radius:12px;padding:28px">
        <h1 style="margin:0 0 8px;font-size:20px">${title}</h1>
        ${body}
      </div>
      <p style="text-align:center;color:#7a736a;font-size:12px;margin-top:20px">${SITE_NAME}${SITE_URL ? ` · ${SITE_URL}` : ""}</p>
    </div></body></html>`;
}

function itemsTable(order: OrderForEmail): string {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${i.name}${i.variantName ? ` · <span style="color:#7a736a">${i.variantName}</span>` : ""} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${formatMoney(i.lineTotal, order.currency)}</td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      ${rows}
      <tr><td style="padding:12px 0 0;font-weight:bold">Total</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:bold">${formatMoney(order.total, order.currency)}</td></tr>
    </table>`;
}

// ── Emails de alto nivel (best-effort; nunca lanzan) ───────────────────────

/** Confirmación de compra al cliente. */
export async function sendOrderConfirmation(order: OrderForEmail): Promise<void> {
  const html = shell(
    `¡Gracias por tu compra, ${order.customerName ?? ""}!`.trim() + " 🐎",
    `<p style="font-size:14px;line-height:1.6">Recibimos tu pedido <strong>#${order.number}</strong> y ya lo estamos preparando. Te avisamos cuando salga el envío.</p>
     ${itemsTable(order)}`,
  );
  await sendEmail({
    to: order.email,
    subject: `Tu pedido #${order.number} · ${SITE_NAME}`,
    html,
  });
}

/** Aviso de nueva venta al administrador. */
export async function notifyAdminNewOrder(order: OrderForEmail): Promise<void> {
  if (!ADMIN_NOTICE_EMAIL) return;
  const html = shell(
    "Nueva venta 🎉",
    `<p style="font-size:14px;line-height:1.6">Pedido <strong>#${order.number}</strong> de ${order.customerName ?? "—"} (${order.email}).</p>
     ${itemsTable(order)}
     ${SITE_URL ? `<p style="margin-top:16px"><a href="${SITE_URL}/admin/ordenes" style="color:#1f3d2b">Ver en el panel →</a></p>` : ""}`,
  );
  await sendEmail({
    to: ADMIN_NOTICE_EMAIL,
    subject: `🎉 Nueva venta #${order.number} · ${formatMoney(order.total, order.currency)}`,
    html,
  });
}

/** Aviso al cliente de que su pedido fue enviado. */
export async function sendOrderShipped(order: OrderForEmail): Promise<void> {
  const html = shell(
    "Tu pedido va en camino 📦",
    `<p style="font-size:14px;line-height:1.6">Despachamos tu pedido <strong>#${order.number}</strong>. ¡Que lo disfrutes!</p>
     ${itemsTable(order)}`,
  );
  await sendEmail({
    to: order.email,
    subject: `Tu pedido #${order.number} fue enviado · ${SITE_NAME}`,
    html,
  });
}
