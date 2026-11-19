import { useEffect, useState } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';
import { buildProductOrderMessage, buildWhatsappUrl } from '../lib/whatsapp';
import { BoutiqueImage } from './BoutiqueImage';

interface ProductDetailModalProps {
  product: Product | null;
  lang: Lang;
  whatsappNumber: string;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  lang,
  whatsappNumber,
  isWishlisted,
  onToggleWishlist,
  onClose,
}: ProductDetailModalProps) {
  const t = getCopy(lang);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] || 'One Size');
    setSelectedColorIdx(0);
  }, [product]);

  if (!product) return null;

  const title = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const desc =
    lang === 'ar' && product.descriptionAr
      ? product.descriptionAr
      : product.description;
  const images = product.images?.length ? product.images : [''];
  const colors = product.colors?.length
    ? product.colors
    : [{ name: 'Signature', nameAr: 'قياسي', hex: '#6B1238' }];
  const chosenColor = colors[selectedColorIdx] || colors[0];
  const colorLabel =
    lang === 'ar' && chosenColor.nameAr ? chosenColor.nameAr : chosenColor.name;

  const hasDiscount =
    product.isSale && product.oldPrice > 0 && product.oldPrice > product.price;

  const whatsappHref = buildWhatsappUrl(
    whatsappNumber,
    buildProductOrderMessage(product, selectedSize || 'One Size', colorLabel, lang)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2A1A20]/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF4EE] rounded-3xl overflow-hidden shadow-2xl border border-[#2A1A20]/10 grid grid-cols-1 md:grid-cols-12 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.modal.close}
          className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full bg-white/90 text-[#2A1A20] flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Gallery Column */}
        <div className="md:col-span-6 bg-[#F3EAE2] p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white">
            <BoutiqueImage
              src={images[activeImage]}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    i === activeImage
                      ? 'border-[#6B1238] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <BoutiqueImage
                    src={img}
                    alt={`${title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & WhatsApp Purchase Column */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="space-y-2 pe-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B1238]">
                {product.category} {!product.inStock ? `· ${t.catalog.soldOut}` : ''}
              </p>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#2A1A20]">
                {title}
              </h2>
              <div className="flex items-baseline gap-3 tabular-nums pt-1">
                <span className="text-2xl font-semibold text-[#6B1238]">
                  ${product.price} USD
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#6E5760] line-through">
                    ${product.oldPrice} USD
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-[#5B454D] leading-relaxed">{desc}</p>

            {/* Color Picker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#2A1A20]/80">
                  {t.modal.selectColor}
                </span>
                <span className="text-[#6B1238] font-medium">{colorLabel}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {colors.map((c, idx) => {
                  const name = lang === 'ar' && c.nameAr ? c.nameAr : c.name;
                  const active = idx === selectedColorIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'border-[#6B1238] bg-[#F6DDE5]/50 text-[#6B1238]'
                          : 'border-[#2A1A20]/12 bg-white text-[#2A1A20]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#2A1A20]/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Picker */}
            {product.sizes?.length > 0 && (
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#2A1A20]/80">
                  {t.modal.selectSize}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {product.sizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-h-[42px] min-w-[48px] px-3.5 py-2 rounded-xl border text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#6B1238] text-[#FAF4EE] border-[#6B1238]'
                            : 'bg-white text-[#2A1A20] border-[#2A1A20]/15 hover:border-[#6B1238]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#2A1A20]/8">
            <div className="flex items-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>
                  {product.inStock ? t.modal.orderWhatsapp : t.modal.askRestock}
                </span>
              </a>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label={isWishlisted ? t.modal.savedWishlist : t.modal.addWishlist}
                className={`min-h-[48px] min-w-[48px] px-3.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'bg-[#F6DDE5] border-[#6B1238]/30 text-[#6B1238]'
                    : 'bg-white border-[#2A1A20]/15 text-[#2A1A20] hover:border-[#6B1238]'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-[#6B1238]' : ''}`}
                />
              </button>
            </div>
            <p className="text-xs text-[#6E5760] text-center">
              {t.modal.italianCraft}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
