"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress (0 to 1) to the video duration
  const videoTime = useTransform(scrollYProgress, [0, 1], [0, 15]); // Assuming a 15-second video

  useEffect(() => {
    // Sync the video time to the scroll value
    const unsubscribe = videoTime.on("change", (latest) => {
      if (videoRef.current) {
        videoRef.current.currentTime = latest;
      }
    });
    return () => unsubscribe();
  }, [videoTime]);

  // Text fade-in/fade-out based on scroll milestones
  const textOpacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const textOpacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);
  const textOpacity3 = useTransform(scrollYProgress, [0.7, 0.9, 1], [0, 1, 1]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* The Video Background */}
        <video
          ref={videoRef}
          src="/clippers.mp4"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        
        {/* Gradient Overlays for depth of field */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-transparent to-brand-dark" />

        {/* Foreground Text Animations */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h2 
            style={{ opacity: textOpacity1 }}
            className="absolute inset-0 flex items-center justify-center text-5xl md:text-7xl font-display text-brand-gold tracking-widest"
          >
            Precision Engineered
          </motion.h2>

          <motion.h2 
            style={{ opacity: textOpacity2 }}
            className="absolute inset-0 flex items-center justify-center text-5xl md:text-7xl font-display text-white tracking-widest text-shadow-glow"
          >
            The Golden Standard
          </motion.h2>

          <motion.div 
            style={{ opacity: textOpacity3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
          >
            <h2 className="text-5xl md:text-7xl font-display text-brand-gold tracking-widest">
              Experience the Craft
            </h2>
            <p className="text-xl text-gray-300 max-w-xl mx-auto">
              Every cut is a masterpiece. Step into the chair and let our master barbers elevate your style.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}