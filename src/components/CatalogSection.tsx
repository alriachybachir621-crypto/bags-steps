import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CategoryItem, CategorySlug, Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  lang: Lang;
  products: Product[];
  categories: CategoryItem[];
  selectedCategory: CategorySlug | 'all';
  onCategoryChange: (cat: CategorySlug | 'all') => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

type PriceFilter = 'all' | 'under60' | '60to100' | 'over100';
type StatusFilter = 'all' | 'new' | 'sale' | 'instock';

export function CatalogSection({
  lang,
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
}: CatalogSectionProps) {
  const t = getCopy(lang);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (priceFilter === 'under60' && p.price >= 60) return false;
      if (priceFilter === '60to100' && (p.price < 60 || p.price > 100)) return false;
      if (priceFilter === 'over100' && p.price <= 100) return false;
      if (statusFilter === 'new' && !p.isNew) return false;
      if (statusFilter === 'sale' && !p.isSale) return false;
      if (statusFilter === 'instock' && !p.inStock) return false;
      if (q) {
        const hay = `${p.name} ${p.nameAr} ${p.description} ${p.descriptionAr} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategory, priceFilter, statusFilter, search]);

  const getCategoryLabel = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (!found) return slug;
    return lang === 'ar' && found.nameAr ? found.nameAr : found.name;
  };

  const resetAll = () => {
    setSearch('');
    onCategoryChange('all');
    setPriceFilter('all');
    setStatusFilter('all');
  };

  return (
    <section id="catalog" className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
              {t.catalog.eyebrow}
            </p>
            <h2
              className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#2A1A20]"
              style={{ textWrap: 'balance' }}
            >
              {t.catalog.title}
            </h2>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6E5760] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.catalog.searchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-9 py-2.5 rounded-xl bg-white border border-[#2A1A20]/12 text-sm text-[#2A1A20] placeholder:text-[#6E5760]/70 focus:outline-none focus:border-[#6B1238]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 text-[#6E5760] hover:text-[#2A1A20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs + Price & Status Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2A1A20]/8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#6B1238] text-[#FAF4EE]'
                  : 'bg-white text-[#2A1A20]/75 hover:bg-[#F6DDE5]/50 border border-[#2A1A20]/8'
              }`}
            >
              {t.catalog.allCategories}
            </button>
            {categories.map((cat) => {
              const label = lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name;
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#6B1238] text-[#FAF4EE]'
                      : 'bg-white text-[#2A1A20]/75 hover:bg-[#F6DDE5]/50 border border-[#2A1A20]/8'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              aria-label="Filter by price"
              className="min-h-[40px] px-3 py-2 rounded-lg bg-white border border-[#2A1A20]/12 text-xs font-medium text-[#2A1A20] focus:outline-none focus:border-[#6B1238] cursor-pointer"
            >
              <option value="all">{t.catalog.allPrices}</option>
              <option value="under60">{t.catalog.under60}</option>
              <option value="60to100">{t.catalog.from60to100}</option>
              <option value="over100">{t.catalog.over100}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter by availability"
              className="min-h-[40px] px-3 py-2 rounded-lg bg-white border border-[#2A1A20]/12 text-xs font-medium text-[#2A1A20] focus:outline-none focus:border-[#6B1238] cursor-pointer"
            >
              <option value="all">{t.catalog.filterAll}</option>
              <option value="new">{t.catalog.filterNew}</option>
              <option value="sale">{t.catalog.filterSale}</option>
              <option value="instock">{t.catalog.filterInStock}</option>
            </select>

            <span className="text-xs text-[#6E5760] tabular-nums ps-1">
              {filtered.length} {t.catalog.showing}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#2A1A20]/8 p-12 text-center space-y-4">
            <p className="text-base text-[#5B454D]">{t.catalog.empty}</p>
            <button
              type="button"
              onClick={resetAll}
              className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-xs font-medium hover:bg-[#540D2B] transition-colors cursor-pointer"
            >
              {t.catalog.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((product) => (
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
        )}
      </div>
    </section>
  );
}
