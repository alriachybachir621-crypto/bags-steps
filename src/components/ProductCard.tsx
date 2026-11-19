import { Heart } from 'lucide-react';
import { Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';
import { BoutiqueImage } from './BoutiqueImage';

interface ProductCardProps {
  product: Product;
  lang: Lang;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onSelect: (product: Product) => void;
  categoryLabel?: string;
}

export function ProductCard({
  product,
  lang,
  isWishlisted,
  onToggleWishlist,
  onSelect,
  categoryLabel,
}: ProductCardProps) {
  const t = getCopy(lang);
  const title = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const hasDiscount =
    product.isSale && product.oldPrice > 0 && product.oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-[#2A1A20]/8 shadow-[0_8px_28px_-16px_rgba(42,26,32,0.14)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EDE5]">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="w-full h-full block cursor-pointer"
          aria-label={title}
        >
          <BoutiqueImage
            src={product.images?.[0]}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !product.inStock ? 'opacity-70 grayscale-[25%]' : ''
            }`}
          />
        </button>

        {/* Top-left single status marker (never stacked badge clusters) */}
        <div className="absolute top-3 start-3 pointer-events-none">
          {!product.inStock ? (
            <span className="inline-block px-2.5 py-1 rounded-md bg-[#2A1A20]/85 text-[#FAF4EE] text-[11px] font-medium tracking-wide">
              {t.catalog.soldOut}
            </span>
          ) : hasDiscount ? (
            <span className="inline-block px-2.5 py-1 rounded-md bg-[#6B1238] text-[#FAF4EE] text-[11px] font-semibold tracking-wide tabular-nums">
              {t.newSale.saleLabel} · -{discountPct}%
            </span>
          ) : product.isNew ? (
            <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF4EE]/95 text-[#6B1238] text-[11px] font-semibold tracking-wide border border-[#C9A66B]/40">
              {t.newSale.newLabel}
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? t.modal.savedWishlist : t.modal.addWishlist}
          className="absolute top-3 end-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#6B1238] shadow-sm hover:scale-105 transition-transform cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#6B1238] text-[#6B1238]' : 'text-[#2A1A20]/70'
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelect(product)}
        className="p-5 flex-1 flex flex-col justify-between text-start space-y-3 cursor-pointer"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#6E5760]">
            <span>{categoryLabel || product.category}</span>
            {product.sizes?.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums truncate">
                  {product.sizes.length > 1
                    ? `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`
                    : product.sizes[0]}
                </span>
              </>
            )}
          </div>
          <h3 className="font-serif-editorial text-lg font-semibold text-[#2A1A20] group-hover:text-[#6B1238] transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#2A1A20]/6">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-[#6B1238]">
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#6E5760] line-through">
                ${product.oldPrice}
              </span>
            )}
          </div>

          {product.colors?.length > 0 && (
            <div className="flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((color, idx) => (
                <span
                  key={idx}
                  title={lang === 'ar' && color.nameAr ? color.nameAr : color.name}
                  className="w-3.5 h-3.5 rounded-full border border-[#2A1A20]/20 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </button>
    </article>
  );
}
