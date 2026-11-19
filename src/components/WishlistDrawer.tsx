import { MessageCircle, Trash2, X } from 'lucide-react';
import { Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';
import { buildWhatsappUrl, buildWishlistMessage } from '../lib/whatsapp';
import { BoutiqueImage } from './BoutiqueImage';

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  products: Product[];
  whatsappNumber: string;
  onRemove: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

export function WishlistDrawer({
  open,
  onClose,
  lang,
  products,
  whatsappNumber,
  onRemove,
  onSelectProduct,
}: WishlistDrawerProps) {
  if (!open) return null;
  const t = getCopy(lang);
  const whatsappHref = buildWhatsappUrl(
    whatsappNumber,
    buildWishlistMessage(products, lang)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2A1A20]/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.wishlist.title}
    >
      <div
        className="w-full max-w-md bg-[#FAF4EE] h-full flex flex-col shadow-2xl border-s border-[#2A1A20]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-[#2A1A20]/8 flex items-center justify-between">
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#2A1A20]">
            {t.wishlist.title} ({products.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.modal.close}
            className="w-10 h-10 rounded-full hover:bg-[#F6DDE5]/60 flex items-center justify-center text-[#2A1A20] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-[#5B454D] leading-relaxed py-8 text-center">
              {t.wishlist.empty}
            </p>
          ) : (
            products.map((product) => {
              const title =
                lang === 'ar' && product.nameAr ? product.nameAr : product.name;
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-[#2A1A20]/8"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-[#F2E9E1] shrink-0 cursor-pointer"
                  >
                    <BoutiqueImage
                      src={product.images?.[0]}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="font-serif-editorial text-base font-semibold text-[#2A1A20] hover:text-[#6B1238] truncate block text-start w-full cursor-pointer"
                    >
                      {title}
                    </button>
                    <p className="text-sm font-semibold text-[#6B1238] tabular-nums">
                      ${product.price} USD
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={t.wishlist.remove}
                    className="w-9 h-9 rounded-lg text-[#6E5760] hover:text-[#6B1238] hover:bg-[#F6DDE5]/50 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {products.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-[#2A1A20]/8 bg-white">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>{t.wishlist.sendWhatsapp}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
