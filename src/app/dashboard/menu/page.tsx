'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  UtensilsCrossed, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  DollarSign,
  Clock,
  Layers
} from 'lucide-react';

export default function MenuManagementPage() {
  const { t, lang } = useLang();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    base_price: '',
    category_id: '',
    preparation_time_minutes: 15,
  });

  const loadMenu = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
    const { data: prods } = await supabase.from('products').select('*').order('sort_order');

    if (cats && cats.length > 0) setCategories(cats);
    if (prods && prods.length > 0) setProducts(prods);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name_ar || !newProduct.base_price) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';

    const targetCat = newProduct.category_id || categories[0]?.id;

    await supabase.from('products').insert([
      {
        restaurant_id: restId,
        category_id: targetCat,
        name: newProduct.name || newProduct.name_ar,
        name_ar: newProduct.name_ar,
        description: newProduct.description,
        description_ar: newProduct.description_ar,
        base_price: parseFloat(newProduct.base_price),
        preparation_time_minutes: Number(newProduct.preparation_time_minutes) || 15,
      }
    ]);

    setShowAddModal(false);
    setNewProduct({ name: '', name_ar: '', description: '', description_ar: '', base_price: '', category_id: '', preparation_time_minutes: 15 });
    loadMenu();
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !current } : p));
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('إدارة قائمة الأطباق والأقسام', 'Menu & Dishes Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('تعديل الأسعار، إضافة أطباق جديدة، وتحديد حالة التوفر في المطبخ', 'Manage prices, add new items, and toggle availability')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>{t('إضافة طبق جديد', 'Add New Dish')}</span>
        </button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('كل الأطباق', 'All Items')} ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id ? 'bg-orange-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ar' ? cat.name_ar : cat.name}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {lang === 'ar' ? prod.name_ar : prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {lang === 'ar' ? prod.description_ar : prod.description}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                  {prod.base_price} DZD
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{prod.preparation_time_minutes || 15} {t('دقيقة', 'min')}</span>
                </span>
              </div>
            </div>

            {/* Toggle Availability */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                {prod.is_available ? t('متوفر للطلب', 'Available') : t('غير متوفر (نفد)', 'Out of Stock')}
              </span>
              <button
                onClick={() => toggleAvailability(prod.id, prod.is_available)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  prod.is_available 
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                {prod.is_available ? t('متاح ✓', 'Active') : t('معطل ✕', 'Disabled')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t('إضافة صنف جديد للمنيو', 'Add New Menu Item')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الطبق (بالعربية)*', 'Dish Name (Arabic)*')}</label>
                <input
                  type="text"
                  required
                  value={newProduct.name_ar}
                  onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                  placeholder="مثال: تاكوس مكسيكي دجاج"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الطبق (بالإنجليزية)', 'Dish Name (English)')}</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Mexican Chicken Tacos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('السعر (DZD)*', 'Price (DZD)*')}</label>
                  <input
                    type="number"
                    required
                    value={newProduct.base_price}
                    onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })}
                    placeholder="750"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('القسم / التصنيف', 'Category')}</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('وصف المكونات (بالعربية)', 'Description')}</label>
                <textarea
                  rows={2}
                  value={newProduct.description_ar}
                  onChange={(e) => setNewProduct({ ...newProduct, description_ar: e.target.value })}
                  placeholder="وصف مختصر لمكونات الطبق..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                >
                  {t('حفظ الطبق', 'Save Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
