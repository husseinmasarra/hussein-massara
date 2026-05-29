import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Sparkles, Truck, Users } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface HeroCarouselProps {
  banners: string[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const { language, t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fallback high-quality realistic pictures if settings empty
  const slides = banners.length > 0 ? banners : [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slides.length);
    }, 5500); // Shift pages every 5.5 seconds smoothly
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length);
  };

  const labels = [
    {
      titleAr: "خضار بلدية ومونة طازجة 100٪",
      titleEn: "Fresh Organic Local Farm Produce",
      tagAr: "مواسم الخير اللبناني",
      tagEn: "100% Homemade & Fresh"
    },
    {
      titleAr: "أحدث التقنيات بأسعار منافسة بالدولار والليرة",
      titleEn: "Latest Premium Gadgets & Accessories",
      tagAr: "التوفير الذكي",
      tagEn: "Optimized Dual-Currency Rates"
    },
    {
      titleAr: "أجود أنواع العسل وزيت الزيتون المعصور على البارد",
      titleEn: "Finest Natural Spices & Olive Oils",
      tagAr: "صحي وطبيعي",
      tagEn: "Artisanal Koura Oils"
    }
  ];

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 bg-slate-900 group">
      
      {/* Background Slides */}
      {slides.map((url, index) => (
        <div
          key={url + index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIdx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 z-20" />
          <img
            src={url}
            alt="Promotion Banner"
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Floating Marketing Slogans Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 z-20 text-white select-none">
        <div className="max-w-2xl text-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-4s font-bold text-white uppercase tracking-wider bg-red-600 rounded-full mb-3 shadow-sm font-sans animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            {language === "ar" 
              ? labels[currentIdx % labels.length]?.tagAr 
              : labels[currentIdx % labels.length]?.tagEn}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-sans text-white drop-shadow-md leading-tight mb-3">
            {language === "ar" 
              ? labels[currentIdx % labels.length]?.titleAr 
              : labels[currentIdx % labels.length]?.titleEn}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-200 font-sans leading-relaxed drop-shadow-sm max-w-lg mb-4 hidden sm:block">
            {language === "ar" 
              ? "استمتع بأسرع خدمة توصيل مريحة في لبنان مع خيارات الدفع النقدي الآمنة عند باب بيتك. حدد مشترياتك الآن."
              : "Experience express delivery throughout Lebanon with straightforward cash payment on delivery option. Track your order on the visual map directly."}
          </p>
        </div>
      </div>

      {/* Carousel Left Control Arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 dark:bg-slate-950/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 cursor-pointer z-35"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Carousel Right Control Arrow */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 dark:bg-slate-950/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 cursor-pointer z-35"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-35">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIdx(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
              index === currentIdx ? "bg-blue-500 w-6" : "bg-white/40 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
