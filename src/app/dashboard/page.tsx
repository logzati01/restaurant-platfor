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
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { t } = useLang();
  const [stats, setStats] = useState({
    totalSales: 24850,
    activeOrdersCount: 4,
    productsCount: 4,
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
          .order('created_at', { ascending: false })
          .limit(5);

        if (orders && orders.length > 0) {
          setRecentOrders(orders);
          const active = orders.filter((o: any) => ['pending', 'accepted', 'in_kitchen'].includes(o.status)).length;
          setStats(prev => ({ ...prev, activeOrdersCount: active }));
        } else {
          // Sample orders for demo display
          setRecentOrders([
            { id: '1', order_number: 104, customer_name: 'كريم بن ناصر', total_amount: 1700, status: 'pending', order_type: 'dine_in', created_at: new Date().toISOString() },
            { id: '2', order_number: 103, customer_name: 'أحمد مراد', total_amount: 1550, status: 'in_kitchen', order_type: 'takeaway', created_at: new Date().toISOString() },
            { id: '3', order_number: 102, customer_name: 'ياسمين بوعلام', total_amount: 850, status: 'ready', order_type: 'dine_in', created_at: new Date().toISOString() },
            { id: '4', order_number: 101, customer_name: 'عمر خالد', total_amount: 2400, status: 'completed', order_type: 'delivery', created_at: new Date().toISOString() },
          ]);
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
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">{t('طلب جديد', 'Pending')}</span>;
      case 'in_kitchen':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">{t('في المطبخ', 'In Kitchen')}</span>;
      case 'ready':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">{t('جاهز للتقديم', 'Ready')}</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{t('مكتمل', 'Completed')}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('نظرة عامة على أداء المطعم', 'Restaurant Performance Overview')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('متابعة لحظية للمبيعات، الطلبات الحية، وحالة الفروع اليوم', 'Live tracking of daily sales, orders, and branch operations')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <ShoppingBag size={18} />
            <span>{t('شاشة الطلبات الحية', 'Live Orders Screen')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('إجمالي المبيعات اليوم', 'Today Total Sales')}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalSales.toLocaleString()} <span className="text-sm font-normal text-slate-500">DZD</span></h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight size={14} />
              <span>+18.4% {t('مقارنة بالأمس', 'vs yesterday')}</span>
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('الطلبات الجارية الآن', 'Active Orders Right Now')}</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeOrdersCount} <span className="text-sm font-normal text-slate-500">{t('طلبات', 'orders')}</span></h3>
            <p className="text-xs text-orange-600 font-medium flex items-center gap-1 mt-1">
              <span>{t('تحديث فوري نشط', 'Live Realtime Active')}</span>
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('الأطباق المسجلة', 'Registered Menu Items')}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UtensilsCrossed size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.productsCount} <span className="text-sm font-normal text-slate-500">{t('أطباق', 'dishes')}</span></h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              <span>3 {t('أقسام رئيسية', 'main categories')}</span>
            </p>
          </div>
        </div>

        {/* Branches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('الفروع العاملة', 'Active Branches')}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.branchesCount} <span className="text-sm font-normal text-slate-500">{t('فرع نشط', 'branch active')}</span></h3>
            <p className="text-xs text-purple-600 font-medium mt-1">
              <span>3 {t('طاولات QR مجهزة', 'QR tables active')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">{t('أحدث الطلبات المستلمة', 'Latest Incoming Orders')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('قائمة بالطلبات المباشرة من الطاولات والتطبيقات', 'Real-time list of table & takeaway orders')}</p>
          </div>
          <Link href="/dashboard/orders" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
            {t('عرض الكل', 'View All Orders')} →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">{t('رقم الطلب', 'Order #')}</th>
                <th className="px-5 py-3.5">{t('العميل / الطاولة', 'Customer / Table')}</th>
                <th className="px-5 py-3.5">{t('نوع الطلب', 'Type')}</th>
                <th className="px-5 py-3.5">{t('المبلغ الإجمالي', 'Total')}</th>
                <th className="px-5 py-3.5">{t('حالة الطلب', 'Status')}</th>
                <th className="px-5 py-3.5 text-center">{t('الإجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">#{order.order_number}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{order.customer_name || t('طلب طاولة', 'Dine-in Guest')}</td>
                  <td className="px-5 py-4 text-xs font-medium">
                    {order.order_type === 'dine_in' ? t('🍽️ محلي', '🍽️ Dine-in') : order.order_type === 'takeaway' ? t('🛍️ سفري', '🛍️ Takeaway') : t('🛵 توصيل', '🛵 Delivery')}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">{order.total_amount} DZD</td>
                  <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      href="/dashboard/orders"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-block"
                    >
                      {t('تفاصيل', 'Details')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
