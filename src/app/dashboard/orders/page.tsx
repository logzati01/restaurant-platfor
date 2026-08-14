'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Printer, 
  Volume2, 
  RefreshCw,
  Trash2,
  Inbox
} from 'lucide-react';

export default function LiveOrdersPage() {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [restaurant, setRestaurant] = useState<any>({ name: 'RestoManager', name_ar: 'برجر آند جريل الفاخر', logo_url: '' });
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const { data: rData } = await supabase.from('restaurants').select('*').limit(1).single();
      if (rData) setRestaurant(rData);

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('realtime_orders_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        loadOrders();
        if (soundEnabled && payload.eventType === 'INSERT') {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  // Delete a single order from Supabase permanently
  const handleDeleteOrder = async (orderId: string, orderNumber: any) => {
    if (!confirm(`${t('هل تريد بالتأكيد حذف الطلب رقم', 'Delete order #')} #${orderNumber} ${t('نهائياً؟', 'permanently?')}`)) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    await supabase.from('orders').delete().eq('id', orderId);
  };

  // Clear all completed orders from Supabase permanently
  const handleClearCompleted = async () => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    if (completedOrders.length === 0) {
      alert(t('لا توجد طلبات مكتملة لمسحها حالياً.', 'No completed orders to clear.'));
      return;
    }
    if (!confirm(t('هل تريد مسح جميع الطلبات المكتملة من الشاشة وقاعدة البيانات؟', 'Clear all completed orders from database?'))) return;
    setOrders(prev => prev.filter(o => o.status !== 'completed'));
    await supabase.from('orders').delete().eq('status', 'completed');
  };

  // Dedicated Thermal Receipt Print Popup
  const handlePrintReceipt = (order: any) => {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;

    const itemsHtml = (order.order_items || []).map((item: any) => `
      <tr style="border-bottom: 1px dashed #ddd; font-size: 13px;">
        <td style="padding: 6px 0; font-weight: bold;">${item.quantity}x ${item.product_name}</td>
        <td style="padding: 6px 0; text-align: left; font-weight: bold;">${item.total_price} DZD</td>
      </tr>
    `).join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>فاتورة طلب #${order.order_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          @page { margin: 5mm; size: 80mm auto; }
          body { font-family: 'Cairo', sans-serif; width: 72mm; margin: 0 auto; padding: 10px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: 900; }
          .logo { font-size: 28px; margin-bottom: 4px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="logo">🍔</div>
          <h2 style="margin: 2px 0; font-size: 18px;" class="bold">${restaurant.name_ar || restaurant.name}</h2>
          <p style="margin: 2px 0; font-size: 11px;">إيصال طلب مطعم</p>
          <div class="divider"></div>
          <h3 style="margin: 4px 0; font-size: 16px;" class="bold">طلب #${order.order_number}</h3>
          <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">${order.customer_name}</p>
          <p style="margin: 2px 0; font-size: 10px; color: #555;">${new Date(order.created_at).toLocaleString()}</p>
          <div class="divider"></div>
        </div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000; font-size: 11px;">
              <th style="text-align: right; padding-bottom: 4px;">الصنف والكمية</th>
              <th style="text-align: left; padding-bottom: 4px;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div style="font-size: 14px; display: flex; justify-content: space-between;" class="bold">
          <span>المجموع الكلي:</span>
          <span>${order.total_amount} DZD</span>
        </div>

        <div class="divider"></div>
        <p class="center" style="font-size: 11px; margin: 10px 0;">شكراً لزيارتكم! نتمنى لكم وجبة شهية ❤️</p>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `;

    win.document.write(receiptHtml);
    win.document.close();
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">{t('شاشة إدارة الطلبات الحية', 'Live Orders Management')}</h1>
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('استقبال وتحديث طلبات الطاولات والمطبخ في الوقت الفعلي مع حذف وإدارة الطلبات', 'Real-time order processing, status updates, and order clearing')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            {['all', 'pending', 'in_kitchen', 'ready', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  filter === st ? 'bg-white text-orange-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? t('الكل', 'All') : st === 'pending' ? t('جديد', 'Pending') : st === 'in_kitchen' ? t('المطبخ', 'Kitchen') : st === 'ready' ? t('جاهز', 'Ready') : t('مكتمل', 'Done')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-colors ${
              soundEnabled ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title={t('تفعيل/تعطيل التنبيه الصوتي', 'Toggle sound alerts')}
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={handleClearCompleted}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1.5"
            title={t('مسح كافة الطلبات المكتملة', 'Clear completed orders')}
          >
            <Trash2 size={15} />
            <span>{t('مسح المكتملة', 'Clear Done')}</span>
          </button>

          <button
            onClick={loadOrders}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title={t('تحديث', 'Refresh')}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Orders Grid / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Inbox size={32} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-black text-lg text-slate-800">{t('لا توجد طلبات حالياً في هذا القسم', 'No active orders in this view')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('عندما يقوم الزبائن بمسح باركود الطاولات وإرسال وجباتهم من المنيو، ستصل الطلبات هنا فوراً ومباشرة مع رنين التنبيه الصوتي.', 'New orders placed by customers from table QR menus will appear here instantly in real-time.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-3xl border-2 transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                order.status === 'pending' ? 'border-amber-400 ring-4 ring-amber-400/10' : order.status === 'in_kitchen' ? 'border-blue-400' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900">#{order.order_number}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-200 font-bold text-slate-700">
                    {order.customer_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleDeleteOrder(order.id, order.order_number)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                    title={t('حذف هذا الطلب نهائياً', 'Delete this order')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Customer & Items */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{t('المبلغ الإجمالي:', 'Total:')}</span>
                  <span className="font-black text-orange-600 text-base">{order.total_amount} DZD</span>
                </div>

                {/* Items List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-semibold">
                        <span className="font-black text-orange-600">{item.quantity}x</span> {item.product_name}
                      </span>
                      <span className="text-slate-400 font-medium">{item.total_price} DZD</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePrintReceipt(order)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold"
                  title={t('طباعة إيصال الفاتورة', 'Print receipt')}
                >
                  <Printer size={16} />
                </button>

                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'in_kitchen')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ChefHat size={16} />
                      <span>{t('تحويل للمطبخ', 'Send to Kitchen')}</span>
                    </button>
                  )}
                  {order.status === 'in_kitchen' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle size={16} />
                      <span>{t('جاهز للتسليم', 'Mark Ready')}</span>
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>{t('إتمام الطلب', 'Complete Order')}</span>
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black text-emerald-600 py-1">
                        ✓ {t('طلب مكتمل', 'Completed')}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(order.id, order.order_number)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 bg-rose-50 rounded-lg"
                      >
                        {t('إزالة', 'Remove')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
