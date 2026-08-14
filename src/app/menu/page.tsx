'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  UtensilsCrossed, 
  Clock, 
  Sparkles,
  ArrowRight,
  Languages
} from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table') || '01';

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('all');
  const [cart, setCart] = useState<{ [id: string]: { product: any; qty: number } }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      const { data: prods } = await supabase.from('products').select('*').eq('is_available', true);
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
    }
    load();
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const current = prev[product.id]?.qty || 0;
      return { ...prev, [product.id]: { product, qty: current + 1 } };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const current = prev[productId]?.qty || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: { ...prev[productId], qty: current - 1 } };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.qty * item.product.base_price), 0);

  const handlePlaceOrder = async () => {
    if (totalItems === 0) return;
    setIsSubmitting(true);

    try {
      const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
      const { data: br } = await supabase.from('branches').select('id').limit(1).single();

      const restId = res?.id || '11111111-1111-1111-1111-111111111111';
      const branchId = br?.id || '22222222-2222-2222-2222-222222222222';

      // Insert Order
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert([
          {
            restaurant_id: restId,
            branch_id: branchId,
            customer_name: customerName || `${t('طاولة', 'Table')} ${tableParam}`,
            order_type: 'dine_in',
            status: 'pending',
            total_amount: totalPrice,
            subtotal: totalPrice,
          }
        ])
        .select()
        .single();

      if (orderData) {
        // Insert items
        const itemsToInsert = Object.values(cart).map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          product_name: lang === 'ar' ? item.product.name_ar : item.product.name,
          unit_price: item.product.base_price,
          quantity: item.qty,
          total_price: item.qty * item.product.base_price
        }));

        await supabase.from('order_items').insert(itemsToInsert);

        setOrderSuccess(orderData);
        setCart({});
        setIsCartOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = activeCat === 'all' ? products : products.filter(p => p.category_id === activeCat);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 pb-28">
      {/* Top Banner */}
      <header className="bg-slate-900 text-white p-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-xl text-xl font-bold">🍔</div>
            <div>
              <h1 className="font-bold text-base">{t('برجر آند جريل الفاخر', 'Gourmet Burger & Grill')}</h1>
              <span className="text-xs text-orange-400 font-medium">{t('طاولة رقم', 'Table #')} {tableParam}</span>
            </div>
          </div>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-bold text-slate-200"
          >
            <Languages size={14} />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCat === 'all' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {t('الكل', 'All')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCat === c.id ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {lang === 'ar' ? c.name_ar : c.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-4">
          {filtered.map((prod) => {
            const inCart = cart[prod.id]?.qty || 0;
            return (
              <div key={prod.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === 'ar' ? prod.name_ar : prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {lang === 'ar' ? prod.description_ar : prod.description}
                  </p>
                  <p className="text-sm font-extrabold text-orange-600 pt-1">
                    {prod.base_price} <span className="text-xs font-normal text-slate-500">DZD</span>
                  </p>
                </div>

                {/* Counter / Add button */}
                <div>
                  {inCart > 0 ? (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-2 py-1.5 rounded-xl">
                      <button onClick={() => removeFromCart(prod.id)} className="p-1 text-orange-700 hover:bg-orange-200 rounded-lg">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-xs text-orange-900 px-1">{inCart}</span>
                      <button onClick={() => addToCart(prod)} className="p-1 text-orange-700 hover:bg-orange-200 rounded-lg">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus size={14} />
                      <span>{t('إضافة', 'Add')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                {totalItems}
              </span>
              <span className="font-bold text-sm">{t('عرض سلة الطلب', 'View Order Cart')}</span>
            </div>
            <span className="font-extrabold text-orange-400 text-base">{totalPrice} DZD</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">{t('سلة الطلب لطاولة', 'Cart for Table')} {tableParam}</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">
                {t('إغلاق ✕', 'Close ✕')}
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 divide-y divide-slate-100">
              {Object.values(cart).map((item) => (
                <div key={item.product.id} className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{lang === 'ar' ? item.product.name_ar : item.product.name}</h4>
                    <span className="text-xs text-slate-500">{item.product.base_price} DZD × {item.qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.product.id)} className="p-1 bg-slate-100 rounded-md"><Minus size={12} /></button>
                    <span className="text-xs font-bold">{item.qty}</span>
                    <button onClick={() => addToCart(item.product)} className="p-1 bg-slate-100 rounded-md"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('اسم الزبون (اختياري)', 'Your Name (Optional)')}</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('مثال: محمد', 'e.g. John')}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>

            {/* Total & Submit */}
            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>{t('المبلغ الإجمالي:', 'Total Amount:')}</span>
                <span className="text-orange-600 text-lg">{totalPrice} DZD</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? t('جارٍ إرسال الطلب للمطبخ...', 'Sending to kitchen...') : t('تأكيد وإرسال الطلب للمطبخ 🚀', 'Confirm & Send Order 🚀')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">{t('تم استلام طلبك بنجاح!', 'Order Placed Successfully!')}</h3>
            <p className="text-xs text-slate-500">
              {t('طلبك رقم', 'Order #')} <span className="font-bold text-slate-900">#{orderSuccess.order_number}</span> {t('وصل إلى المطبخ ويجري تحضيره الآن.', 'has been received and is being prepared in the kitchen.')}
            </p>
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              {t('العودة للمنيو', 'Back to Menu')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">جارٍ تحميل المنيو...</div>}>
      <MenuContent />
    </Suspense>
  );
}
