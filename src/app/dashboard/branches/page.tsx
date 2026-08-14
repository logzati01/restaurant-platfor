'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Store, QrCode, Plus, Printer, Phone, MapPin, Trash2, X, Building2 } from 'lucide-react';

export default function BranchesPage() {
  const { t, lang } = useLang();
  const [restaurant, setRestaurant] = useState<any>({ name: 'RestoManager', name_ar: 'برجر آند جريل', logo_url: '' });
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  // Modals
  const [showTableModal, setShowTableModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);

  // Forms
  const [tableForm, setTableForm] = useState({ table_number: '', capacity: 4, branch_id: '' });
  const [branchForm, setBranchForm] = useState({ name: '', name_ar: '', city: '', address: '', phone: '', opening_time: '09:00', closing_time: '23:00' });

  const loadData = async () => {
    const { data: rData } = await supabase.from('restaurants').select('*').limit(1).single();
    const { data: bData } = await supabase.from('branches').select('*').order('created_at');
    const { data: tData } = await supabase.from('restaurant_tables').select('*').order('table_number');
    if (rData) setRestaurant(rData);
    if (bData) setBranches(bData);
    if (tData) setTables(tData);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
    loadData();
  }, []);

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name_ar) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';

    const newBranch = {
      restaurant_id: restId,
      name: branchForm.name || branchForm.name_ar,
      name_ar: branchForm.name_ar,
      city: branchForm.city || 'Algiers',
      address: branchForm.address,
      phone: branchForm.phone,
      is_active: true,
    };

    const { data } = await supabase.from('branches').insert([newBranch]).select().single();
    if (data) {
      setBranches(prev => [...prev, data]);
    } else {
      setBranches(prev => [...prev, { ...newBranch, id: Date.now().toString() }]);
    }

    setShowBranchModal(false);
    setBranchForm({ name: '', name_ar: '', city: '', address: '', phone: '', opening_time: '09:00', closing_time: '23:00' });
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (branches.length <= 1) {
      alert(t('لا يمكن حذف الفرع الوحيد للمطعم!', 'Cannot delete the only remaining branch!'));
      return;
    }
    if (!confirm(t('حذف الفرع سيحذف الطاولات التابعة له، هل تريد المتابعة؟', 'Delete branch and related tables?'))) return;
    setBranches(prev => prev.filter(b => b.id !== branchId));
    await supabase.from('branches').delete().eq('id', branchId);
    loadData();
  };

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

  // Dedicated Print Function for ONLY the selected table card
  const handlePrintSingleTable = (table: any) => {
    const win = window.open('', '_blank', 'width=500,height=700');
    if (!win) return;

    const currentOrigin = baseUrl || window.location.origin;
    const qrUrl = `${currentOrigin}/menu?table=${table.table_number}`;
    const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>بطاقة طاولة رقم ${table.table_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&display=swap" rel="stylesheet">
        <style>
          @page { size: portrait; margin: 10mm; }
          body { font-family: 'Cairo', sans-serif; text-align: center; margin: 0; padding: 20px; background: #fff; }
          .card { 
            border: 3px solid #0f172a; 
            border-radius: 28px; 
            padding: 35px 25px; 
            max-width: 320px; 
            margin: 20px auto; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.06); 
          }
          .resto-header { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
            margin-bottom: 20px; 
          }
          .resto-name { 
            font-size: 20px; 
            font-weight: 900; 
            color: #0f172a; 
          }
          .table-badge { 
            background: #0f172a; 
            color: #fff; 
            padding: 10px 18px; 
            border-radius: 16px; 
            font-weight: 900; 
            font-size: 20px; 
            letter-spacing: 1px;
            margin-bottom: 25px; 
          }
          .qr-box { 
            padding: 16px; 
            border: 2px solid #e2e8f0; 
            border-radius: 24px; 
            display: inline-block; 
            margin-bottom: 20px; 
            background: #fff;
          }
          .qr-img { 
            width: 200px; 
            height: 200px; 
            display: block; 
          }
          .instruction { 
            font-size: 15px; 
            font-weight: 900; 
            color: #ea580c; 
            margin-bottom: 6px; 
          }
          .sub-text { 
            font-size: 12px; 
            color: #64748b; 
            margin-bottom: 8px; 
          }
          .url { 
            font-size: 10px; 
            color: #94a3b8; 
            font-family: monospace; 
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="resto-header">
            ${restaurant.logo_url ? `<img src="${restaurant.logo_url}" style="width:45px;height:45px;border-radius:14px;object-fit:cover;">` : '<span style="font-size:28px;">🍔</span>'}
            <span class="resto-name">${lang === 'ar' ? restaurant.name_ar : restaurant.name}</span>
          </div>

          <div class="table-badge">طاولة رقم ${table.table_number}</div>

          <div class="qr-box">
            <img src="${qrImageSrc}" class="qr-img" alt="QR Code" />
          </div>

          <div class="instruction">امسح الكود لفتح القائمة والطلب 📱</div>
          <div class="sub-text">اختر وجباتك المفضلة وسنحضرها فوراً لطاولتك</div>
          <div class="url">${qrUrl}</div>
        </div>

        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `;

    win.document.write(printContent);
    win.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إدارة الفروع ورموز الطاولات (QR Code)', 'Branches & Table QR Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('إضافة فروع جديدة، إدارة الطاولات، وطباعة بطاقة كل طاولة منفصلة بجودة عالية', 'Manage branches, add tables, and print individual stand cards')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBranchModal(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <Building2 size={16} className="text-orange-600" />
            <span>{t('إضافة فرع جديد', 'Add Branch')}</span>
          </button>

          <button
            onClick={() => {
              setTableForm({ table_number: `T-0${tables.length + 1}`, capacity: 4, branch_id: branches[0]?.id || '' });
              setShowTableModal(true);
            }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all"
          >
            <Plus size={16} />
            <span>{t('إضافة طاولة جديدة', 'Add Table')}</span>
          </button>
        </div>
      </div>

      {/* Branches List */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-800 text-base">{t('فروع المطعم المسجلة', 'Registered Branches')} ({branches.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-4 relative group hover:border-orange-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl shrink-0">
                  <Store size={26} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base">{lang === 'ar' ? b.name_ar : b.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{b.address || t('العنوان الرئيسي', 'Main Address')}, {b.city || 'Algiers'}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>{b.phone || '+213...'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteBranch(b.id)}
                className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                title={t('حذف الفرع', 'Delete Branch')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tables QR Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-800 text-base">{t('بطاقات باركود الطاولات (جاهزة للطباعة والتوزيع)', 'Table QR Stand Cards (Print-Ready)')} ({tables.length})</h2>
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

                {/* Restaurant Logo on Table Stand */}
                <div className="flex items-center gap-2">
                  {restaurant.logo_url ? (
                    <img src={restaurant.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-cover border" />
                  ) : (
                    <span className="text-xl">🍔</span>
                  )}
                  <span className="font-extrabold text-xs text-slate-800">{lang === 'ar' ? restaurant.name_ar : restaurant.name}</span>
                </div>

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
                  onClick={() => handlePrintSingleTable(table)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer size={15} />
                  <span>{t('طباعة بطاقة هذه الطاولة فقط', 'Print This Card Only')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">{t('إضافة فرع جديد للمطعم', 'Add New Branch')}</h3>
              <button onClick={() => setShowBranchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الفرع (بالعربية)*', 'Branch Name (Arabic)*')}</label>
                <input
                  type="text"
                  required
                  value={branchForm.name_ar}
                  onChange={(e) => setBranchForm({ ...branchForm, name_ar: e.target.value })}
                  placeholder="مثال: فرع وهران - وسط المدينة"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('اسم الفرع (بالإنجليزية)', 'Branch Name (English)')}</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="e.g. Oran City Center Branch"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('المدينة', 'City')}</label>
                  <input
                    type="text"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="Oran / Algiers"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('رقم هاتف الفرع', 'Phone')}</label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="+213..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('العنوان التفصيلي', 'Full Address')}</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="شارع الأمير عبد القادر، وهران"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {t('حفظ الفرع', 'Save Branch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('الفرع التابعة له', 'Branch')}</label>
                <select
                  value={tableForm.branch_id}
                  onChange={(e) => setTableForm({ ...tableForm, branch_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{lang === 'ar' ? b.name_ar : b.name}</option>
                  ))}
                </select>
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
