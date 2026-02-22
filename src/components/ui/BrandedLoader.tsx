// src/components/ui/BrandedLoader.tsx

import { motion } from 'framer-motion';

export default function BrandedLoader() {
  return (
    <div className="fixed inset-0 bg-deep-black z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow - using subtle gradient instead of full-screen image */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-warm-brown/10 to-transparent pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, #5A361F20 0%, #030303 60%)' }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 relative flex items-center justify-center">
            {/* Outer Ring */}
            <motion.div 
              className="absolute inset-0 border-2 border-accent-gold/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Ring with Glow */}
            <motion.div 
              className="absolute inset-2 border-t-2 border-accent-gold rounded-full shadow-[0_0_15px_rgba(213,160,66,0.5)]"
              animate={{ rotate: -180 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Center W */}
            <motion.span 
              className="text-4xl font-display font-bold text-light-gray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              W
            </motion.span>
          </div>
        </motion.div>

        {/* Brand Text */}
        <motion.h1 
          className="text-4xl md:text-5xl font-display font-bold text-light-gray mb-2 tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          The Nocturne
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          className="text-warm-beige/60 font-sans tracking-[0.2em] text-xs uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Culinary Excellence
        </motion.p>

        {/* Minimal Progress Bar */}
        <div className="mt-12 w-32 h-0.5 bg-warm-brown/20 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-accent-gold"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
      </div>
    </div>
  );
}