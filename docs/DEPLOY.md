# Despliegue en un VPS con Docker

Guía para poner la tienda online en un servidor propio (Ubuntu/Debian) usando
Docker. La app corre en el puerto `3000` y va detrás de un reverse proxy que le
da HTTPS.

---

## 1. Requisitos en el servidor

- Un VPS con Ubuntu 22.04+ (o similar) y acceso SSH.
- Un dominio apuntando (registro **A**) a la IP del servidor.
- Docker + Docker Compose instalados:

  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # relogueá la sesión SSH después de esto
  ```

---

## 2. Traer el código y configurar el entorno

```bash
git clone <tu-repo> ecuestre
cd ecuestre
cp .env.example .env
nano .env
```

Completá en `.env` **como mínimo**:

```bash
# Base de datos (dentro de compose el host es "db")
DATABASE_URL="postgresql://ecuestre:ecuestre@db:5432/ecuestre?schema=public"

# Sitio
NEXT_PUBLIC_SITE_URL="https://tudominio.com"
NEXT_PUBLIC_SITE_NAME="Ecuestre"

# Secreto de sesión (generalo así):  openssl rand -base64 32
AUTH_SECRET="..."

# Primer admin
ADMIN_EMAIL="tu@email.com"
ADMIN_PASSWORD="una-clave-fuerte"

# PayPal (ver docs/PAYPAL.md)
PAYPAL_ENV="live"
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
NEXT_PUBLIC_PAYPAL_CURRENCY="USD"
```

> ⚠️ Cambiá el usuario/clave de la base en `docker-compose.yml` y en
> `DATABASE_URL` para producción. No dejes `ecuestre/ecuestre`.

---

## 3. Levantar la aplicación

```bash
docker compose --profile prod up -d --build
```

Esto:

1. Construye la imagen de la app (incluye `pnpm build`).
2. Levanta **Postgres** y espera a que esté sano.
3. Levanta la app, que **aplica las migraciones** automáticamente al arrancar.

La app queda escuchando en `http://IP_DEL_SERVIDOR:3000`.

### Crear el usuario admin y (opcional) datos demo

El usuario admin se crea con el seed. Para correrlo dentro del contenedor:

```bash
docker compose exec app node node_modules/prisma/build/index.js db seed
```

> Si preferís **no** cargar productos demo, editá `prisma/seed.ts` antes del
> build, o creá el admin manualmente. En una versión productiva conviene un
> script que cree solo el admin.

---

## 4. HTTPS con un reverse proxy (Caddy — la forma más simple)

Caddy saca certificados de Let's Encrypt solo. Instalalo y creá `/etc/caddy/Caddyfile`:

```
tudominio.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

Listo: `https://tudominio.com` sirve la tienda con certificado automático.

> Alternativa con Nginx + certbot: proxy_pass a `http://127.0.0.1:3000` y
> certificado con `certbot --nginx`.

---

## 5. Operación diaria

| Acción | Comando |
| ------ | ------- |
| Ver logs de la app | `docker compose logs -f app` |
| Reiniciar | `docker compose --profile prod restart app` |
| Actualizar (deploy) | `git pull && docker compose --profile prod up -d --build` |
| Parar todo | `docker compose --profile prod down` |
| Backup de la base | ver abajo |

### Backup de la base de datos

```bash
docker compose exec db pg_dump -U ecuestre ecuestre > backup_$(date +%F).sql
```

Restaurar:

```bash
cat backup_YYYY-MM-DD.sql | docker compose exec -T db psql -U ecuestre ecuestre
```

### Imágenes subidas

Las imágenes que cargás desde el admin se guardan en el volumen
`ecuestre-uploads` (montado en `/app/public/uploads`). Persisten entre deploys.
Para backup, copiá ese volumen o usá un almacenamiento externo (S3/Cloudinary)
más adelante.

---

## 6. Checklist antes de abrir al público

- [ ] `AUTH_SECRET` aleatorio y `ADMIN_PASSWORD` fuerte.
- [ ] Usuario/clave de Postgres cambiados.
- [ ] `PAYPAL_ENV="live"` con credenciales Live probadas.
- [ ] `NEXT_PUBLIC_SITE_URL` con tu dominio real (`https://…`).
- [ ] HTTPS funcionando (candado en el navegador).
- [ ] Una compra de prueba real de bajo monto, verificada en Órdenes.
- [ ] Backups programados (cron con `pg_dump`).
