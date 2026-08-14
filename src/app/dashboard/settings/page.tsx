'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Settings, Save, CheckCircle2, Store, DollarSign, Percent, Phone, Mail, Image as ImageIcon } from 'lucide-react';

export default function RestaurantSettingsPage() {
  const { t, lang } = useLang();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    id: '',
    name: 'Gourmet Burger & Grill',
    name_ar: 'برجر آند جريل الفاخر',
    logo_url: '',
    currency: 'DZD',
    phone: '+213555000111',
    email: 'contact@gourmetgrill.com',
    tax_percentage: 0,
    service_charge_percentage: 0,
  });

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('restaurants').select('*').limit(1).single();
      if (data) {
        setSettings({
          id: data.id,
          name: data.name || '',
          name_ar: data.name_ar || '',
          logo_url: data.logo_url || '',
          currency: data.currency || 'DZD',
          phone: data.phone || '',
          email: data.email || '',
          tax_percentage: data.tax_percentage || 0,
          service_charge_percentage: data.service_charge_percentage || 0,
        });
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (settings.id) {
        await supabase.from('restaurants').update({
          name: settings.name,
          name_ar: settings.name_ar,
          logo_url: settings.logo_url,
          currency: settings.currency,
          phone: settings.phone,
          email: settings.email,
          tax_percentage: Number(settings.tax_percentage) || 0,
          service_charge_percentage: Number(settings.service_charge_percentage) || 0,
        }).eq('id', settings.id);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إعدادات المطعم العامة والشعار', 'Restaurant Branding & Settings')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('تخصيص شعار المطعم، الاسم التجاري، العملة، وأرقام التواصل', 'Customize your logo, brand name, currency, and contacts')}</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-fadeIn">
            <CheckCircle2 size={16} />
            <span>{t('تم حفظ الإعدادات والشعار بنجاح!', 'Settings saved!')}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-xs">
        {/* Branding & Logo */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-2">
            <ImageIcon size={16} className="text-orange-600" />
            <span>{t('شعار المطعم والهوية البصرية', 'Restaurant Logo & Branding')}</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            {/* Logo Preview */}
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🍔</span>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="font-bold text-slate-700 block">{t('رابط صورة الشعار (Logo Image URL)', 'Logo Image URL')}</label>
              <input
                type="url"
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://example.com/my-restaurant-logo.png"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
              <p className="text-[11px] text-slate-400">{t('يمكن لصاحب المطعم وضع رابط شعاره ليظهر تلقائياً في لوحة التحكم ومنيو العملاء وبطاقات الطاولات', 'The custom logo will replace the default icon across dashboard and menus')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('اسم المطعم (بالعربية)', 'Restaurant Name (Arabic)')}</label>
              <input
                type="text"
                value={settings.name_ar}
                onChange={(e) => setSettings({ ...settings, name_ar: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('اسم المطعم (بالإنجليزية)', 'Restaurant Name (English)')}</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financials */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-orange-600" />
            <span>{t('العملة والضرائب', 'Currency & Tax Settings')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('رمز العملة (Currency)', 'Currency Code')}</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-white"
              >
                <option value="DZD">DZD (دينار جزائري)</option>
                <option value="SAR">SAR (ريال سعودي)</option>
                <option value="AED">AED (درهم إماراتي)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('نسبة الضريبة (Tax %)', 'Tax Percentage (%)')}</label>
              <input
                type="number"
                value={settings.tax_percentage}
                onChange={(e) => setSettings({ ...settings, tax_percentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('رسوم الخدمة (Service %)', 'Service Fee (%)')}</label>
              <input
                type="number"
                value={settings.service_charge_percentage}
                onChange={(e) => setSettings({ ...settings, service_charge_percentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-2">
            <Phone size={16} className="text-orange-600" />
            <span>{t('معلومات التواصل وخدمة العملاء', 'Customer Service & Contact')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('رقم الهاتف / الواتساب', 'Phone / WhatsApp')}</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">{t('البريد الإلكتروني للإدارة', 'Manager Email')}</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md shadow-orange-600/25 transition-all"
          >
            <Save size={16} />
            <span>{loading ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ جميع التغييرات والشعار', 'Save Settings & Logo')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
