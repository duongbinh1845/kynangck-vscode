import React, { useState } from 'react';
import { Project, PricingPackage, LearnerValue, ProjectFAQ } from '../types';
import { ShieldCheck, Calendar, MapPin, User, Check, Sparkles, HelpCircle, Users, Plus, Trash2 } from 'lucide-react';

interface ProjectLandingPageProps {
  project: Project;
  onBack: () => void;
  onRegisterSuccess: (parentData: any) => void;
}

export default function ProjectLandingPage({ project, onBack, onRegisterSuccess }: ProjectLandingPageProps) {
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(project.pricingPackages[0] || null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  const [participantCount, setParticipantCount] = useState<number>(1);
  const [studentsList, setStudentsList] = useState<{ studentName: string; studentAge: string }[]>([
    { studentName: '', studentAge: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default fallback landing page content if AI landing config not present
  const landing = project.aiLandingPage || {
    headline: `Dự Án Giáo Dục Kỹ Năng: ${project.title}`,
    subheadline: `Rèn luyện toàn diện, sẵn sàng thích nghi cuộc sống hiện đại`,
    description: project.description,
    keyTakeaways: [
      'Nâng cao kỹ năng tự lập giải quyết vấn đề',
      'Định hướng tinh thần đoàn kết đồng đội',
      'Xây dựng ý thức kỷ luật tự giác cao',
      'Đồng hành an toàn cùng đội ngũ y tế, chuyên gia huấn luyện viên'
    ],
    bannerColor: 'emerald',
    accentColor: 'amber',
    faq: [
      { question: 'Có người hỗ trợ bé trong dự án không?', answer: 'Có, các chuyên viên và giáo viên của chúng tôi túc trực 24/7 để đồng hành và hỗ trợ bé trong tất cả hoạt động.' }
    ]
  };

  const getThemeColors = (color: string) => {
    switch (color) {
      case 'emerald':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', badge: 'bg-emerald-50 text-emerald-700' };
      case 'orange':
        return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-400', btn: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-orange-50 text-orange-700' };
      case 'red':
        return { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', btn: 'bg-red-600 hover:bg-red-700', badge: 'bg-red-50 text-red-700' };
      case 'sky':
        return { bg: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-500', btn: 'bg-sky-600 hover:bg-sky-700', badge: 'bg-sky-50 text-sky-700' };
      case 'indigo':
        return { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700', badge: 'bg-indigo-50 text-indigo-700' };
      case 'amber':
        return { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-400', btn: 'bg-amber-500 hover:bg-amber-600', badge: 'bg-amber-50 text-amber-700' };
      default:
        return { bg: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-800', btn: 'bg-slate-900 hover:bg-slate-800', badge: 'bg-slate-100 text-slate-800' };
    }
  };

  const theme = getThemeColors(landing.bannerColor);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleParticipantCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(20, count));
    setParticipantCount(newCount);
    setStudentsList(prev => {
      const updated = [...prev];
      if (newCount > updated.length) {
        for (let i = updated.length; i < newCount; i++) {
          updated.push({ studentName: '', studentAge: '' });
        }
      } else {
        updated.length = newCount;
      }
      return updated;
    });
  };

  const handleStudentChange = (index: number, field: 'studentName' | 'studentAge', value: string) => {
    setStudentsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    
    // Check required student fields
    for (let i = 0; i < studentsList.length; i++) {
      if (!studentsList[i].studentName) {
        setErrorMsg(`Vui lòng điền họ tên học sinh tham gia thứ ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const firstStudent = studentsList[0] || { studentName: '', studentAge: '' };
      const totalAmount = selectedPackage.price * participantCount;

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          studentName: firstStudent.studentName,
          studentAge: firstStudent.studentAge,
          students: studentsList,
          participantCount,
          totalAmount,
          projectId: project.id,
          packageId: selectedPackage.id
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Đăng ký không thành công. Vui lòng thử lại.');
      }

      setIsCheckoutOpen(false);
      onRegisterSuccess(result);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract customizable values or fallback
  const learnerValuesList = (project.learnerValues && project.learnerValues.length > 0)
    ? project.learnerValues
    : (landing.keyTakeaways || []);

  const faqsList: ProjectFAQ[] = (project.faqs && project.faqs.length > 0)
    ? project.faqs
    : (landing.faq || []);

  const sidebarTitle = project.sidebarConfig?.title || 'Chọn gói học bổng & dịch vụ';
  const sidebarSubtitle = project.sidebarConfig?.subtitle || 'Học phí trọn gói bảo hộ tối đa cho con';
  const trustTitle = project.sidebarConfig?.trustTitle || 'An Tâm Tuyệt Đối Với Trẻ';
  const trustDesc = project.sidebarConfig?.trustDescription || 'Mọi khóa dã ngoại sinh tồn của KidSkill đều mua kèm bảo hiểm du lịch cao cấp và có điều phối viên y tế 24/7 đồng hành.';

  return (
    <div id={`landing-page-${project.id}`} className="bg-slate-50 min-h-screen font-sans pb-16">
      {/* Dynamic Header Banner */}
      <div className={`${theme.bg} text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <button
            onClick={onBack}
            className="self-start text-xs font-mono font-bold bg-white/25 text-white px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/30 transition uppercase cursor-pointer"
          >
            ← Quay Lại
          </button>
        </div>

        {/* Hero Copy */}
        <div className="max-w-4xl mx-auto mt-8 text-center md:text-left">
          <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {project.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight mt-4 leading-tight">
            {landing.headline}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-medium mt-4 max-w-3xl">
            {landing.subheadline}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details & Key Takeaways */}
          <div className="lg:col-span-8 space-y-8">
            {/* Visual & Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
              <div className="h-64 sm:h-96 rounded-2xl overflow-hidden relative mb-6">
                <img
                  src={project.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Course quick metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-slate-600 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Thời gian</p>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">{project.eventTime || project.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Lứa tuổi</p>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">{project.ageRange}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Địa điểm</p>
                    <p className="font-semibold text-slate-800 truncate max-w-[120px] text-xs sm:text-sm">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Trạng thái</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-slate-900 font-serif">Chi tiết hành trình</h2>
                {project.journeyDetails ? (
                  <div 
                    className="text-slate-700 text-sm mt-3 leading-relaxed space-y-4 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.journeyDetails }}
                  />
                ) : (
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed whitespace-pre-line font-sans">
                    {landing.description}
                  </p>
                )}
              </div>
            </div>

            {/* Learner Values Received */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${theme.bg}`}></div>
              <h2 className="text-2xl font-bold text-slate-900 font-serif">Giá trị học viên nhận được</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {learnerValuesList.map((item: any, idx: number) => {
                  const text = typeof item === 'string' ? item : (item.text || item.title || '');
                  const title = typeof item === 'object' && item.title ? item.title : null;
                  return (
                    <div key={idx} className="flex items-start space-x-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="bg-emerald-100 text-emerald-700 p-1 rounded-full flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        {title && <p className="font-bold text-xs text-slate-900 mb-0.5">{title}</p>}
                        <p className="text-slate-700 text-xs font-sans leading-relaxed">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 font-serif mb-6">Giải đáp lo lắng của phụ huynh</h2>
              <div className="space-y-4">
                {faqsList.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                      <HelpCircle className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                      <span>{item.question}</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-2 pl-6.5 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing Packages & Registration */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6 relative text-center">
                <h3 className="text-xl font-bold text-slate-900 font-serif text-center">{sidebarTitle}</h3>
                <p className="text-slate-500 text-xs mt-1 text-center font-sans">{sidebarSubtitle}</p>

                {/* Packages Selection */}
                <div className="space-y-3 mt-4 text-left">
                  {project.pricingPackages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                          isSelected
                            ? `${theme.border} bg-slate-50/50`
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-slate-900">{pkg.name}</p>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                        <p className={`text-base font-bold font-mono mt-2 ${theme.text}`}>
                          {pkg.price.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Benefits List of Selected Package */}
                {selectedPackage && selectedPackage.benefits && selectedPackage.benefits.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-4 text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Quyền lợi đặc quyền:</p>
                    <ul className="mt-2 space-y-1.5">
                      {selectedPackage.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Action button -> Đăng Ký Tham Gia */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  id="btn-open-payment"
                  className="w-full py-3.5 rounded-xl font-bold font-sans text-sm text-white mt-6 shadow-md transition cursor-pointer flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600"
                >
                  <Users className="h-4.5 w-4.5" />
                  <span>Đăng Ký Tham Gia</span>
                </button>
              </div>

              {/* Extra Trust Banner */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start space-x-3 text-emerald-800 text-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{trustTitle}</p>
                  <p className="mt-1 leading-relaxed text-[11px] text-emerald-700">
                    {trustDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Popup */}
      {isCheckoutOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-2xl relative my-8">
            <div className={`${theme.bg} text-white p-6`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold font-serif">CONNECT KIDS sẽ liên hệ lại ngay sau 24h</h4>
                  <p className="text-xs text-white/90 mt-1 leading-normal">
                    Sau khi đăng ký hoàn tất, mentor sẽ liên hệ trong 24h để tư vấn chương trình phù hợp.
                  </p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full font-bold text-xs cursor-pointer ml-2 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Order summary info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>DỰ ÁN ĐĂNG KÝ:</span>
                  <span className="font-bold text-slate-800 text-right">{project.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono mt-1.5">
                  <span>GÓI CHỌN:</span>
                  <span className="font-bold text-slate-800">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-800 font-mono mt-3 pt-2 border-t border-slate-200">
                  <span className="font-bold">ĐƠN GIÁ / HỌC VIÊN:</span>
                  <span className={`text-base font-bold ${theme.text}`}>{selectedPackage.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                {participantCount > 1 && (
                  <div className="flex justify-between items-center text-sm text-orange-600 font-mono mt-1 pt-1 border-t border-dashed border-orange-200">
                    <span className="font-bold">TỔNG TẠM TÍNH ({participantCount} BÉ):</span>
                    <span className="text-base font-extrabold">{(selectedPackage.price * participantCount).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
              </div>

              {/* Parent Info */}
              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">1. Thông tin phụ huynh liên hệ</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Họ tên phụ huynh *</label>
                    <input
                      required
                      type="text"
                      name="parentName"
                      placeholder="Nguyễn Văn A"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Số điện thoại *</label>
                    <input
                      required
                      type="tel"
                      name="parentPhone"
                      placeholder="0901234567"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Địa chỉ Email *</label>
                  <input
                    required
                    type="email"
                    name="parentEmail"
                    placeholder="phuhuynh@gmail.com"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Student/Child Info */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">2. Thông tin học sinh tham gia</p>
                  <div className="flex items-center space-x-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700">Số lượng học viên:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={participantCount}
                      onChange={e => handleParticipantCountChange(parseInt(e.target.value) || 1)}
                      className="w-12 text-center bg-white border border-slate-300 rounded font-bold text-xs py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Dynamic fields for each student */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {studentsList.map((st, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                        <span>Học sinh #{idx + 1}</span>
                        {studentsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = studentsList.filter((_, i) => i !== idx);
                              setStudentsList(updated);
                              setParticipantCount(updated.length);
                            }}
                            className="text-red-500 hover:text-red-700 p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Họ tên bé *</label>
                          <input
                            required
                            type="text"
                            placeholder="VD: Nguyễn Minh Quân"
                            value={st.studentName}
                            onChange={e => handleStudentChange(idx, 'studentName', e.target.value)}
                            className="mt-0.5 w-full p-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Tuổi bé</label>
                          <input
                            type="number"
                            placeholder="VD: 9"
                            value={st.studentAge}
                            onChange={e => handleStudentChange(idx, 'studentAge', e.target.value)}
                            className="mt-0.5 w-full p-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {participantCount < 10 && (
                  <button
                    type="button"
                    onClick={() => handleParticipantCountChange(participantCount + 1)}
                    className="w-full py-1.5 border border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm học sinh tham gia</span>
                  </button>
                )}
              </div>

              {/* Secure Consultation badge */}
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-[10px]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>CONNECT KIDS cam kết bảo mật thông tin và phản hồi tư vấn lộ trình học phù hợp nhất cho bé trong 24h.</span>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold font-sans text-sm text-white shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer bg-orange-500 hover:bg-orange-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Check className="h-4.5 w-4.5" />
                <span>{isSubmitting ? 'Đang gửi thông tin...' : 'Hoàn Tất Đăng Ký'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
