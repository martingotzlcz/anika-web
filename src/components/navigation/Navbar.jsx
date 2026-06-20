import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'DOMŮ', page: 'Home' },
  { name: 'TERMÍNY', page: 'Events' },
  { name: 'O MNĚ', page: 'About' },
  { name: 'HUDBA', page: 'Music' },
  { name: 'KONTAKT', page: 'Contact' },
];

const socialLinks = [
  { icon: Instagram, url: 'https://www.instagram.com/anikamenclova' },
  { icon: Facebook, url: 'https://www.facebook.com/anikamenclovaofficial' },
  { icon: Youtube, url: 'https://www.youtube.com/@anikamenclova' },
  { icon: TikTokIcon, url: 'https://www.tiktok.com/@anikamenclova' },
  { icon: Linkedin, url: 'https://www.linkedin.com/in/anika-menclov%C3%A1-5a66b2234/' },
];

export default function Navbar({ currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-500 ${scrolled ? "bg-white/90 shadow-md" : "bg-white/70 shadow-sm"}`}>
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={`text-sm tracking-widest font-medium transition-colors duration-300 ${
                  currentPage === item.page
                    ? 'text-[#c94a4a] border-b-2 border-[#c94a4a] pb-1'
                    : 'text-gray-700 hover:text-[#c94a4a]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Social Icons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#1e3a5f] transition-colors duration-300"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setIsOpen(false)}
                  className={`block text-sm tracking-widest font-medium ${
                    currentPage === item.page
                      ? 'text-[#c94a4a]'
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}