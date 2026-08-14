'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { TicketPercent, Plus, Trash2, CheckCircle2, Percent } from 'lucide-react';

export default function CouponsPage() {
  const { t } = useLang();
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('coupons').select('*');
      if (data && data.length > 0) {
        setCoupons(data);
      } else {
        setCoupons([
          { id: '1', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, usage_limit: 100, used_count: 14, is_active: true },
          { id: '2', code: 'RAMADAN2026', discount_type: 'percentage', discount_value: 15, usage_limit: 50, used_count: 32, is_active: true },
        ]);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('إدارة الكوبونات والخصومات', 'Coupons & Discount Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('إنشاء عروض ترويجية وأكواد خصم للعملاء وزيادة المبيعات', 'Create promo codes and track usage limits')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-orange-50 text-orange-600 font-extrabold text-sm rounded-lg border border-orange-200">
                {coupon.code}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {coupon.is_active ? t('نشط', 'Active') : t('معطل', 'Inactive')}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">
                {coupon.discount_value}% <span className="text-xs font-normal text-slate-500">{t('خصم', 'OFF')}</span>
              </p>
              <p className="text-xs text-slate-500">
                {t('تم الاستخدام:', 'Used:')} <span className="font-bold text-slate-800">{coupon.used_count}</span> / {coupon.usage_limit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
