# Guía paso a paso: conectar PayPal

Esta guía te lleva desde cero hasta cobrar con PayPal en la tienda. Está pensada
para que la sigas sin conocimientos técnicos previos. Tiempo estimado: **15–20
minutos** para el modo de pruebas (sandbox).

> **Resumen de lo que necesitás**
> 1. Una cuenta de PayPal (idealmente **Business**).
> 2. Acceso al **PayPal Developer Dashboard**.
> 3. Crear una **App** para obtener dos claves: `Client ID` y `Secret`.
> 4. Pegar esas claves en el archivo `.env`.
> 5. Probar con una cuenta de comprador de sandbox.
> 6. Cuando funcione, repetir con las claves **Live** (producción).

---

## ⚠️ Antes de empezar: ¿PayPal es lo que te conviene?

- **Público internacional** (compradores fuera de Argentina): PayPal es
  excelente. Seguí esta guía.
- **Cobros dentro de Argentina en pesos**: PayPal tiene limitaciones para
  *recibir* y *retirar* dinero como negocio argentino. Si tu mercado principal es
  local, más adelante conviene sumar **Payway** o **Mercado Pago**. La buena
  noticia: la tienda ya tiene una **capa de pago intercambiable**
  (`src/lib/payments/`), así que agregar otro medio no requiere rehacer el
  checkout. Podés arrancar con PayPal para el exterior y sumar el local después.

---

## Paso 1 · Crear/verificar tu cuenta de PayPal

1. Entrá a **https://www.paypal.com** y creá una cuenta **Business** (Empresa) o
   convertí tu cuenta personal en Business.
2. Verificá tu email y, para producción, completá los datos del negocio
   (razón social, país, etc.).

> Para **probar** (sandbox) no necesitás una cuenta Business verificada: alcanza
> con una cuenta de developer (paso siguiente).

---

## Paso 2 · Entrar al Developer Dashboard

1. Andá a **https://developer.paypal.com/dashboard/**
2. Iniciá sesión con tu cuenta de PayPal.
3. Arriba a la derecha vas a ver un interruptor **Sandbox / Live**:
   - **Sandbox** = entorno de pruebas (dinero ficticio).
   - **Live** = producción (dinero real).

Empezá siempre en **Sandbox**.

---

## Paso 3 · Crear la App y obtener las claves

1. En el menú, entrá a **Apps & Credentials**.
2. Asegurate de estar en la pestaña **Sandbox**.
3. Hacé clic en **Create App**.
4. Ponele un nombre (ej. `Ecuestre Tienda`) y creala.
5. Vas a ver dos valores. Guardalos:
   - **Client ID** → público (va al navegador).
   - **Secret** → **privado** (nunca lo publiques ni lo subas a git).
   Hacé clic en *Show/Copy* en el Secret para verlo.

---

## Paso 4 · Configurar el archivo `.env`

Abrí el archivo `.env` en la raíz del proyecto y completá:

```bash
# Sandbox (pruebas)
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="pega-aca-tu-client-id-de-sandbox"
PAYPAL_CLIENT_SECRET="pega-aca-tu-secret-de-sandbox"

# El navegador necesita el mismo Client ID para mostrar el botón:
NEXT_PUBLIC_PAYPAL_CLIENT_ID="pega-aca-tu-client-id-de-sandbox"

# Moneda del cobro (debe coincidir con la de tus productos)
NEXT_PUBLIC_PAYPAL_CURRENCY="USD"
```

> **Importante:** `PAYPAL_CLIENT_ID` y `NEXT_PUBLIC_PAYPAL_CLIENT_ID` llevan el
> **mismo valor**. Uno lo usa el servidor y el otro el navegador.

Guardá el archivo y **reiniciá** el servidor (`Ctrl+C` y `pnpm dev` de nuevo).
Los valores `NEXT_PUBLIC_*` se leen al iniciar.

---

## Paso 5 · Crear un comprador de prueba (sandbox)

Para probar una compra necesitás una cuenta de **comprador** ficticia:

1. En el Developer Dashboard, andá a **Testing Tools → Sandbox Accounts**.
2. PayPal ya te crea dos cuentas automáticamente: una *Business* (vendedor) y una
   *Personal* (comprador).
3. Hacé clic en la cuenta **Personal**, luego en **View/Edit account**, y anotá:
   - El **email** (algo como `sb-xxxx@personal.example.com`).
   - La **contraseña** (System Generated Password).

---

## Paso 6 · Probar una compra de punta a punta

1. En la tienda (`http://localhost:3000`), agregá un producto al carrito.
2. Andá a **Finalizar compra** → completá email y nombre.
3. Hacé clic en el botón de **PayPal**.
4. En la ventana de PayPal, iniciá sesión con el **comprador de sandbox** del
   paso anterior.
