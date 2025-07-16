import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const heroBannerData = [
  {
    id: "b1",
    backgroundColor: "#F06C00",
    textColor: "text-black",
    buttonStyle: "dark",
    title: "Your collection. Your rules.",
    description: "Discover all the ways to curate an epic hand of game cards.",
    cta: "Shop now",
    images: [
      { src: "https://i.ebayimg.com/images/g/-WIAAOSwbGNnFmRF/s-l300.webp", subtitle: "Sealed boxes" },
      { src: "https://i.ebayimg.com/images/g/cFMAAOSwANZnFmRM/s-l300.webp", subtitle: "Singles" },
      { src: "https://i.ebayimg.com/images/g/6mEAAOSwo7hnFmRT/s-l300.webp", subtitle: "Sealed packs" },
    ],
  },
  {
    id: "b2",
    backgroundColor: "#18465a", // Màu xanh nhạt
    textColor: "text-white",
    buttonStyle: "white",
    title: "Current mood: summer magic",
    description: "Shift your whole vibe with vintage curated by Emma Chamberlain.",
    cta: "Shop her collection",
    images: [{ src: "https://i.ebayimg.com/images/g/SIgAAOSwlkdoQ1Bv/s-l960.webp", subtitle: "" }],
  },
  {
    id: "b3",
    backgroundColor: "#f8bd00",
    textColor: "text-black",
    buttonStyle: "dark",
    title: "Transform any room",
    description: "Common ways to stack your card games deck with ultra rare finds.",
    cta: "Shop home decor",
    images: [
      { src: "https://i.ebayimg.com/images/g/RL8AAOSwwzJoQvk5/s-l300.webp", subtitle: "" },
      { src: "https://i.ebayimg.com/images/g/MnAAAOSw6ONoQvlA/s-l300.webp", subtitle: "" },
      { src: "https://i.ebayimg.com/images/g/YcgAAOSwAL1oQvlJ/s-l300.webp", subtitle: "" },
    ],
  },
  {
    id: "b4",
    backgroundColor: "#41a7ff", // Màu xanh đậm
    textColor: "text-black",
    buttonStyle: "dark",
    title: "Call the play, coach",
    description: "Draft your dream sports card lineup. It's your ball.",
    cta: "Put 'em in",
    images: [
      { src: "https://i.ebayimg.com/images/g/QWoAAOSwLTBoUVcS/s-l300.webp", subtitle: "" },
      { src: "https://i.ebayimg.com/images/g/W1YAAOSwN4poUVcV/s-l300.webp", subtitle: "" },
      { src: "https://i.ebayimg.com/images/g/TTQAAOSwsIVoUVcZ/s-l300.webp", subtitle: "" },
    ],
  },
];


export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBannerData.length);
    }, 5000); // Tự động chuyển sau 5 giây
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startAutoPlay();
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, startAutoPlay]);
  
  const resetAutoPlay = () => {
    clearInterval(intervalRef.current);
    if(isPlaying) startAutoPlay();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    resetAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroBannerData.length);
    resetAutoPlay();
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroBannerData.length) % heroBannerData.length);
    resetAutoPlay();
  };

  const currentBanner = heroBannerData[currentIndex];

  return (
    <div className="relative mb-8 w-full h-[350px] md:h-[400px] rounded-lg overflow-hidden">
      {/* Background Color Layer */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: currentBanner.backgroundColor }}
      ></div>

      {/* Slides */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          className={`absolute inset-0 flex items-center justify-between px-8 md:px-16 ${currentBanner.textColor}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Side: Text Content */}
          <div className="w-full md:w-1/3 space-y-4 z-10">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {currentBanner.title}
            </h1>
            <p className="text-lg">{currentBanner.description}</p>
            <button
              className={`px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 ${
                currentBanner.buttonStyle === 'dark'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              {currentBanner.cta}
            </button>
          </div>

          {/* Right Side: Images */}
          <div className="w-2/3 hidden md:flex items-center justify-center relative h-full">
            {/* 1-Image Layout */}
            {currentBanner.images.length === 1 && (
              <motion.img
                src={currentBanner.images[0].src}
                alt={currentBanner.title}
                className="max-h-[80%] object-contain"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            )}
            {/* 3-Image Layout */}
            {currentBanner.images.length === 3 && (
              <div className="flex items-center justify-around w-full h-full">
                {currentBanner.images.map((img, index) => (
                   <motion.div 
                    key={index} 
                    className="flex flex-col items-center justify-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                   >
                     <img
                       src={img.src}
                       alt={img.subtitle || `Image ${index + 1}`}
                       className="max-h-[220px] object-contain mb-2"
                     />
                     {img.subtitle && <span className="font-semibold">{img.subtitle}</span>}
                   </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroBannerData.map((_, index) => (
             <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
             />
          ))}
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
        <button onClick={() => setIsPlaying(p => !p)} className="p-2 bg-black/20 rounded-full text-white hover:bg-black/40">
            {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        <button onClick={goToPrevious} className="p-2 bg-black/20 rounded-full text-white hover:bg-black/40">
            <FiChevronLeft />
        </button>
         <button onClick={goToNext} className="p-2 bg-black/20 rounded-full text-white hover:bg-black/40">
            <FiChevronRight />
        </button>
      </div>
    </div>
  );
}