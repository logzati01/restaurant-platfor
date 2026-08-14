'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from './LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Store, 
  TicketPercent, 
  QrCode,
  Settings,
  Users,
  Languages,
  Menu as MenuIcon,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLang();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>({ name: 'RestoManager', name_ar: 'منصة إدارة المطاعم', logo_url: '' });

  useEffect(() => {
    async function loadResto() {
      const { data } = await supabase.from('restaurants').select('*').limit(1).single();
      if (data) setRestaurant(data);
    }
    loadResto();
  }, []);

  const links = [
    { href: '/dashboard', label: t('لوحة التحكم', 'Dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/orders', label: t('الطلبات الحية', 'Live Orders'), icon: ShoppingBag, badge: t('مباشر', 'LIVE') },
    { href: '/dashboard/menu', label: t('إدارة القائمة والوجبات', 'Menu & Dishes'), icon: UtensilsCrossed },
    { href: '/dashboard/branches', label: t('إدارة الفروع والطاولات', 'Branches & Tables'), icon: Store },
    { href: '/dashboard/staff', label: t('الموظفون والصلاحيات', 'Staff & Roles'), icon: Users },
    { href: '/dashboard/coupons', label: t('الكوبونات والخصومات', 'Coupons & Discounts'), icon: TicketPercent },
    { href: '/dashboard/settings', label: t('إعدادات المطعم والشعار', 'Restaurant & Logo'), icon: Settings },
    { href: '/menu', label: t('معاينة منيو العميل', 'Customer Menu Preview'), icon: QrCode, target: '_blank' },
  ];

  const renderLogo = (sizeClass = "w-10 h-10") => (
    restaurant.logo_url ? (
      <img src={restaurant.logo_url} alt="Logo" className={`${sizeClass} rounded-2xl object-cover border border-slate-700 shadow-md`} />
    ) : (
      <div className={`${sizeClass} bg-orange-600 rounded-2xl text-white font-black text-xl shadow-lg shadow-orange-600/30 flex items-center justify-center`}>
        🍔
      </div>
    )
  );

  const renderNavLinks = () => (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            target={link.target}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={19} />
              <span>{link.label}</span>
            </div>
            {link.badge && (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30">
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderFooter = () => (
    <div className="p-4 border-t border-slate-800 space-y-3">
      <button
        onClick={toggleLang}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60"
      >
        <div className="flex items-center gap-2">
          <Languages size={16} />
          <span>{t('تغيير لغة العرض', 'Display Language')}</span>
        </div>
        <span className="px-2 py-0.5 bg-orange-600 text-white rounded-md font-black uppercase text-[11px]">
          {lang === 'ar' ? 'English' : 'عربي'}
        </span>
      </button>

      <div className="flex items-center gap-3 px-2 pt-1">
        <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black text-xs">
          ADM
        </div>
        <div className="text-xs">
          <p className="font-bold text-slate-200">{lang === 'ar' ? restaurant.name_ar || t('إدارة المطعم', 'Manager') : restaurant.name}</p>
          <p className="text-slate-500 text-[11px]">admin@restaurant.com</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Top Header */}
      <div className="lg:hidden w-full bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
            aria-label="Toggle menu"
          >
            <MenuIcon size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            {renderLogo("w-7 h-7")}
            <span className="font-black text-sm">{lang === 'ar' ? restaurant.name_ar : restaurant.name}</span>
          </div>
        </div>

        <button
          onClick={toggleLang}
          className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-xs font-black uppercase"
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>

      {/* 2. Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-100 flex flex-col h-full shadow-2xl z-10 border-l rtl:border-l-0 rtl:border-r border-slate-800 animate-fadeIn">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {renderLogo("w-8 h-8")}
                <div>
                  <h2 className="font-black text-sm">{lang === 'ar' ? restaurant.name_ar : restaurant.name}</h2>
                  <span className="text-[11px] text-orange-400 font-bold">{t('لوحة التحكم', 'Dashboard')}</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {renderNavLinks()}
            {renderFooter()}
          </div>
        </div>
      )}

      {/* 3. Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-slate-900 text-slate-100 flex-col min-h-screen border-r rtl:border-r-0 rtl:border-l border-slate-800 shrink-0 sticky top-0 h-screen select-none z-30">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {renderLogo("w-10 h-10")}
            <div>
              <h1 className="font-black text-base leading-tight tracking-tight">{lang === 'ar' ? restaurant.name_ar : restaurant.name}</h1>
              <span className="text-xs text-orange-400 font-bold">{t('لوحة التحكم الإدارية', 'Admin Dashboard')}</span>
            </div>
          </div>
        </div>

        {renderNavLinks()}
        {renderFooter()}
      </aside>
    </>
  );
};
