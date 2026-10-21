import Hero from "@/components/Hero";
import ScrollExplode from "@/components/ScrollExplode";
import LineupCalendar from "@/components/LineupCalendar";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <Hero />
      <ScrollExplode />
      <LineupCalendar />
      <Services />
      <Footer />
    </main>
  );
}
