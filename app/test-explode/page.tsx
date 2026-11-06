import { notFound } from "next/navigation";
import ScrollExplode from "@/components/ScrollExplode";

export default function TestExplodePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="w-full bg-[#0a0a0a] min-h-screen">
      <ScrollExplode />
    </main>
  );
}
