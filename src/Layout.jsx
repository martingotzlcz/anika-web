import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/shared/Footer';
import CookieConsent from '@/components/shared/CookieConsent';
import { Settings } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === 'admin') setIsAdmin(true);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@300;400;500;600&family=Cormorant+Garamond:wght@300;400;500&family=Forum&family=Cinzel:wght@400;500;600&display=swap');

                          body {
                            font-family: 'Inter', sans-serif;
                          }

                          h1, h2, h3 {
                                            font-family: 'Playfair Display', serif;
                                          }
        `}
      </style>
      <Navbar currentPage={currentPageName} />
      <main className="flex-1">
                {children}
              </main>

              {isAdmin && (
                <Link
                  to={createPageUrl('Admin')}
                  className="fixed right-6 bottom-6 z-50 bg-[#1e3a5f] text-white p-3 rounded-full shadow-lg hover:bg-[#2a4a6f] transition-colors"
                  title="Administrace"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
          {currentPageName !== 'Home' && currentPageName !== 'About' && <Footer />}
                      <CookieConsent />
                </div>
  );
}