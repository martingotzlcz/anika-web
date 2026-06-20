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

export default function Contact() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => { const list = await base44.entities.SiteSettings.list(); return list[0] || null; },
    initialData: null,
  });

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: settings?.instagram_url || 'https://www.instagram.com/anikamenclova', color: 'hover:text-pink-500' },
    { name: 'Facebook', icon: Facebook, url: settings?.facebook_url || 'https://www.facebook.com/anikamenclova', color: 'hover:text-blue-600' },
    { name: 'YouTube', icon: Youtube, url: settings?.youtube_url || 'https://www.youtube.com/@anikamenclova', color: 'hover:text-red-500' },
    { name: 'TikTok', icon: TikTokIcon, url: settings?.tiktok_url || 'https://www.tiktok.com/@anikamenclova', color: 'hover:text-gray-900' },
    { name: 'LinkedIn', icon: Linkedin, url: settings?.linkedin_url || 'https://www.linkedin.com/in/anika-menclov%C3%A1-5a66b2234/', color: 'hover:text-blue-700' },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-[#1e3a5f] tracking-wider">KONTAKT</h1>
          <div className="w-16 h-0.5 bg-[#c94a4a] mx-auto mt-6" />
        </motion.div>

        <div className="flex flex-col items-center text-center space-y-8">
          <div>
            <h2 className="text-2xl font-light text-[#1e3a5f] mb-4">Pojďme spolupracovat</h2>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
              Máte zájem o spolupráci nebo dotaz?<br />Ozvěte se mi e-mailem nebo na sociálních sítích.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${settings?.email || 'kontakt@anikamenclova.cz'}`} className="text-[#1e3a5f] hover:text-[#c94a4a] transition-colors text-lg">
                {settings?.email || 'kontakt@anikamenclova.cz'}
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1e3a5f] mb-4">Sledujte mě</h3>
            <div className="flex gap-4 justify-center">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                   className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 transition-all duration-300 ${social.color} hover:shadow-lg hover:-translate-y-1`}>
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
