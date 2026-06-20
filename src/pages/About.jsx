import React from 'react';
import { optImg } from "@/lib/img";
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Footer from '@/components/shared/Footer';

const defaultBioText = `DIVADLO
2025 Jihočeské divadlo – Café Groll (Růžena)
2025 Jihočeské divadlo – Poslední víkend (zpěvačka)
2025 Divadlo Hybernia – Divotvorný hrnec (company)
2025 Jihočeské divadlo – Evita (company)
2022 Jihočeské divadlo – Hej Mistře (Anna Rybová, Madona)
2022 Divadlo Lucie Bílé – Karol a Kvído (Lůca)
2020 Divadlo Na Fidlovačce – Sugar (Barbara)

FILM
Poslední mejdan (2025) – role Simony
Holka od vedle (2025) – role Evy

SERIÁLY
Štěstíčku naproti – hosteska
ZOO Nové začátky – Tamara Skalická
Slunečná – role Vendulky Holé
Krejzovi – role Kláry Čechové
Polda III. – role studentky

DABING
Harry Potter 20 let filmové magie (Bonnie Wright)
Elvis (sbory)
Harley Quinn (Queen of Fables, Batgirl, Nora)
Autoparta (Bridget, Aimee)

VOICEOVERY
Lejaan, Bioderma, Vekra

TELEVIZE
ProSieben – Rockin' Prag

REKLAMY
Honor – 2025
Nice to fit you – 2025
Lékárna.cz – 2023
Briliantina – 2012

ROZHLAS
Hovory s mámou
Slečny Brontëovy

VZDĚLÁNÍ
FF Univerzity Karlovy, katedra divadelní vědy
Pražská konzervatoř, obor hudebně dramatický

JAZYKY
Anglický jazyk B2
Německý jazyk B2

ZÁJMY
herectví, zpěv, tanec, dabing, housle, gymnastika, plavání, snowboarding, cestování, moderování`;

export default function About() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const list = await base44.entities.SiteSettings.list();
      return list[0] || null;
    },
    initialData: null,
  });

  // Get bio text (plain text)
  const bioText = settings?.bio_text || '';

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Fixed hero image - same as homepage */}
      <div className="fixed inset-0 z-0 flex justify-center items-start overflow-hidden -mt-[108px]">
        <img
          src={optImg(settings?.hero_image_url, 2560, 90)}
          alt=""
          className="min-h-[125%] w-auto max-w-none"
            style={{ filter: 'contrast(1.02) saturate(1.05)' }}
        />
      </div>
      
      {/* Scrollable content */}
      <div className="relative z-10">
        <div className="min-h-screen pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-wider drop-shadow-lg">
                O MNĚ
              </h1>
              <div className="w-16 h-0.5 bg-[#c94a4a] mx-auto mt-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-left mb-8"
            >
              <h2 className="text-2xl font-light text-white drop-shadow-md">Bc. Anika Menclová, DiS.</h2>
              <p className="text-white/70 mt-1 text-sm drop-shadow">25. 2. 2000</p>
            </motion.div>

            {/* Continuous text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl ml-0"
            >
              <div 
                className="text-white/90 text-sm leading-relaxed whitespace-pre-line text-left drop-shadow-md [&_b]:font-bold [&_i]:italic [&_.text-xs]:text-xs [&_.text-sm]:text-sm [&_.text-base]:text-base [&_.text-lg]:text-lg [&_.text-xl]:text-xl"
                dangerouslySetInnerHTML={{ __html: (bioText || defaultBioText).replace(/\n/g, '<br />') }}
              /></motion.div>
          </div>
        </div>
        
        {/* Footer with white background */}
        <div className="bg-white">
          <Footer />
        </div>
      </div>
    </div>
  );
}