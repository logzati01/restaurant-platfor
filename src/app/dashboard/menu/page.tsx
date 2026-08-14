'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  UtensilsCrossed, 
  Trash2, 
  Edit3, 
  Clock, 
  Layers, 
  X, 
  Search,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';

export default function MenuManagementPage() {
  const { t, lang } = useLang();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showDishModal, setShowDishModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);

  // Form states
  const [dishForm, setDishForm] = useState({
    id: '',
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    base_price: '',
    category_id: '',
    preparation_time_minutes: 15,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    name_ar: '',
  });

  const loadMenuData = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (cats) setCategories(cats);
    if (prods) setProducts(prods);
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Save Dish (Add or Edit)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name_ar || !dishForm.base_price) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';
    const targetCat = dishForm.category_id || categories[0]?.id;

    if (editingDish) {
      // Update existing dish
      await supabase.from('products').update({
        name: dishForm.name || dishForm.name_ar,
        name_ar: dishForm.name_ar,
        description: dishForm.description,
        description_ar: dishForm.description_ar,
        base_price: parseFloat(dishForm.base_price),
        category_id: targetCat,
        preparation_time_minutes: Number(dishForm.preparation_time_minutes) || 15,
      }).eq('id', editingDish.id);
    } else {
      // Insert new dish
      await supabase.from('products').insert([
        {
          restaurant_id: restId,
          category_id: targetCat,
          name: dishForm.name || dishForm.name_ar,
          name_ar: dishForm.name_ar,
          description: dishForm.description,
          description_ar: dishForm.description_ar,
          base_price: parseFloat(dishForm.base_price),
          preparation_time_minutes: Number(dishForm.preparation_time_minutes) || 15,
          is_available: true,
        }
      ]);
    }

    setShowDishModal(false);
    setEditingDish(null);
    setDishForm({ id: '', name: '', name_ar: '', description: '', description_ar: '', base_price: '', category_id: '', preparation_time_minutes: 15 });
    loadMenuData();
  };

  // Delete Dish
  const handleDeleteDish = async (dishId: string) => {
    if (!confirm(t('هل أنت متأكد من حذف هذه الوجبة نهائياً؟', 'Are you sure you want to delete this dish permanently?'))) return;
    setProducts(prev => prev.filter(p => p.id !== dishId));
    await supabase.from('products').delete().eq('id', dishId);
  };

  // Open Edit Dish Modal
  const handleOpenEditDish = (dish: any) => {
    setEditingDish(dish);
    setDishForm({
      id: dish.id,
      name: dish.name || '',
      name_ar: dish.name_ar || '',
      description: dish.description || '',
      description_ar: dish.description_ar || '',
      base_price: dish.base_price.toString(),
      category_id: dish.category_id,
      preparation_time_minutes: dish.preparation_time_minutes || 15,
    });
    setShowDishModal(true);
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_ar) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';

    await supabase.from('categories').insert([
      {
        restaurant_id: restId,
        name: categoryForm.name || categoryForm.name_ar,
        name_ar: categoryForm.name_ar,
        sort_order: categories.length + 1,
      }
    ]);

    setShowCategoryModal(false);
    setCategoryForm({ name: '', name_ar: '' });
    loadMenuData();
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm(t('حذف هذا القسم سيحذف جميع الوجبات التابعة له، هل تريد المتابعة؟', 'Deleting this category will remove related dishes, proceed?'))) return;
    setCategories(prev => prev.filter(c => c.id !== catId));
    await supabase.from('categories').delete().eq('id', catId);
    loadMenuData();
  };

  // Toggle Availability
  const toggleAvailability = async (id: string, current: boolean) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !current } : p));
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (p.name_ar && p.name_ar.toLowerCase().includes(query)) || 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.description_ar && p.description_ar.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إدارة قائمة الأطباق والأقسام', 'Menu & Dishes Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('إضافة وجبات جديدة، تعديل الأسعار، تنظيم الأقسام، والتحكم في توفر الأصناف', 'Add new dishes, update prices, organize categories, and toggle stock')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <FolderPlus size={16} className="text-orange-600" />
            <span>{t('إضافة قسم جديد', 'Add Category')}</span>
          </button>

          <button
            onClick={() => {
              setEditingDish(null);
              setDishForm({ id: '', name: '', name_ar: '', description: '', description_ar: '', base_price: '', category_id: categories[0]?.id || '', preparation_time_minutes: 15 });
              setShowDishModal(true);
            }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all"
          >
            <Plus size={16} />
            <span>{t('إضافة وجبة جديدة', 'Add New Dish')}</span>
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('كل الأطباق', 'All Items')} ({products.length})
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="relative group flex items-center">
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id ? 'bg-orange-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lang === 'ar' ? cat.name_ar : cat.name}
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="hidden group-hover:flex absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-sm"
                title={t('حذف هذا القسم', 'Delete Category')}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search size={16} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('بحث عن وجبة أو مكون...', 'Search dish or ingredient...')}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-orange-200 transition-all">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {lang === 'ar' ? prod.name_ar : prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {lang === 'ar' ? prod.description_ar : prod.description}
                  </p>
                </div>
                <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 shrink-0">
                  {prod.base_price} <span className="text-[10px] font-bold">DZD</span>
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{prod.preparation_time_minutes || 15} {t('دقيقة تحضير', 'mins prep')}</span>
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleAvailability(prod.id, prod.is_available)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  prod.is_available 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {prod.is_available ? t('متاح للطلب ✓', 'In Stock') : t('غير متوفر (نفد) ✕', 'Out of Stock')}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditDish(prod)}
                  className="p-2 text-slate-600 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 rounded-xl transition-colors"
                  title={t('تعديل الوجبة', 'Edit Dish')}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteDish(prod.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors"
                  title={t('حذف الوجبة', 'Delete Dish')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {showDishModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingDish ? t('تعديل بيانات الوجبة', 'Edit Dish Details') : t('إضافة وجبة جديدة للمنيو', 'Add New Menu Dish')}
              </h3>
              <button onClick={() => setShowDishModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الوجبة (بالعربية)*', 'Dish Name (Arabic)*')}</label>
                <input
                  type="text"
                  required
                  value={dishForm.name_ar}
                  onChange={(e) => setDishForm({ ...dishForm, name_ar: e.target.value })}
                  placeholder="مثال: برجر دبل تشيز فاخر"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الوجبة (بالإنجليزية)', 'Dish Name (English)')}</label>
                <input
                  type="text"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Double Cheese Deluxe Burger"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('السعر (DZD)*', 'Price (DZD)*')}</label>
                  <input
                    type="number"
                    required
                    value={dishForm.base_price}
                    onChange={(e) => setDishForm({ ...dishForm, base_price: e.target.value })}
                    placeholder="850"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('القسم / التصنيف', 'Category')}</label>
                  <select
                    value={dishForm.category_id}
                    onChange={(e) => setDishForm({ ...dishForm, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('وصف المكونات (بالعربية)', 'Ingredients & Description')}</label>
                <textarea
                  rows={2}
                  value={dishForm.description_ar}
                  onChange={(e) => setDishForm({ ...dishForm, description_ar: e.target.value })}
                  placeholder="شريحة لحم مشوية مع جبن الشيدر وصوص الباربيكيو..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDishModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {editingDish ? t('حفظ التعديلات', 'Save Changes') : t('إضافة الوجبة', 'Add Dish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t('إضافة قسم جديد للمنيو', 'Add New Category')}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم القسم (بالعربية)*', 'Category Name (Arabic)*')}</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                  placeholder="مثال: الحلويات والتحليات"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم القسم (بالإنجليزية)', 'Category Name (English)')}</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Desserts & Sweets"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {t('حفظ القسم', 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
