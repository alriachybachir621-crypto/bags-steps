import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight } from 'lucide-react';
import { Lang, ShopConfig } from '../types/boutique';
import { getCopy } from '../data/translations';
import { IMG_HERO } from '../data/seedData';
import { BoutiqueImage } from './BoutiqueImage';

interface HeroSectionProps {
  lang: Lang;
  shopConfig: ShopConfig;
  onLogoTap: () => void;
}

export function HeroSection({ lang, shopConfig, onLogoTap }: HeroSectionProps) {
  const t = getCopy(lang);
  const images = shopConfig.heroImages?.length ? shopConfig.heroImages : [IMG_HERO];
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % images.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [images.length]);

  const headline =
    lang === 'ar' && shopConfig.heroHeadlineAr
      ? shopConfig.heroHeadlineAr
      : shopConfig.heroHeadline || t.tagline;

  const subtitle =
    lang === 'ar' && shopConfig.heroSubtitleAr
      ? shopConfig.heroSubtitleAr
      : shopConfig.heroSubtitle;

  return (
    <section id="top" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 lg:pt-10 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 flex flex-col justify-between bg-[#FBF7F2] rounded-3xl p-7 sm:p-10 border border-[#2A1A20]/8 shadow-[0_12px_40px_-18px_rgba(107,18,56,0.12)]"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onLogoTap}
                  aria-label="Bags&Steps emblem"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 shadow-sm border border-[#C9A66B]/40 cursor-pointer transition-transform active:scale-95"
                >
                  <img
                    src="/logo.png"
                    alt="Bags&Steps"
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-widest uppercase text-[#6B1238]">
                    {t.hero.locationTag}
                  </p>
                  <p className="font-serif-editorial text-lg text-[#2A1A20]">
                    Bags&amp;Steps
                  </p>
                </div>
              </div>

              <h1
                className="font-serif-editorial text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold text-[#2A1A20] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {headline}
              </h1>

              <p className="text-base sm:text-lg text-[#5B454D] leading-relaxed max-w-md">
                {subtitle}
              </p>
            </div>

            <div className="pt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-sm font-medium hover:bg-[#540D2B] transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <span>{t.hero.cta}</span>
                  <ArrowDownRight className="w-4 h-4" />
                </a>
                <a
                  href="#lookbook"
                  className="inline-flex items-center justify-center min-h-[46px] px-5 py-3 rounded-xl border border-[#2A1A20]/15 text-sm font-medium text-[#2A1A20] hover:bg-[#F6DDE5]/50 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.hero.explore}
                </a>
              </div>

              <div className="pt-4 border-t border-[#2A1A20]/8">
                <p className="text-xs sm:text-sm font-medium text-[#6B1238] tracking-wide">
                  {t.hero.strip}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Lifestyle Imagery Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[440px] lg:min-h-[540px] bg-[#EFE5DC] shadow-[0_20px_50px_-20px_rgba(42,26,32,0.22)]"
          >
            <BoutiqueImage
              src={images[slideIdx % images.length]}
              alt="Bags&Steps Italian shoes and bags lifestyle"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1A20]/55 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-5 inset-x-5 sm:bottom-7 sm:inset-x-7 flex items-end justify-between gap-4">
              <div className="text-[#FAF4EE]">
                <p className="text-xs uppercase tracking-[0.18em] text-[#F6DDE5] mb-1">
                  Bags&amp;Steps · Ksara
                </p>
                <p className="font-serif-editorial text-xl sm:text-2xl font-medium">
                  {t.tagline}
                </p>
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Hero slide ${i + 1}`}
                      onClick={() => setSlideIdx(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === slideIdx % images.length
                          ? 'w-6 bg-[#FAF4EE]'
                          : 'w-2 bg-[#FAF4EE]/50 hover:bg-[#FAF4EE]/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
