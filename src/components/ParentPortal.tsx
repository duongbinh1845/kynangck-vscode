import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParentCRM, Project, Feedback } from '../types';
import {
  Search, ShieldAlert, CheckCircle, ClipboardList, Sparkles,
  Send, Award, Star, MessageSquare, PlusCircle, User, Phone, Mail, Calendar
} from 'lucide-react';

interface ParentPortalProps {
  projects: Project[];
  onRefreshStats: () => void;
}

export default function ParentPortal({ projects, onRefreshStats }: ParentPortalProps) {
  const [activePortalTab, setActivePortalTab] = useState<'progress' | 'testimonials' | 'feedback' | 'register'>('progress');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [currentParent, setCurrentParent] = useState<ParentCRM | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // New feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    parentName: '',
    parentPhone: '',
    content: '',
    rating: 5
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // New course registration form state
  const [registerForm, setRegisterForm] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    studentName: '',
    studentAge: '8',
    projectId: '',
    packageId: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch('/api/feedbacks');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Error loading feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Default auto-login with first parent for ease-of-use
  const loadFirstParentForSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/parent/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '0901234567' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.parent) {
          setCurrentParent(data.parent);
          setPhoneQuery(data.parent.parentPhone);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFirstParentForSimulate();
  }, []);

  // Update packages dropdown when selected project changes
  useEffect(() => {
    if (projects && projects.length > 0 && !registerForm.projectId) {
      const defaultProjId = projects[0].id;
      const defaultPkgId = projects[0].pricingPackages && projects[0].pricingPackages.length > 0 
        ? projects[0].pricingPackages[0].id 
        : '';
      setRegisterForm(prev => ({
        ...prev,
        projectId: defaultProjId,
        packageId: defaultPkgId
      }));
    }
  }, [projects]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projId = e.target.value;
    const selectedProj = projects.find(p => p.id === projId);
    const defaultPkgId = selectedProj?.pricingPackages && selectedProj.pricingPackages.length > 0
      ? selectedProj.pricingPackages[0].id
      : '';
    setRegisterForm(prev => ({
      ...prev,
      projectId: projId,
      packageId: defaultPkgId
    }));
  };

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery.trim()) return;
    setIsLoading(true);
    setSearchError('');

    try {
      const res = await fetch('/api/parent/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneQuery.trim() })
      });
      const data = await res.json();
      if (res.ok && data.parent) {
        setCurrentParent(data.parent);
      } else {
        setSearchError(data.error || 'Không tìm thấy phụ huynh nào với số điện thoại này. Gợi ý tra cứu SĐT mẫu: 0901234567');
        setCurrentParent(null);
      }
    } catch (error) {
      setSearchError('Không thể kết nối máy chủ dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.parentName || !feedbackForm.content) {
      alert('Vui lòng điền đầy đủ tên và ý kiến đóng góp.');
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });
      if (response.ok) {
        setFeedbackSuccess(true);
        fetchFeedbacks();
        setFeedbackForm({
          parentName: '',
          parentPhone: '',
          content: '',
          rating: 5
        });
        setTimeout(() => setFeedbackSuccess(false), 4000);
      } else {
        const err = await response.json();
        alert('Gửi góp ý lỗi: ' + err.error);
      }
    } catch (err) {
      console.error(err);
      alert('Gửi góp ý thất bại.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSubmitting(true);
    setRegisterError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Đăng ký khóa học không thành công.');
      }

      setRegisterSuccess(true);
      onRefreshStats(); // Sync system dashboard

      // Save Phone to search immediately after registration
      setPhoneQuery(registerForm.parentPhone);

      setRegisterForm({
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        studentName: '',
        studentAge: '8',
        projectId: projects[0]?.id || '',
        packageId: projects[0]?.pricingPackages?.[0]?.id || ''
      });
    } catch (err: any) {
      setRegisterError(err.message);
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-[#5C7A3E] to-[#455c2e] text-white p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 select-none">
          <Award className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kênh Hỗ Trợ Phụ Huynh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Đồng Hành Phát Triển Kỹ Năng Cùng Con</h1>
          <p className="text-sm text-slate-100 font-sans leading-relaxed">
            Tra cứu học bạ điện tử rèn luyện của con, tham gia đóng góp góp ý cải tiến học vụ, xem phản hồi từ phụ huynh khác hoặc trực tiếp đăng ký các trại dã ngoại thực tế của KynangCK.
          </p>
        </div>
      </div>

      {/* Tabs list matching 4 exact areas requested */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1.5 scrollbar-none pb-0.5">
        <button
          onClick={() => setActivePortalTab('progress')}
          className={`pb-4 px-4 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activePortalTab === 'progress'
              ? 'border-[#5C7A3E] text-[#5C7A3E] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Học Bạ Rèn Luyện</span>
        </button>

        <button
          onClick={() => setActivePortalTab('testimonials')}
          className={`pb-4 px-4 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activePortalTab === 'testimonials'
              ? 'border-[#5C7A3E] text-[#5C7A3E] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Cảm nhận từ Phụ huynh ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActivePortalTab('feedback')}
          className={`pb-4 px-4 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activePortalTab === 'feedback'
              ? 'border-[#5C7A3E] text-[#5C7A3E] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Góp Ý Hoàn Thiện</span>
        </button>

        <button
          onClick={() => setActivePortalTab('register')}
          className={`pb-4 px-4 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activePortalTab === 'register'
              ? 'border-[#5C7A3E] text-[#5C7A3E] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Đăng Ký Khóa Học</span>
        </button>
      </div>

      {/* Render areas */}
      <div className="min-h-[400px]">
        {/* 1. TRA CỨU HỌC BẠ RÈN LUYỆN */}
        {activePortalTab === 'progress' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Tra cứu học bạ dã ngoại</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Nhập số điện thoại của phụ huynh đã đăng ký để hiển thị đánh giá rèn luyện kỹ năng sinh tồn, dã ngoại của con từ giáo viên KynangCK.
                </p>

                <form onSubmit={handlePhoneSearch} className="flex items-center space-x-3 mt-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="VD: 0901234567 hoặc số điện thoại của bạn"
                      value={phoneQuery}
                      onChange={(e) => setPhoneQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    id="btn-search-phone"
                    disabled={isLoading}
                    className="bg-[#5C7A3E] hover:bg-[#4a6332] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    {isLoading ? 'Đang tra cứu...' : 'Tìm Kiếm'}
                  </button>
                </form>
                {searchError && <p className="text-red-600 text-xs mt-2">{searchError}</p>}
              </div>
            </div>

            {currentParent ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left parent summary card */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6 self-start">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase">Phụ huynh bảo hộ</h4>
                    <p className="text-base font-extrabold text-slate-900 mt-1">{currentParent.parentName}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">SĐT: {currentParent.parentPhone}</p>
                    <p className="text-xs text-slate-500 font-mono">Email: {currentParent.parentEmail}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase">Dự án rèn luyện đã đặt</h4>
                    {projects.find(p => p.id === currentParent.registeredProjectId) ? (
                      <div className="mt-2 bg-[#FAF7F0] p-3 rounded-xl border border-slate-200/40 text-xs">
                        <p className="font-bold text-[#5C7A3E]">{projects.find(p => p.id === currentParent.registeredProjectId)?.title}</p>
                        <p className="text-slate-500 mt-0.5">Chương trình: {currentParent.packageName}</p>
                        <p className="text-emerald-700 font-bold mt-1.5">{currentParent.amountPaid.toLocaleString('vi-VN')} VNĐ (Thành công)</p>
                      </div>
                    ) : (
                      <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/40 text-xs">
                        <p className="font-bold text-slate-700">Khóa học đăng ký mới</p>
                        <p className="text-slate-500 mt-0.5">Gói: {currentParent.packageName}</p>
                        <p className="text-emerald-700 font-bold mt-1.5">{currentParent.amountPaid.toLocaleString('vi-VN')} VNĐ (Đã thanh toán)</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Dữ liệu rèn luyện kỹ năng của con được giáo viên đồng bộ bảo mật trực tiếp từ hệ thống CRM trung tâm.</span>
                  </div>
                </div>

                {/* Right children development logs */}
                <div className="lg:col-span-8 space-y-6">
                  {currentParent.children.map((child, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#FAF7F0] text-[#5C7A3E] p-2.5 rounded-2xl border border-slate-200/50">
                            <Award className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900">{child.studentName}</h4>
                            <p className="text-xs text-slate-400">Độ tuổi: {child.studentAge} tuổi • Sổ liên lạc kỹ năng</p>
                          </div>
                        </div>
                        <span className="bg-[#5C7A3E]/10 text-[#5C7A3E] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#5C7A3E]/20">Học bạ số</span>
                      </div>

                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-4">Lịch trình rèn luyện & Nhận xét của huấn luyện viên:</p>

                        <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
                          {child.progressLog && child.progressLog.length > 0 ? (
                            child.progressLog.map((log, lIdx) => (
                              <div key={lIdx} className="relative">
                                {/* Timeline pin indicator */}
                                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                                  log.status === 'Đã hoàn thành'
                                    ? 'bg-emerald-500 border-emerald-100'
                                    : 'bg-amber-500 border-amber-100 animate-pulse'
                                }`}></div>

                                <div className="space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span className="font-extrabold text-sm text-slate-800">{log.skillName}</span>
                                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                                      <span>Ngày: {log.date}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        log.status === 'Đã hoàn thành'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}>
                                        {log.status}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed bg-[#FAF7F0] p-3 rounded-xl border border-slate-200/40">
                                    {log.notes}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">Chưa có hoạt động rèn luyện nào được huấn luyện viên ghi sổ. Giáo vụ sẽ đồng bộ ngay khi bé tham gia dã ngoại.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-[#FAF7F0] rounded-3xl border border-slate-200/40 max-w-xl mx-auto space-y-2">
                <ShieldAlert className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="font-serif font-bold text-slate-800 text-sm">Chưa có kết quả tra cứu</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nhập số điện thoại của bạn ở ô trên để tra cứu hoặc nhấn vào <b>Tìm kiếm</b> để hiển thị dữ liệu dã ngoại mô phỏng mẫu của gia đình bé Nguyễn Minh Quân.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. CẢM NHẬN TỪ PHỤ HUYNH */}
        {activePortalTab === 'testimonials' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h3 className="text-xl font-bold font-serif text-slate-900">Cảm nhận từ Phụ huynh</h3>
              <p className="text-slate-500 text-xs">
                Tổng hợp những chia sẻ chân thực từ các phụ huynh đã gửi gắm con em rèn luyện kỹ năng tự lập, dã ngoại cùng KynangCK.
              </p>
            </div>

            {loadingFeedbacks ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">Đang tải ý kiến...</div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 border border-dashed rounded-3xl text-slate-400 italic text-xs max-w-md mx-auto">
                Chưa có ý kiến góp ý nào được phê duyệt hiển thị.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1 text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        " {fb.content} "
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-[10px] font-mono text-slate-400">
                      <div>
                        <p className="font-extrabold text-slate-800 text-xs not-italic">{fb.parentName}</p>
                        <p className="text-[10px] text-slate-400">Phụ huynh bảo hộ</p>
                      </div>
                      <span>{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. GÓP Ý HOÀN THIỆN */}
        {activePortalTab === 'feedback' && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Gửi góp ý cải thiện dịch vụ</h3>
                <p className="text-slate-500 text-xs">
                  Ý kiến của quý phụ huynh là chìa khóa để KynangCK không ngừng hoàn thiện giáo án huấn luyện dã ngoại và nâng cấp CRM học bạ điện tử tiện ích hơn.
                </p>
              </div>

              {feedbackSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4">
                  <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-slate-950 font-serif">Gửi Góp Ý Thành Công!</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Xin chân thành cảm ơn những ý kiến vô giá của quý phụ huynh. Quản trị viên CMS của KynangCK đã ghi nhận đóng góp này và sẽ phản hồi sớm nhất.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase text-[10px]">Tên của phụ huynh</label>
                      <input
                        required
                        type="text"
                        placeholder="VD: Nguyễn Văn Hùng"
                        value={feedbackForm.parentName}
                        onChange={e => setFeedbackForm({ ...feedbackForm, parentName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 uppercase text-[10px]">Số điện thoại liên hệ (Tùy chọn)</label>
                      <input
                        type="tel"
                        placeholder="VD: 0901234567"
                        value={feedbackForm.parentPhone}
                        onChange={e => setFeedbackForm({ ...feedbackForm, parentPhone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Tactile Star Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase text-[10px] block">Mức độ hài lòng của phụ huynh</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: starValue })}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="focus:outline-none cursor-pointer transition transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              (hoverRating !== null ? starValue <= hoverRating : starValue <= feedbackForm.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 fill-transparent'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 font-mono ml-2">
                        {hoverRating !== null ? `${hoverRating}/5 sao` : `${feedbackForm.rating}/5 sao`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase text-[10px]">Nội dung ý kiến đóng góp</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Nhập chi tiết nhận xét của phụ huynh về cơ sở vật chất, giáo trình sinh tồn dã ngoại hoặc thái độ của điều phối viên..."
                      value={feedbackForm.content}
                      onChange={e => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs font-sans leading-relaxed resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="w-full bg-[#5C7A3E] hover:bg-[#4a6332] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>{feedbackSubmitting ? 'Đang gửi ý kiến lên CMS...' : 'Gửi Ý Kiến Phản Hồi'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 4. ĐĂNG KÝ CHƯƠNG TRÌNH CHO CON */}
        {activePortalTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left instructions card */}
            <div className="lg:col-span-5 bg-gradient-to-tr from-[#5C7A3E] to-[#3a4d27] rounded-3xl p-6 text-white border border-[#4d6634] shadow-lg space-y-6">
              <div className="bg-white/10 p-2.5 rounded-2xl w-11 h-11 flex items-center justify-center text-white border border-white/20">
                <PlusCircle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif">Đăng ký khóa học dã ngoại</h3>
                <p className="text-slate-100 text-xs mt-2 leading-relaxed">
                  Lựa chọn các chương trình huấn luyện dã ngoại cắm trại sinh tồn và rèn luyện kỹ năng thực tế hiện có của KynangCK. 
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                <p className="text-[10px] text-emerald-200 font-mono uppercase tracking-wider font-bold">Lợi ích sau khi thanh toán đăng ký:</p>
                <div className="space-y-2 leading-relaxed text-slate-100">
                  <p>• <b>Kích hoạt học bạ số:</b> Có ngay tài khoản để giáo vụ cập nhật tiến trình rèn luyện kỹ năng dã ngoại của con.</p>
                  <p>• <b>Gửi thư mời nhập học:</b> Hệ thống tự động gửi email thông báo chương trình, địa điểm và cẩm nang chuẩn bị đồ dùng.</p>
                  <p>• <b>Bảo hiểm trọn gói:</b> Gói dịch vụ đã bao gồm bảo hiểm dã ngoại chuẩn y tế cao cấp cho bé.</p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center flex justify-around text-xs">
                <div>
                  <p className="text-lg font-bold text-amber-300 font-mono">100%</p>
                  <p className="text-[10px] text-slate-200">An toàn y tế dã dã ngoại</p>
                </div>
                <div className="border-l border-white/10"></div>
                <div>
                  <p className="text-lg font-bold text-amber-300 font-mono">24/7</p>
                  <p className="text-[10px] text-slate-200">Huấn luyện viên theo sát</p>
                </div>
              </div>
            </div>

            {/* Right registration form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Đăng ký tham gia rèn luyện dã ngoại</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Nhập đầy đủ thông tin bên dưới. Hệ thống sẽ tự động khởi tạo học bạ điện tử trong CRM ngay lập tức.
                </p>
              </div>

              {registerSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4">
                  <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-slate-950 font-serif">Thanh Toán & Đăng Ký Thành Công!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                      Đã thanh toán thành công khóa dã ngoại của bé. Một thư xác nhận cùng cẩm nang chuẩn bị dã dã ngoại đã được gửi đến email của bạn. Bạn có thể sử dụng SĐT vừa đăng ký để tra cứu học bạ của con ngay lúc này!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRegisterSuccess(false);
                      setActivePortalTab('progress');
                    }}
                    className="bg-[#5C7A3E] hover:bg-[#4a6332] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    Tra cứu học bạ ngay
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  {registerError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs">
                      {registerError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Tên của phụ huynh bảo hộ</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="text"
                          placeholder="VD: Nguyễn Văn Hùng"
                          value={registerForm.parentName}
                          onChange={e => setRegisterForm({ ...registerForm, parentName: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Số điện thoại liên hệ</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="tel"
                          placeholder="VD: 0901234567"
                          value={registerForm.parentPhone}
                          onChange={e => setRegisterForm({ ...registerForm, parentPhone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Địa chỉ Email liên hệ</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="email"
                          placeholder="VD: hung.nguyen@gmail.com"
                          value={registerForm.parentEmail}
                          onChange={e => setRegisterForm({ ...registerForm, parentEmail: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Họ tên của con</label>
                      <input
                        required
                        type="text"
                        placeholder="VD: Nguyễn Minh Quân"
                        value={registerForm.studentName}
                        onChange={e => setRegisterForm({ ...registerForm, studentName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Độ tuổi của con</label>
                      <select
                        value={registerForm.studentAge}
                        onChange={e => setRegisterForm({ ...registerForm, studentAge: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                      >
                        {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                          <option key={age} value={age}>{age} tuổi</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Lựa chọn chương trình</label>
                      <select
                        value={registerForm.projectId}
                        onChange={handleProjectChange}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                      >
                        {projects.map(proj => (
                          <option key={proj.id} value={proj.id}>{proj.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Lựa chọn gói dịch vụ</label>
                      <select
                        value={registerForm.packageId}
                        onChange={e => setRegisterForm({ ...registerForm, packageId: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                      >
                        {projects.find(p => p.id === registerForm.projectId)?.pricingPackages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.price.toLocaleString('vi-VN')}đ)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerSubmitting}
                    className="w-full bg-[#5C7A3E] hover:bg-[#4a6332] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>{registerSubmitting ? 'Đang kích hoạt học bạ CRM...' : 'Xác Nhận Đăng Ký & Tạo Học Bạ Điện Tử'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
