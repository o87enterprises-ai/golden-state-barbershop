import { notFound } from "next/navigation";
import ClipperBreakdown from "@/components/ClipperBreakdown";

export default function Test3DPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="w-full bg-[#0a0a0a] min-h-screen">
      <ClipperBreakdown />
    </main>
  );
}
