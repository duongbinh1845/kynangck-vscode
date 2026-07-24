import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import InteractiveGame from './components/InteractiveGame';
import ProjectLandingPage from './components/ProjectLandingPage';
import ParentPortal from './components/ParentPortal';
import CorporatePortal from './components/CorporatePortal';
import AdminPortal from './components/AdminPortal';
import TeamPage from './components/TeamPage';
import { LibraryPortal } from './components/LibraryPortal';
import { Project, NewsArticle, CMSData, CMSStaticPage } from './types';
import { Sparkles, Compass, Trophy, Users, BookOpen, Shield, GraduationCap, Info, PhoneCall, ChevronRight, Search, Tag, Settings, Lock, X } from 'lucide-react';
import { adminLogin, verifyAdminToken, clearAdminToken, isAdminLoggedIn } from './lib/adminAuth';

export default function App() {
  const [role, setRole] = useState<'parent' | 'child' | 'corporate' | 'admin'>('parent');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [cms, setCms] = useState<CMSData | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Xác thực token còn hiệu lực lúc khởi động; nếu hết hạn thì bỏ trạng thái admin.
  useEffect(() => {
    verifyAdminToken().then(valid => setIsAdmin(valid));
    const onExpired = () => {
      setIsAdmin(false);
      if (activeTab === 'admin-portal') setActiveTab('home');
    };
    window.addEventListener('admin-session-expired', onExpired);
    return () => window.removeEventListener('admin-session-expired', onExpired);
  }, []);

  // Mở cổng quản trị: nếu đã đăng nhập thì vào thẳng, chưa thì hiện modal nhập mật khẩu.
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setRole('admin');
      setActiveTab('admin-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginError('');
      setAdminPassword('');
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError('');
    try {
      const ok = await adminLogin(adminPassword);
      if (ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
        setRole('admin');
        setActiveTab('admin-portal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setLoginError('Mật khẩu quản trị không đúng.');
      }
    } catch {
      setLoginError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Landing page category filters & Search states
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('Khóa Học');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Tất cả');
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');

  const getParentCategoryForProject = (proj: Project | string) => {
    let projCategory = typeof proj === 'string' ? proj : proj.category || '';
    if (typeof proj === 'object' && proj.mainCategory) {
      return proj.mainCategory;
    }
    const tree = cms?.projectCategoryTree || {
      "Khóa Học": ["Kỹ năng sống", "Kỹ năng tự lập", "Tư duy sinh tồn", "Phản ứng khẩn cấp", "Kỹ năng sinh tồn", "An toàn dã ngoại"],
      "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên", "Thám hiểm tự nhiên", "Thám hiểm rừng sâu", "Hành trình di sản"],
      "Sân Chơi": ["Trò chơi vận động", "Thử thách trí tuệ", "Cuộc thi sinh tồn", "Sân chơi gia đình", "Hội trại dã ngoại", "Sân chơi sáng tạo", "Ngày hội gia đình"],
      "Cộng Đồng": ["Dự án xanh", "Tình nguyện nhí", "Gắn kết phụ huynh", "Hoạt động xã hội"]
    };
    for (const parent of Object.keys(tree)) {
      if (tree[parent].some(sub => projCategory.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(projCategory.toLowerCase()))) {
        return parent;
      }
    }
    if (projCategory.toLowerCase().includes('khóa') || projCategory.toLowerCase().includes('học') || projCategory.toLowerCase().includes('kỹ năng')) return 'Khóa Học';
    if (projCategory.toLowerCase().includes('trải nghiệm') || projCategory.toLowerCase().includes('dã ngoại') || projCategory.toLowerCase().includes('thám hiểm')) return 'Trải Nghiệm';
    if (projCategory.toLowerCase().includes('sân chơi') || projCategory.toLowerCase().includes('trại') || projCategory.toLowerCase().includes('hội')) return 'Sân Chơi';
    if (projCategory.toLowerCase().includes('cộng đồng') || projCategory.toLowerCase().includes('tình nguyện') || projCategory.toLowerCase().includes('xanh')) return 'Cộng Đồng';
    return 'Khóa Học';
  };

  const getSubCategoriesForParent = (parentCat: string) => {
    const tree: Record<string, string[]> = (cms?.projectCategoryTree as Record<string, string[]>) || {
      "Khóa Học": ["Kỹ năng sinh tồn", "Kỹ năng tự lập", "An toàn dã ngoại", "Kỹ năng sống", "Tư duy sinh tồn", "Phản ứng khẩn cấp"],
      "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên", "Thám hiểm rừng sâu", "Hành trình di sản", "Thám hiểm tự nhiên"],
      "Sân Chơi": ["Cuộc thi sinh tồn", "Sân chơi sáng tạo", "Ngày hội gia đình", "Trò chơi vận động", "Thử thách trí tuệ", "Sân chơi gia đình", "Hội trại dã ngoại"],
      "Cộng Đồng": ["Dự án xanh", "Tình nguyện nhí", "Gắn kết phụ huynh", "Hoạt động xã hội"]
    };
    if (parentCat === 'Tất cả') {
      const allSubs = new Set<string>();
      Object.values(tree).forEach(subs => subs.forEach(s => allSubs.add(s)));
      projects.forEach(p => {
        const sub = p.subCategory || (p.category.includes('»') ? p.category.split('»')[1].trim() : p.category);
        if (sub) allSubs.add(sub);
      });
      return Array.from(allSubs);
    }
    const catList = new Set<string>(tree[parentCat] || []);
    projects.forEach(p => {
      if (getParentCategoryForProject(p) === parentCat) {
        const sub = p.subCategory || (p.category.includes('»') ? p.category.split('»')[1].trim() : p.category);
        if (sub) catList.add(sub);
      }
    });
    return Array.from(catList);
  };

  const getProjectCountForParent = (parentCat: string) => {
    if (parentCat === 'Tất cả') return projects.length;
    return projects.filter(p => getParentCategoryForProject(p) === parentCat).length;
  };

  // Load database models and CMS configs from backend APIs
  const loadDatabase = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Projects
      const projRes = await fetch('/api/projects');
      const projData = await projRes.json();
      setProjects(projData || []);

      // Refresh selectedProject if active
      setSelectedProject(prev => {
        if (!prev) return null;
        const updated = (projData || []).find((p: Project) => p.id === prev.id);
        return updated || prev;
      });

      // 2. Fetch News articles
      const newsRes = await fetch('/api/news');
      const newsData = await newsRes.json();
      setNews(newsData || []);

      // 3. Fetch CMS settings
      const cmsRes = await fetch('/api/cms');
      const cmsData = await cmsRes.json();
      setCms(cmsData);
    } catch (e) {
      console.error('Lỗi đồng bộ dữ liệu KynangCK:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  useEffect(() => {
    if (cms?.siteTitle) {
      document.title = cms.siteTitle;
    }
    const desc = cms?.siteDescription || cms?.footer?.shortDescription;
    if (desc) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', desc);
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        metaDesc.setAttribute('content', desc);
        document.head.appendChild(metaDesc);
      }
    }
    const fav = cms?.faviconUrl;
    if (fav) {
      let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (iconLink) {
        iconLink.href = fav;
      } else {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        iconLink.href = fav;
        document.head.appendChild(iconLink);
      }
    }
  }, [cms]);

  const handleRegisterSuccess = (result: any) => {
    alert(`Chúc mừng! Bạn đã đăng ký và thanh toán trực tuyến thành công cho bé ${result.parent.children[0].studentName}.\nSố điện thoại đăng ký tra cứu học bạ: ${result.parent.parentPhone}`);
    setSelectedProject(null);
    setActiveTab('parent-portal'); // Redirect to parents portal
    loadDatabase(); // Refresh stats and list
  };

  const handleProjectAdded = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  // Helper render CMS Static Pages content (e.g. Giới thiệu / Liên hệ / Điều khoản / Bảo mật)
  const renderStaticPage = (slug: string) => {
    let page = cms?.pages?.find(p => p.slug === slug);
    if (!page) {
      if (slug === 'terms') {
        page = {
          id: 'page-terms',
          title: 'Điều Khoản Sử Dụng Dịch Vụ & Tham Gia Dã Ngoại Connect Kids',
          slug: 'terms',
          createdAt: new Date().toISOString(),
          content: `CHÍNH SÁCH VÀ ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ DÃ NGOẠI & HỌC BẠ CRM CONNECT KIDS

Chào mừng Quý phụ huynh và các em học viên đến với Hệ thống Giáo dục & Dã ngoại Kỹ năng Connect Kids (kynangck.edu.vn). Khi truy cập website, đăng ký các dự án dã ngoại hoặc sử dụng Cổng Phụ huynh CRM, Quý khách đồng ý tuân thủ các điều khoản dịch vụ dưới đây:

1. QUY ĐỊNH ĐĂNG KÝ VÀ THAM GIA KHÓA HỌC/DÃ NGOẠI
- Học viên tham gia các chương trình dã ngoại sinh tồn, cắm trại thực tế cần đáp ứng yêu cầu độ tuổi từ 6 đến 15 tuổi (hoặc theo quy định cụ thể của từng dự án).
- Phụ huynh có trách nhiệm cung cấp chính xác thông tin tình trạng sức khỏe, tiền sử dị ứng, hoặc nhu cầu chăm sóc đặc biệt của con khi hoàn tất form đăng ký trực tuyến.

2. QUY ĐỊNH THANH TOÁN VÀ HOÀN HỦY VÉ
- Tất cả các khoản phí dã ngoại được thanh toán qua kênh ngân hàng điện tử chính thức của Connect Kids.
- Trường hợp phụ huynh cần hủy đăng ký trước 7 ngày khởi hành: Được hoàn 100% học phí hoặc bảo lưu sang dự án tiếp theo.
- Hủy trong vòng 3 đến 6 ngày trước khởi hành: Được hỗ trợ chuyển suất dã ngoại cho bé khác hoặc bảo lưu 70% phí.
- Trường hợp hoãn/hủy do thời tiết thiên tai nguy hiểm: Ban tổ chức sẽ chủ động thông báo và hoàn trả 100% phí hoặc xếp lịch trải nghiệm bù an toàn nhất.

3. AN TOÀN VÀ BẢO HIỂM TRẢI NGHIỆM
- 100% học viên tham gia dã ngoại được đóng bảo hiểm du lịch trải nghiệm cao cấp.
- Đội ngũ huấn luyện viên (tỷ lệ 1 KTV kèm 4-5 học sinh) cùng y tế túc trực 24/7 trong suốt chuyến hành trình.
- Học viên phải tuân thủ nghiêm ngặt các quy định an toàn dã ngoại, không tự ý rời khỏi khu vực tập trung khi chưa có sự đồng ý của Trại trưởng.

4. BẢO VỆ DỮ LIỆU CÁ NHÂN VÀ HỌC BẠ ĐIỆN TỬ CRM
- Thông tin học bạ kỹ năng, hình ảnh trải nghiệm của học viên chỉ phục vụ cho việc theo dõi tiến trình phát triển và gửi báo cáo cho phụ huynh trên Cổng CRM.
- Ban tổ chức cam kết không chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.

5. ĐIỀU CHỈNH VÀ CẬP NHẬT
Connect Kids có quyền cập nhật các điều khoản này để phù hợp với quy định pháp luật và nâng cao chất lượng dịch vụ. Mọi thay đổi sẽ được công bố công khai trên website.`
        };
      } else if (slug === 'privacy') {
        page = {
          id: 'page-privacy',
          title: 'Chính Sách Bảo Mật Thông Tin & Dữ Liệu Học Viên Connect Kids',
          slug: 'privacy',
          createdAt: new Date().toISOString(),
          content: `CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ DỮ LIỆU PHỤ HUYNH & HỌC VIÊN CONNECT KIDS

Connect Kids (kynangck.edu.vn) cam kết bảo vệ tuyệt đối thông tin riêng tư của Quý phụ huynh và các em học sinh khi tương tác trên nền tảng trực tuyến cũng như trong suốt quá trình tham gia các khóa học dã ngoại.

1. THÔNG TIN THU THẬP
Chúng tôi thu thập các thông tin cần thiết nhằm phục vụ cho việc tổ chức dã ngoại an toàn và theo dõi học bạ kỹ năng:
- Thông tin Phụ huynh: Họ tên, Số điện thoại (dùng tra cứu sổ học bạ CRM), Email, Địa chỉ liên hệ.
- Thông tin Học viên: Họ tên bé, Tuổi, Lớp học, Tiền sử sức khỏe/dị ứng (nếu có), Tiến trình rèn luyện kỹ năng.

2. MỤC ĐÍCH SỬ DỤNG THÔNG TIN
Thông tin thu thập được sử dụng duy nhất cho các mục đích:
- Xác nhận đăng ký và gửi thông báo lịch trình dã ngoại, cẩm nang chuẩn bị.
- Cập nhật nhật ký rèn luyện kỹ năng thực tế lên Cổng tra cứu Phụ huynh CRM.
- Mua bảo hiểm du lịch dã ngoại khẩn cấp cho bé.
- Gửi thông báo chăm sóc khách hàng và các chương trình ưu đãi giáo dục mới.

3. CAM KẾT BẢO MẬT DỮ LIỆU
- Dữ liệu được lưu trữ mã hóa an toàn trên hệ thống máy chủ đám mây tiên tiến.
- Tuyệt đối KHÔNG bán, chia sẻ hoặc trao đổi thông tin phụ huynh cho bất kỳ đơn vị quảng cáo thứ ba nào.
- Chỉ đội ngũ giáo viên, huấn luyện viên trực tiếp quản lý trại mới có quyền truy cập thông tin học viên để hỗ trợ chăm sóc bé.

4. HÌNH ẢNH VÀ TRUYỀN THÔNG DÃ NGOẠI
- Hình ảnh và video ghi lại quá trình trải nghiệm dã ngoại của các bé sẽ được lưu trữ trong thư viện khoảnh khắc cho phụ huynh xem và tải về.
- Nếu Quý phụ huynh không muốn hiển thị hình ảnh của con trên kênh truyền thông chung, vui lòng gửi yêu cầu đến email crm@kynangck.edu.vn hoặc hotline 1900 8123.

5. QUYỀN CỦA PHỤ HUYNH ĐỐI VỚI DỮ LIỆU
Phụ huynh có quyền tra cứu, chỉnh sửa thông tin cá nhân hoặc yêu cầu xóa dữ liệu học bạ sau khi khóa học kết thúc bằng cách liên hệ với bộ phận CSKH của Connect Kids.`
        };
      }
    }

    if (!page) {
      return (
        <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
          <Info className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Trang thông tin chưa được khởi tạo</h2>
          <p className="text-slate-500 text-sm">Quản trị viên có thể thêm trang này thông qua trình quản lý nội dung WordPress.</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 font-sans">
        <div className="border-b pb-6 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
            {page.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">Cập nhật ngày: {new Date(page.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>

        {page.content?.includes('<') ? (
          <div
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-sm"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-sm">
            {page.content}
          </div>
        )}
      </div>
    );
  };

  // Get dynamic assets or fallback values from CMS
  const headline = cms?.homepage?.headline || 'Kiến Tạo Thế Hệ Trẻ Tự Lập, Bản Lĩnh Và Vững Vàng Kỹ Năng';
  const subheadline = cms?.homepage?.subheadline || 'Chương trình đào tạo kỹ năng sinh tồn, dã ngoại thực tế phối hợp cùng các hoạt động tương tác, kết nối doanh nghiệp và hỗ trợ học bạ phát triển CRM tối ưu cho gia đình.';
  const bannerUrl = cms?.homepage?.bannerUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80';
  const copyright = cms?.footer?.copyright || '© 2026 KynangCK Education Platform. All rights reserved.';
  const hotline = cms?.footer?.hotline || '1900 8123 (Phục vụ 24/7)';
  const officeAddress = cms?.footer?.officeAddress || 'Trụ sở đại diện: Học viện Kỹ Năng KynangCK, TP. Hồ Chí Minh';
  const campAddress = cms?.footer?.campAddress || 'Địa điểm dã ngoại chính: Rừng Nam Cát Tiên, Đồng Nai';

  const theme = cms?.theme || {
    primaryColor: '5C7A3E',
    accentColor: 'F08C3A',
    webBgColor: 'FAF7F0',
    headerBgColor: 'FAF7F0',
    footerBgColor: '5C7A3E',
    linkColor: '5C7A3E'
  };

  const dynamicStyles = `
    :root {
      --primary-color: #${theme.primaryColor};
      --accent-color: #${theme.accentColor};
      --web-bg-color: #${theme.webBgColor};
      --header-bg-color: #${theme.headerBgColor};
      --footer-bg-color: #${theme.footerBgColor};
      --link-color: #${theme.linkColor};
    }
    body, .web-bg {
      background-color: #${theme.webBgColor} !important;
    }
    .text-primary-theme {
      color: #${theme.primaryColor} !important;
    }
    .bg-primary-theme {
      background-color: #${theme.primaryColor} !important;
    }
    .hover-bg-primary-theme:hover {
      filter: brightness(0.9) !important;
    }
    .bg-accent-theme {
      background-color: #${theme.accentColor} !important;
    }
    .hover-bg-accent-theme:hover {
      filter: brightness(0.9) !important;
    }
    .border-primary-theme {
      border-color: #${theme.primaryColor} !important;
    }
    .bg-header-theme {
      background-color: #${theme.headerBgColor} !important;
    }
    .bg-footer-theme {
      background-color: #${theme.footerBgColor} !important;
    }
    .text-link-theme {
      color: #${theme.linkColor} !important;
    }
    .hover-text-link-theme:hover {
      filter: brightness(0.9) !important;
    }
    /* Buttons */
    .btn-theme-primary {
      background-color: #${theme.primaryColor} !important;
      color: #ffffff !important;
      transition: all 0.2s ease;
    }
    .btn-theme-primary:hover {
      filter: brightness(0.9) !important;
    }
    .btn-theme-accent {
      background-color: #${theme.accentColor} !important;
      color: #ffffff !important;
      transition: all 0.2s ease;
    }
    .btn-theme-accent:hover {
      filter: brightness(0.9) !important;
    }
    /* Custom CSS variables for header menu active & hover state */
    .header-nav-btn {
      color: #000000 !important;
      font-weight: 700 !important;
      background: transparent;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }
    .header-nav-btn:hover {
      background-color: #E8EFD9 !important;
      color: #${theme.primaryColor} !important;
    }
    .header-nav-btn.active {
      border-color: #${theme.primaryColor} !important;
      color: #ffffff !important;
      background-color: #${theme.primaryColor} !important;
    }
  `;

  return (
    <div className="web-bg min-h-screen flex flex-col font-sans selection:bg-[#F08C3A] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      {/* Header with dynamic CMS menu configs */}
      <Navigation
        currentRole={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProject(null);
        }}
        cms={cms}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-mono">Đang tải đồng bộ hệ thống KynangCK...</p>
          </div>
        ) : (
          <>
            {/* If a project is selected, render its custom AI optimized Landing Page */}
            {selectedProject ? (
              <ProjectLandingPage
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onRegisterSuccess={handleRegisterSuccess}
              />
            ) : (
              <>
                {/* 1. PUBLIC LANDING LIST TAB */}
                {activeTab === 'home' && (
                  <div className="space-y-12 pb-16">
                    {/* Hero Banner Area */}
                    <div
                      className="relative text-white overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
                      style={{ backgroundColor: `#${theme.accentColor}` }}
                    >
                      {/* Ambient background image with dark overlay */}
                      <div className="absolute inset-0">
                        <img
                          src={bannerUrl}
                          alt="Dã ngoại KynangCK"
                          className="w-full h-full object-cover opacity-35"
                          referrerPolicy="no-referrer"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t"
                          style={{
                            backgroundImage: `linear-gradient(to top, #${theme.webBgColor} 0%, #${theme.accentColor}cc 65%, #${theme.accentColor}a0 100%)`
                          }}
                        />
                      </div>

                      <div className="relative max-w-5xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center space-x-1.5 bg-white/15 text-white border border-white/25 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                          <GraduationCap className="h-4 w-4 text-white" />
                          <span>Dã Ngoại Thực Tế & Sinh Tồn Trẻ Em</span>
                        </div>
                        <h2 className="text-3xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                          {headline}
                        </h2>
                        <div className="max-w-3xl mx-auto">
                          <p 
                            className="inline-block text-sm sm:text-base leading-relaxed px-5 py-3 rounded-2xl font-bold bg-white/90 border border-emerald-800/10 shadow-sm"
                            style={{ color: '#5C7A3E' }}
                          >
                            {subheadline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Projects Grid List */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 font-sans">Các dự án dã ngoại đang tuyển sinh</h3>
                          <p className="text-slate-400 text-xs">Phụ huynh dễ dàng lựa chọn hành trình trải nghiệm phù hợp nhất với lứa tuổi của con</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {projects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => setSelectedProject(proj)}
                            className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-orange-500/35 transition duration-300 cursor-pointer"
                          >
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                              <img
                                src={proj.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80'}
                                alt={proj.title}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-3 left-3 flex space-x-1">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-white shadow ${
                                  proj.status === 'đang thực hiện'
                                    ? 'bg-orange-500'
                                    : proj.status === 'đã hoàn thành'
                                    ? 'bg-slate-500'
                                    : 'bg-amber-500'
                                }`}>
                                  {proj.status}
                                </span>
                              </div>
                            </div>

                            <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 font-mono">
                                  {proj.category}
                                </span>
                                <h4 className="text-base font-extrabold text-slate-900 font-sans leading-snug">
                                  {proj.title}
                                </h4>
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                                  {proj.description}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-slate-50 space-y-3">
                                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                  <span>Độ tuổi: {proj.ageRange}</span>
                                  <span>Thời lượng: {proj.duration}</span>
                                </div>

                                <button
                                  onClick={() => setSelectedProject(proj)}
                                  id={`btn-view-project-${proj.id}`}
                                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 bg-white font-extrabold text-xs text-slate-800 transition cursor-pointer text-center block"
                                >
                                  {proj.status === 'đã hoàn thành' ? 'Xem dự án đã hoàn thành' : 'Xem Đăng Ký & Trải Nghiệm'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.5 "Dự Án" LANDING PAGE TAB */}
                {activeTab === 'projects-list' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
                    
                    {/* Header Banner */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-[#5C7A3E] border border-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <GraduationCap className="h-4 w-4 text-[#5C7A3E]" />
                        <span>Chương Trình Đào Tạo KynangCK</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Hành Trình Trải Nghiệm & Phát Triển Toàn Diện
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Khám phá các khóa dã ngoại, lớp học trải nghiệm thực tế và các sân chơi rèn luyện kỹ năng sinh tồn bổ ích giúp con vững tin bước vào tương lai.
                      </p>
                    </div>

                    {/* REDESIGNED 3-TIER CATEGORY SYSTEM (Matching FE Thư viện style) */}
                    <div className="space-y-6 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                      
                      {/* Search Bar & Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                            <GraduationCap className="h-5 w-5 text-[#5C7A3E]" />
                            <span>Danh Mục Chương Trình Dã Ngoại</span>
                          </h3>
                          <p className="text-slate-400 text-xs mt-0.5">Chọn danh mục cấp 1, danh mục con hoặc tìm kiếm dự án phù hợp với độ tuổi của con.</p>
                        </div>

                        {/* Search Input bar */}
                        <div className="relative w-full md:w-80">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm dã ngoại, địa điểm, độ tuổi..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-[#5C7A3E]/50 focus:bg-white text-slate-800 transition shadow-xs"
                            value={projectSearchQuery}
                            onChange={(e) => setProjectSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* TẦNG 1: 4 TAB LỚN (Khóa Học / Trải Nghiệm / Sân Chơi / Cộng Đồng) */}
                      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-2 max-w-4xl mx-auto shadow-inner">
                        {['Khóa Học', 'Trải Nghiệm', 'Sân Chơi', 'Cộng Đồng'].map((cat) => {
                          const isSelected = selectedParentCategory === cat;
                          const count = getProjectCountForParent(cat);
                          const renderCatIcon = (c: string) => {
                            switch (c) {
                              case 'Khóa Học': return <GraduationCap className="h-4 w-4" />;
                              case 'Trải Nghiệm': return <Compass className="h-4 w-4" />;
                              case 'Sân Chơi': return <Trophy className="h-4 w-4" />;
                              case 'Cộng Đồng': return <Users className="h-4 w-4" />;
                              default: return <GraduationCap className="h-4 w-4" />;
                            }
                          };

                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedParentCategory(cat);
                                setSelectedSubCategory('Tất cả');
                              }}
                              className={`flex-1 min-w-[130px] py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                                isSelected
                                  ? 'bg-[#F08C3A] text-white shadow-md shadow-[#F08C3A]/20'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F3ECDC]'
                              }`}
                            >
                              {renderCatIcon(cat)}
                              <span>{cat}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* TẦNG 2: SUB-CATEGORY PILL FILTERS (DẠNG VIÊN THUỐC) */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedSubCategory('Tất cả')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            selectedSubCategory === 'Tất cả'
                              ? 'bg-[#5C7A3E] text-white shadow-sm ring-2 ring-[#5C7A3E]/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-[#E8EFD9] hover:text-slate-900'
                          }`}
                        >
                          {selectedParentCategory === 'Tất cả' ? 'Tất cả dự án' : 'Tất cả'}
                        </button>

                        {getSubCategoriesForParent(selectedParentCategory).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                              selectedSubCategory === sub
                                ? 'bg-[#5C7A3E] text-white shadow-sm ring-2 ring-[#5C7A3E]/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-[#E8EFD9] hover:text-slate-900'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}

                        {selectedParentCategory !== 'Tất cả' && (
                          <button
                            onClick={() => {
                              setSelectedParentCategory('Tất cả');
                              setSelectedSubCategory('Tất cả');
                            }}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 ml-2 underline cursor-pointer"
                          >
                            Xem tất cả dự án
                          </button>
                        )}
                      </div>
                    </div>

                    {/* TẦNG 3: FILTERED PROJECTS GRID */}
                    {(() => {
                      const filtered = projects.filter((proj) => {
                        // 1. Parent category matching
                        if (selectedParentCategory !== 'Tất cả') {
                          const projParent = getParentCategoryForProject(proj);
                          if (projParent !== selectedParentCategory) return false;
                        }
                        // 2. Subcategory matching
                        if (selectedSubCategory !== 'Tất cả') {
                          const projCat = proj.category || '';
                          const projSub = proj.subCategory || (projCat.includes('»') ? projCat.split('»')[1].trim() : projCat);
                          if (
                            projCat !== selectedSubCategory &&
                            projSub !== selectedSubCategory &&
                            !projCat.toLowerCase().includes(selectedSubCategory.toLowerCase())
                          ) {
                            return false;
                          }
                        }
                        // 3. Search query matching
                        if (projectSearchQuery.trim()) {
                          const query = projectSearchQuery.toLowerCase();
                          return (
                            proj.title.toLowerCase().includes(query) ||
                            proj.description.toLowerCase().includes(query) ||
                            proj.location.toLowerCase().includes(query) ||
                            proj.category.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm max-w-xl mx-auto space-y-3">
                            <Info className="h-10 w-10 text-slate-300 mx-auto" />
                            <h4 className="font-bold text-slate-800 text-sm">Chưa có chương trình nào thuộc danh mục này</h4>
                            <p className="text-xs text-slate-500">Quý phụ huynh vui lòng chọn danh mục khác hoặc thay đổi từ khóa tìm kiếm.</p>
                            <button
                              onClick={() => {
                                setSelectedParentCategory('Tất cả');
                                setSelectedSubCategory('Tất cả');
                                setProjectSearchQuery('');
                              }}
                              className="px-4 py-2 bg-[#5C7A3E] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-800 transition cursor-pointer"
                            >
                              Hiển thị tất cả dự án
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {filtered.map((proj) => (
                            <div
                              key={proj.id}
                              onClick={() => setSelectedProject(proj)}
                              className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-orange-500/35 transition duration-300 group cursor-pointer"
                            >
                              <div className="relative h-52 bg-slate-100 overflow-hidden">
                                <img
                                  src={proj.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80'}
                                  alt={proj.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 flex space-x-1">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-white shadow ${
                                    proj.status === 'đang thực hiện'
                                      ? 'bg-orange-500'
                                      : proj.status === 'đã hoàn thành'
                                      ? 'bg-slate-500'
                                      : 'bg-amber-500'
                                  }`}>
                                    {proj.status}
                                  </span>
                                </div>
                              </div>

                              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 font-mono">
                                      {proj.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                                      {getParentCategoryForProject(proj)}
                                    </span>
                                  </div>
                                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#5C7A3E] transition duration-200 leading-snug">
                                    {proj.title}
                                  </h4>
                                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                                    {proj.description}
                                  </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                    <span>Độ tuổi: {proj.ageRange}</span>
                                    <span>Thời lượng: {proj.duration}</span>
                                  </div>

                                  <button
                                    onClick={() => setSelectedProject(proj)}
                                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:text-white hover:bg-orange-500 bg-white font-extrabold text-xs text-slate-800 transition cursor-pointer text-center block shadow-sm"
                                  >
                                    {proj.status === 'đã hoàn thành' ? 'Xem dự án đã hoàn thành' : 'Xem Đăng Ký & Trải Nghiệm'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. INTERACTIVE GAME TAB */}
                {activeTab === 'game' && <InteractiveGame cms={cms} />}

                {/* 3. PARENT PORTAL TAB */}
                {activeTab === 'parent-portal' && (
                  <ParentPortal
                    projects={projects}
                    onRefreshStats={loadDatabase}
                  />
                )}

                {/* 3.5. CORPORATE COLLABORATION TAB */}
                {activeTab === 'corporate-portal' && (
                  <CorporatePortal
                    onRefreshStats={loadDatabase}
                    cms={cms}
                  />
                )}

                {/* 4. MODERN PARENTING HUB TAB (THƯ VIỆN) */}
                {activeTab === 'hub' && (
                  <LibraryPortal
                    newsArticles={news}
                    cms={cms}
                    onNavigate={(tab) => setActiveTab(tab)}
                  />
                )}

                {/* 5. STATIC PAGES & TEAM PAGE RENDER TAB */}
                {(activeTab === 'page-team' || activeTab === 'team') && (
                  <TeamPage
                    onNavigate={(tab) => setActiveTab(tab)}
                    cms={cms}
                  />
                )}
                {activeTab.startsWith('page-') && activeTab !== 'page-team' && renderStaticPage(activeTab.replace('page-', ''))}

                {/* 6. CMS & CRM BACKEND (AUTHENTICATED ROLE) */}
                {activeTab === 'admin-portal' && (
                  <AdminPortal
                    projects={projects}
                    onProjectAdded={handleProjectAdded}
                    onRefreshStats={loadDatabase}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modern Footer with dynamic CMS properties */}
      <footer className="bg-footer-theme text-white py-12 font-sans border-t border-[#FAF7F0]/10 shadow-[inner_0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={cms?.header?.logoUrl || 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp'}
                alt="Connect Kids Logo"
                className="w-[100px] h-[100px] object-contain shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp';
                }}
              />
              <span className="text-xl font-black text-[#FAF7F0] tracking-tight">
                {cms?.header?.brandName || 'Connect Kids'}
              </span>
            </div>
            <p className="text-sm text-[#FAF7F0]/90 leading-relaxed">
              {cms?.siteDescription || cms?.footer?.shortDescription || 'Kiến tạo các hành trình dã ngoại sinh tồn thực tế kết hợp sổ học bạ kỹ năng điện tử CRM, đồng hành cùng gia đình giúp con vững tin bản lĩnh tự lập tương lai.'}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-amber-200 font-sans uppercase tracking-wider text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>Thông tin liên hệ</h4>
            <p className="text-[#FAF7F0]/90 text-sm">{campAddress}</p>
            <p className="text-[#FAF7F0]/90 text-sm">{officeAddress}</p>
            <p className="text-[#FAF7F0]/90 text-sm">Hotline hỗ trợ: <span className="text-[#FAF7F0] font-bold underline">{hotline}</span></p>

            {/* 4 Social Media 45x45px Image Icons: Zalo, Facebook, Youtube, Tiktok */}
            <div className="pt-3 flex items-center gap-3">
              {/* Zalo */}
              <a
                href={cms?.footer?.zaloUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0"
                title="Kênh Zalo Connect Kids"
              >
                <img
                  src="https://i.postimg.cc/rmtD6fQx/Logo-Zalo.webp"
                  alt="Zalo Icon"
                  className="w-[45px] h-[45px] object-contain rounded-xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </a>

              {/* Facebook */}
              <a
                href={cms?.footer?.facebookUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0"
                title="Trang Facebook Connect Kids"
              >
                <img
                  src="https://i.postimg.cc/tJNCywPR/Logo-Facebook.webp"
                  alt="Facebook Icon"
                  className="w-[45px] h-[45px] object-contain rounded-xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </a>

              {/* Youtube */}
              <a
                href={cms?.footer?.youtubeUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0"
                title="Kênh Youtube Connect Kids"
              >
                <img
                  src="https://i.postimg.cc/FKkr17c8/Logo-Youtube.webp"
                  alt="Youtube Icon"
                  className="w-[45px] h-[45px] object-contain rounded-xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </a>

              {/* TikTok */}
              <a
                href={cms?.footer?.tiktokUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0"
                title="Kênh TikTok Connect Kids"
              >
                <img
                  src="https://i.postimg.cc/jdqRP8P3/Logo-Tiktok.webp"
                  alt="TikTok Icon"
                  className="w-[45px] h-[45px] object-contain rounded-xl shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-bold text-amber-200 font-sans uppercase tracking-wider text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>Bảo mật dã ngoại & CRM</h4>
            <p className="text-[#FAF7F0]/90 font-medium text-sm">Cam kết bảo mật tuyệt đối tiến trình, học bạ phát triển của học viên dã ngoại.</p>
            <p className="text-[#FAF7F0]/90 font-medium text-sm">Hệ thống phân quyền chuẩn hóa giúp gia đình theo dõi con 24/7 an toàn tối đa.</p>
          </div>
        </div>

        {/* Dynamic Copyright with Terms & Privacy Page Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#FAF7F0]/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-[#FAF7F0]/80 font-sans gap-3">
          <p className="text-sm text-[#FAF7F0]/90">{copyright}</p>

          <div className="flex flex-wrap items-center space-x-3 text-sm font-medium">
            <button
              onClick={() => {
                setActiveTab('page-terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-200 underline cursor-pointer transition text-sm text-[#FAF7F0]"
            >
              Điều khoản sử dụng
            </button>
            <span className="text-white/40">•</span>
            <button
              onClick={() => {
                setActiveTab('page-privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-200 underline cursor-pointer transition text-sm text-[#FAF7F0]"
            >
              Chính sách bảo mật
            </button>

            {/* Secret Administration Portal Entry — icon bánh răng nhỏ, xám nhạt */}
            <button
              onClick={handleOpenAdmin}
              className="text-[#FAF7F0]/30 hover:text-amber-200 transition ml-2 cursor-pointer p-1"
              title={isAdmin ? 'Quản trị hệ thống (đã đăng nhập)' : 'Quản trị hệ thống'}
              aria-label="Quản trị hệ thống"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAdminLogin(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center">
                <Lock className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Đăng nhập quản trị</h3>
              <p className="text-xs text-slate-500">Nhập mật khẩu để truy cập cổng quản trị hệ thống KynangCK.</p>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Mật khẩu quản trị"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-slate-900 focus:bg-white text-slate-800 transition"
              />

              {loginError && (
                <p className="text-xs text-red-500 font-medium text-center">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginSubmitting || !adminPassword}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loginSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
