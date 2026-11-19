import { CategoryItem, Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';
import { ProductCard } from './ProductCard';

interface NewAndSaleSectionProps {
  lang: Lang;
  products: Product[];
  categories: CategoryItem[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

export function NewAndSaleSection({
  lang,
  products,
  categories,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
}: NewAndSaleSectionProps) {
  const t = getCopy(lang);
  const featured = products.filter((p) => p.isNew || p.isSale).slice(0, 6);

  if (featured.length === 0) return null;

  const getCategoryLabel = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (!found) return slug;
    return lang === 'ar' && found.nameAr ? found.nameAr : found.name;
  };

  return (
    <section
      id="new-sale"
      className="py-14 sm:py-20 bg-[#F6DDE5]/35 border-y border-[#2A1A20]/6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
              {t.newSale.eyebrow}
            </p>
            <h2
              className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#2A1A20]"
              style={{ textWrap: 'balance' }}
            >
              {t.newSale.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5B454D]">
              {t.newSale.subtitle}
            </p>
          </div>
          <a
            href="#catalog"
            className="text-sm font-medium text-[#6B1238] hover:underline whitespace-nowrap shrink-0"
          >
            {t.hero.cta}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
              categoryLabel={getCategoryLabel(product.category)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
