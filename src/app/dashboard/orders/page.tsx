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
  Bell, 
  Volume2, 
  Filter,
  RefreshCw 
} from 'lucide-react';

export default function LiveOrdersPage() {
  const { t } = useLang();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch initial orders
  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setOrders(data);
    } else {
      // Fallback sample orders
      setOrders([
        { 
          id: 'ord-1', 
          order_number: 105, 
          customer_name: 'طاولة رقم 01', 
          order_type: 'dine_in', 
          status: 'pending', 
          total_amount: 1300, 
          created_at: new Date().toISOString(),
          order_items: [
            { product_name: 'دبل ترافل برجر', quantity: 1, total_price: 850 },
            { product_name: 'بطاطس مقلية بالجبن', quantity: 1, total_price: 450 }
          ]
        },
        { 
          id: 'ord-2', 
          order_number: 104, 
          customer_name: 'سفيان تواتي', 
          order_type: 'takeaway', 
          status: 'in_kitchen', 
          total_amount: 1050, 
          created_at: new Date().toISOString(),
          order_items: [
            { product_name: 'برجر دجاج مقرمش', quantity: 1, total_price: 700 },
            { product_name: 'موهيتو ليمون ونعناع', quantity: 1, total_price: 350 }
          ]
        },
        { 
          id: 'ord-3', 
          order_number: 103, 
          customer_name: 'طاولة رقم 03', 
          order_type: 'dine_in', 
          status: 'ready', 
          total_amount: 2400, 
          created_at: new Date().toISOString(),
          order_items: [
            { product_name: 'دبل ترافل برجر', quantity: 2, total_price: 1700 },
            { product_name: 'برجر دجاج مقرمش', quantity: 1, total_price: 700 }
          ]
        }
      ]);
    }
  };

  useEffect(() => {
    loadOrders();

    // Subscribe to Supabase Realtime changes
    const channel = supabase
      .channel('realtime_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        loadOrders();
        // Play notification sound on new order
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
    // Update locally for instant responsiveness
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  const handlePrint = (order: any) => {
    window.print();
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{t('شاشة إدارة الطلبات الحية', 'Live Orders Management')}</h1>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('استقبال وتحديث طلبات الطاولات والمطبخ في الوقت الفعلي', 'Real-time order processing for kitchen and tables')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'pending', 'in_kitchen', 'ready', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === st ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? t('الكل', 'All') : st === 'pending' ? t('جديد', 'Pending') : st === 'in_kitchen' ? t('المطبخ', 'Kitchen') : st === 'ready' ? t('جاهز', 'Ready') : t('مكتمل', 'Done')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title={t('تفعيل/تعطيل التنبيه الصوتي', 'Toggle sound alerts')}
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={loadOrders}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`bg-white rounded-2xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
              order.status === 'pending' ? 'border-amber-400 ring-2 ring-amber-400/20' : order.status === 'in_kitchen' ? 'border-blue-300' : 'border-slate-200'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900">#{order.order_number}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 font-bold text-slate-700">
                  {order.order_type === 'dine_in' ? t('طاولة', 'Dine-in') : t('سفري', 'Takeaway')}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Customer & Items */}
            <div className="p-4 flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">{order.customer_name}</h4>
                <span className="font-bold text-orange-600 text-sm">{order.total_amount} DZD</span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-medium">
                      <span className="font-bold text-orange-600">{item.quantity}x</span> {item.product_name}
                    </span>
                    <span className="text-slate-500">{item.total_price} DZD</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Action Buttons */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePrint(order)}
                className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title={t('طباعة الفاتورة', 'Print receipt')}
              >
                <Printer size={16} />
              </button>

              <div className="flex items-center gap-1.5 flex-1 justify-end">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'in_kitchen')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ChefHat size={15} />
                    <span>{t('تحويل للمطبخ', 'Send to Kitchen')}</span>
                  </button>
                )}
                {order.status === 'in_kitchen' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle size={15} />
                    <span>{t('جاهز للتسليم', 'Mark Ready')}</span>
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{t('إتمام الطلب', 'Complete Order')}</span>
                  </button>
                )}
                {order.status === 'completed' && (
                  <span className="text-xs font-semibold text-emerald-600 py-1">
                    ✓ {t('طلب مكتمل', 'Completed')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
