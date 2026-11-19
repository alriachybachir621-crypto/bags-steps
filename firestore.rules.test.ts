/**
 * Security Rules Specification Verification (Dirty Dozen Test Matrix)
 * Run with @firebase/rules-unit-testing against the Firestore emulator.
 */

export interface SecurityTestCase {
  name: string;
  authEmail: string | null;
  operation: 'create' | 'update' | 'delete' | 'read';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

const VALID_PRODUCT = {
  name: 'Milano Burgundy Slingback',
  nameAr: 'حذاء ميلانو كعب عنابي',
  category: 'heels',
  price: 68,
  oldPrice: 85,
  description: 'Italian patent calfskin slingback.',
  descriptionAr: 'حذاء إيطالي من الجلد اللامع.',
  sizes: ['36', '37', '38', '39', '40', '41'],
  colors: [{ name: 'Wine', nameAr: 'عنابي', hex: '#6B1238' }],
  images: ['/src/assets/images/product_heels_wine_1795076185161.jpg'],
  inStock: true,
  isNew: true,
  isSale: true,
  sortOrder: 1,
  updatedAt: '2026-11-19T08:00:00.000Z',
};

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    name: '1. Unauthenticated product create denied',
    authEmail: null,
    operation: 'create',
    path: 'products/prod_1',
    payload: VALID_PRODUCT,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Non-admin authenticated product create denied',
    authEmail: 'customer@example.com',
    operation: 'create',
    path: 'products/prod_1',
    payload: VALID_PRODUCT,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Unauthenticated shop config update denied',
    authEmail: null,
    operation: 'update',
    path: 'shop/main',
    payload: { whatsappNumber: '+961000000' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Non-admin category delete denied',
    authEmail: 'intruder@bagsandsteps.app',
    operation: 'delete',
    path: 'categories/shoes',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Admin shadow-field injection denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/prod_shadow',
    payload: { ...VALID_PRODUCT, ghostField: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Admin invalid document ID denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/bad$id!',
    payload: VALID_PRODUCT,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Admin oversized product name denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/prod_long',
    payload: { ...VALID_PRODUCT, name: 'A'.repeat(121) },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Admin negative price denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/prod_neg',
    payload: { ...VALID_PRODUCT, price: -10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Admin invalid category slug denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/prod_cat',
    payload: { ...VALID_PRODUCT, category: 'electronics' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Admin oversized images list denied',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'products/prod_imgs',
    payload: { ...VALID_PRODUCT, images: Array(9).fill('/img.jpg') },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Unknown collection blocked by default-deny',
    authEmail: 'admin@bagsandsteps.app',
    operation: 'create',
    path: 'secret/doc1',
    payload: { foo: 'bar' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Non-admin lookbook update denied',
    authEmail: 'visitor@example.com',
    operation: 'update',
    path: 'lookbook/item_1',
    payload: { image: '/hack.jpg', caption: 'x', captionAr: 'x', sortOrder: 1 },
    expected: 'PERMISSION_DENIED',
  },
];
