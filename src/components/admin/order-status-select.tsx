"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { updateOrderStatus } from "@/app/admin/ordenes/actions";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Select
      className="h-9 w-36 text-xs"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await updateOrderStatus(orderId, e.target.value);
        })
      }
    >
      <option value="PENDING">Pendiente</option>
      <option value="PAID">Pagada</option>
      <option value="FULFILLED">Enviada</option>
      <option value="CANCELLED">Cancelada</option>
      <option value="REFUNDED">Reembolsada</option>
    </Select>
  );
}
