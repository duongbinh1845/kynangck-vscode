import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  Award,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Activity,
  Compass,
  PhoneCall,
  Search,
  Star,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import { CMSData } from '../types';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  category: 'Ban Lãnh Đạo & Cố Vấn' | 'Huấn Luyện Viên Sinh Tồn' | 'Y Tế & Tâm Lý' | 'Trại Trưởng Trực Tiếp';
  experience: string;
  avatar: string;
  bio: string;
  quote: string;
  skills: string[];
  badge: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'ThS. Nguyễn Văn Anh',
    title: 'Founder & Cố Vấn Trưởng Phương Pháp Sinh Tồn',
    category: 'Ban Lãnh Đạo & Cố Vấn',
    experience: '15+ Năm Kinh Nghiệm',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Thạc sĩ Tâm lý Giáo dục. Cố vấn xây dựng khung chương trình rèn luyện kỹ năng sinh tồn thực chiến cho hơn 15.000 học sinh toàn quốc.',
    quote: 'Mỗi chuyến dã ngoại là một hành trình giúp trẻ tự khai phá bản lĩnh và trưởng thành.',
    skills: ['Tâm lý lứa tuổi', 'Giáo dục trải nghiệm', 'Lãnh đạo trẻ em', 'Xây dựng chương trình'],
    badge: 'Cố Vấn Trưởng'
  },
  {
    id: '2',
    name: 'HLV. Trần Đức Mạnh',
    title: 'Trưởng Ban Huấn Luyện Dã Ngoại & Sinh Tồn Rừng Sâu',
    category: 'Huấn Luyện Viên Sinh Tồn',
    experience: '12+ Năm Kinh Nghiệm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Cựu sĩ quan cứu hộ dã ngoại. Chuyên gia đào tạo kỹ năng nhóm lửa, dựng lều, định hướng la bàn và ứng phó tình huống hoang dã.',
    quote: 'An toàn của các con là kỷ luật sắt, nụ cười của các con là phần thưởng lớn nhất.',
    skills: ['Sinh tồn rừng sâu', 'Dựng lều dã ngoại', 'Xử lý khẩn cấp SOS', 'Kỹ thuật dây thừng'],
    badge: 'Trưởng Ban Huấn Luyện'
  },
  {
    id: '3',
    name: 'BS. Lê Thị Mai Hương',
    title: 'Trưởng Bác Sĩ Dã Ngoại & An Toàn Y Tế Trẻ Em',
    category: 'Y Tế & Tâm Lý',
    experience: '10+ Năm Y Tế Nhi Khoa',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Bác sĩ chuyên khoa Nhi & Y tế dã ngoại Wilderness First Aid. Trực tiếp phụ trách tủ thuốc khẩn cấp, đánh giá thể trạng và dinh dưỡng trại.',
    quote: 'Chúng tôi mang quy chuẩn y tế chuyên nghiệp nhất theo sát từng bước chân dã ngoại của bé.',
    skills: ['Sơ cứu khẩn cấp', 'Y tế dã ngoại', 'Dinh dưỡng học đường', 'Chăm sóc sức khỏe nhi'],
    badge: 'Trưởng Bác Sĩ Y Tế'
  },
  {
    id: '4',
    name: 'ThS. Lê Thu Thảo',
    title: 'Chuyên Gia Tâm Lý Học Đường & Rèn Luyện Tự Lập',
    category: 'Y Tế & Tâm Lý',
    experience: '8+ Năm Tư Vấn Tâm Lý',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    bio: 'Chuyên gia tâm lý đồng hành cùng trẻ nhút nhát, hỗ trợ bé vượt qua lo âu khi xa cha mẹ và kích hoạt tinh thần chủ động tự lập.',
    quote: 'Lắng nghe chân thành giúp trẻ mở lòng và đón nhận bài học kỹ năng một cách tự nhiên nhất.',
    skills: ['Tư vấn tâm lý', 'Giải tỏa căng thẳng', 'Kết nối phụ huynh', 'Động viên tinh thần'],
    badge: 'Chuyên Gia Tâm Lý'
  },
  {
    id: '5',
    name: 'Trại Trưởng Hoàng Quốc Nam',
    title: 'Trưởng Ban Điều Hành Trại Hè & Dã Ngoại Thám Hiểm',
    category: 'Trại Trưởng Trực Tiếp',
    experience: '9+ Năm Điều Hành Trại',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    bio: 'Trại trưởng chỉ huy hơn 200 hành trình dã ngoại Nam Cát Tiên, Tà Năng. Thiết kế trò chơi sinh tồn và gắn kết tình đồng đội.',
    quote: 'Một trại trưởng giỏi không chỉ truyền kiến thức mà còn thắp sáng ngọn lửa tự tin cho từng học sinh.',
    skills: ['Quản lý trại dã ngoại', 'Điều hành trò chơi', 'Teambuilding nhí', 'Quản trị rủi ro'],
    badge: 'Trại Trưởng Chỉ Huy'
  },
  {
    id: '6',
    name: 'HLV. Phạm Quốc Huy',
    title: 'Huấn Luyện Viên Cứu Hộ Nguồn Nước & Bơi Sinh Tồn',
    category: 'Huấn Luyện Viên Sinh Tồn',
    experience: '7+ Năm Cứu Hộ Sông Nước',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    bio: 'Huấn luyện viên bơi lội & cứu hộ sông nước chuẩn quốc tế. Hướng dẫn học sinh kỹ năng chống đuối nước, chèo SUP và vượt dòng nước xoáy.',
    quote: 'Kỹ năng bơi sinh tồn là món quà vô giá giúp trẻ tự bảo vệ mình trọn đời.',
    skills: ['Cứu hộ bơi lội', 'Chèo SUP dã ngoại', 'An toàn mực nước sâu', 'Thoát hiểm dưới nước'],
    badge: 'HLV Cứu Hộ Bơi Lội'
  },
  {
    id: '7',
    name: 'Cô Vũ Minh Anh',
    title: 'Trưởng Nhóm Điều Trại & Chăm Sóc Sinh Hoạt Trẻ',
    category: 'Trại Trưởng Trực Tiếp',
    experience: '6+ Năm Đồng Hành Cùng Trẻ',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    bio: 'Chu đáo, tận tâm quản lý giấc ngủ, bữa ăn, vệ sinh cá nhân và động viên tinh thần từng học viên 24/24 trong suốt hành trình trại.',
    quote: 'Chăm sóc các con như con ruột của mình là tâm nguyện của đội ngũ điều trại Connect Kids.',
    skills: ['Chăm sóc sinh hoạt', 'Quản lý nếp sống', 'Theo dõi sức khỏe', 'Tương tác phụ huynh'],
    badge: 'Quản Lý Trại Nữ'
  },
  {
    id: '8',
    name: 'HLV. Nguyễn Hoàng Long',
    title: 'Chuyên Gia Kỹ Thuật Dã Ngoại & Định Vị Địa Hình',
    category: 'Huấn Luyện Viên Sinh Tồn',
    experience: '8+ Năm Thám Hiểm',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    bio: 'Chuyên gia hướng dẫn trẻ đọc bản đồ địa hình, la bàn quang học, tìm nguồn nước sạch và phát tín hiệu cứu hộ SOS trong môi trường tự nhiên.',
    quote: 'Tự nhiên là người thầy lớn nhất giúp trẻ phát triển giác quan và bản lĩnh vững vàng.',
    skills: ['Định vị bản đồ', 'Lọc nước dã ngoại', 'Phát tín hiệu SOS', 'Thám hiểm địa hình'],
    badge: 'HLV Định Vị Dã Ngoại'
  }
];

