import { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { Lang } from '../types/boutique';
import { getCopy } from '../data/translations';

interface NavbarProps {
  lang: Lang;
  onToggleLang: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onLogoTap: () => void;
}

export function Navbar({
  lang,
  onToggleLang,
  wishlistCount,
  onOpenWishlist,
  onLogoTap,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = getCopy(lang);

  const navLinks = [
    { href: '#collections', label: t.nav.collections },
    { href: '#new-sale', label: t.nav.newSale },
    { href: '#catalog', label: t.nav.catalog },
    { href: '#delivery', label: t.nav.delivery },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF4EE]/95 backdrop-blur-md border-b border-[#2A1A20]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Lockup (5 taps on logo opens private code pad) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onLogoTap}
            aria-label="Bags&Steps"
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1238] transition-transform active:scale-95 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Bags&Steps logo"
              className="w-full h-full object-cover"
            />
          </button>
          <a
            href="#top"
            className="font-serif-editorial text-xl font-semibold tracking-tight text-[#6B1238] whitespace-nowrap shrink-0"
          >
            Bags&amp;Steps
          </a>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2A1A20]/80">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#6B1238] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#6B1238]/50"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language toggle + Wishlist */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-[#2A1A20] hover:bg-[#F6DDE5]/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={t.nav.wishlist}
            className="relative min-h-[40px] min-w-[40px] px-3 py-2 rounded-lg bg-[#6B1238] text-[#FAF4EE] hover:bg-[#540D2B] transition-colors flex items-center gap-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.wishlist}</span>
            {wishlistCount > 0 && (
              <span className="tabular-nums font-semibold">({wishlistCount})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#2A1A20] hover:bg-[#F6DDE5]/60 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-[#2A1A20]/8 bg-[#FAF4EE] px-4 py-4 space-y-1">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#2A1A20] hover:bg-[#F6DDE5]/60 hover:text-[#6B1238] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
