import { Instagram } from 'lucide-react';
import { Lang, LookbookItem } from '../types/boutique';
import { getCopy } from '../data/translations';
import { BoutiqueImage } from './BoutiqueImage';

interface LookbookSectionProps {
  lang: Lang;
  items: LookbookItem[];
  instagramUrl: string;
}

export function LookbookSection({
  lang,
  items,
  instagramUrl,
}: LookbookSectionProps) {
  const t = getCopy(lang);

  return (
    <section id="lookbook" className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
              {t.lookbook.eyebrow}
            </p>
            <h2
              className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#2A1A20]"
              style={{ textWrap: 'balance' }}
            >
              {t.lookbook.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5B454D]">
              {t.lookbook.subtitle}
            </p>
          </div>

          <a
            href={instagramUrl || 'https://www.instagram.com/bagsandsteps.lb/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 shadow-sm"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            <span>{t.lookbook.followBtn}</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => {
            const caption =
              lang === 'ar' && item.captionAr ? item.captionAr : item.caption;
            return (
              <a
                key={item.id}
                href={instagramUrl || 'https://www.instagram.com/bagsandsteps.lb/'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#F2E9E1] border border-[#2A1A20]/8 shadow-sm"
              >
                <BoutiqueImage
                  src={item.image}
                  alt={caption || 'Bags&Steps Lookbook'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {caption && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#2A1A20]/80 via-[#2A1A20]/35 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs sm:text-sm text-[#FAF4EE] line-clamp-2">
                      {caption}
                    </p>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
