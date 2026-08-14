'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from './LanguageContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Store, 
  TicketPercent, 
  QrCode,
  Languages
} from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLang();

  const links = [
    { href: '/dashboard', label: t('لوحة التحكم', 'Dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/orders', label: t('الطلبات الحية', 'Live Orders'), icon: ShoppingBag, badge: t('مباشر', 'LIVE') },
    { href: '/dashboard/menu', label: t('إدارة القائمة', 'Menu Management'), icon: UtensilsCrossed },
    { href: '/dashboard/branches', label: t('الفروع والطاولات (QR)', 'Branches & Tables (QR)'), icon: Store },
    { href: '/dashboard/coupons', label: t('الكوبونات والخصومات', 'Coupons & Discounts'), icon: TicketPercent },
    { href: '/menu', label: t('معاينة منيو العميل', 'Customer Menu Preview'), icon: QrCode, target: '_blank' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-xl text-white font-bold text-xl shadow-lg shadow-orange-600/30">
            🍔
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">{t('منصة إدارة المطاعم', 'RestoManager')}</h1>
            <span className="text-xs text-orange-400 font-medium">{t('الفرع الرئيسي', 'Main Branch')}</span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              target={link.target}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language Toggle & User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={toggleLang}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Languages size={15} />
            <span>{t('تغيير اللغة', 'Switch Language')}</span>
          </div>
          <span className="px-2 py-0.5 bg-orange-600/30 text-orange-400 rounded font-bold uppercase">
            {lang === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>

        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-orange-400">
            AD
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">{t('المدير العام', 'Store Admin')}</p>
            <p className="text-slate-500 text-[11px]">admin@restaurant.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
