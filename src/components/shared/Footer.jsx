import React from 'react';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/anikamenclova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#1e3a5f] transition-colors duration-300"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/anikamenclovaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#1e3a5f] transition-colors duration-300"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@anikamenclova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#1e3a5f] transition-colors duration-300"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@anikamenclova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#1e3a5f] transition-colors duration-300"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://www.linkedin.com/in/anika-menclov%C3%A1-5a66b2234/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#1e3a5f] transition-colors duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
                        © {currentYear} Anika Menclová<span 
                                        onClick={() => base44.auth.redirectToLogin()} 
                                        className="cursor-pointer select-none"
                                      >.</span> Všechna práva vyhrazena.
                      </p>
        </div>
      </div>
    </footer>
  );
}