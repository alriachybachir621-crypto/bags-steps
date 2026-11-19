import { Lang, Product } from '../types/boutique';
import { getCopy } from '../data/translations';

export function normalizeWhatsappPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '96170000000';
  return digits;
}

export function buildWhatsappUrl(phone: string, message: string): string {
  const cleanPhone = normalizeWhatsappPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildProductOrderMessage(
  product: Product,
  size: string,
  colorName: string,
  lang: Lang
): string {
  const t = getCopy(lang).whatsapp;
  const productName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const lines = [
    product.inStock ? t.productPrefix : t.restockPrefix,
    `${t.productLabel}: ${productName}`,
    `${t.sizeLabel}: ${size}`,
    `${t.colorLabel}: ${colorName}`,
    `${t.priceLabel}: $${product.price} USD`,
  ];
  return lines.join('\n');
}

export function buildDeliveryOrderMessage(
  data: { name: string; area: string; phone: string; notes: string },
  lang: Lang
): string {
  const t = getCopy(lang).whatsapp;
  const lines = [
    t.deliveryPrefix,
    `${t.customerName}: ${data.name}`,
    `${t.customerArea}: ${data.area}`,
    `${t.customerPhone}: ${data.phone}`,
  ];
  if (data.notes.trim()) {
    lines.push(`${t.customerNotes}: ${data.notes.trim()}`);
  }
  return lines.join('\n');
}

export function buildWishlistMessage(products: Product[], lang: Lang): string {
  const t = getCopy(lang).whatsapp;
  const items = products.map((p, idx) => {
    const title = lang === 'ar' && p.nameAr ? p.nameAr : p.name;
    return `${idx + 1}. ${title} — $${p.price} USD`;
  });
  return [t.wishlistPrefix, ...items].join('\n');
}
