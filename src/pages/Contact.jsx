import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

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
    { name: 'Instagram', icon: Instagram, url: settings?.instagram_url || 'https://www.instagram.com/anikamenclova', color: 'hover:text-pink-500' },
    { name: 'Facebook', icon: Facebook, url: settings?.facebook_url || 'https://www.facebook.com/anikamenclova', color: 'hover:text-blue-600' },
    { name: 'YouTube', icon: Youtube, url: settings?.youtube_url || 'https://www.youtube.com/@anikamenclova', color: 'hover:text-red-500' },
    { name: 'TikTok', icon: TikTokIcon, url: settings?.tiktok_url || 'https://www.tiktok.com/@anikamenclova', color: 'hover:text-gray-900' },
    { name: 'LinkedIn', icon: Linkedin, url: settings?.linkedin_url || 'https://www.linkedin.com/in/anika-menclov%C3%A1-5a66b2234/', color: 'hover:text-blue-700' },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Hlavička – stejná pozice i styl jako Hudba / Termíny / O mně */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-[#1e3a5f] tracking-wider">KONTAKT</h1>
          <div className="w-16 h-0.5 bg-[#c94a4a] mx-auto mt-6" />
        </motion.div>

        <div className="max-w-2xl mx-auto text-center space-y-12">
          <motion.p {...fade(0.05)} className="text-gray-500 text-lg" style={{ fontFamily: "'Georgia', serif" }}>
            Pro spolupráci, nabídky a dotazy mě neváhejte kontaktovat.
          </motion.p>

          <motion.div {...fade(0.1)}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-3">Email</p>
            <a href={`mailto:${email}`} className="text-2xl md:text-3xl font-light text-[#1e3a5f] hover:text-[#c94a4a] transition-colors duration-300">{email}</a>
          </motion.div>

          <motion.div {...fade(0.15)} className="pt-4">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-6">Sledujte mě</p>
            <div className="flex gap-4 justify-center">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}
                  className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 transition-all duration-300 ${social.color} hover:shadow-lg hover:-translate-y-1`}>
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
