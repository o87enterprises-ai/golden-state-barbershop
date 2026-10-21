import Hero from "@/components/Hero";
import ScrollVideo from "@/components/ScrollVideo";
import ClipperBreakdown from "@/components/ClipperBreakdown";
import LiveLineup from "@/components/LiveLineup";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <Hero />
      <ScrollVideo />
      <ClipperBreakdown />
      <LiveLineup />
      <Services />
      <Footer />
    </main>
  );
}