5. Confirmá el pago.
6. Deberías volver a la página de **¡Gracias por tu compra!** con un número de
   orden.
7. Verificá en el **panel admin → Órdenes** que la orden figura como **Pagada** y
   que el **stock se descontó**.

✅ Si esto funciona, la integración está lista.

---

## Paso 7 · Pasar a producción (Live)

Cuando ya probaste todo en sandbox:

1. En el Developer Dashboard, cambiá el interruptor a **Live**.
2. **Apps & Credentials → pestaña Live → Create App** (o usá la que se crea sola).
3. Copiá el **Client ID** y **Secret** de **Live**.
4. En tu `.env` de producción (en el servidor), poné:

   ```bash
   PAYPAL_ENV="live"
   PAYPAL_CLIENT_ID="client-id-de-LIVE"
   PAYPAL_CLIENT_SECRET="secret-de-LIVE"
   NEXT_PUBLIC_PAYPAL_CLIENT_ID="client-id-de-LIVE"
   ```

5. Para que tu cuenta reciba pagos reales, PayPal puede pedirte **confirmar tu
   cuenta Business** (datos del negocio, cuenta bancaria/tarjeta). Seguí los
   avisos en tu cuenta de PayPal.
6. Reconstruí y reiniciá la app. En Docker:

   ```bash
   docker compose --profile prod up -d --build
   ```

   > Recordá: como los valores `NEXT_PUBLIC_*` se "hornean" en el build, hay que
   > **rebuildear** la imagen cuando cambian (el `docker-compose.yml` ya toma
   > esos valores del `.env` como *build args*).

---

## Cómo funciona por dentro (referencia técnica)

El flujo de pago usa la API REST v2 de PayPal (*Orders*), en dos pasos, y **nunca
confía en el navegador** para los montos:

1. **Crear orden** — `POST /api/checkout/create`
   - El servidor recrea la orden con **precios y stock reales de la base**.
   - Crea la orden interna (estado `PENDING`) y la orden de PayPal.
   - Devuelve el `paypalOrderId` al botón.

2. **Capturar** — `POST /api/checkout/capture`
   - El servidor captura el pago en PayPal.
   - **Verifica** que el monto cobrado coincida con el total de la orden.
   - Marca la orden como `PAID` y **descuenta el stock** en una transacción.

Archivos relevantes:

| Archivo                                   | Rol                                        |
| ----------------------------------------- | ------------------------------------------ |
| `src/lib/payments/provider.ts`            | Interfaz común de proveedor de pago        |
| `src/lib/payments/paypal.ts`              | Implementación PayPal (auth, crear, capturar) |
| `src/lib/payments/index.ts`               | Selección del proveedor activo             |
| `src/app/api/checkout/create/route.ts`    | Crea orden interna + orden PayPal          |
| `src/app/api/checkout/capture/route.ts`   | Captura y verifica el pago                 |
| `src/app/(site)/checkout/page.tsx`        | Botón de PayPal en el navegador            |

### Cambiar/sumar otro medio de pago (Payway, Mercado Pago, Stripe)

1. Creá `src/lib/payments/miproveedor.ts` que implemente `PaymentProvider`
   (`createPayment` y `capturePayment`).
2. Elegilo en `getPaymentProvider()` (`src/lib/payments/index.ts`), por ejemplo
   según una variable `PAYMENT_PROVIDER`.
3. No hace falta tocar el checkout ni la lógica de órdenes.

---

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
| ------- | -------------- | -------- |
| No aparece el botón de PayPal | Falta `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Completalo en `.env` y reiniciá |
| "PayPal auth falló: 401" | `Client ID`/`Secret` mal o de otro entorno | Verificá que sean del **mismo** entorno (sandbox o live) |
| El botón carga pero falla al pagar | Moneda no soportada por la cuenta | Usá `USD` o una moneda válida para tu cuenta |
| "El monto pagado no coincide" | Se manipuló el carrito | Es una protección; la orden se rechaza a propósito |
| En Docker no toma el Client ID | Se cambió el `.env` sin rebuildear | `docker compose --profile prod up -d --build` |

---

## (Opcional pero recomendado) Webhooks

Si un comprador cierra la pestaña justo después de pagar, la captura podría no
dispararse desde el navegador. Para cubrir ese caso conviene configurar un
**webhook** de PayPal que notifique al servidor cuando un pago se completa.

Guía oficial: <https://developer.paypal.com/api/rest/webhooks/>. Cuando quieras
sumarlo, se agrega una ruta `POST /api/checkout/webhook` que valida la firma y
finaliza la orden con la misma función `finalizePaidOrder()`.
