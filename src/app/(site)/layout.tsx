import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/site/search-overlay";
import { Toaster } from "@/components/site/toaster";
import { FlyToCartLayer } from "@/components/site/fly-to-cart";
import { AssistantWidget } from "@/components/site/assistant-widget";
import { SplashScreen } from "@/components/site/splash-screen";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { getBrands } from "@/lib/queries";

// El nav/footer leen marcas de la DB: render en runtime, no en build.
export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Ecuestre";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brands = await getBrands();
  const navBrands = brands.map((b) => ({ slug: b.slug, name: b.name }));

  return (
    <>
      <SplashScreen />
      <ScrollProgress />
      <Navbar brands={navBrands} siteName={siteName} />
      <main className="flex-1">{children}</main>
      <Footer brands={navBrands} siteName={siteName} />
      <CartDrawer />
      <SearchOverlay />
      <Toaster />
      <FlyToCartLayer />
      <AssistantWidget />
      <AnalyticsTracker />
    </>
  );
}
