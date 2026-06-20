import React from 'react';
import { motion } from 'framer-motion';

const defaultImages = [
  { url: "https://static.wixstatic.com/media/75b2d6_a195e2c6c4fc4ceeb3ebfdcf02d5c087~mv2.jpg/v1/fill/w_280,h_419,q_90,enc_avif,quality_auto/75b2d6_a195e2c6c4fc4ceeb3ebfdcf02d5c087~mv2.jpg", alt: "Portrait" },
  { url: "https://static.wixstatic.com/media/75b2d6_9f7dc8031b5d4fbf82b0beda30a4b978~mv2.jpg/v1/fill/w_280,h_186,q_90,enc_avif,quality_auto/75b2d6_9f7dc8031b5d4fbf82b0beda30a4b978~mv2.jpg", alt: "Performance" },
  { url: "https://static.wixstatic.com/media/75b2d6_750e8853af5647eb93d6d2f6d3e0a64b~mv2.jpg/v1/fill/w_542,h_361,q_90,enc_avif,quality_auto/75b2d6_750e8853af5647eb93d6d2f6d3e0a64b~mv2.jpg", alt: "Stage" },
];

export default function GalleryGrid({ images = defaultImages }) {
  return (
    <section className="bg-[#1e3a5f] py-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 p-4">
          {/* First image - tall portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden w-[200px] md:w-[280px]"
          >
            <div className="aspect-[2/3] overflow-hidden">
              <img
                src={images[0]?.url || defaultImages[0].url}
                alt={images[0]?.alt || "Portrait"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>
          
          {/* Second image - landscape */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden w-[200px] md:w-[280px]"
          >
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src={images[1]?.url || defaultImages[1].url}
                alt={images[1]?.alt || "Performance"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>
          
          {/* Third image - wider landscape */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden w-[300px] md:w-[540px]"
          >
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src={images[2]?.url || defaultImages[2].url}
                alt={images[2]?.alt || "Stage"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}