"use client";

import { useActionState, use } from "react";
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo
            className="justify-center"
            imgClassName="h-10"
            textClassName="text-3xl"
          />
          <p className="mt-3 kicker text-accent">Administración</p>
          <p className="mt-1 text-sm text-muted">Ingresá para gestionar la tienda</p>
        </div>
        <form
          action={action}
          className="space-y-4 rounded-brand border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
        >
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error && (
            <p className="rounded-brand bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {state.error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={pending}>
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
