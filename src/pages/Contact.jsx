import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Mail, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const EASE = [0.22, 1, 0.36, 1];
const fade = (d = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.7, delay: d, ease: EASE } });

export default function Contact() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => { const list = await base44.entities.SiteSettings.list(); return list[0] || null; },
    initialData: null,
  });

  const email = settings?.email || 'kontakt@anikamenclova.cz';
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: settings?.instagram_url || 'https://www.instagram.com/anikamenclova' },
    { name: 'Facebook', icon: Facebook, url: settings?.facebook_url || 'https://www.facebook.com/anikamenclova' },
    { name: 'YouTube', icon: Youtube, url: settings?.youtube_url || 'https://www.youtube.com/@anikamenclova' },
    { name: 'TikTok', icon: TikTokIcon, url: settings?.tiktok_url || 'https://www.tiktok.com/@anikamenclova' },
    { name: 'LinkedIn', icon: Linkedin, url: settings?.linkedin_url || 'https://www.linkedin.com/in/anika-menclov%C3%A1-5a66b2234/' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-32">
      <div className="max-w-3xl w-full text-center">
        <motion.p {...fade(0)} className="text-[11px] tracking-[0.45em] uppercase text-[#c94a4a] mb-6">Spojme se</motion.p>
        <motion.h1 {...fade(0.05)} className="text-5xl md:text-7xl text-[#1e3a5f] leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}>Kontakt</motion.h1>
        <motion.div {...fade(0.1)} className="w-12 h-px bg-[#c94a4a]/60 mx-auto mt-8 mb-14" />

        <motion.p {...fade(0.15)} className="text-gray-500 text-base md:text-lg mb-5 max-w-md mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
          Pro spolupráci, nabídky a dotazy mě neváhejte kontaktovat.
        </motion.p>
        <motion.a {...fade(0.2)} href={`mailto:${email}`}
          className="inline-block text-2xl md:text-4xl text-[#1e3a5f] hover:text-[#c94a4a] transition-colors duration-300 border-b border-[#1e3a5f]/15 hover:border-[#c94a4a] pb-1"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}>{email}</motion.a>

        <motion.div {...fade(0.3)} className="mt-20">
          <p className="text-[11px] tracking-[0.35em] uppercase text-gray-400 mb-7">Sledujte mě</p>
          <div className="flex gap-4 justify-center">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}
                className="w-12 h-12 rounded-full border border-[#1e3a5f]/15 flex items-center justify-center text-[#1e3a5f]/70 transition-all duration-300 hover:text-white hover:bg-[#1e3a5f] hover:border-[#1e3a5f] hover:-translate-y-1">
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
