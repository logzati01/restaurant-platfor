'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  ArrowUpRight, 
  Clock, 
  Store,
  Inbox
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { t } = useLang();
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrdersCount: 0,
    productsCount: 0,
    branchesCount: 1,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: prods } = await supabase.from('products').select('id');
        const { data: brs } = await supabase.from('branches').select('id');

        if (orders) {
          setRecentOrders(orders.slice(0, 5));
          const active = orders.filter((o: any) => ['pending', 'accepted', 'in_kitchen'].includes(o.status)).length;
          const total = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
          setStats({
            totalSales: total,
            activeOrdersCount: active,
            productsCount: prods?.length || 0,
            branchesCount: brs?.length || 1,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-800 border border-amber-200">{t('طلب جديد', 'Pending')}</span>;
      case 'in_kitchen':
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-800 border border-blue-200">{t('في المطبخ', 'In Kitchen')}</span>;
      case 'ready':
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">{t('جاهز للتقديم', 'Ready')}</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-slate-100 text-slate-700">{t('مكتمل', 'Completed')}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('نظرة عامة على أداء المطعم', 'Restaurant Performance Overview')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('متابعة لحظية للمبيعات، الطلبات الحية، وحالة الفروع اليوم', 'Live tracking of daily sales, orders, and branch operations')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-md shadow-orange-600/25 transition-all"
          >
            <ShoppingBag size={18} />
            <span>{t('شاشة الطلبات الحية', 'Live Orders Screen')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('إجمالي المبيعات المحققة', 'Total Sales Revenue')}</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalSales.toLocaleString()} <span className="text-xs font-bold text-slate-400">DZD</span></h3>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight size={14} />
              <span>{t('حساب دقيق من قاعدة البيانات', 'Live calculated from DB')}</span>
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('الطلبات الجارية الآن', 'Active Orders Right Now')}</span>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{stats.activeOrdersCount} <span className="text-xs font-bold text-slate-400">{t('طلبات نشطة', 'active orders')}</span></h3>
            <p className="text-[11px] text-orange-600 font-bold flex items-center gap-1 mt-1">
              <span>{t('تحديث فوري نشط (Realtime)', 'Live Realtime Active')}</span>
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('الأطباق المسجلة', 'Registered Dishes')}</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <UtensilsCrossed size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{stats.productsCount} <span className="text-xs font-bold text-slate-400">{t('أطباق بالمنيو', 'menu dishes')}</span></h3>
            <p className="text-[11px] text-slate-400 font-bold mt-1">
              <span>{t('جاهزة للطلب من الطاولات', 'Ready for QR ordering')}</span>
            </p>
          </div>
        </div>

        {/* Branches */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('الفروع العاملة', 'Active Branches')}</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <Store size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{stats.branchesCount} <span className="text-xs font-bold text-slate-400">{t('فرع مسجل', 'branches')}</span></h3>
            <p className="text-[11px] text-purple-600 font-bold mt-1">
              <span>{t('مجهزة بنظام الطاولات والباركود', 'Multi-branch enabled')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-base">{t('أحدث الطلبات المستلمة', 'Latest Incoming Orders')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('قائمة بالطلبات المباشرة من الطاولات والتطبيقات', 'Real-time list of table & takeaway orders')}</p>
          </div>
          <Link href="/dashboard/orders" className="text-xs font-bold text-orange-600 hover:text-orange-700">
            {t('شاشة الطلبات الحية', 'Live Orders Screen')} →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Inbox size={32} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">{t('لا توجد طلبات مسجلة بعد. اطلب وجبة تجريبية من المنيو لتراها هنا فوراً!', 'No orders yet. Place a test order from the menu!')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">{t('رقم الطلب', 'Order #')}</th>
                  <th className="px-6 py-4">{t('العميل / الطاولة', 'Customer / Table')}</th>
                  <th className="px-6 py-4">{t('المبلغ الإجمالي', 'Total')}</th>
                  <th className="px-6 py-4">{t('حالة الطلب', 'Status')}</th>
                  <th className="px-6 py-4 text-center">{t('الإجراء', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">#{order.order_number}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{order.customer_name || t('طلب طاولة', 'Dine-in')}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{order.total_amount} DZD</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href="/dashboard/orders"
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-block"
                      >
                        {t('عرض في الشاشة الحية', 'Live View')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
