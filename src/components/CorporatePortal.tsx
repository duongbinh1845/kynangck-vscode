import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building, ShieldCheck, CheckCircle, Send, Users, Compass,
  Briefcase, GraduationCap, ArrowRight, Star, Heart
} from 'lucide-react';
import { CMSData } from '../types';

interface CorporatePortalProps {
  onRefreshStats: () => void;
  cms?: CMSData | null;
}

export default function CorporatePortal({ onRefreshStats, cms }: CorporatePortalProps) {
  const [activeTab, setActiveTab] = useState<'organization' | 'business' | 'school'>('organization');
  const [formData, setFormData] = useState({
    corporateName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    eventType: 'Kỹ năng sinh tồn' as any,
    numberOfParticipants: '',
    pricePackage: '', // Notes/custom request description
    amount: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/register-corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Gửi yêu cầu không thành công.');
      }

      setSubmitSuccess(true);
      onRefreshStats(); // Reload admin panel state

      setFormData({
        corporateName: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        eventType: 'Kỹ năng sinh tồn',
        numberOfParticipants: '',
        pricePackage: '',
        amount: '0'
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract from cms or default
  const heroTitle = cms?.corporate?.heroTitle || 'Kiến Tạo Trải Nghiệm Tập Thể Đột Phá';
  const heroSub = cms?.corporate?.heroSub || 'KynangCK mang đến giáo án huấn luyện sinh tồn dã ngoại thực tế chuyên nghiệp cho trường học, doanh nghiệp và tổ chức đoàn thể. Chúng tôi cam kết an toàn tuyệt đối và quy trình quản trị dự án hiện đại.';

  const organization = cms?.corporate?.organization || {
    title: 'Dành Cho Tổ Chức & Hội Đoàn',
    description: 'Thiết kế các chương trình dã ngoại chuyên sâu, xây dựng tinh thần đồng đội cho các hội nhóm thanh thiếu niên, câu lạc bộ sở thích, các tổ chức thiện nguyện xã hội.',
    focusTitle: 'HẠNG MỤC TRỌNG TÂM',
    focusItems: [
      'Kỹ năng lãnh đạo dã ngoại: Tổ chức hoạt động sơ cứu, dựng trại tập thể khẩn cấp và bảo vệ an toàn cho thành viên.',
      'Hành trình giải mật thư: Thử thách trí tuệ đồng đội vượt địa hình phức tạp, định vị vệ tinh và la bàn thủ công.'
    ],
    highlightText: 'Dịch vụ trọn gói bảo hiểm dã ngoại chuẩn quốc tế cho toàn bộ thành viên đoàn thể tham gia.'
  };

  const business = cms?.corporate?.business || {
    title: 'Dành Cho Doanh Nghiệp (Team building)',
    description: 'Xóa nhòa khoảng cách cấp bậc trong doanh nghiệp, tạo cầu nối thấu hiểu bền chặt giữa các phòng ban thông qua kịch bản dã ngoại khắc nghiệt thử thách khả năng sinh tồn.',
    focusTitle: 'CHƯƠNG TRÌNH ĐỘT PHÁ',
    focusItems: [
      'Trại sinh tồn lãnh đạo CEO: Vượt chướng ngại vật thiên nhiên, rèn luyện kỹ năng quản trị khủng hoảng và teamwork thực chiến.',
      'Thử thách Robinson: Tự lập lều bạt dã chiến, lọc nước ngọt tự nhiên từ bùn đất, dập lửa khói báo tín hiệu định vị cứu hộ.'
    ],
    highlightText: 'Cung cấp báo giá, hợp đồng & hóa đơn VAT chuẩn chỉnh lưu vào CRM tiện dụng cho kế toán doanh nghiệp.'
  };

  const school = cms?.corporate?.school || {
    title: 'Dành Cho Trường Học & Học Xá',
    description: 'Hợp tác thiết kế học vụ dã ngoại ngoại khóa tích hợp, chuẩn hóa giáo dục trực quan, giúp học sinh trải nghiệm thực tế sinh động thay vì lý thuyết sách vở.',
    focusTitle: 'DỊCH VỤ CHUYÊN BIỆT',
    focusItems: [
      'Học kỳ quân đội dã ngoại: Kỹ năng tự lập sinh hoạt, gấp chăn màn quân đội, sơ cứu thương tích cơ bản và định hướng rừng rậm.',
      'Trại kỹ năng tự bảo vệ vệ sĩ nhí: Nhận diện nguy hiểm tiềm ẩn, phòng tránh lạc đường, xử lý tình huống hỏa hoạn và đuối nước dã ngoại.'
    ],
    highlightText: 'Huấn luyện viên dã ngoại đạt chứng chỉ sơ cứu quốc tế trực tiếp giám sát dã ngoại tỉ lệ 1 HLV kèm 5 bé học sinh.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Premium Hero Banner - Styled with orange of the system */}
      <div className="bg-gradient-to-r from-[#F08C3A] via-[#f7a45e] to-[#F08C3A] text-white p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-15 transform translate-x-10 -translate-y-10 select-none">
          <Building className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <span className="bg-white/20 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            B2B • HỢP TÁC TRẢI NGHIỆM DÃ NGOẠI
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-none text-white drop-shadow-xs">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-white/95 leading-relaxed drop-shadow-xs">
            {heroSub}
          </p>
        </div>
      </div>

      {/* 3 tabs: Tổ chức - Đoàn thể / Doanh nghiệp / Trường học - Shortened titles */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 pb-0.5">
        <button
          onClick={() => setActiveTab('organization')}
          className={`pb-4 px-5 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeTab === 'organization'
              ? 'border-[#F08C3A] text-[#F08C3A] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          <span>Tổ Chức - Đoàn Thể</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`pb-4 px-5 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeTab === 'business'
              ? 'border-[#F08C3A] text-[#F08C3A] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="h-4.5 w-4.5" />
          <span>Doanh Nghiệp</span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`pb-4 px-5 font-sans font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeTab === 'school'
              ? 'border-[#F08C3A] text-[#F08C3A] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="h-4.5 w-4.5" />
          <span>Trường Học</span>
        </button>
      </div>

      {/* Split layout for dynamic info & the custom event registration form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column info matching active tab */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'organization' && (
              <motion.div
                key="org"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-slate-900">{organization.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {organization.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono text-[#F08C3A] uppercase font-bold tracking-wider">{organization.focusTitle}:</h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    {organization.focusItems.map((item, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F08C3A] mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span>{organization.highlightText}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div
                key="bus"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-slate-900">{business.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {business.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono text-[#F08C3A] uppercase font-bold tracking-wider">{business.focusTitle}:</h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    {business.focusItems.map((item, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F08C3A] mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FAF7F0] text-slate-800 p-4 rounded-2xl border border-slate-200/50 text-[11px] leading-relaxed flex items-center space-x-2.5">
                  <Compass className="h-5 w-5 text-[#F08C3A] flex-shrink-0" />
                  <span>{business.highlightText}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'school' && (
              <motion.div
                key="sch"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-slate-900">{school.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {school.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono text-[#F08C3A] uppercase font-bold tracking-wider">{school.focusTitle}:</h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    {school.focusItems.map((item, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F08C3A] mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-100 text-[11px] leading-relaxed flex items-center space-x-2.5">
                  <Star className="h-5 w-5 text-amber-500 flex-shrink-0 fill-amber-400" />
                  <span>{school.highlightText}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column registration booking form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Đăng ký thiết kế sự kiện dã ngoại riêng</h3>
            <p className="text-slate-500 text-xs mt-1">
              Gửi nhu cầu rèn luyện của quý tổ chức. Đội ngũ tư vấn KynangCK sẽ thiết kế giáo án dã ngoại phù hợp và gửi CRM báo giá ngay lập tức.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="font-extrabold text-slate-950 font-serif">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Hệ thống CRM đã ghi nhận thông tin đăng ký hợp tác. Đội ngũ giáo vụ KynangCK sẽ liên hệ trực tiếp với quý đơn vị trong 4 giờ làm việc tiếp theo.
                </p>
              </div>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="bg-[#F08C3A] hover:bg-[#d97c30] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                Gửi thêm yêu cầu mới
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <p className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs">{errorMsg}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Tên tổ chức / Doanh nghiệp / Trường học</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Trường Quốc tế Á Châu, VNG Corp..."
                    value={formData.corporateName}
                    onChange={e => setFormData({ ...formData, corporateName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Người liên hệ trực tiếp</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Nguyễn Thị Mai"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Số điện thoại di động</label>
                  <input
                    required
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Email công tác</label>
                  <input
                    required
                    type="email"
                    placeholder="VD: hr@vng.com.vn"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Loại hình trải nghiệm mong muốn</label>
                  <select
                    value={formData.eventType}
                    onChange={e => setFormData({ ...formData, eventType: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                  >
                    <option value="Kỹ năng sinh tồn">Dã ngoại Sinh tồn hoang dã chuyên sâu</option>
                    <option value="Kỹ năng cắm trại">Trại rèn luyện Kỹ năng sống & Tự lập</option>
                    <option value="Team building tập thể">Team building Thử thách cực hạn</option>
                    <option value="Hoạt động trải nghiệm ngắn ngày">Trải nghiệm Ngoại khóa học xá ngắn ngày</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Số lượng thành viên ước tính</label>
                  <input
                    required
                    type="number"
                    placeholder="VD: 45"
                    value={formData.numberOfParticipants}
                    onChange={e => setFormData({ ...formData, numberOfParticipants: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Mô tả nhu cầu & mong muốn riêng (Tùy chọn)</label>
                <textarea
                  rows={3}
                  placeholder="VD: Cần tổ chức cho 50 học sinh lớp 6 tại rừng dã ngoại Nam Cát Tiên 2 ngày 1 đêm vào tháng tới..."
                  value={formData.pricePackage}
                  onChange={e => setFormData({ ...formData, pricePackage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs font-sans leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F08C3A] hover:bg-[#d97c30] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Thiết Kế Lộ Trình & Báo Giá'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
