import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { CategoryItem, CategorySlug, Lang } from '../types/boutique';
import { getCopy } from '../data/translations';
import { BoutiqueImage } from './BoutiqueImage';

interface CategoriesSectionProps {
  lang: Lang;
  categories: CategoryItem[];
  onSelectCategory: (slug: CategorySlug) => void;
}

export function CategoriesSection({
  lang,
  categories,
  onSelectCategory,
}: CategoriesSectionProps) {
  const t = getCopy(lang);

  return (
    <section id="collections" className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10 sm:mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
            {t.categories.eyebrow}
          </p>
          <h2
            className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#2A1A20]"
            style={{ textWrap: 'balance' }}
          >
            {t.categories.title}
          </h2>
          <p className="text-sm sm:text-base text-[#5B454D] leading-relaxed">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => {
            const title = lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name;
            const subtitle =
              lang === 'ar' && cat.subtitleAr ? cat.subtitleAr : cat.subtitle;
            return (
              <motion.button
                key={cat.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                onClick={() => onSelectCategory(cat.slug)}
                className="group relative text-start rounded-2xl overflow-hidden bg-white border border-[#2A1A20]/8 shadow-[0_8px_30px_-15px_rgba(42,26,32,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F2E9E1]">
                  <BoutiqueImage
                    src={cat.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 sm:p-6 flex items-end justify-between gap-4 bg-white">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#2A1A20] group-hover:text-[#6B1238] transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6E5760] line-clamp-1">
                      {subtitle}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6B1238] whitespace-nowrap shrink-0">
                    <span>{t.categories.exploreAction}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
