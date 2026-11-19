import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  Edit3,
  ImagePlus,
  KeyRound,
  LogOut,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  PASSCODE_SUFFIX,
  uploadBoutiqueImage,
} from '../lib/firebase';
import {
  CategoryItem,
  CategorySlug,
  LookbookItem,
  Product,
  ProductColor,
  ShopConfig,
} from '../types/boutique';
import { BoutiqueImage } from './BoutiqueImage';

interface BoutiqueManagerProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  categories: CategoryItem[];
  shopConfig: ShopConfig;
  lookbook: LookbookItem[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveCategory: (cat: CategoryItem) => Promise<void>;
  onSaveShopConfig: (cfg: ShopConfig) => Promise<void>;
  onSaveLookbook: (item: LookbookItem) => Promise<void>;
  onDeleteLookbook: (id: string) => Promise<void>;
  onSeedDefaults: () => Promise<void>;
}

type TabKey = 'products' | 'categories' | 'hero' | 'shop';

const ALL_SIZES = ['36', '37', '38', '39', '40', '41', 'One Size'];
const CATEGORY_SLUGS: CategorySlug[] = [
  'shoes',
  'boots',
  'sneakers',
  'heels',
  'bags',
  'accessories',
];

function emptyProduct(sortOrder: number): Product {
  return {
    id: `prod_${Date.now()}`,
    name: '',
    nameAr: '',
    category: 'shoes',
    price: 75,
    oldPrice: 0,
    description: '',
    descriptionAr: '',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: [{ name: 'Wine', nameAr: 'عنابي', hex: '#6B1238' }],
    images: [],
    inStock: true,
    isNew: true,
    isSale: false,
    sortOrder,
    updatedAt: new Date().toISOString(),
  };
}

