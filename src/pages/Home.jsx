import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import MarqueeGallery from '@/components/home/MarqueeGallery';
import Footer from '@/components/shared/Footer';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: galleryImages } = useQuery({
    queryKey: ['galleryImages'],
    queryFn: () => base44.entities.GalleryImage.list('order'),
    initialData: [],
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const list = await base44.entities.SiteSettings.list();
      return list[0] || null;
    },
  });

  const heroImageUrl = settings?.hero_image_url || null;

  return (
    <div className="relative bg-[#fafafa]">
      {/* Fixed Hero Background */}
      <div className="fixed inset-0 z-0">
        {!isLoading && (
          <HeroSection
            artistName={settings?.artist_name?.split(' ')[0] || "ANIKA"}
            artistSurname={settings?.artist_name?.split(' ').slice(1).join(' ') || "MENCLOVÁ"}
            subtitle={settings?.artist_subtitle || "HEREČKA & ZPĚVAČKA"}
            heroImage={heroImageUrl}
          />
        )}
      </div>
      
      {/* Spacer for hero height */}
      <div className="h-screen" />
      
      {/* Gallery with transparent background and footer */}
      <div className="relative z-10">
        <MarqueeGallery images={galleryImages} />
        <Footer />
      </div>
    </div>
  );
}