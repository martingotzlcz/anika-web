import React, { useState, useEffect } from 'react';
import { optImg } from "@/lib/img";
import { motion } from 'framer-motion';

export default function HeroSection({ artistName = "Anika", artistSurname = "Menclová", subtitle = "HEREČKA & ZPĚVAČKA", heroImage }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const textOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section className="relative h-screen overflow-hidden bg-[#1e3a5f]">
      {heroImage && (
        <img
          src={optImg(heroImage, 2560, 90)}
          alt={artistName}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 22%', filter: 'contrast(1.02) saturate(1.05)' }}
          fetchpriority="high"
        />
      )}
      {/* modrý přechod zleva — sjednotí plochu a udrží text čitelný */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#16294a]/50 to-transparent" />

      <div className="relative z-10 h-full flex items-center transition-opacity duration-100" style={{ opacity: textOpacity }}>
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16">
          <div className="max-w-xl text-center md:text-left">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-[5rem] md:text-[7rem] lg:text-[8.5rem] text-white leading-[0.9] uppercase tracking-[0.03em]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}>{artistName}</motion.h1>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] text-white leading-[0.9] uppercase tracking-[0.12em] mt-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}>{artistSurname}</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg md:text-xl text-[#e0a3a3] tracking-[0.18em] mt-8" style={{ fontFamily: "'Georgia', serif" }}>[ {subtitle} ]</motion.p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-5 h-9 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-1 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
