export type CategorySlug =
  | 'shoes'
  | 'boots'
  | 'sneakers'
  | 'heels'
  | 'bags'
  | 'accessories';

export type Lang = 'en' | 'ar';

export interface ProductColor {
  name: string;
  nameAr: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: CategorySlug;
  price: number;
  oldPrice: number;
  description: string;
  descriptionAr: string;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  slug: CategorySlug;
  name: string;
  nameAr: string;
  subtitle: string;
  subtitleAr: string;
  image: string;
  sortOrder: number;
}

export interface ShopConfig {
  heroImages: string[];
  heroHeadline: string;
  heroHeadlineAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  whatsappNumber: string;
  instagramUrl: string;
  mapsUrl: string;
  address: string;
  addressAr: string;
  hours: string;
  hoursAr: string;
  deliveryInfo: string;
  deliveryInfoAr: string;
  pinConfigured: boolean;
  updatedAt: string;
}

export interface LookbookItem {
  id: string;
  image: string;
  caption: string;
  captionAr: string;
  sortOrder: number;
}
