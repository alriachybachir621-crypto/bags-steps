import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ADMIN_EMAIL, auth } from './lib/firebase';
import { useBoutiqueData } from './hooks/useBoutiqueData';
import { CategorySlug, Lang, Product } from './types/boutique';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { NewAndSaleSection } from './components/NewAndSaleSection';
import { CatalogSection } from './components/CatalogSection';
import { DeliverySection } from './components/DeliverySection';
import { LookbookSection } from './components/LookbookSection';
import { ContactFooter } from './components/ContactFooter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { VaultModal } from './components/VaultModal';
import { BoutiqueManager } from './components/BoutiqueManager';

const WISHLIST_STORAGE_KEY = 'bagsandsteps_wishlist';
const LANG_STORAGE_KEY = 'bagsandsteps_lang';

function Storefront() {
  const {
    products,
    categories,
    shopConfig,
    lookbook,
    seedIfEmpty,
    saveProduct,
    removeProduct,
    saveCategory,
    saveShopConfig,
    saveLookbookItem,
    removeLookbookItem,
  } = useBoutiqueData();

  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Auth & 5-tap secret entry
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const isAuthenticatedOwner = currentUser?.email === ADMIN_EMAIL;

  const handleLogoTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (isAuthenticatedOwner) {
        setManagerOpen(true);
      } else {
        setVaultOpen(true);
      }
      return;
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, 2500);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCategorySelect = (slug: CategorySlug) => {
    setSelectedCategory(slug);
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FAF4EE] text-[#2A1A20]">
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        wishlistCount={wishlistProducts.length}
        onOpenWishlist={() => setWishlistOpen(true)}
        onLogoTap={handleLogoTap}
      />

      <main>
        <HeroSection
          lang={lang}
          shopConfig={shopConfig}
          onLogoTap={handleLogoTap}
        />

        <CategoriesSection
          lang={lang}
          categories={categories}
          onSelectCategory={handleCategorySelect}
        />

        <NewAndSaleSection
          lang={lang}
          products={products}
          categories={categories}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onSelectProduct={setActiveProduct}
        />

        <CatalogSection
          lang={lang}
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onSelectProduct={setActiveProduct}
        />

        <DeliverySection
          lang={lang}
          shopConfig={shopConfig}
          wishlistProducts={wishlistProducts}
        />

        <LookbookSection
          lang={lang}
          items={lookbook}
          instagramUrl={shopConfig.instagramUrl}
        />
      </main>

      <ContactFooter
        lang={lang}
        shopConfig={shopConfig}
        onLogoTap={handleLogoTap}
      />

      <FloatingWhatsApp
        lang={lang}
        whatsappNumber={shopConfig.whatsappNumber}
      />

      <ProductDetailModal
        product={activeProduct}
        lang={lang}
        whatsappNumber={shopConfig.whatsappNumber}
        isWishlisted={activeProduct ? wishlist.includes(activeProduct.id) : false}
        onToggleWishlist={toggleWishlist}
        onClose={() => setActiveProduct(null)}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        lang={lang}
        products={wishlistProducts}
        whatsappNumber={shopConfig.whatsappNumber}
        onRemove={toggleWishlist}
        onSelectProduct={setActiveProduct}
      />

      <VaultModal
        open={vaultOpen}
        onClose={() => setVaultOpen(false)}
        lang={lang}
        pinConfigured={shopConfig.pinConfigured}
        onAuthenticated={async (isFirstSetup) => {
          setVaultOpen(false);
          setManagerOpen(true);
          if (isFirstSetup) {
            await seedIfEmpty(true);
          }
        }}
      />

      {isAuthenticatedOwner && (
        <BoutiqueManager
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
          products={products}
          categories={categories}
          shopConfig={shopConfig}
          lookbook={lookbook}
          onSaveProduct={saveProduct}
          onDeleteProduct={removeProduct}
          onSaveCategory={saveCategory}
          onSaveShopConfig={saveShopConfig}
          onSaveLookbook={saveLookbookItem}
          onDeleteLookbook={removeLookbookItem}
          onSeedDefaults={() => seedIfEmpty(true)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Storefront />
    </ErrorBoundary>
  );
}
