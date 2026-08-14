'use client';
import React, { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Mail, 
  Phone, 
  Store, 
  CheckCircle2, 
  X, 
  ChefHat, 
  Receipt, 
  UserCheck 
} from 'lucide-react';

export default function StaffManagementPage() {
  const { t, lang } = useLang();
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New staff form state
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'cashier',
    branch_id: '',
  });

  const loadStaffData = async () => {
    const { data: bData } = await supabase.from('branches').select('*');
    if (bData) setBranches(bData);

    const { data: pData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (pData && pData.length > 0) {
      setStaff(pData);
    } else {
      // Demo Staff Members for immediate realistic display
      setStaff([
        { id: '1', full_name: 'عبد الحميد دحماني', email: 'owner@restaurant.com', phone: '+213555112233', role: 'restaurant_owner', branch_id: bData?.[0]?.id, is_active: true },
        { id: '2', full_name: 'سامي بلحاج', email: 'sami.manager@restaurant.com', phone: '+213555445566', role: 'branch_manager', branch_id: bData?.[0]?.id, is_active: true },
        { id: '3', full_name: 'يوسف شريف', email: 'youssef.chef@restaurant.com', phone: '+213555778899', role: 'kitchen_staff', branch_id: bData?.[0]?.id, is_active: true },
        { id: '4', full_name: 'حمزة بوعلام', email: 'hamza.cashier@restaurant.com', phone: '+213555990011', role: 'cashier', branch_id: bData?.[0]?.id, is_active: true },
        { id: '5', full_name: 'بلال قدور', email: 'bilal.waiter@restaurant.com', phone: '+213555223344', role: 'waiter', branch_id: bData?.[0]?.id, is_active: true },
      ]);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) return;

    const { data: res } = await supabase.from('restaurants').select('id').limit(1).single();
    const restId = res?.id || '11111111-1111-1111-1111-111111111111';
    const targetBranch = form.branch_id || branches[0]?.id || '22222222-2222-2222-2222-222222222222';

    const newMember = {
      restaurant_id: restId,
      branch_id: targetBranch,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      is_active: true,
    };

    const { data } = await supabase.from('profiles').insert([newMember]).select().single();

    if (data) {
      setStaff(prev => [data, ...prev]);
    } else {
      setStaff(prev => [{ ...newMember, id: Date.now().toString() }, ...prev]);
    }

    setShowModal(false);
    setForm({ full_name: '', email: '', phone: '', role: 'cashier', branch_id: '' });
  };

  const toggleStaffStatus = async (id: string, current: boolean) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm(t('هل تريد بالتأكيد حذف هذا الموظف؟', 'Delete this staff member?'))) return;
    setStaff(prev => prev.filter(s => s.id !== id));
    await supabase.from('profiles').delete().eq('id', id);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'restaurant_owner':
      case 'super_admin':
        return (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit">
            <ShieldCheck size={14} />
            <span>{t('المدير العام (صلاحيات كاملة)', 'Owner / Super Admin')}</span>
          </span>
        );
      case 'branch_manager':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit">
            <Store size={14} />
            <span>{t('مدير فرع', 'Branch Manager')}</span>
          </span>
        );
      case 'cashier':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit">
            <Receipt size={14} />
            <span>{t('كاشير / نقاط البيع', 'Cashier / POS')}</span>
          </span>
        );
      case 'kitchen_staff':
        return (
          <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit">
            <ChefHat size={14} />
            <span>{t('طاقم المطبخ / الشيف', 'Kitchen / Chef')}</span>
          </span>
        );
      case 'waiter':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit">
            <UserCheck size={14} />
            <span>{t('نادل / صالة', 'Waiter')}</span>
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">{role}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('إدارة الموظفين والأدوار والصلاحيات', 'Staff & Permissions Management')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('إضافة طاقم العمل، تحديد الأدوار (مدير، كاشير، شيف، نادل)، والتحكم في صلاحيات الوصول', 'Manage team members, assign specific roles, and control access permissions')}</p>
        </div>

        <button
          onClick={() => {
            setForm({ full_name: '', email: '', phone: '', role: 'cashier', branch_id: branches[0]?.id || '' });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all"
        >
          <UserPlus size={16} />
          <span>{t('إضافة موظف جديد', 'Add New Staff')}</span>
        </button>
      </div>

      {/* Roles & Permissions Reference Card */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <h2 className="text-sm font-black flex items-center gap-2 text-orange-400">
          <ShieldCheck size={18} />
          <span>{t('جدول توزيع الصلاحيات الذكي في المنصة', 'Role Permissions Matrix')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-purple-400">👑 {t('المدير العام', 'Owner / Admin')}</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{t('تحكم كامل في كافة الفروع، التقارير المالية، المنيو، الموظفين، والإعدادات.', 'Full access to all branches, reports, menus, staff, and settings.')}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-blue-400">🏢 {t('مدير الفرع', 'Branch Manager')}</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{t('إدارة طلبات وطاولات ومبيعات فرعه المحدد فقط دون الإعدادات العامة.', 'Manages orders, tables, and sales of assigned branch only.')}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400">🧾 {t('الكاشير', 'Cashier')}</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{t('استقبال الطلبات، استلام المدفوعات، وطباعة فواتير الإيصالات الحرارية.', 'Receive orders, process payments, and print thermal receipts.')}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-orange-400">👨‍🍳 {t('طاقم المطبخ', 'Kitchen Staff')}</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{t('الوصول لشاشة المطبخ (KDS) فقط لتغيير حالة تحضير الوجبات لحظياً.', 'Access to Kitchen Display System only to update prep status.')}</p>
          </div>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-800 text-base">{t('فريق العمل الحالي', 'Current Staff Members')} ({staff.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-200 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{member.full_name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail size={12} />
                        <span>{member.email}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStaffStatus(member.id, member.is_active)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                      member.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {member.is_active ? t('نشط ✓', 'Active') : t('موقوف ✕', 'Suspended')}
                  </button>
                </div>

                {/* Role Badge */}
                <div>
                  {getRoleBadge(member.role)}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>{member.phone || t('غير محدد', 'Not set')}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Delete Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {branches.find(b => b.id === member.branch_id)?.name_ar || t('الفرع الرئيسي', 'Main Branch')}
                </span>

                {member.role !== 'restaurant_owner' && (
                  <button
                    onClick={() => handleDeleteStaff(member.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t('حذف الموظف', 'Delete Staff')}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">{t('إضافة موظف جديد وتعيين الصلاحية', 'Add New Staff & Assign Role')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('الاسم الكامل للموظف*', 'Full Name*')}</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="مثال: يوسف بلعيد"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('البريد الإلكتروني*', 'Email*')}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="youssef@resto.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('رقم الهاتف', 'Phone Number')}</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+213..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('الدور والصلاحية*', 'Role & Permission*')}</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-orange-500 outline-none bg-white text-orange-600"
                  >
                    <option value="branch_manager">{t('مدير فرع (Branch Manager)', 'Branch Manager')}</option>
                    <option value="cashier">{t('كاشير (Cashier)', 'Cashier')}</option>
                    <option value="kitchen_staff">{t('طاقم المطبخ (Kitchen)', 'Kitchen Staff')}</option>
                    <option value="waiter">{t('نادل (Waiter)', 'Waiter')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('الفرع المخصص', 'Assigned Branch')}</label>
                  <select
                    value={form.branch_id}
                    onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{lang === 'ar' ? b.name_ar : b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md shadow-orange-600/20"
                >
                  {t('حفظ الموظف', 'Save Staff Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
