import Hero from "@/components/Hero";
import ClipperBreakdown from "@/components/ClipperBreakdown";
import LineupCalendar from "@/components/LineupCalendar";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <Hero />
      <ClipperBreakdown />
      <LineupCalendar />
      <Services />
      <Footer />
    </main>
  );
}