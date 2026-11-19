import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_SHOP_CONFIG,
  SEED_CATEGORIES,
  SEED_LOOKBOOK,
  SEED_PRODUCTS,
} from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CategoryItem,
  LookbookItem,
  Product,
  ShopConfig,
} from '../types/boutique';

function clampString(val: unknown, max: number): string {
  return String(val ?? '').slice(0, max);
}

function sanitizeProduct(p: Omit<Product, 'id'>): Omit<Product, 'id'> {
  return {
    name: clampString(p.name, 120) || 'Boutique Piece',
    nameAr: clampString(p.nameAr, 120),
    category: p.category,
    price: Math.max(0, Math.min(50000, Number(p.price) || 0)),
    oldPrice: Math.max(0, Math.min(50000, Number(p.oldPrice) || 0)),
    description: clampString(p.description, 1000),
    descriptionAr: clampString(p.descriptionAr, 1000),
    sizes: (p.sizes || []).slice(0, 12).map((s) => clampString(s, 32)),
    colors: (p.colors || []).slice(0, 10).map((c) => ({
      name: clampString(c.name, 40),
      nameAr: clampString(c.nameAr, 40),
      hex: clampString(c.hex, 16) || '#6B1238',
    })),
    images: (p.images || []).filter(Boolean).slice(0, 8).map((img) => clampString(img, 1500)),
    inStock: Boolean(p.inStock),
    isNew: Boolean(p.isNew),
    isSale: Boolean(p.isSale),
    sortOrder: Number(p.sortOrder) || 0,
    updatedAt: new Date().toISOString().slice(0, 40),
  };
}

function sanitizeCategory(c: Omit<CategoryItem, 'id'>): Omit<CategoryItem, 'id'> {
  return {
    slug: c.slug,
    name: clampString(c.name, 80) || c.slug,
    nameAr: clampString(c.nameAr, 80),
    subtitle: clampString(c.subtitle, 160),
    subtitleAr: clampString(c.subtitleAr, 160),
    image: clampString(c.image, 1500),
    sortOrder: Number(c.sortOrder) || 0,
  };
}

function sanitizeShopConfig(cfg: ShopConfig): ShopConfig {
  return {
    heroImages: (cfg.heroImages || []).filter(Boolean).slice(0, 6).map((u) => clampString(u, 1500)),
    heroHeadline: clampString(cfg.heroHeadline, 140),
    heroHeadlineAr: clampString(cfg.heroHeadlineAr, 140),
    heroSubtitle: clampString(cfg.heroSubtitle, 260),
    heroSubtitleAr: clampString(cfg.heroSubtitleAr, 260),
    whatsappNumber: clampString(cfg.whatsappNumber, 40),
    instagramUrl: clampString(cfg.instagramUrl, 250),
    mapsUrl: clampString(cfg.mapsUrl, 250),
    address: clampString(cfg.address, 200),
    addressAr: clampString(cfg.addressAr, 200),
    hours: clampString(cfg.hours, 160),
    hoursAr: clampString(cfg.hoursAr, 160),
    deliveryInfo: clampString(cfg.deliveryInfo, 300),
    deliveryInfoAr: clampString(cfg.deliveryInfoAr, 300),
    pinConfigured: Boolean(cfg.pinConfigured),
    updatedAt: new Date().toISOString().slice(0, 40),
  };
}

function sanitizeLookbook(item: Omit<LookbookItem, 'id'>): Omit<LookbookItem, 'id'> {
  return {
    image: clampString(item.image, 1500),
    caption: clampString(item.caption, 200),
    captionAr: clampString(item.captionAr, 200),
    sortOrder: Number(item.sortOrder) || 0,
  };
}

