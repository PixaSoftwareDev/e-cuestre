"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const s = await getSession();
  if (!s) throw new Error("No autorizado");
}

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  heroImageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  theme: z.object({
    colors: z.object({
      bg: z.string(),
      fg: z.string(),
      primary: z.string(),
      primaryFg: z.string(),
      accent: z.string(),
      card: z.string(),
      muted: z.string(),
      border: z.string(),
    }),
    fonts: z.object({ heading: z.string(), body: z.string() }),
    radius: z.string(),
  }),
});

export type BrandInput = z.infer<typeof brandSchema>;

export async function saveBrand(input: BrandInput) {
  await requireAdmin();
  const data = brandSchema.parse(input);
  const slug = slugify(data.slug || data.name);

  const payload = {
    name: data.name,
    slug,
    tagline: data.tagline || null,
    description: data.description || null,
    heroImageUrl: data.heroImageUrl || null,
    logoUrl: data.logoUrl || null,
    active: data.active,
    sortOrder: data.sortOrder,
    theme: data.theme,
  };

  let id = data.id;
  if (id) {
    await prisma.brand.update({ where: { id }, data: payload });
  } else {
    const created = await prisma.brand.create({ data: payload });
    id = created.id;
  }

  revalidatePath("/admin/marcas");
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/marcas");
  revalidatePath("/");
  return { ok: true };
}
