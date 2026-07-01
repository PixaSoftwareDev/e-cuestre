# Ecuestre · E-commerce premium multi-marca

Tienda online de alta gama para el mundo del polo y la vida ecuestre. Diseño
fino y adaptable por marca, carrito moderno, checkout con PayPal, panel de
administración privado con métricas y grabación de sesiones.

---

## ✨ Características

- **Diseño premium y adaptable.** Cada marca define su propia identidad visual
  (colores, radios) que re-tematiza toda la tienda sin duplicar código.
- **Catálogo multi-marca** con productos, variantes (talles/colores) y stock.
- **Carrito moderno** con drawer deslizante y persistencia local.
- **Checkout con PayPal** (capa de pago abstracta: fácil de cambiar a Payway,
  Mercado Pago o Stripe más adelante).
- **Panel de administración privado** (`/admin`): carga de productos con
  imágenes, gestión de stock, órdenes, y editor visual de marcas.
- **Métricas** de negocio: ingresos, embudo de conversión, más vendidos y más
  vistos (qué se vende y qué no).
- **Grabación de sesiones** (rrweb) con reproductor integrado para ver cómo
  navegan los visitantes.
- **Responsive** y optimizado para todas las medidas.
- **SEO**: metadata, Open Graph y generación estática de productos/marcas.

## 🧱 Stack

| Capa             | Tecnología                                 |
| ---------------- | ------------------------------------------ |
| Framework        | Next.js 16 (App Router, React 19, RSC)     |
| Lenguaje         | TypeScript                                 |
| Estilos          | Tailwind CSS v4 + design tokens por marca  |
| Base de datos    | PostgreSQL + Prisma ORM                     |
| Estado (carrito) | Zustand                                    |
| Pagos            | PayPal (capa abstracta e intercambiable)   |
| Gráficos         | Recharts                                   |
| Animaciones      | Motion (Framer Motion)                     |
| Grabación        | rrweb + rrweb-player                        |
| Auth admin       | JWT (jose) en cookie httpOnly + bcrypt     |
| Deploy           | Docker + Docker Compose                    |

---

## 🚀 Puesta en marcha (desarrollo)

### Requisitos

- **Node.js 24 LTS** (recomendado). Con Node 25 anda, pero Prisma sugiere LTS.
- **pnpm** (`corepack enable`).
- **Docker** (para la base de datos).

### Pasos

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno (revisá y editá los valores)
cp .env.example .env

# 3. Levantar PostgreSQL (contenedor)
docker compose up -d db

# 4. Crear las tablas
pnpm db:migrate

# 5. Cargar datos demo (3 marcas + productos + usuario admin)
pnpm db:seed

# 6. Arrancar en desarrollo
pnpm dev
```

Abrí **http://localhost:3000**.

> ℹ️ El `docker-compose.yml` mapea Postgres al puerto **5435** del host (para no
> chocar con otras bases). Si querés otro puerto, cambialo ahí y en `DATABASE_URL`.

### Acceso al panel admin

- URL: **http://localhost:3000/admin**
- Usuario y contraseña: los definidos en `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Por defecto del seed: `admin@ecuestre.com` / `cambiame123` **(cambialos).**

---

## 💳 Pagos con PayPal

El checkout ya está integrado con PayPal. Para activarlo necesitás tus
credenciales. La guía completa paso a paso está en:

### 👉 [`docs/PAYPAL.md`](docs/PAYPAL.md)

Sin credenciales, la tienda funciona igual y el checkout muestra un aviso de que
PayPal no está configurado (útil para desarrollo).

---

## 🐳 Despliegue en producción (VPS con Docker)

Guía detallada en [`docs/DEPLOY.md`](docs/DEPLOY.md). Resumen:

```bash
# En el servidor, con el repo clonado y el .env completo:
docker compose --profile prod up -d --build
```

Esto levanta **Postgres + la app**. El contenedor de la app corre las
migraciones automáticamente al arrancar. La app queda en el puerto `3000`
(poné un Nginx/Caddy adelante para HTTPS).

---

## 📜 Scripts útiles

| Comando            | Qué hace                                     |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Servidor de desarrollo                       |
| `pnpm build`       | Build de producción                          |
| `pnpm start`       | Sirve el build                               |
| `pnpm db:migrate`  | Crea/aplica migraciones (dev)                |
| `pnpm db:seed`     | Carga datos demo                             |
| `pnpm db:studio`   | Explorador visual de la base (Prisma Studio) |
| `pnpm db:generate` | Regenera el cliente Prisma                   |

---

## 🗂️ Estructura del proyecto

```
prisma/
  schema.prisma        # Modelo de datos
  seed.ts              # Datos demo
src/
  app/
    (site)/            # Tienda pública (home, catálogo, producto, marca, carrito, checkout)
    admin/             # Panel privado (productos, marcas, órdenes, métricas, grabaciones)
    api/               # Rutas: analytics, recordings, checkout (PayPal), upload
  components/
    ui/                # Componentes base (button, card, input…)
    site/              # Navbar, footer, product card, theming…
    cart/              # Carrito (drawer, add-to-cart)
    admin/             # Sidebar, charts, formularios, player
  lib/
    prisma.ts          # Cliente Prisma
    theme.ts           # Sistema de theming por marca
    payments/          # Capa de pago abstracta + PayPal
    orders.ts          # Creación/finalización de órdenes
    metrics.ts         # Consultas de métricas
    auth.ts            # Sesión del admin
  store/cart.ts        # Estado del carrito (Zustand)
  proxy.ts             # Protección de /admin (ex "middleware")
docs/                  # PAYPAL.md, DEPLOY.md
```

---

## 🔐 Notas de seguridad

- Cambiá `AUTH_SECRET`, `ADMIN_PASSWORD` y las credenciales de la base antes de
  producción.
- Los precios y el stock se **validan siempre en el servidor** al crear la orden;
  nunca se confía en el monto que envía el navegador.
- El monto capturado por PayPal se **verifica** contra el total de la orden.

## 🛣️ Próximos pasos sugeridos

- Emails transaccionales (confirmación de compra).
- Webhooks de PayPal para robustez ante cierres de pestaña.
- Cupones/descuentos y cálculo de envío por zona.
- Segundo medio de pago local (Payway / Mercado Pago) usando la misma capa.
