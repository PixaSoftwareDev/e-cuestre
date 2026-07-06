"use client";

import { useActionState, use, useRef } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { loginAction, type LoginState } from "../auth-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo } from "@/components/site/logo";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = use(searchParams);
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  const quickLogin = () => {
    const f = formRef.current;
    if (!f) return;
    (f.elements.namedItem("email") as HTMLInputElement).value =
      "admin@ecuestre.com";
    (f.elements.namedItem("password") as HTMLInputElement).value =
      "cambiame123";
    f.requestSubmit();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6">
      {/* Aura decorativa (blobs difuminados con los colores de marca) */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Logo
            className="justify-center"
            imgClassName="h-11"
            textClassName="text-3xl"
          />
          <p className="mt-3 kicker text-accent">Administración</p>
          <p className="mt-1 text-sm text-muted">
            Ingresá para gestionar la tienda
          </p>
        </div>

        <form
          ref={formRef}
          action={action}
          className="space-y-4 rounded-2xl border border-border bg-card/80 p-7 shadow-[var(--shadow-lift)] backdrop-blur-sm"
        >
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@ecuestre.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
          {state.error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-brand bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
            >
              {state.error}
            </motion.p>
          )}
          <Button type="submit" className="w-full" loading={pending}>
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>

          {(process.env.NODE_ENV !== "production" ||
            process.env.NEXT_PUBLIC_QUICK_LOGIN === "on") && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={quickLogin}
            >
              Acceso rápido (demo)
            </Button>
          )}
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Lock className="h-3 w-3" strokeWidth={1.5} /> Acceso privado · Conexión
          segura
        </p>
      </motion.div>
    </div>
  );
}
