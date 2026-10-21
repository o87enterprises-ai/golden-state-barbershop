import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollVideo from "@/components/ScrollVideo";
import Services from "@/components/Services";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <Navbar />
      <Hero />
      <ScrollVideo />
      <Services />
    </main>
  );
}