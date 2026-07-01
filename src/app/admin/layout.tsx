import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Admin" };
// El admin siempre es dinámico (datos privados, sin cache).
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Sin sesión (única ruta accesible: /admin/login por el middleware):
  // se renderiza sin el chrome del panel.
  if (!session) {
    return <div className="min-h-screen bg-bg">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar email={session.email} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
