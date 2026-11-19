import { Clock, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { Lang, ShopConfig } from '../types/boutique';
import { getCopy } from '../data/translations';
import { buildWhatsappUrl } from '../lib/whatsapp';

interface ContactFooterProps {
  lang: Lang;
  shopConfig: ShopConfig;
  onLogoTap: () => void;
}

export function ContactFooter({
  lang,
  shopConfig,
  onLogoTap,
}: ContactFooterProps) {
  const t = getCopy(lang);
  const address =
    lang === 'ar' && shopConfig.addressAr ? shopConfig.addressAr : shopConfig.address;
  const hours =
    lang === 'ar' && shopConfig.hoursAr ? shopConfig.hoursAr : shopConfig.hours;
  const whatsappHref = buildWhatsappUrl(
    shopConfig.whatsappNumber,
    t.whatsapp.generalGreeting
  );

  return (
    <>
      <section
        id="contact"
        className="py-14 sm:py-20 bg-[#FBF7F2] border-t border-[#2A1A20]/8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-white rounded-3xl p-7 sm:p-9 border border-[#2A1A20]/8 shadow-[0_10px_34px_-18px_rgba(42,26,32,0.12)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B1238]">
                    {t.contact.eyebrow}
                  </p>
                  <h2 className="font-serif-editorial text-3xl font-semibold text-[#2A1A20]">
                    {t.contact.title}
                  </h2>
                  <p className="text-sm text-[#5B454D] leading-relaxed">
                    {t.contact.subtitle}
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-[#2A1A20]/8 text-sm">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 text-[#6B1238] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6E5760]">
                        {t.contact.whatsappLabel}
                      </p>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="font-medium text-[#2A1A20] hover:text-[#6B1238] tabular-nums"
                      >
                        {shopConfig.whatsappNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Instagram className="w-4 h-4 text-[#6B1238] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6E5760]">
                        {t.contact.instagramLabel}
                      </p>
                      <a
                        href={shopConfig.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="font-medium text-[#2A1A20] hover:text-[#6B1238]"
                      >
                        @bagsandsteps.lb
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#6B1238] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6E5760]">
                        {t.contact.addressLabel}
                      </p>
                      <p className="font-medium text-[#2A1A20]">{address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#6B1238] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6E5760]">
                        {t.contact.hoursLabel}
                      </p>
                      <p className="font-medium text-[#2A1A20]">{hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors text-xs sm:text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{t.contact.chatNow}</span>
                </a>

                <a
                  href={shopConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#2A1A20]/15 text-[#2A1A20] hover:bg-[#F6DDE5]/50 transition-colors text-xs sm:text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{t.contact.openMaps}</span>
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="lg:col-span-7 min-h-[340px] lg:min-h-[440px] rounded-3xl overflow-hidden border border-[#2A1A20]/10 shadow-[0_10px_34px_-18px_rgba(42,26,32,0.12)] bg-[#EFE5DC]">
              <iframe
                title="Bags&Steps Ksara Zahle Location"
                src="https://maps.google.com/maps?q=Ksara,+Zahle,+Lebanon&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full min-h-[340px] lg:min-h-[440px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#2A1A20] text-[#FAF4EE] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onLogoTap}
              aria-label="Bags&Steps"
              className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#C9A66B]/40 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Bags&Steps"
                className="w-full h-full object-cover"
              />
            </button>
            <div>
              <p className="font-serif-editorial text-lg font-semibold text-[#FAF4EE]">
                Bags&amp;Steps
              </p>
              <p className="text-xs text-[#F6DDE5]/80">{t.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#FAF4EE]/80">
            <a href="#collections" className="hover:text-[#F6DDE5] transition-colors">
              {t.nav.collections}
            </a>
            <a href="#catalog" className="hover:text-[#F6DDE5] transition-colors">
              {t.nav.catalog}
            </a>
            <a href="#delivery" className="hover:text-[#F6DDE5] transition-colors">
              {t.nav.delivery}
            </a>
            <a
              href={shopConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F6DDE5] transition-colors"
            >
              Instagram
            </a>
          </div>

          <p className="text-xs text-[#FAF4EE]/70 text-center sm:text-end">
            © {new Date().getFullYear()} Bags&amp;Steps · {t.footer.crafted}
          </p>
        </div>
      </footer>
    </>
  );
}