export function useBoutiqueData() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(SEED_CATEGORIES);
  const [shopConfig, setShopConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [lookbook, setLookbook] = useState<LookbookItem[]>(SEED_LOOKBOOK);
  const [hasLiveProducts, setHasLiveProducts] = useState(false);
  const [hasLiveCategories, setHasLiveCategories] = useState(false);
  const [hasLiveLookbook, setHasLiveLookbook] = useState(false);
  const [hasLiveShop, setHasLiveShop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qProducts = query(collection(db, 'products'), orderBy('sortOrder', 'asc'));
    const unsubProducts = onSnapshot(
      qProducts,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
          setProducts(items);
          setHasLiveProducts(true);
        } else {
          setProducts(SEED_PRODUCTS);
          setHasLiveProducts(false);
        }
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'products')
    );

    const qCategories = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
    const unsubCategories = onSnapshot(
      qCategories,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CategoryItem, 'id'>),
          }));
          setCategories(items);
          setHasLiveCategories(true);
        } else {
          setCategories(SEED_CATEGORIES);
          setHasLiveCategories(false);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'categories')
    );

    const unsubShop = onSnapshot(
      doc(db, 'shop', 'main'),
      (snap) => {
        if (snap.exists()) {
          setShopConfig({ ...DEFAULT_SHOP_CONFIG, ...(snap.data() as ShopConfig) });
          setHasLiveShop(true);
        } else {
          setShopConfig(DEFAULT_SHOP_CONFIG);
          setHasLiveShop(false);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'shop/main')
    );

    const qLookbook = query(collection(db, 'lookbook'), orderBy('sortOrder', 'asc'));
    const unsubLookbook = onSnapshot(
      qLookbook,
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<LookbookItem, 'id'>),
          }));
          setLookbook(items);
          setHasLiveLookbook(true);
        } else {
          setLookbook(SEED_LOOKBOOK);
          setHasLiveLookbook(false);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'lookbook')
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubShop();
      unsubLookbook();
    };
  }, []);

  const seedIfEmpty = useCallback(
    async (markPinConfigured = false) => {
      try {
        const batch = writeBatch(db);
        if (!hasLiveProducts) {
          for (const p of SEED_PRODUCTS) {
            const { id, ...rest } = p;
            batch.set(doc(db, 'products', id), sanitizeProduct(rest));
          }
        }
        if (!hasLiveCategories) {
          for (const c of SEED_CATEGORIES) {
            const { id, ...rest } = c;
            batch.set(doc(db, 'categories', id), sanitizeCategory(rest));
          }
        }
        if (!hasLiveLookbook) {
          for (const l of SEED_LOOKBOOK) {
            const { id, ...rest } = l;
            batch.set(doc(db, 'lookbook', id), sanitizeLookbook(rest));
          }
        }
        if (!hasLiveShop || markPinConfigured) {
          batch.set(
            doc(db, 'shop', 'main'),
            sanitizeShopConfig({
              ...shopConfig,
              pinConfigured: markPinConfigured ? true : shopConfig.pinConfigured,
            })
          );
        }
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'seed');
      }
    },
    [hasLiveProducts, hasLiveCategories, hasLiveLookbook, hasLiveShop, shopConfig]
  );

  const saveProduct = useCallback(async (product: Product) => {
    const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '') || `prod_${Date.now()}`;
    const { id: _id, ...rest } = product;
    try {
      await setDoc(doc(db, 'products', safeId), sanitizeProduct(rest));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${safeId}`);
    }
  }, []);

  const removeProduct = useCallback(async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  }, []);

  const saveCategory = useCallback(async (category: CategoryItem) => {
    const safeId = category.id.replace(/[^a-zA-Z0-9_-]/g, '') || category.slug;
    const { id: _id, ...rest } = category;
    try {
      await setDoc(doc(db, 'categories', safeId), sanitizeCategory(rest));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${safeId}`);
    }
  }, []);

  const saveShopConfig = useCallback(async (config: ShopConfig) => {
    try {
      await setDoc(doc(db, 'shop', 'main'), sanitizeShopConfig(config));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'shop/main');
    }
  }, []);

  const saveLookbookItem = useCallback(async (item: LookbookItem) => {
    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '') || `look_${Date.now()}`;
    const { id: _id, ...rest } = item;
    try {
      await setDoc(doc(db, 'lookbook', safeId), sanitizeLookbook(rest));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `lookbook/${safeId}`);
    }
  }, []);

  const removeLookbookItem = useCallback(async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'lookbook', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `lookbook/${itemId}`);
    }
  }, []);

  return {
    products,
    categories,
    shopConfig,
    lookbook,
    loading,
    hasLiveProducts,
    seedIfEmpty,
    saveProduct,
    removeProduct,
    saveCategory,
    saveShopConfig,
    saveLookbookItem,
    removeLookbookItem,
  };
}
