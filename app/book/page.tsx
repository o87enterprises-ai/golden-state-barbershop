import type { Metadata } from "next";
import BookingFlow from "@/components/booking/BookingFlow";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book a Cut | Golden State Barbershop",
  description: "Book your haircut at Golden State Barbershop in Tracy, CA. No account needed — pay to confirm.",
};

export default function BookPage() {
  return (
    <>
      <BookingFlow />
      <Footer />
    </>
  );
}
