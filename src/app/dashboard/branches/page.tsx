'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Store, QrCode, Plus, Printer, Phone, MapPin, Trash2, X } from 'lucide-react';

export default function BranchesPage() {
  const { t, lang } = useLang();
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({ table_number: '', capacity: 4, branch_id: '' });

  const loadData = async () => {
    const { data: bData } = await supabase.from('branches').select('*');
    const { data: tData } = await supabase.from('restaurant_tables').select('*').order('table_number');
    if (bData) setBranches(bData);
    if (tData) setTables(tData);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
    loadData();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.table_number) return;
    const targetBranch = tableForm.branch_id || branches[0]?.id || '22222222-2222-2222-2222-222222222222';

    await supabase.from('restaurant_tables').insert([
      {
        branch_id: targetBranch,
        table_number: tableForm.table_number,
        capacity: Number(tableForm.capacity) || 4,
      }
    ]);

    setShowTableModal(false);
    setTableForm({ table_number: '', capacity: 4, branch_id: '' });
    loadData();
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm(t('هل تريد بالتأكيد حذف هذه الطاولة؟', 'Delete this table?'))) return;
    setTables(prev => prev.filter(t => t.id !== tableId));
    await supabase.from('restaurant_tables').delete().eq('id', tableId);
  };

  const handlePrintQR = (tableNum: string) => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إدارة الفروع ورموز الطاولات (QR Code)', 'Branches & Table QR Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('توليد وطباعة باركودات الطاولات الذكية للطلب المباشر وإدارة الفروع', 'Generate and print smart QR codes for instant table ordering')}</p>
        </div>

        <button
          onClick={() => {
            setTableForm({ table_number: `T-0${tables.length + 1}`, capacity: 4, branch_id: branches[0]?.id || '' });
            setShowTableModal(true);
          }}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all"
        >
          <Plus size={16} />
          <span>{t('إضافة طاولة جديدة', 'Add New Table')}</span>
        </button>
      </div>

      {/* Branches List */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-800 text-base">{t('فروع المطعم المسجلة', 'Registered Branches')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl">
                <Store size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">{lang === 'ar' ? b.name_ar : b.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>{b.address}, {b.city}</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone size={14} />
                  <span>{b.phone}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables QR Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-800 text-base">{t('بطاقات باركود الطاولات (جاهزة للطباعة والتوزيع)', 'Table QR Stand Cards (Print-Ready)')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => {
            const currentOrigin = baseUrl || 'https://restaurant.app';
            const qrUrl = `${currentOrigin}/menu?table=${table.table_number}`;
            const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`;

            return (
              <div
                key={table.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden group hover:border-orange-300 transition-all"
              >
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title={t('حذف الطاولة', 'Delete Table')}
                >
                  <Trash2 size={16} />
                </button>

                <div className="w-full bg-slate-900 text-white py-2 rounded-xl">
                  <span className="font-black text-sm uppercase tracking-wider">
                    {t('طاولة رقم', 'Table')} {table.table_number}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
                  <img src={qrImageSrc} alt={`QR Table ${table.table_number}`} className="w-[150px] h-[150px] object-contain rounded-xl" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">{t('امسح الكود لفتح القائمة والطلب', 'Scan to view menu & order')}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{qrUrl}</p>
                </div>

                <button
                  onClick={() => handlePrintQR(table.table_number)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={15} />
                  <span>{t('طباعة بطاقة الطاولة', 'Print Card')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">{t('إضافة طاولة جديدة', 'Add New Table')}</h3>
              <button onClick={() => setShowTableModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('رقم أو رمز الطاولة*', 'Table Number / Code*')}</label>
                <input
                  type="text"
                  required
                  value={tableForm.table_number}
                  onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                  placeholder="مثال: T-04 أو VIP-01"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('عدد المقاعد (السعة)', 'Seats Capacity')}</label>
                <input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {t('حفظ وتوليد الـ QR', 'Generate QR')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
