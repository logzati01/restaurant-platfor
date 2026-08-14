'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Store, QrCode, Plus, Printer, Phone, MapPin, Download } from 'lucide-react';

export default function BranchesPage() {
  const { t, lang } = useLang();
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    async function loadData() {
      const { data: bData } = await supabase.from('branches').select('*');
      const { data: tData } = await supabase.from('restaurant_tables').select('*');
      if (bData) setBranches(bData);
      if (tData) setTables(tData);
    }
    loadData();
  }, []);

  const handlePrintQR = (tableNum: string) => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('إدارة الفروع ورموز الطاولات (QR Code)', 'Branches & Table QR Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('طباعة بطاقات الباركود الذكية لتمكين الزبائن من الطلب مباشرة من الطاولة', 'Generate and print smart QR codes for instant table ordering')}</p>
        </div>
      </div>

      {/* Branches List */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-base">{t('الفروع المسجلة', 'Registered Branches')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Store size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{lang === 'ar' ? b.name_ar : b.name}</h3>
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
          <h2 className="font-bold text-slate-800 text-base">{t('بطاقات باركود الطاولات (جاهزة للطباعة)', 'Table QR Stand Cards (Print-Ready)')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => {
            const qrUrl = `${baseUrl}/menu?table=${table.table_number}`;
            return (
              <div
                key={table.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden"
              >
                <div className="w-full bg-slate-900 text-white py-2 rounded-xl">
                  <span className="font-extrabold text-sm uppercase tracking-wider">
                    {t('طاولة رقم', 'Table')} {table.table_number}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <QRCodeSVG value={qrUrl} size={150} level="H" />
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
    </div>
  );
}
