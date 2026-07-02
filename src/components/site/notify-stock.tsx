"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/store/toast";

/**
 * Aviso de reposición de stock para productos agotados.
 * Guarda el pedido localmente y confirma; el envío real del email queda para
 * cuando se integre un servicio de correo.
 */
export function NotifyStock({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const push = useToast((s) => s.push);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    try {
      const key = "ecuestre-notify";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ productId, email, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setDone(true);
    push(`Te avisaremos cuando "${productName}" vuelva`);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-brand border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
        <Check className="h-4 w-4" strokeWidth={2} />
        Listo, te avisaremos a {email}.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" strokeWidth={1.5} /> Avisame cuando vuelva
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        aria-label="Email para aviso de stock"
        required
        autoFocus
      />
      <Button type="submit" className="shrink-0">
        Avisarme
      </Button>
    </form>
  );
}
