import { PageHeader } from "@/components/admin/ui";
import { BrandForm } from "@/components/admin/brand-form";

export default function NewBrandPage() {
  return (
    <div>
      <PageHeader title="Nueva marca" description="Definí su identidad visual." />
      <BrandForm />
    </div>
  );
}
