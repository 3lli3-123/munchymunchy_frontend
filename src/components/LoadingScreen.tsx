import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const SCRAPBOOK_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1697652973385-ccf1e85496b2?w=600', x: '10%', y: '15%', rotate: -15 },
  { url: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600', x: '75%', y: '10%', rotate: 12 },
  { url: 'https://images.unsplash.com/photo-1630914441934-a29bf360934c?w=600', x: '20%', y: '70%', rotate: 8 },
  { url: 'https://images.unsplash.com/photo-1681995790407-5a64283680d4?w=600', x: '80%', y: '75%', rotate: -10 },
  { url: 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?w=600', x: '50%', y: '80%', rotate: -5 },
  { url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600', x: '5%', y: '45%', rotate: 15 },
  { url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600', x: '85%', y: '40%', rotate: -12 },
  { url: 'https://images.unsplash.com/photo-1495899686424-be6ded54191a?w=600', x: '45%', y: '10%', rotate: 5 },
];

export function LoadingScreen() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < SCRAPBOOK_IMAGES.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 300); // Add a new image every 300ms
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FDF8EF' }}
    >
      {/* Scrapbook Images - Visible on all devices with responsive sizing */}
      {SCRAPBOOK_IMAGES.map((img, index) => {
        // Adjust positions and sizes for mobile - lower opacity on mobile to not cover text
        const isMobileSize = window.innerWidth < 640;
        const sizeClass = isMobileSize ? 'w-24 h-24' : (window.innerWidth < 1024 ? 'w-32 h-32' : 'w-40 h-40');
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.5, rotate: img.rotate + 20 }}
            animate={{ 
              opacity: index < visibleCount ? (isMobileSize ? 0.5 : 1) : 0, 
              scale: index < visibleCount ? 1 : 1.5,
              rotate: index < visibleCount ? img.rotate : img.rotate + 20 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              duration: 0.8 
            }}
            className={`absolute ${sizeClass} pointer-events-none`}
            style={{ 
              left: isMobileSize ? `calc(50% + ${(parseFloat(img.x) - 50) * 0.6}%)` : img.x,
              top: isMobileSize ? `calc(50% + ${(parseFloat(img.y) - 50) * 0.6}%)` : img.y,
              transform: isMobileSize ? 'translate(-50%, -50%)' : 'translate(0, 0)',
              boxShadow: '0 10px 30px rgba(245, 159, 0, 0.2)',
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px'
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm relative">
               <ImageWithFallback 
                src={img.url} 
                alt="Food" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[8px] border-white/10" />
            </div>
          </motion.div>
        );
      })}

      {/* Center Branding */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-6"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex items-center justify-center"
          style={{ width: 'clamp(5rem, 15vw, 7rem)', height: 'clamp(5rem, 15vw, 7rem)'}}
        >
          <img src="/munch.png" alt="Munchy" className="w-full h-full" />
        </motion.div>

        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="font-bold tracking-tighter text-center" 
          style={{ color: '#242116', fontSize: 'clamp(2rem, 8vw, 3.75rem)' }}
        >
          Munchy Munchy
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 font-medium tracking-wide uppercase text-xs sm:text-sm text-center"
          style={{ color: '#F59F00', letterSpacing: '0.2em' }}
        >
          Curating your journey...
        </motion.p>
      </motion.div>

      {/* Decorative Bouncing Icons background layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, Math.random() * -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            <Utensils size={40 + Math.random() * 40} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
