'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  TicketPercent, 
  Plus, 
  Trash2, 
  Percent, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X,
  Copy,
  Calendar
} from 'lucide-react';

export default function CouponsPage() {
  const { t, lang } = useLang();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Form State
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    usage_limit: '100',
    expiry_date: '',
  });

  const loadCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCoupons(data);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';

    await supabase.from('coupons').insert([
      {
        restaurant_id: restId,
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        usage_limit: parseInt(form.usage_limit) || 100,
        expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
        is_active: true,
      }
    ]);

    setShowModal(false);
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', usage_limit: '100', expiry_date: '' });
    loadCoupons();
  };

  const toggleCouponStatus = async (id: string, current: boolean) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm(t('هل تريد حذف هذا الكوبون نهائياً؟', 'Delete this coupon permanently?'))) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    await supabase.from('coupons').delete().eq('id', id);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إدارة الكوبونات والخصومات والعروض', 'Coupons & Discount Promotions')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('إنشاء عروض ترويجية، تحديد نسب الخصم، ومتابعة عدد مرات الاستخدام لزيادة المبيعات', 'Create promo codes, manage percentage/fixed discounts, and track usage')}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all"
        >
          <Plus size={16} />
          <span>{t('إنشاء كوبون جديد', 'Create New Coupon')}</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden group hover:border-orange-300 transition-all"
          >
            {/* Header: Code & Status */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl tracking-wider">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title={t('نسخ الكود', 'Copy code')}
                  >
                    <Copy size={15} />
                  </button>
                </div>

                <button
                  onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    coupon.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {coupon.is_active ? t('نشط ✓', 'Active') : t('معطل ✕', 'Inactive')}
                </button>
              </div>

              {copiedCode === coupon.code && (
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">{t('تم نسخ الكود للحافظة!', 'Code copied!')}</p>
              )}

              {/* Discount Value */}
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                  <span>{coupon.discount_value}</span>
                  <span className="text-base font-extrabold text-orange-600">
                    {coupon.discount_type === 'percentage' ? '%' : 'DZD'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 mr-1 rtl:mr-1 rtl:ml-0 ltr:ml-1">
                    {t('خصم على الطلب', 'Discount')}
                  </span>
                </p>
              </div>

              {/* Rules & Limits */}
              <div className="mt-4 space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('الحد الأدنى للطلب:', 'Min Order:')}</span>
                  <span className="font-bold text-slate-800">{coupon.min_order_amount || 0} DZD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('مرات الاستخدام:', 'Usage:')}</span>
                  <span className="font-bold text-slate-800">{coupon.used_count || 0} / {coupon.usage_limit || 100}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Clock size={13} />
                <span>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : t('صلاحية مفتوحة', 'No Expiry')}</span>
              </span>

              <button
                onClick={() => handleDeleteCoupon(coupon.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title={t('حذف الكوبون', 'Delete coupon')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">{t('إنشاء كوبون خصم جديد', 'Create New Discount Coupon')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('كود الخصم (Promo Code)*', 'Coupon Code*')}</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: BURGER20 أو WELCOME"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('نوع الخصم', 'Discount Type')}</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="percentage">{t('نسبة مئوية (%)', 'Percentage (%)')}</option>
                    <option value="fixed">{t('مبلغ ثابت (DZD)', 'Fixed Amount (DZD)')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('قيمة الخصم*', 'Value*')}</label>
                  <input
                    type="number"
                    required
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === 'percentage' ? '20' : '200'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('الحد الأدنى للطلب (DZD)', 'Min Order Amount')}</label>
                  <input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('الحد الأقصى لمرات الاستخدام', 'Usage Limit')}</label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('تاريخ الانتهاء (اختياري)', 'Expiry Date (Optional)')}</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {t('حفظ الكوبون', 'Save Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
