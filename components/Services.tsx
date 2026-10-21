"use client";

import { motion } from "framer-motion";
import { Scissors, Droplets, Sparkles, Shield } from "lucide-react";

export default function Services() {
  const services = [
    { name: "Classic Cut", price: "$35", description: "Precision scissor cut, wash, and style.", icon: Scissors },
    { name: "Skin Fade", price: "$40", description: "Zero to skin fade with detailed lineup.", icon: Shield },
    { name: "Beard Trim", price: "$25", description: "Sculpting, razor outline, and hot towel.", icon: Sparkles },
    { name: "The Full Service", price: "$60", description: "Haircut, beard trim, hot towel, and facial.", icon: Droplets },
  ];

  return (
    <section className="py-32 bg-brand-dark relative z-20">
      <div className="max-w-6xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-display text-brand-gold tracking-widest mb-4">
            The Menu
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our styling guide and service menu. Choose your experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative p-8 bg-brand-charcoal border border-white/5 rounded-xl hover:border-brand-gold/50 transition-colors cursor-pointer overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 to-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-6 items-start">
                  <div className="p-4 bg-brand-dark rounded-lg text-brand-gold group-hover:scale-110 transition-transform duration-300">
                    <service.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display tracking-wider text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 max-w-xs">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-display text-brand-gold">
                  {service.price}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA under menu */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button className="bg-transparent border border-brand-gold text-brand-gold px-12 py-4 rounded-sm font-display text-2xl tracking-widest hover:bg-brand-gold hover:text-black transition-all">
            Book Your Experience
          </button>
        </motion.div>

      </div>
    </section>
  );
}