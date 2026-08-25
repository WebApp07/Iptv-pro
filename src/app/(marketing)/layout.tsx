import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FreeTrialProvider } from "@/components/free-trial/free-trial-context";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FreeTrialProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </FreeTrialProvider>
  );
}