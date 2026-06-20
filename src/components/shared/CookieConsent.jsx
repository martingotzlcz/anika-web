import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-5 h-5 text-[#c94a4a] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Tento web používá cookies pro zlepšení vašeho zážitku. Pokračováním v prohlížení souhlasíte s jejich používáním.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="flex-1 md:flex-none text-sm"
                >
                  Odmítnout
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none bg-[#1e3a5f] hover:bg-[#2a4a6f] text-sm"
                >
                  Přijmout
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}