interface TeamPageProps {
  onNavigate?: (tab: string) => void;
  cms?: CMSData | null;
}

export default function TeamPage({ onNavigate, cms }: TeamPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'Tất cả',
    'Ban Lãnh Đạo & Cố Vấn',
    'Huấn Luyện Viên Sinh Tồn',
    'Y Tế & Tâm Lý',
    'Trại Trưởng Trực Tiếp'
  ];

  const filteredMembers = TEAM_MEMBERS.filter(member => {
    const matchesCategory = activeCategory === 'Tất cả' || member.category === activeCategory;
    const matchesQuery =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-12 pb-16 font-sans text-slate-800 animate-fadeIn">
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-br from-[#5C7A3E] via-[#4A6431] to-[#2E401E] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/15 text-amber-200 border border-white/25 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Đội Ngũ Connect Kids</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Những Con Người Tâm Huyết <br className="hidden sm:inline" />
            <span className="text-amber-300">Vững Kỹ Năng & Yêu Trẻ</span>
          </h1>

          <p className="text-slate-100 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Tập hợp các Chuyên gia Tâm lý Giáo dục, Huấn luyện viên Sinh tồn Cấp cao, Bác sĩ Y tế Dã ngoại và Trại trưởng chuyên nghiệp — luôn túc trực 24/7 bảo đảm sự an toàn tuyệt đối và rèn luyện bản lĩnh tự lập cho từng học viên.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">100+</div>
              <div className="text-xs text-slate-200 font-medium">Huấn luyện viên & Trại trưởng</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">1 : 4</div>
              <div className="text-xs text-slate-200 font-medium">Tỷ lệ giám sát (1 HLV kèm 4-5 bé)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">100%</div>
              <div className="text-xs text-slate-200 font-medium">Đạt chứng chỉ Sơ cấp cứu & Y tế</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">15,000+</div>
              <div className="text-xs text-slate-200 font-medium">Học viên đồng hành an toàn</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE STANDARDS & QUALIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest font-mono bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Tiêu Chuẩn Đào Tạo & An Toàn
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            4 Tiêu Chuẩn Vàng Của Đội Ngũ Connect Kids
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Mỗi thành viên trong ban huấn luyện đều được tuyển chọn nghiêm ngặt và kiểm tra năng lực định kỳ nhằm đem đến sự an tâm tuyệt đối cho Phụ huynh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#5C7A3E] flex items-center justify-center font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">100% Có Chứng Chỉ Sơ Cấp Cứu</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Tất cả huấn luyện viên và cán bộ điều trại bắt buộc sở hữu chứng chỉ y tế dã ngoại Wilderness First Aid và cứu hộ an toàn nguồn nước.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Tỷ Lệ Giám Sát Sát Sao 1:4</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Mỗi nhóm nhỏ 4-5 học sinh luôn có 1 Huấn luyện viên trực tiếp đồng hành, quan sát kỹ lưỡng từ giấc ngủ, bữa ăn đến cảm xúc từng em.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Thấu Hiểu Tâm Lý Trẻ Em</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Đội ngũ am hiểu tâm lý lứa tuổi 6–15, biết cách kiên nhẫn lắng nghe, khích lệ trẻ vượt qua nỗi sợ hãi và tự tin tự lập một cách tích cực.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Kinh Nghiệm Thực Chiến</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Trải qua hàng ngàn giờ chỉ huy trại hè dã ngoại thực tế tại các vùng rừng quốc gia, địa hình sinh thái hoang dã và sông hồ tự nhiên.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TEAM MEMBERS DIRECTORY WITH CATEGORY FILTERS & SEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Danh Sách Huấn Luyện Viên & Chuyên Gia</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Gặp gỡ những người thầy, người anh chị đồng hành trực tiếp cùng các bé</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, chuyên môn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5C7A3E]/30 focus:border-[#5C7A3E] transition"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#5C7A3E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#E8EFD9] hover:text-[#5C7A3E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Members Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#5C7A3E]/40 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative h-64 bg-slate-100 overflow-hidden">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#5C7A3E] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                        {member.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {member.experience}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#5C7A3E] transition">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-orange-600 leading-snug">
                        {member.title}
                      </p>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Quote */}
                    <div className="bg-slate-50 border-l-2 border-[#5C7A3E] p-2.5 rounded-r-lg italic text-[11px] text-slate-600">
                      "{member.quote}"
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-600 text-sm font-bold">Không tìm thấy nhân sự phù hợp</p>
              <p className="text-slate-400 text-xs">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. SELECTION & TRAINING PROCESS (QUY TRÌNH TUYỂN CHỌN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-md space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest font-mono bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
              Quy Trình Khắt Khe
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              4 Bước Tuyển Chọn & Đào Tạo Huấn Luyện Viên
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Để đứng vào hàng ngũ ban huấn luyện dã ngoại Connect Kids, mỗi ứng viên đều phải hoàn thành chuỗi sát hạch toàn diện.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3 relative">
              <div className="text-3xl font-black text-amber-300 font-mono">01</div>
              <h3 className="text-base font-extrabold text-white">Sàng Lọc Lý Lịch & Đạo Đức</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thẩm định tư pháp, lịch sử công tác và đánh giá tâm lý chuẩn mực khi làm việc trực tiếp với trẻ em.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3 relative">
              <div className="text-3xl font-black text-amber-300 font-mono">02</div>
              <h3 className="text-base font-extrabold text-white">Sát Hạch Thể Lực & Sinh Tồn</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kiểm tra thể lực dã ngoại, kỹ năng bơi sinh tồn, vượt địa hình hoang dã và ứng phó tình huống nguy hiểm.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3 relative">
              <div className="text-3xl font-black text-amber-300 font-mono">03</div>
              <h3 className="text-base font-extrabold text-white">Huấn Luyện Sơ Cấp Cứu Y Tế</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hoàn thành chứng chỉ Wilderness First Aid, kỹ năng xử lý chấn thương, say nắng, dị ứng và cứu hộ nước.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-3 relative">
              <div className="text-3xl font-black text-amber-300 font-mono">04</div>
              <h3 className="text-base font-extrabold text-white">Diễn Tập Thực Đa & Đánh Giá</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thực tập trực tiếp dưới sự giám sát của Trại trưởng cấp cao. Tái sát hạch năng lực định kỳ 6 tháng/lần.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION & CONSULTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-10 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Sẵn Sàng Cho Con Khởi Hành Hành Trình Dã Ngoại An Toàn?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Đội ngũ chuyên gia Connect Kids luôn sẵn sàng tư vấn lộ trình rèn luyện kỹ năng sống & sinh tồn phù hợp nhất với tính cách và lứa tuổi của con.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate && onNavigate('projects-list')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#5C7A3E] hover:bg-[#4A6431] text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Khám Phá Các Khóa Dã Ngoại</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('page-contact')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-sm rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <PhoneCall className="h-5 w-5 text-orange-500" />
              <span>Liên Hệ Tư Vấn Trực Tiếp</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
