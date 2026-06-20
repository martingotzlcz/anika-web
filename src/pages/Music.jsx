import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Youtube } from 'lucide-react';

const defaultSongs = [
  {
    id: '1',
    title: 'Slunce nad hlavou',
    youtube_id: 'HyUhul82oiU',
    description: 'Hudba: Ondřej Žatkuliak, Daniel Vrba, Anika Menclová\nText: Anika Menclová\nMix & master: Rooftop Studios'
  },
  {
    id: '2',
    title: 'V kruhu',
    youtube_id: 'HIKe6fdM--I',
    description: 'Hudba: Ondřej Žatkuliak, Daniel Vrba, Anika Menclová\nText: Anika Menclová'
  },
  {
    id: '3',
    title: 'Vánoční zázrak',
    youtube_id: 'eShRmwL5Dxo',
    description: 'Hudba: Ondřej Žatkuliak, Daniel Vrba, Anika Menclová\nText: Anika Menclová'
  }
];

export default function Music() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('order'),
    initialData: [],
  });

  const displaySongs = songs.length > 0 ? songs : defaultSongs;

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-[#1e3a5f] tracking-wider">
            HUDBA
          </h1>
          <div className="w-16 h-0.5 bg-[#c94a4a] mx-auto mt-6" />
        </motion.div>

        <div className="space-y-16">
          {displaySongs.map((song, index) => (
            <div
              key={song.id}
              className="space-y-6"
            >
              <h2 className="text-3xl font-light text-[#1e3a5f] text-center tracking-wide">
                {song.title}
              </h2>
              
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${song.youtube_id}`}
                  title={song.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {song.description && (
                <div className="text-center text-gray-600 text-sm max-w-2xl mx-auto">
                  {song.description.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              )}

              {index < displaySongs.length - 1 && (
                <div className="w-full h-px bg-gray-200 mt-12" />
              )}
            </div>
          ))}
        </div>

        {/* YouTube Subscribe */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a
            href="https://www.youtube.com/@AnikaMenclova"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#FF0000] text-white px-8 py-4 rounded-full hover:bg-[#CC0000] transition-colors duration-300"
          >
            <Youtube className="w-6 h-6" />
            <span className="font-medium">Odebírat na YouTube</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}