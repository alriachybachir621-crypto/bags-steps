import { FormEvent, useState } from 'react';
import { MapPin, MessageCircle, Truck } from 'lucide-react';
import { Lang, Product, ShopConfig } from '../types/boutique';
import { getCopy } from '../data/translations';
import { buildDeliveryOrderMessage, buildWhatsappUrl } from '../lib/whatsapp';

interface DeliverySectionProps {
  lang: Lang;
  shopConfig: ShopConfig;
  wishlistProducts: Product[];
}

export function DeliverySection({
  lang,
  shopConfig,
  wishlistProducts,
}: DeliverySectionProps) {
  const t = getCopy(lang);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryInfo =
    lang === 'ar' && shopConfig.deliveryInfoAr
      ? shopConfig.deliveryInfoAr
      : shopConfig.deliveryInfo;

  const includeWishlist = () => {
    if (wishlistProducts.length === 0) return;
    const summary = wishlistProducts
      .map((p) => {
        const title = lang === 'ar' && p.nameAr ? p.nameAr : p.name;
        return `${title} ($${p.price})`;
      })
      .join(', ');
    setNotes((prev) => (prev.trim() ? `${prev.trim()}\n${summary}` : summary));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area.trim() || !phone.trim()) {
      setErrorMsg(t.delivery.requiredNotice);
      return;
    }
    setErrorMsg('');
    const href = buildWhatsappUrl(
      shopConfig.whatsappNumber,
      buildDeliveryOrderMessage({ name, area, phone, notes }, lang)
    );
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="delivery"
      className="py-14 sm:py-20 bg-[#F6DDE5]/30 border-y border-[#2A1A20]/6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Delivery Info & Coverage */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
                {t.delivery.eyebrow}
              </p>
              <h2
                className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#2A1A20]"
                style={{ textWrap: 'balance' }}
              >
                {t.delivery.title}
              </h2>
              <p className="text-sm sm:text-base text-[#5B454D] leading-relaxed">
                {t.delivery.subtitle}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#2A1A20]/8 shadow-[0_8px_28px_-16px_rgba(42,26,32,0.1)] space-y-4">
              <div className="flex items-center gap-3 text-[#6B1238]">
                <Truck className="w-5 h-5 shrink-0" />
                <h3 className="font-serif-editorial text-lg font-semibold text-[#2A1A20]">
                  {t.delivery.regionsTitle}
                </h3>
              </div>
              <p className="text-sm text-[#5B454D] leading-relaxed">
                {deliveryInfo}
              </p>
              <div className="pt-3 border-t border-[#2A1A20]/8 flex items-center gap-2 text-xs text-[#6E5760]">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>
                  {lang === 'ar' && shopConfig.addressAr
                    ? shopConfig.addressAr
                    : shopConfig.address}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Order Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#2A1A20]/8 shadow-[0_12px_36px_-18px_rgba(42,26,32,0.14)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="font-serif-editorial text-2xl font-semibold text-[#2A1A20]">
                {t.delivery.formTitle}
              </h3>
              {wishlistProducts.length > 0 && (
                <button
                  type="button"
                  onClick={includeWishlist}
                  className="text-xs font-medium text-[#6B1238] hover:underline cursor-pointer"
                >
                  + {t.delivery.useWishlist} ({wishlistProducts.length})
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2A1A20]/80">
                    {t.delivery.nameLabel} *
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.delivery.namePlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF4EE]/60 border border-[#2A1A20]/12 text-sm text-[#2A1A20] focus:outline-none focus:border-[#6B1238]"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2A1A20]/80">
                    {t.delivery.areaLabel} *
                  </span>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder={t.delivery.areaPlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF4EE]/60 border border-[#2A1A20]/12 text-sm text-[#2A1A20] focus:outline-none focus:border-[#6B1238]"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#2A1A20]/80">
                  {t.delivery.phoneLabel} *
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.delivery.phonePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF4EE]/60 border border-[#2A1A20]/12 text-sm text-[#2A1A20] focus:outline-none focus:border-[#6B1238]"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#2A1A20]/80">
                  {t.delivery.notesLabel}
                </span>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.delivery.notesPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4EE]/60 border border-[#2A1A20]/12 text-sm text-[#2A1A20] focus:outline-none focus:border-[#6B1238]"
                />
              </label>

              {errorMsg && (
                <p className="text-xs font-medium text-[#6B1238]" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{t.delivery.submit}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