export function BoutiqueManager({
  open,
  onClose,
  products,
  categories,
  shopConfig,
  lookbook,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onSaveShopConfig,
  onSaveLookbook,
  onDeleteLookbook,
  onSeedDefaults,
}: BoutiqueManagerProps) {
  const [tab, setTab] = useState<TabKey>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorNameAr, setNewColorNameAr] = useState('');
  const [newColorHex, setNewColorHex] = useState('#6B1238');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Shop / Hero local draft
  const [shopDraft, setShopDraft] = useState<ShopConfig>(shopConfig);
  const [heroUrlInput, setHeroUrlInput] = useState('');

  useEffect(() => {
    if (open) {
      setShopDraft(shopConfig);
    }
  }, [open, shopConfig]);

  // Lookbook draft
  const [newLookUrl, setNewLookUrl] = useState('');
  const [newLookCaption, setNewLookCaption] = useState('');
  const [newLookCaptionAr, setNewLookCaptionAr] = useState('');

  // Change PIN modal state
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmNextPin, setConfirmNextPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  if (!open) return null;

  const flashStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  const handleUploadFiles = async (
    e: ChangeEvent<HTMLInputElement>,
    folder: string,
    onUrls: (urls: string[]) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadBoutiqueImage(files[i], folder);
        urls.push(url);
      }
      onUrls(urls);
      flashStatus('Image uploaded.');
    } catch (err) {
      flashStatus(
        err instanceof Error
          ? `Upload failed: ${err.message}. You can also paste an image URL.`
          : 'Upload failed.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await onSaveProduct(editingProduct);
    setEditingProduct(null);
    flashStatus('Product saved.');
  };

  const handleChangePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPinMsg('');
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(nextPin)) {
      setPinMsg('Codes must be exactly 4 digits.');
      return;
    }
    if (nextPin !== confirmNextPin) {
      setPinMsg('New codes do not match.');
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    try {
      const cred = EmailAuthProvider.credential(
        ADMIN_EMAIL,
        currentPin + PASSCODE_SUFFIX
      );
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, nextPin + PASSCODE_SUFFIX);
      setCurrentPin('');
      setNextPin('');
      setConfirmNextPin('');
      setShowChangePin(false);
      flashStatus('4-digit code updated.');
    } catch {
      setPinMsg('Current code is incorrect.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2A1A20]/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      dir="ltr"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-6xl bg-[#FAF4EE] rounded-3xl shadow-2xl border border-[#2A1A20]/12 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 bg-white border-b border-[#2A1A20]/8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Bags&Steps"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-serif-editorial text-xl font-semibold text-[#6B1238]">
                Bags&amp;Steps Boutique Manager
              </h2>
              <p className="text-xs text-[#6E5760]">
                Manage catalog, categories, hero imagery &amp; shop settings
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusMsg && (
              <span className="text-xs font-medium text-[#6B1238] bg-[#F6DDE5]/70 px-3 py-1.5 rounded-lg">
                {statusMsg}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowChangePin((v) => !v)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#2A1A20]/12 text-xs font-medium text-[#2A1A20] hover:bg-[#F6DDE5]/50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change code</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-xs font-medium hover:bg-[#540D2B] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close manager"
              className="w-9 h-9 rounded-full hover:bg-[#F6DDE5]/60 flex items-center justify-center text-[#2A1A20] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Change PIN Inline Drawer */}
        {showChangePin && (
          <form
            onSubmit={handleChangePinSubmit}
            className="px-5 sm:px-8 py-4 bg-[#F6DDE5]/40 border-b border-[#2A1A20]/8 flex flex-wrap items-end gap-3"
          >
            <label className="space-y-1">
              <span className="block text-xs font-medium text-[#2A1A20]">
                Current 4-digit code
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 px-3 py-2 rounded-lg bg-white border border-[#2A1A20]/15 text-sm tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium text-[#2A1A20]">
                New 4-digit code
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={nextPin}
                onChange={(e) => setNextPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 px-3 py-2 rounded-lg bg-white border border-[#2A1A20]/15 text-sm tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium text-[#2A1A20]">
                Confirm new code
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmNextPin}
                onChange={(e) =>
                  setConfirmNextPin(e.target.value.replace(/\D/g, ''))
                }
                className="w-32 px-3 py-2 rounded-lg bg-white border border-[#2A1A20]/15 text-sm tabular-nums"
              />
            </label>
            <button
              type="submit"
              className="min-h-[38px] px-4 py-2 rounded-lg bg-[#6B1238] text-[#FAF4EE] text-xs font-medium cursor-pointer"
            >
              Update Code
            </button>
            {pinMsg && (
              <span className="text-xs font-medium text-[#6B1238]">{pinMsg}</span>
            )}
          </form>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-8 pt-3 bg-white border-b border-[#2A1A20]/8 flex items-center gap-2 overflow-x-auto">
          {(
            [
              { id: 'products', label: `Products (${products.length})` },
              { id: 'categories', label: 'Categories' },
              { id: 'hero', label: 'Hero & Lookbook' },
              { id: 'shop', label: 'Shop Info' },
            ] as { id: TabKey; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setShopDraft(shopConfig);
              }}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === item.id
                  ? 'border-[#6B1238] text-[#6B1238]'
                  : 'border-transparent text-[#6E5760] hover:text-[#2A1A20]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* PRODUCTS TAB */}
          {tab === 'products' && !editingProduct && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(emptyProduct(products.length + 1))}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-xs font-medium hover:bg-[#540D2B] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await onSeedDefaults();
                    flashStatus('Catalog synced to Firestore.');
                  }}
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-[#2A1A20]/15 bg-white text-xs font-medium text-[#2A1A20] hover:bg-[#F6DDE5]/40 cursor-pointer"
                >
                  Sync Default Catalog to Cloud
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-4 border border-[#2A1A20]/8 flex gap-4 items-center"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F2E9E1] shrink-0">
                      <BoutiqueImage
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-serif-editorial text-base font-semibold text-[#2A1A20] truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#6E5760] tabular-nums">
                        ${p.price} {p.oldPrice > 0 ? `(was $${p.oldPrice})` : ''} ·{' '}
                        {p.inStock ? 'In Stock' : 'Sold Out'}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="text-xs font-medium text-[#6B1238] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteProduct(p.id);
                            flashStatus('Product deleted.');
                          }}
                          className="text-xs font-medium text-[#6E5760] hover:text-[#6B1238] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCT EDITOR FORM */}
          {tab === 'products' && editingProduct && (
            <form
              onSubmit={handleSaveProductSubmit}
              className="bg-white rounded-2xl p-6 border border-[#2A1A20]/10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif-editorial text-xl font-semibold text-[#2A1A20]">
                  {editingProduct.name ? `Edit: ${editingProduct.name}` : 'New Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-medium text-[#6E5760] hover:text-[#2A1A20] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-[#2A1A20]">
                    Name (English) *
                  </span>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-[#2A1A20]">
                    Name (Arabic)
                  </span>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingProduct.nameAr}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, nameAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-[#2A1A20]">Category</span>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as CategorySlug,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm bg-white"
                  >
                    {CATEGORY_SLUGS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-[#2A1A20]">
                      Price (USD) *
                    </span>
                    <input
                      required
                      type="number"
                      min={0}
                      step="1"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm tabular-nums"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-[#2A1A20]">
                      Old Price (USD)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={editingProduct.oldPrice}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          oldPrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm tabular-nums"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-[#2A1A20]">
                    Description (English)
                  </span>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-[#2A1A20]">
                    Description (Arabic)
                  </span>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={editingProduct.descriptionAr}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        descriptionAr: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-[#2A1A20]">
                  Sizes
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((sz) => {
                    const active = editingProduct.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? editingProduct.sizes.filter((s) => s !== sz)
                            : [...editingProduct.sizes, sz];
                          setEditingProduct({ ...editingProduct, sizes: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#6B1238] text-[#FAF4EE] border-[#6B1238]'
                            : 'bg-white text-[#2A1A20] border-[#2A1A20]/15'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-[#2A1A20]">
                  Colors
                </span>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAF4EE] border border-[#2A1A20]/12 text-xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-[#2A1A20]/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            colors: editingProduct.colors.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[#6E5760] hover:text-[#6B1238] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Color (EN)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Color (AR)"
                    value={newColorNameAr}
                    onChange={(e) => setNewColorNameAr(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-8 rounded border border-[#2A1A20]/15 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newColorName.trim()) return;
                      const added: ProductColor = {
                        name: newColorName.trim(),
                        nameAr: newColorNameAr.trim() || newColorName.trim(),
                        hex: newColorHex,
                      };
                      setEditingProduct({
                        ...editingProduct,
                        colors: [...editingProduct.colors, added],
                      });
                      setNewColorName('');
                      setNewColorNameAr('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F6DDE5] text-[#6B1238] text-xs font-medium cursor-pointer"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Images (Upload + URL) */}
              <div className="space-y-3">
                <span className="block text-xs font-medium text-[#2A1A20]">
                  Product Images (max 8)
                </span>
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#2A1A20]/15"
                    >
                      <BoutiqueImage
                        src={img}
                        alt={`Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            images: editingProduct.images.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#2A1A20]/80 text-white text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-h-[38px] px-4 py-2 rounded-xl bg-[#F6DDE5] text-[#6B1238] text-xs font-medium inline-flex items-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={(e) =>
                        handleUploadFiles(e, 'products', (urls) =>
                          setEditingProduct((prev) =>
                            prev
                              ? { ...prev, images: [...prev.images, ...urls].slice(0, 8) }
                              : prev
                          )
                        )
                      }
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl.trim()) return;
                        setEditingProduct({
                          ...editingProduct,
                          images: [...editingProduct.images, newImageUrl.trim()].slice(0, 8),
                        });
                        setNewImageUrl('');
                      }}
                      className="px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs font-medium cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        inStock: e.target.checked,
                      })
                    }
                    className="accent-[#6B1238]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNew}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isNew: e.target.checked,
                      })
                    }
                    className="accent-[#6B1238]"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isSale}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isSale: e.target.checked,
                      })
                    }
                    className="accent-[#6B1238]"
                  />
                  <span>On Sale</span>
                </label>
              </div>

              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-sm font-medium hover:bg-[#540D2B] inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Product</span>
              </button>
            </form>
          )}

          {/* CATEGORIES TAB */}
          {tab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <CategoryEditorCard
                  key={cat.id}
                  category={cat}
                  uploading={uploading}
                  onUpload={handleUploadFiles}
                  onSave={async (updated) => {
                    await onSaveCategory(updated);
                    flashStatus(`Saved ${updated.name}.`);
                  }}
                />
              ))}
            </div>
          )}

          {/* HERO & LOOKBOOK TAB */}
          {tab === 'hero' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 border border-[#2A1A20]/8 space-y-4">
                <h3 className="font-serif-editorial text-xl font-semibold text-[#2A1A20]">
                  Hero Banner &amp; Lifestyle Images
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-xs font-medium">Headline (EN)</span>
                    <input
                      type="text"
                      value={shopDraft.heroHeadline}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, heroHeadline: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium">Headline (AR)</span>
                    <input
                      type="text"
                      dir="rtl"
                      value={shopDraft.heroHeadlineAr}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, heroHeadlineAr: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium">Subtitle (EN)</span>
                    <input
                      type="text"
                      value={shopDraft.heroSubtitle}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, heroSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium">Subtitle (AR)</span>
                    <input
                      type="text"
                      dir="rtl"
                      value={shopDraft.heroSubtitleAr}
                      onChange={(e) =>
                        setShopDraft({ ...shopDraft, heroSubtitleAr: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {shopDraft.heroImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-36 h-24 rounded-xl overflow-hidden border border-[#2A1A20]/15"
                    >
                      <BoutiqueImage
                        src={img}
                        alt={`Hero ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShopDraft({
                            ...shopDraft,
                            heroImages: shopDraft.heroImages.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#2A1A20]/80 text-white text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="min-h-[38px] px-4 py-2 rounded-xl bg-[#F6DDE5] text-[#6B1238] text-xs font-medium inline-flex items-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    <span>Upload Hero Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) =>
                        handleUploadFiles(e, 'hero', (urls) =>
                          setShopDraft((prev) => ({
                            ...prev,
                            heroImages: [...prev.heroImages, ...urls].slice(0, 6),
                          }))
                        )
                      }
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste hero image URL..."
                    value={heroUrlInput}
                    onChange={(e) => setHeroUrlInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!heroUrlInput.trim()) return;
                      setShopDraft({
                        ...shopDraft,
                        heroImages: [...shopDraft.heroImages, heroUrlInput.trim()].slice(0, 6),
                      });
                      setHeroUrlInput('');
                    }}
                    className="px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs font-medium cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await onSaveShopConfig(shopDraft);
                    flashStatus('Hero settings saved.');
                  }}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Hero Settings</span>
                </button>
              </div>

              {/* Lookbook Gallery Manager */}
              <div className="bg-white rounded-2xl p-6 border border-[#2A1A20]/8 space-y-4">
                <h3 className="font-serif-editorial text-xl font-semibold text-[#2A1A20]">
                  Lookbook Gallery
                </h3>

                <div className="flex flex-wrap items-end gap-3 pb-4 border-b border-[#2A1A20]/8">
                  <label className="min-h-[38px] px-4 py-2 rounded-xl bg-[#F6DDE5] text-[#6B1238] text-xs font-medium inline-flex items-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) =>
                        handleUploadFiles(e, 'lookbook', (urls) => {
                          if (urls[0]) setNewLookUrl(urls[0]);
                        })
                      }
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newLookUrl}
                    onChange={(e) => setNewLookUrl(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Caption (EN)"
                    value={newLookCaption}
                    onChange={(e) => setNewLookCaption(e.target.value)}
                    className="w-44 px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Caption (AR)"
                    value={newLookCaptionAr}
                    onChange={(e) => setNewLookCaptionAr(e.target.value)}
                    className="w-44 px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newLookUrl.trim()) return;
                      await onSaveLookbook({
                        id: `look_${Date.now()}`,
                        image: newLookUrl.trim(),
                        caption: newLookCaption.trim(),
                        captionAr: newLookCaptionAr.trim(),
                        sortOrder: lookbook.length + 1,
                      });
                      setNewLookUrl('');
                      setNewLookCaption('');
                      setNewLookCaptionAr('');
                      flashStatus('Lookbook photo added.');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-xs font-medium cursor-pointer"
                  >
                    + Add Look
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {lookbook.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden border border-[#2A1A20]/10 bg-[#FAF4EE]"
                    >
                      <div className="aspect-square">
                        <BoutiqueImage
                          src={item.image}
                          alt={item.caption || 'Lookbook'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <span className="text-xs text-[#2A1A20] truncate">
                          {item.caption || 'Lookbook item'}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteLookbook(item.id);
                            flashStatus('Lookbook item removed.');
                          }}
                          className="text-[#6E5760] hover:text-[#6B1238] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SHOP INFO TAB */}
          {tab === 'shop' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onSaveShopConfig(shopDraft);
                flashStatus('Shop details saved.');
              }}
              className="bg-white rounded-2xl p-6 border border-[#2A1A20]/8 space-y-4"
            >
              <h3 className="font-serif-editorial text-xl font-semibold text-[#2A1A20]">
                Boutique Contact, Hours &amp; Delivery
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium">WhatsApp Number</span>
                  <input
                    type="text"
                    value={shopDraft.whatsappNumber}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, whatsappNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Instagram URL</span>
                  <input
                    type="url"
                    value={shopDraft.instagramUrl}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, instagramUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Opening Hours (EN)</span>
                  <input
                    type="text"
                    value={shopDraft.hours}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, hours: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Opening Hours (AR)</span>
                  <input
                    type="text"
                    dir="rtl"
                    value={shopDraft.hoursAr}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, hoursAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Address (EN)</span>
                  <input
                    type="text"
                    value={shopDraft.address}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Address (AR)</span>
                  <input
                    type="text"
                    dir="rtl"
                    value={shopDraft.addressAr}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, addressAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Delivery Info (EN)</span>
                  <textarea
                    rows={2}
                    value={shopDraft.deliveryInfo}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, deliveryInfo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium">Delivery Info (AR)</span>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={shopDraft.deliveryInfoAr}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, deliveryInfoAr: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-medium">Google Maps Link</span>
                  <input
                    type="url"
                    value={shopDraft.mapsUrl}
                    onChange={(e) =>
                      setShopDraft({ ...shopDraft, mapsUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#2A1A20]/15 text-sm"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6B1238] text-[#FAF4EE] text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Shop Info</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryEditorCard({
  category,
  uploading,
  onUpload,
  onSave,
}: {
  category: CategoryItem;
  uploading: boolean;
  onUpload: (
    e: ChangeEvent<HTMLInputElement>,
    folder: string,
    onUrls: (urls: string[]) => void
  ) => Promise<void>;
  onSave: (cat: CategoryItem) => Promise<void>;
}) {
  const [draft, setDraft] = useState<CategoryItem>(category);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(draft);
      }}
      className="bg-white rounded-2xl p-5 border border-[#2A1A20]/8 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2E9E1] shrink-0">
          <BoutiqueImage
            src={draft.image}
            alt={draft.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-[#6B1238] font-semibold">
            {draft.slug}
          </p>
          <label className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#6B1238] cursor-pointer hover:underline">
            <ImagePlus className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Change image'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) =>
                onUpload(e, 'categories', (urls) => {
                  if (urls[0]) setDraft((prev) => ({ ...prev, image: urls[0] }));
                })
              }
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name (EN)"
          className="px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
        />
        <input
          type="text"
          dir="rtl"
          value={draft.nameAr}
          onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })}
          placeholder="Name (AR)"
          className="px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
        />
      </div>

      <input
        type="text"
        value={draft.subtitle}
        onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
        placeholder="Subtitle (EN)"
        className="w-full px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
      />
      <input
        type="text"
        dir="rtl"
        value={draft.subtitleAr}
        onChange={(e) => setDraft({ ...draft, subtitleAr: e.target.value })}
        placeholder="Subtitle (AR)"
        className="w-full px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
      />
      <input
        type="url"
        value={draft.image}
        onChange={(e) => setDraft({ ...draft, image: e.target.value })}
        placeholder="Image URL"
        className="w-full px-3 py-1.5 rounded-lg border border-[#2A1A20]/15 text-xs"
      />

      <button
        type="submit"
        className="min-h-[36px] px-4 py-1.5 rounded-lg bg-[#6B1238] text-[#FAF4EE] text-xs font-medium cursor-pointer"
      >
        Save Category
      </button>
    </form>
  );
}
