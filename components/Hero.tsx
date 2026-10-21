"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ perspective: 1200 }}
    >
      {/* Background gradients and imagery */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593702288056-7927b442d0fa?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/40 via-brand-dark/80 to-brand-dark" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        
        {/* 3D Simulated Logo Container */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="mb-8 relative"
        >
          {/* Floating Animation wrapper */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ transform: "translateZ(50px)" }}
            className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
          >
            {/* The Logo Image with a heavy shadow to feel 3D */}
            <Image 
              src="/logo.png" 
              alt="Golden State Barbershop Logo"
              fill
              className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)]"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-xl text-gray-300 text-lg md:text-xl mb-10 font-light"
        >
          Premium cuts. Classic style. Experience the absolute best grooming 
          in Tracy, California.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link 
            href="/book" 
            className="bg-brand-red text-white px-10 py-4 rounded-sm font-display text-2xl tracking-widest hover:bg-red-700 transition-all hover:scale-105 shadow-[0_0_20px_rgba(185,28,28,0.4)]"
          >
            Book Now
          </Link>
          <Link 
            href="/menu" 
            className="bg-transparent border-2 border-brand-gold text-brand-gold px-10 py-4 rounded-sm font-display text-2xl tracking-widest hover:bg-brand-gold hover:text-black transition-all hover:scale-105"
          >
            View Menu
          </Link>
        </motion.div>
      </div>
    </section>
  );
}