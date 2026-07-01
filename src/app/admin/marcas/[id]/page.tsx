import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { BrandForm, type BrandFormInitial } from "@/components/admin/brand-form";
import { DEFAULT_THEME, type BrandTheme } from "@/lib/theme";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  const theme = (brand.theme as BrandTheme | null) ?? DEFAULT_THEME;
  const initial: BrandFormInitial = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    tagline: brand.tagline ?? "",
    description: brand.description ?? "",
    heroImageUrl: brand.heroImageUrl ?? "",
    active: brand.active,
    sortOrder: brand.sortOrder,
    theme: {
      colors: { ...DEFAULT_THEME.colors, ...theme.colors },
      fonts: { ...DEFAULT_THEME.fonts, ...theme.fonts },
      radius: theme.radius ?? DEFAULT_THEME.radius,
    },
  };

  return (
    <div>
      <PageHeader title="Editar marca" description={brand.name} />
      <BrandForm initial={initial} />
    </div>
  );
}
