import React, { useState, useEffect } from 'react';
import { Project, ParentCRM, CorporateCRM, TransactionHistory, NotificationLog, PricingPackage, CMSData, CMSStaticPage, NewsArticle, Feedback, parseVideoEmbedUrl } from '../types';
import {
  LayoutDashboard, Users, FolderPlus, CreditCard, Bell, Sparkles, TrendingUp, Check,
  CheckCircle, AlertCircle, Calendar, ShieldCheck, Mail, Send, FileText, Files, Palette,
  Settings, Plus, Trash2, Edit3, Globe, ExternalLink, RefreshCw, Layers, MessageSquare,
  Image as ImageIcon, Video as VideoIcon, HelpCircle, MapPin, ArrowLeft, X, Folder as FolderIcon
} from 'lucide-react';
import { VisualPageBuilder } from './VisualPageBuilder';
import { PuckEditorModal } from './PuckEditorModal';
import { GoogleDriveManager } from './GoogleDriveManager';
import { adminFetch } from '../lib/adminAuth';

interface AdminPortalProps {
  projects: Project[];
  onProjectAdded: (newProject: Project) => void;
  onRefreshStats: () => void;
}

interface StatsData {
  totalRevenue: number;
  parentRevenue: number;
  corporateRevenue: number;
  studentCount: number;
  corporateCount: number;
  categorySignups: { [key: string]: number };
  transactions: TransactionHistory[];
  notifications: NotificationLog[];
}

export default function AdminPortal({ projects, onProjectAdded, onRefreshStats }: AdminPortalProps) {
  // WordPress sidebar tabs
  const [activeAdminTab, setActiveAdminTab] = useState<
    'dashboard' | 'posts' | 'pages' | 'projects' | 'images' | 'videos' | 'appearance' | 'crm' | 'corporate' | 'notifications' | 'feedbacks' | 'categories'
  >('dashboard');

  const [stats, setStats] = useState<StatsData | null>(null);
  const [parents, setParents] = useState<ParentCRM[]>([]);
  const [corporates, setCorporates] = useState<CorporateCRM[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [cms, setCms] = useState<CMSData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Frontend Preview Modals state
  const [previewPage, setPreviewPage] = useState<CMSStaticPage | null>(null);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);

  // --- FORM STATE ---
  
  // News Article Form State
  const [articleForm, setArticleForm] = useState<{
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    type: 'article' | 'video' | 'image';
    mediaUrl: string;
    thumbnailUrl: string;
    author: string;
  }>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Phương pháp giáo dục',
    type: 'article',
    mediaUrl: '',
    thumbnailUrl: '',
    author: 'Chuyên gia KynangCK'
  });
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [articleSuccess, setArticleSuccess] = useState(false);

  // Image Media library state
  const [imageForm, setImageForm] = useState<{
    id?: string;
    title: string;
    category: string;
    url: string;
    content: string;
  }>({
    title: '',
    category: 'Hoạt động dã ngoại',
    url: '',
    content: '',
  });
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);

  // Video Media library state
  const [videoForm, setVideoForm] = useState<{
    id?: string;
    title: string;
    category: string;
    mediaUrl: string;
    excerpt: string;
    content: string;
  }>({
    title: '',
    category: 'Video thực hành',
    mediaUrl: '',
    excerpt: '',
    content: '',
  });
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  // Static Page Form State
  const [pageForm, setPageForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    content: string;
  }>({
    title: '',
    slug: '',
    content: ''
  });
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageSuccess, setPageSuccess] = useState(false);
  
  // Visual Page Builder & Puck Editor state
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [showPuckBuilder, setShowPuckBuilder] = useState(false);
  const [builderTarget, setBuilderTarget] = useState<'post' | 'page' | 'project' | null>(null);

  // Appearance Form State (Header, Footer, Homepage, Web Title, Support CTA)
  const [siteTitle, setSiteTitle] = useState('Connect Kids - Kỹ Năng cho bé');
  const [siteDescription, setSiteDescription] = useState('Kiến tạo các hành trình dã ngoại sinh tồn thực tế kết hợp sổ học bạ kỹ năng điện tử CRM, đồng hành cùng gia đình giúp con vững tin bản lĩnh tự lập tương lai.');
  const [faviconUrl, setFaviconUrl] = useState('https://i.ibb.co/LDd2ggmC/logo-kynangck.webp');
  const [supportCtaForm, setSupportCtaForm] = useState({
    title: 'Cần hỗ trợ trực tiếp?',
    description: 'Đăng ký tham gia dã ngoại ngay tại Trang chủ để rèn luyện kỹ năng thực tế cho bé.',
    buttonText: 'Xem lịch tuyển sinh',
    buttonLink: 'home'
  });
  const [headerForm, setHeaderForm] = useState({
    brandName: 'Connect Kids',
    logoUrl: 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp',
    menuItems: [
      { label: 'Trang chủ', tab: 'home' },
      { label: 'Trò Chơi', tab: 'game' },
      { label: 'Thư Viện', tab: 'hub' },
      { label: 'Phụ Huynh', tab: 'parent-portal' }
    ] as { label: string; tab: string }[]
  });
  const [footerForm, setFooterForm] = useState({
    campAddress: '',
    officeAddress: '',
    hotline: '',
    copyright: '',
    facebookUrl: '',
    zaloUrl: '',
    youtubeUrl: '',
    tiktokUrl: ''
  });
  const [homepageForm, setHomepageForm] = useState({
    headline: '',
    subheadline: '',
    bannerUrl: ''
  });
  const [themeForm, setThemeForm] = useState({
    primaryColor: '5C7A3E',
    accentColor: 'F08C3A',
    webBgColor: 'FAF7F0',
    headerBgColor: 'FAF7F0',
    footerBgColor: '5C7A3E',
    linkColor: '5C7A3E'
  });
  const [appearanceSuccess, setAppearanceSuccess] = useState('');

  const [corporateForm, setCorporateForm] = useState({
    heroTitle: 'Kiến Tạo Trải Nghiệm Tập Thể Đột Phá',
    heroSub: 'KynangCK mang đến giáo án huấn luyện sinh tồn dã ngoại thực tế chuyên nghiệp cho trường học, doanh nghiệp và tổ chức đoàn thể. Chúng tôi cam kết an toàn tuyệt đối và quy trình quản trị dự án hiện đại.',
    organization: {
      title: 'Dành Cho Tổ Chức & Hội Đoàn',
      description: 'Thiết kế các chương trình dã ngoại chuyên sâu, xây dựng tinh thần đồng đội cho các hội nhóm thanh thiếu niên, câu lạc bộ sở thích, các tổ chức thiện nguyện xã hội.',
      focusTitle: 'HẠNG MỤC TRỌNG TÂM',
      focusItems: [
        'Kỹ năng lãnh đạo dã ngoại: Tổ chức hoạt động sơ cứu, dựng trại tập thể khẩn cấp và bảo vệ an toàn cho thành viên.',
        'Hành trình giải mật thư: Thử thách trí tuệ đồng đội vượt địa hình phức tạp, định vị vệ tinh và la bàn thủ công.'
      ] as string[],
      highlightText: 'Dịch vụ trọn gói bảo hiểm dã ngoại chuẩn quốc tế cho toàn bộ thành viên đoàn thể tham gia.'
    },
    business: {
      title: 'Dành Cho Doanh Nghiệp (Team building)',
      description: 'Xóa nhòa khoảng cách cấp bậc trong doanh nghiệp, tạo cầu nối thấu hiểu bền chặt giữa các phòng ban thông qua kịch bản dã ngoại khắc nghiệt thử thách khả năng sinh tồn.',
      focusTitle: 'CHƯƠNG TRÌNH ĐỘT PHÁ',
      focusItems: [
        'Trại sinh tồn lãnh đạo CEO: Vượt chướng ngại vật thiên nhiên, rèn luyện kỹ năng quản trị khủng hoảng và teamwork thực chiến.',
        'Thử thách Robinson: Tự lập lều bạt dã chiến, lọc nước ngọt tự nhiên từ bùn đất, dập lửa khói báo tín hiệu định vị cứu hộ.'
      ] as string[],
      highlightText: 'Cung cấp báo giá, hợp đồng & hóa đơn VAT chuẩn chỉnh lưu vào CRM tiện dụng cho kế toán doanh nghiệp.'
    },
    school: {
      title: 'Dành Cho Trường Học & Học Xá',
      description: 'Hợp tác thiết kế học vụ dã ngoại ngoại khóa tích hợp, chuẩn hóa giáo dục trực quan, giúp học sinh trải nghiệm thực tế sinh động thay vì lý thuyết sách vở.',
      focusTitle: 'DỊCH VỤ CHUYÊN BIỆT',
      focusItems: [
        'Học kỳ quân đội dã ngoại: Kỹ năng tự lập sinh hoạt, gấp chăn màn quân đội, sơ cứu thương tích cơ bản và định hướng rừng rậm.',
        'Trại kỹ năng tự bảo vệ vệ sĩ nhí: Nhận diện nguy hiểm tiềm ẩn, phòng tránh lạc đường, xử lý tình huống hỏa hoạn và đuối nước dã ngoại.'
      ] as string[],
      highlightText: 'Huấn luyện viên dã ngoại đạt chứng chỉ sơ cứu quốc tế trực tiếp giám sát dã ngoại tỉ lệ 1 HLV kèm 5 bé học sinh.'
    }
  });

  // Project (Dự án dã ngoại) Form State
  const [newProj, setNewProj] = useState({
    title: '',
    mainCategory: 'Khóa Học',
    subCategory: 'Kỹ năng sinh tồn',
    category: 'Khóa Học » Kỹ năng sinh tồn',
    eventTime: '',
    status: 'sắp diễn ra' as 'đang thực hiện' | 'đã hoàn thành' | 'sắp diễn ra',
    description: '',
    imageUrl: '',
    ageRange: '6 - 15 tuổi',
    duration: '3 ngày 2 đêm',
    location: '',
    journeyDetails: '',
  });

  const [learnerValues, setLearnerValues] = useState<{ id?: string; title?: string; text: string }[]>([
    { text: 'Rèn luyện kỹ năng tự lập giải quyết vấn đề thực tế' },
    { text: 'Xây dựng tinh thần đồng đội và tính kỷ luật' },
    { text: 'Rời xa màn hình thiết bị điện tử, hòa mình vào thiên nhiên' }
  ]);

  const [projectFaqs, setProjectFaqs] = useState<{ id?: string; question: string; answer: string }[]>([
    { question: 'Có người hỗ trợ bé trong suốt chuyến dã ngoại không?', answer: 'Có, các chuyên viên và giáo viên của chúng tôi túc trực 24/7 để đồng hành và hỗ trợ bé trong tất cả hoạt động.' }
  ]);

  const [sidebarConfig, setSidebarConfig] = useState({
    title: 'Chọn gói học bổng & dịch vụ',
    subtitle: 'Học phí trọn gói bảo hộ tối đa cho con',
    trustTitle: 'An Tâm Tuyệt Đối Với Trẻ',
    trustDescription: 'Mọi khóa dã ngoại sinh tồn của CONNECT KIDS đều mua kèm bảo hiểm du lịch cao cấp và có điều phối viên y tế 24/7 đồng hành.'
  });

  const [pricingPkgs, setPricingPkgs] = useState<PricingPackage[]>([
    { id: 'pkg-1', name: 'Gói Trải Nghiệm', price: 3500000, description: 'Bao gồm xe đưa đón, ăn uống và trang thiết bị cơ bản', benefits: ['Xe đưa đón khứ hồi', 'Lều trại dã ngoại tiêu chuẩn', 'Chứng nhận hoàn thành'] },
    { id: 'pkg-2', name: 'Gói Chiến Binh Toàn Diện', price: 5200000, description: 'Đầy đủ dịch vụ cộng với bộ kit sinh tồn cá nhân cao cấp', benefits: ['Toàn bộ quyền lợi Gói Trải Nghiệm', 'Tặng bộ Kit la bàn sinh tồn riêng', 'Bộ ảnh lưu niệm cá nhân từ nhiếp ảnh gia'] }
  ]);

  const [aiLandingConfig, setAiLandingConfig] = useState<any | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // CRM Student Progress Form State
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [newProgress, setNewProgress] = useState({
    skillName: '',
    status: 'Đang rèn luyện' as any,
    notes: ''
  });
  const [isProgressUpdating, setIsProgressUpdating] = useState(false);
  const [progressSuccess, setProgressSuccess] = useState(false);

  // Project edit support states
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Category Tree configuration states
  const [localPostTree, setLocalPostTree] = useState<{ [parent: string]: string[] }>({});
  const [localProjectTree, setLocalProjectTree] = useState<{ [parent: string]: string[] }>({});
  const [newPostSub, setNewPostSub] = useState<{ [parent: string]: string }>({});
  const [newProjSub, setNewProjSub] = useState<{ [parent: string]: string }>({});
  const [newPostParent, setNewPostParent] = useState('');
  const [newProjParent, setNewProjParent] = useState('');
  const [selectedArticleCategoryFilter, setSelectedArticleCategoryFilter] = useState<string>('Tất cả');
  const [selectedImageCategoryFilter, setSelectedImageCategoryFilter] = useState<string>('Tất cả');
  const [selectedVideoCategoryFilter, setSelectedVideoCategoryFilter] = useState<string>('Tất cả');
  const [selectedProjMainTab, setSelectedProjMainTab] = useState<string>('Tất cả');
  const [selectedProjSubFilter, setSelectedProjSubFilter] = useState<string>('Tất cả');

  const defaultPostCategoryTree: { [parent: string]: string[] } = {
    "Bài viết": ["Phương pháp giáo dục", "Tâm lý trẻ em", "Cẩm nang dã ngoại", "Kiến thức kỹ năng", "Sơ cứu & An toàn"],
    "Hình ảnh": ["Hoạt động dã ngoại", "Khu cắm trại", "Thánh địa sinh tồn", "Khoảnh khắc học viên", "Rèn luyện tự lập"],
    "Video": ["Video thực hành", "Hướng dẫn sinh tồn", "Góc nhìn học viên", "Kỷ niệm dã ngoại", "Kỹ năng cắm trại"]
  };

  const defaultProjectCategoryTree: { [parent: string]: string[] } = {
    "Khóa Học": ["Kỹ năng sinh tồn", "Kỹ năng tự lập", "An toàn dã ngoại", "Kỹ năng sống", "Tư duy sinh tồn", "Phản ứng khẩn cấp"],
    "Trải Nghiệm": ["Cắm trại hoang dã", "Dã ngoại thực tế", "Lớp học thiên nhiên", "Thám hiểm rừng sâu", "Hành trình di sản", "Thám hiểm tự nhiên"],
    "Sân Chơi": ["Cuộc thi sinh tồn", "Sân chơi sáng tạo", "Ngày hội gia đình", "Trò chơi vận động", "Thử thách trí tuệ", "Sân chơi gia đình", "Hội trại dã ngoại"],
    "Cộng Đồng": ["Dự án xanh", "Tình nguyện nhí", "Gắn kết phụ huynh", "Hoạt động xã hội"]
  };

  useEffect(() => {
    if (cms) {
      // Build merged post category tree with default fallback + existing db tree + dynamic post categories
      const mergedPostTree: { [parent: string]: string[] } = {
        "Bài viết": Array.from(new Set([
          ...defaultPostCategoryTree["Bài viết"],
          ...(cms.postCategoryTree?.["Bài viết"] || cms.postCategoryTree?.["Post"] || []),
          ...news.filter(art => art.type === 'article' || !art.type).map(art => art.category).filter(Boolean)
        ])),
        "Hình ảnh": Array.from(new Set([
          ...defaultPostCategoryTree["Hình ảnh"],
          ...(cms.postCategoryTree?.["Hình ảnh"] || cms.postCategoryTree?.["Image"] || []),
          ...news.filter(art => art.type === 'image').map(art => art.category).filter(Boolean)
        ])),
        "Video": Array.from(new Set([
          ...defaultPostCategoryTree["Video"],
          ...(cms.postCategoryTree?.["Video"] || cms.postCategoryTree?.["Video Embed"] || []),
          ...news.filter(art => art.type === 'video').map(art => art.category).filter(Boolean)
        ]))
      };

      if (cms.postCategoryTree) {
        Object.keys(cms.postCategoryTree).forEach(key => {
          if (!mergedPostTree[key]) {
            mergedPostTree[key] = cms.postCategoryTree[key] || [];
          }
        });
      }

      setLocalPostTree(mergedPostTree);

      setLocalProjectTree({
        ...defaultProjectCategoryTree,
        ...(cms.projectCategoryTree || {})
      });
    } else {
      setLocalPostTree(defaultPostCategoryTree);
      setLocalProjectTree(defaultProjectCategoryTree);
    }
  }, [cms, news]);

  const handleAddPostParent = () => {
    const text = newPostParent.trim();
    if (!text) return;
    if (localPostTree[text]) {
      alert("Nhánh danh mục cha này đã tồn tại.");
      return;
    }
    setLocalPostTree({ ...localPostTree, [text]: [] });
    setNewPostParent('');
  };

  const handleAddProjParent = () => {
    const text = newProjParent.trim();
    if (!text) return;
    if (localProjectTree[text]) {
      alert("Nhánh danh mục cha này đã tồn tại.");
      return;
    }
    setLocalProjectTree({ ...localProjectTree, [text]: [] });
    setNewProjParent('');
  };

  const handleAddPostSubcategory = (parent: string) => {
    const text = newPostSub[parent]?.trim();
    if (!text) return;
    const currentList = localPostTree[parent] || [];
    if (currentList.includes(text)) {
      alert("Danh mục con này đã tồn tại.");
      return;
    }
    setLocalPostTree({
      ...localPostTree,
      [parent]: [...currentList, text]
    });
    setNewPostSub({ ...newPostSub, [parent]: '' });
  };

  const handleRemovePostSubcategory = (parent: string, sub: string) => {
    const currentList = localPostTree[parent] || [];
    setLocalPostTree({
      ...localPostTree,
      [parent]: currentList.filter(s => s !== sub)
    });
  };

  const handleSavePostCategoryTree = async () => {
    try {
      const response = await adminFetch('/api/cms/post-category-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tree: localPostTree })
      });
      if (response.ok) {
        alert("Sơ đồ danh mục bài viết đã được cập nhật thành công!");
        loadSystemData();
      } else {
        const err = await response.json();
        alert("Lỗi lưu sơ đồ danh mục bài viết: " + err.error);
      }
    } catch (e) {
      alert("Không thể kết nối lưu sơ đồ danh mục bài viết.");
    }
  };

  const handleAddProjectSubcategory = (parent: string) => {
    const text = newProjSub[parent]?.trim();
    if (!text) return;
    const currentList = localProjectTree[parent] || [];
    if (currentList.includes(text)) {
      alert("Danh mục con này đã tồn tại.");
      return;
    }
    setLocalProjectTree({
      ...localProjectTree,
      [parent]: [...currentList, text]
    });
    setNewProjSub({ ...newProjSub, [parent]: '' });
  };

  const handleRemoveProjectSubcategory = (parent: string, sub: string) => {
    const currentList = localProjectTree[parent] || [];
    setLocalProjectTree({
      ...localProjectTree,
      [parent]: currentList.filter(s => s !== sub)
    });
  };

  const handleSaveProjectCategoryTree = async () => {
    try {
      const response = await adminFetch('/api/cms/project-category-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tree: localProjectTree })
      });
      if (response.ok) {
        alert("Sơ đồ danh mục dự án đã được cập nhật thành công!");
        loadSystemData();
      } else {
        const err = await response.json();
        alert("Lỗi lưu sơ đồ danh mục dự án: " + err.error);
      }
    } catch (e) {
      alert("Không thể kết nối lưu sơ đồ danh mục dự án.");
    }
  };

  const handleEditProjectClick = (proj: Project) => {
    let mainCat = proj.mainCategory === 'Khóa học' ? 'Khóa Học' : (proj.mainCategory || 'Khóa Học');
    let subCat = proj.subCategory || '';

    if (!subCat && proj.category && proj.category.includes('»')) {
      const parts = proj.category.split('»').map(s => s.trim());
      mainCat = parts[0] === 'Khóa học' ? 'Khóa Học' : (parts[0] || 'Khóa Học');
      subCat = parts[1] || '';
    } else if (!subCat && proj.category) {
      subCat = proj.category;
    }

    setNewProj({
      title: proj.title || '',
      mainCategory: mainCat,
      subCategory: subCat,
      category: proj.category || (subCat ? `${mainCat} » ${subCat}` : mainCat),
      eventTime: proj.eventTime || '',
      status: proj.status || 'sắp diễn ra',
      description: proj.description || '',
      imageUrl: proj.imageUrl || '',
      ageRange: proj.ageRange || '6 - 15 tuổi',
      duration: proj.duration || '3 ngày 2 đêm',
      location: proj.location || '',
      journeyDetails: proj.journeyDetails || (proj.aiLandingPage?.description || ''),
    });

    if (proj.learnerValues && proj.learnerValues.length > 0) {
      setLearnerValues(proj.learnerValues.map((v: any) => typeof v === 'string' ? { text: v } : v));
    } else if (proj.aiLandingPage?.keyTakeaways) {
      setLearnerValues(proj.aiLandingPage.keyTakeaways.map((t: string) => ({ text: t })));
    } else {
      setLearnerValues([
        { text: 'Rèn luyện kỹ năng sinh tồn và tính tự lập giải quyết vấn đề' },
        { text: 'Xây dựng bản lĩnh, thể chất dẻo dai và tinh thần đồng đội' }
      ]);
    }

    if (proj.faqs && proj.faqs.length > 0) {
      setProjectFaqs(proj.faqs);
    } else if (proj.aiLandingPage?.faq) {
      setProjectFaqs(proj.aiLandingPage.faq);
    } else {
      setProjectFaqs([
        { question: 'Có người hỗ trợ bé trong suốt chuyến dã ngoại không?', answer: 'Có, các chuyên viên và giáo viên của chúng tôi túc trực 24/7 để đồng hành và hỗ trợ bé trong tất cả hoạt động.' }
      ]);
    }

    setSidebarConfig({
      title: proj.sidebarConfig?.title || 'Chọn gói học bổng & dịch vụ',
      subtitle: proj.sidebarConfig?.subtitle || 'Học phí trọn gói bảo hộ tối đa cho con',
      trustTitle: proj.sidebarConfig?.trustTitle || 'An Tâm Tuyệt Đối Với Trẻ',
      trustDescription: proj.sidebarConfig?.trustDescription || 'Mọi khóa dã ngoại sinh tồn của CONNECT KIDS đều mua kèm bảo hiểm du lịch cao cấp và có điều phối viên y tế 24/7 đồng hành.'
    });

    setPricingPkgs(proj.pricingPackages && proj.pricingPackages.length > 0 ? proj.pricingPackages : [
      { id: 'pkg-1', name: 'Gói Trải Nghiệm', price: 3500000, description: 'Bao gồm xe đưa đón, ăn uống và trang thiết bị cơ bản', benefits: ['Xe đưa đón khứ hồi', 'Lều trại dã ngoại tiêu chuẩn', 'Chứng nhận hoàn thành'] },
      { id: 'pkg-2', name: 'Gói Chiến Binh Toàn Diện', price: 5200000, description: 'Đầy đủ dịch vụ cộng với bộ kit sinh tồn cá nhân cao cấp', benefits: ['Toàn bộ quyền lợi Gói Trải Nghiệm', 'Tặng bộ Kit la bàn sinh tồn riêng', 'Bộ ảnh lưu niệm cá nhân từ nhiếp ảnh gia'] }
    ]);

    setAiLandingConfig(proj.aiLandingPage || null);
    setEditingProjectId(proj.id);
    setIsEditingProject(true);
  };

  // Load All System Data (Stats, CRM, News, CMS)
  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch CRM stats
      const statsRes = await adminFetch('/api/crm/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch all database models
      const dbRes = await adminFetch('/api/crm/all');
      const dbData = await dbRes.json();
      setParents(dbData.parents || []);
      setCorporates(dbData.corporates || []);

      if (dbData.parents && dbData.parents.length > 0 && !selectedParentId) {
        setSelectedParentId(dbData.parents[0].id);
      }

      // Fetch feedbacks
      try {
        const fbRes = await adminFetch('/api/feedbacks');
        const fbData = await fbRes.json();
        setFeedbacks(fbData || []);
      } catch (fbErr) {
        console.error('Lỗi tải feedback:', fbErr);
      }

      // 3. Fetch all news posts
      const newsRes = await adminFetch('/api/news');
      const newsData = await newsRes.json();
      setNews(newsData || []);

      // 4. Fetch CMS configs
      const cmsRes = await adminFetch('/api/cms');
      const cmsData = await cmsRes.json();
      setCms(cmsData);

      if (cmsData) {
        if (cmsData.siteTitle) setSiteTitle(cmsData.siteTitle);
        if (cmsData.siteDescription || cmsData.footer?.shortDescription) {
          setSiteDescription(cmsData.siteDescription || cmsData.footer?.shortDescription || '');
        }
        if (cmsData.faviconUrl) setFaviconUrl(cmsData.faviconUrl);
        if (cmsData.supportCta) setSupportCtaForm(cmsData.supportCta);
        if (cmsData.header) {
          const default4 = [
            { label: 'Trang chủ', tab: 'home' },
            { label: 'Trò Chơi', tab: 'game' },
            { label: 'Thư Viện', tab: 'hub' },
            { label: 'Phụ Huynh', tab: 'parent-portal' }
          ];
          const rawItems = cmsData.header.menuItems;
          let validItems = default4;
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            validItems = rawItems.map((item: any) => {
              let label = item.label || 'Trang';
              let tab = item.tab || (item.link ? item.link.replace(/^\//, '') : 'home');
              return { label, tab };
            });
          }

          setHeaderForm({
            brandName: cmsData.header.brandName || 'Connect Kids',
            logoUrl: cmsData.header.logoUrl || 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp',
            menuItems: validItems
          });
        }
        if (cmsData.footer) {
          setFooterForm({
            campAddress: cmsData.footer.campAddress || '',
            officeAddress: cmsData.footer.officeAddress || '',
            hotline: cmsData.footer.hotline || '',
            copyright: cmsData.footer.copyright || '',
            facebookUrl: cmsData.footer.facebookUrl || '',
            zaloUrl: cmsData.footer.zaloUrl || '',
            youtubeUrl: cmsData.footer.youtubeUrl || '',
            tiktokUrl: cmsData.footer.tiktokUrl || ''
          });
        }
        setHomepageForm(cmsData.homepage);
        if (cmsData.theme) {
          setThemeForm(cmsData.theme);
        }
        if (cmsData.corporate) {
          setCorporateForm({
            ...corporateForm,
            ...cmsData.corporate,
            organization: {
              ...corporateForm.organization,
              ...(cmsData.corporate.organization || {})
            },
            business: {
              ...corporateForm.business,
              ...(cmsData.corporate.business || {})
            },
            school: {
              ...corporateForm.school,
              ...(cmsData.corporate.school || {})
            }
          });
        }
      }
    } catch (error) {
      console.error('Lỗi kết nối toàn hệ thống:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  // --- ACTION HANDLERS ---

  // 1. Posts Management (Bài viết/Tin tức)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết.');
      return;
    }

    try {
      const isEdit = !!articleForm.id;
      const url = isEdit ? `/api/news/${articleForm.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...articleForm };
      if (payload.type === 'video' && payload.mediaUrl) {
        payload.mediaUrl = parseVideoEmbedUrl(payload.mediaUrl);
      }

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setArticleSuccess(true);
        setTimeout(() => setArticleSuccess(false), 3000);
        setArticleForm({
          title: '',
          excerpt: '',
          content: '',
          category: 'Phương pháp giáo dục',
          type: 'article',
          mediaUrl: '',
          thumbnailUrl: '',
          author: 'Chuyên gia KynangCK'
        });
        setIsEditingArticle(false);
        loadSystemData();
        onRefreshStats();
      } else {
        const err = await response.json();
        alert('Lỗi lưu bài viết: ' + err.error);
      }
    } catch (err) {
      alert('Lỗi lưu bài viết.');
    }
  };

  const handleEditArticleClick = (art: NewsArticle) => {
    setArticleForm({
      id: art.id,
      title: art.title,
      excerpt: art.excerpt,
      content: art.content,
      category: art.category,
      type: art.type,
      mediaUrl: art.mediaUrl || '',
      thumbnailUrl: art.thumbnailUrl || '',
      author: art.author
    });
    setIsEditingArticle(true);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      const res = await adminFetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSystemData();
        onRefreshStats();
      }
    } catch (err) {
      alert('Không thể xóa bài viết.');
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageForm.title || !imageForm.url) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và URL ảnh đại diện.');
      return;
    }

    try {
      const isEdit = !!imageForm.id;
      const url = isEdit ? `/api/news/${imageForm.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imageForm.title,
          excerpt: imageForm.content || 'Hình ảnh từ thư viện',
          content: imageForm.content || 'Hình ảnh từ thư viện',
          category: imageForm.category,
          type: 'image',
          mediaUrl: imageForm.url,
          thumbnailUrl: imageForm.url,
          author: 'Chuyên gia KynangCK'
        })
      });

      if (response.ok) {
        setImageSuccess(true);
        setTimeout(() => setImageSuccess(false), 3000);
        setImageForm({
          title: '',
          category: cms?.postCategoryTree?.["Hình ảnh"]?.[0] || 'Hoạt động dã ngoại',
          url: '',
          content: ''
        });
        setIsEditingImage(false);
        loadSystemData();
        onRefreshStats();
      } else {
        const err = await response.json();
        alert('Lỗi lưu hình ảnh: ' + err.error);
      }
    } catch (err) {
      alert('Lỗi kết nối lưu hình ảnh.');
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.mediaUrl) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Link/mã nhúng Video.');
      return;
    }

    try {
      const isEdit = !!videoForm.id;
      const url = isEdit ? `/api/news/${videoForm.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoForm.title,
          excerpt: videoForm.excerpt || 'Video từ thư viện',
          content: videoForm.content || 'Video từ thư viện',
          category: videoForm.category,
          type: 'video',
          mediaUrl: parseVideoEmbedUrl(videoForm.mediaUrl),
          author: 'Chuyên gia KynangCK'
        })
      });

      if (response.ok) {
        setVideoSuccess(true);
        setTimeout(() => setVideoSuccess(false), 3000);
        setVideoForm({
          title: '',
          category: cms?.postCategoryTree?.["Video"]?.[0] || 'Video thực hành',
          mediaUrl: '',
          excerpt: '',
          content: ''
        });
        setIsEditingVideo(false);
        loadSystemData();
        onRefreshStats();
      } else {
        const err = await response.json();
        alert('Lỗi lưu video: ' + err.error);
      }
    } catch (err) {
      alert('Lỗi kết nối lưu video.');
    }
  };

  // 2. Static Pages Management (Trang tĩnh WordPress)
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title || !pageForm.slug) {
      alert('Tiêu đề và Đường dẫn tĩnh (Slug) không được bỏ trống.');
      return;
    }

    try {
      const response = await adminFetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm)
      });

      if (response.ok) {
        setPageSuccess(true);
        setTimeout(() => setPageSuccess(false), 3000);
        setPageForm({ title: '', slug: '', content: '' });
        setIsEditingPage(false);
        loadSystemData();
      } else {
        const err = await response.json();
        alert('Lỗi lưu trang tĩnh: ' + err.error);
      }
    } catch (err) {
      alert('Lỗi kết nối lưu trang.');
    }
  };

  const handleEditPageClick = (page: CMSStaticPage) => {
    setPageForm({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content
    });
    setIsEditingPage(true);
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Xóa trang tĩnh này sẽ ảnh hưởng tới liên kết điều hướng. Bạn có chắc chắn?')) return;
    try {
      const res = await adminFetch(`/api/cms/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSystemData();
      }
    } catch (err) {
      alert('Không thể xóa trang tĩnh.');
    }
  };

  const handleSaveSiteTitle = async () => {
    try {
      const res = await adminFetch('/api/cms/site-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteTitle, siteDescription, faviconUrl })
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật Tiêu đề, Mô tả ngắn & Favicon trang web thành công!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      }
    } catch (e) {
      alert('Không thể lưu Tiêu đề & Cấu hình trang web.');
    }
  };

  const handleSaveSupportCta = async () => {
    try {
      const res = await adminFetch('/api/cms/support-cta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportCtaForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật khung Hỗ trợ trực tiếp ở Thư viện!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      }
    } catch (e) {
      alert('Không thể lưu thông tin hỗ trợ trực tiếp.');
    }
  };

  // 3. Appearance Management (Giao diện WordPress)
  const handleSaveHeaderSettings = async () => {
    try {
      const res = await adminFetch('/api/cms/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật cấu hình Header & Thanh điều hướng!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      }
    } catch (e) {
      alert('Không thể lưu cài đặt Header.');
    }
  };

  const handleSaveFooterSettings = async () => {
    try {
      const res = await adminFetch('/api/cms/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật thông tin Chân trang (Footer) thành công!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      }
    } catch (e) {
      alert('Không thể lưu cài đặt Footer.');
    }
  };

  const handleSaveHomepageSettings = async () => {
    try {
      const res = await adminFetch('/api/cms/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật Headline & Banner trang chủ KynangCK!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      }
    } catch (e) {
      alert('Không thể lưu cài đặt Trang chủ.');
    }
  };

  const handleSaveCorporateSettings = async () => {
    try {
      const res = await adminFetch('/api/cms/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corporateForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật cấu hình mục Hợp tác B2B thành công!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
      } else {
        alert('Không thể lưu cấu hình Hợp tác.');
      }
    } catch (e) {
      alert('Không thể lưu cài đặt Hợp tác.');
    }
  };

  const handleSaveThemeSettings = async () => {
    try {
      const res = await adminFetch('/api/cms/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm)
      });
      if (res.ok) {
        setAppearanceSuccess('Đã cập nhật Bảng màu giao diện (Theme Colors) thành công!');
        setTimeout(() => setAppearanceSuccess(''), 4000);
        loadSystemData();
        onRefreshStats(); // Inform parent to update page styles immediately
      } else {
        const err = await res.json();
        alert('Lỗi lưu bảng màu: ' + err.error);
      }
    } catch (e) {
      alert('Không thể lưu bảng màu giao diện.');
    }
  };

  // 4. Projects (Dự án/Khóa học dã ngoại) Management
  const runAiLandingOptimization = async () => {
    if (!newProj.title || !newProj.description) {
      alert('Vui lòng điền Tên dự án và Mô tả tóm tắt để AI thiết kế landing page.');
      return;
    }

    setIsAiGenerating(true);
    setAiStatusMessage('Đang kết nối Gemini AI để viết tiêu đề & tối ưu hóa bố cục...');
    try {
      const response = await adminFetch('/api/projects/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProj.title,
          description: newProj.description,
          category: newProj.category,
          ageRange: newProj.ageRange
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi từ máy chủ Gemini API');
      }

      const data = await response.json();
      setAiLandingConfig(data);
      setAiStatusMessage('Tối ưu hóa thành công! Đã thiết lập tiêu đề, lợi ích và câu hỏi FAQ.');
    } catch (error) {
      console.error(error);
      setAiStatusMessage('Không thể kết nối API. Đã thiết lập mẫu tối ưu hóa mặc định.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const resetProjectForm = () => {
    setNewProj({
      title: '',
      mainCategory: 'Khóa Học',
      subCategory: 'Kỹ năng sinh tồn',
      category: 'Khóa Học » Kỹ năng sinh tồn',
      eventTime: '',
      status: 'sắp diễn ra',
      description: '',
      imageUrl: '',
      ageRange: '6 - 15 tuổi',
      duration: '3 ngày 2 đêm',
      location: '',
      journeyDetails: '',
    });
    setLearnerValues([
      { text: 'Rèn luyện kỹ năng tự lập giải quyết vấn đề thực tế' },
      { text: 'Xây dựng tinh thần đồng đội và tính kỷ luật' },
      { text: 'Rời xa màn hình thiết bị điện tử, hòa mình vào thiên nhiên' }
    ]);
    setProjectFaqs([
      { question: 'Có người hỗ trợ bé trong suốt chuyến dã ngoại không?', answer: 'Có, các chuyên viên và giáo viên của chúng tôi túc trực 24/7 để đồng hành và hỗ trợ bé trong tất cả hoạt động.' }
    ]);
    setSidebarConfig({
      title: 'Chọn gói học bổng & dịch vụ',
      subtitle: 'Học phí trọn gói bảo hộ tối đa cho con',
      trustTitle: 'An Tâm Tuyệt Đối Với Trẻ',
      trustDescription: 'Mọi khóa dã ngoại sinh tồn của CONNECT KIDS đều mua kèm bảo hiểm du lịch cao cấp và có điều phối viên y tế 24/7 đồng hành.'
    });
    setPricingPkgs([
      { id: 'pkg-1', name: 'Gói Trải Nghiệm', price: 3500000, description: 'Bao gồm xe đưa đón, ăn uống và trang thiết bị cơ bản', benefits: ['Xe đưa đón khứ hồi', 'Lều trại dã ngoại tiêu chuẩn', 'Chứng nhận hoàn thành'] },
      { id: 'pkg-2', name: 'Gói Chiến Binh Toàn Diện', price: 5200000, description: 'Đầy đủ dịch vụ cộng với bộ kit sinh tồn cá nhân cao cấp', benefits: ['Toàn bộ quyền lợi Gói Trải Nghiệm', 'Tặng bộ Kit la bàn sinh tồn riêng', 'Bộ ảnh lưu niệm cá nhân từ nhiếp ảnh gia'] }
    ]);
    setAiLandingConfig(null);
    setAiStatusMessage('');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.title) {
      alert('Vui lòng điền tên dự án.');
      return;
    }

    try {
      const isEdit = isEditingProject && editingProjectId;
      const url = isEdit ? `/api/projects/${editingProjectId}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const fullCategory = newProj.subCategory
        ? `${newProj.mainCategory} » ${newProj.subCategory}`
        : newProj.mainCategory;

      const finalAiLandingPage = aiLandingConfig ? {
        ...aiLandingConfig,
        headline: aiLandingConfig.headline || `Dự án: ${newProj.title}`,
        subheadline: aiLandingConfig.subheadline || `Chương trình giáo dục kỹ năng cho con`,
        description: newProj.description || aiLandingConfig.description,
        keyTakeaways: learnerValues.map(v => v.text).filter(Boolean),
        faq: projectFaqs
      } : {
        headline: `Dự án: ${newProj.title}`,
        subheadline: `Chương trình giáo dục kỹ năng cho con`,
        description: newProj.description,
        keyTakeaways: learnerValues.map(v => v.text).filter(Boolean),
        bannerColor: 'emerald',
        accentColor: 'amber',
        faq: projectFaqs
      };

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProj,
          category: fullCategory,
          learnerValues,
          faqs: projectFaqs,
          sidebarConfig,
          pricingPackages: pricingPkgs,
          aiLandingPage: finalAiLandingPage
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (!isEdit) {
          onProjectAdded(data);
          alert(`Dự án "${newProj.title}" đã được xuất bản và hiện diện thành 1 trang Landing Page công khai!`);
        } else {
          alert(`Dự án "${newProj.title}" đã được cập nhật thành công!`);
        }
        resetProjectForm();
        setIsEditingProject(false);
        setEditingProjectId(null);
        loadSystemData();
        onRefreshStats();
      } else {
        alert('Lỗi: ' + (data.error || 'Không thể lưu dự án.'));
      }
    } catch (err) {
      alert('Lỗi xuất bản hoặc cập nhật dự án.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa dự án dã ngoại này khỏi website?')) return;
    try {
      const res = await adminFetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSystemData();
        onRefreshStats();
        alert('Đã xóa dự án thành công.');
      }
    } catch (e) {
      alert('Không thể xóa dự án.');
    }
  };

  // 5. CRM Student Progress Log
  const handleUpdateStudentProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || !newProgress.skillName) return;

    setIsProgressUpdating(true);
    setProgressSuccess(false);

    try {
      const response = await adminFetch('/api/crm/student-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParentId,
          childIndex: selectedChildIndex,
          skillName: newProgress.skillName,
          status: newProgress.status,
          notes: newProgress.notes
        })
      });

      if (response.ok) {
        setProgressSuccess(true);
        setNewProgress({ skillName: '', status: 'Đang rèn luyện', notes: '' });
        loadSystemData();
        onRefreshStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProgressUpdating(false);
    }
  };

  // 6. CRM Corporate Approval
  const handleApproveCorporate = async (corpId: string, status: string) => {
    try {
      const response = await adminFetch('/api/crm/corporate-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corpId, status })
      });
      if (response.ok) {
        loadSystemData();
        onRefreshStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveCorporatePayment = async (corpId: string) => {
    try {
      const response = await adminFetch('/api/crm/corporate-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corpId, paymentStatus: 'Đã thanh toán' })
      });
      if (response.ok) {
        loadSystemData();
        onRefreshStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedParent = parents.find(p => p.id === selectedParentId);

  return (
    <div className="flex min-h-screen bg-[#f1f1f1] text-[#32373c] font-sans">
      {/* WORDPRESS BLACK SIDEBAR */}
      <aside className="w-56 bg-[#23282d] text-[#eee] shrink-0 flex flex-col justify-between select-none">
        <div>
          {/* Header Brand */}
          <div className="bg-[#121619] px-4 py-4 flex items-center space-x-2 border-b border-[#2d3136]">
            <div className="bg-[#5C7A3E] text-white font-extrabold w-7 h-7 rounded-full flex items-center justify-center font-mono text-sm shadow-inner">
              CK
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white font-sans">KynangCK</h2>
              <span className="text-[10px] text-emerald-400 font-mono">Google AI Studio Build</span>
            </div>
          </div>

          {/* WordPress Menu Navigation Links */}
          <nav className="mt-4 text-[13px] font-medium space-y-0.5">
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'dashboard' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Bảng tin (Dashboard)</span>
            </button>

            <button
              onClick={() => { setActiveAdminTab('posts'); setIsEditingArticle(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'posts' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Bài viết (Posts)</span>
            </button>

            <button
              onClick={() => { setActiveAdminTab('pages'); setIsEditingPage(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'pages' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Files className="h-4 w-4" />
              <span>Trang (Pages)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('projects')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'projects' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Dự án</span>
            </button>

            <button
              onClick={() => { setActiveAdminTab('images'); setIsEditingImage(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'images' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Hình Ảnh</span>
            </button>

            <button
              onClick={() => { setActiveAdminTab('videos'); setIsEditingVideo(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'videos' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <VideoIcon className="h-4 w-4" />
              <span>Video</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('drive-media')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'drive-media' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <FolderIcon className="h-4 w-4" />
              <span>Quản lý File (Drive)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'categories' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Quản lý danh mục</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('appearance')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'appearance' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Palette className="h-4 w-4" />
              <span>Giao diện (Appearance)</span>
            </button>

            <div className="px-4 py-2 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-t border-[#2d3136] mt-4">
              Hệ thống CRM
            </div>

            <button
              onClick={() => setActiveAdminTab('crm')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'crm' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Học bạ CRM học viên</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('corporate')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'corporate' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Dự án Doanh nghiệp</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'notifications' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Gửi thông báo Auto</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('feedbacks')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                activeAdminTab === 'feedbacks' ? 'bg-[#0073aa] text-white font-bold' : 'hover:bg-[#32373c] hover:text-[#00b0ff]'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ý kiến & Góp ý ({feedbacks.length})</span>
            </button>
          </nav>
        </div>

        {/* Live Website quick link */}
        <div className="p-4 bg-[#1e2227] border-t border-[#2d3136]">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); alert('Vui lòng sử dụng thanh điều hướng menu của app để xem trực tiếp trang chủ!'); }}
            className="flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white"
          >
            <span>Xem Trang Chủ</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </aside>

      {/* WORDPRESS CONTENT AREA */}
      <main className="flex-grow p-8 overflow-y-auto space-y-6">
        
        {/* WordPress Top Notification Bar */}
        {isLoading && (
          <div className="bg-[#fff8e5] border-l-4 border-orange-500 p-4 text-xs font-mono text-orange-800 animate-pulse flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Đang đồng bộ cơ sở dữ liệu dã ngoại KynangCK và CRM...</span>
          </div>
        )}

        {/* 1. DASHBOARD TAB */}
        {activeAdminTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-4">
              <h1 className="text-2xl font-normal text-[#23282d] font-serif">
                Chào mừng bạn đến với Bảng Quản Trị KynangCK!
              </h1>
              <p className="text-[#555] text-sm leading-relaxed max-w-3xl">
                Chúng tôi đã kết hợp hệ thống quản trị nội dung trực quan giúp chỉnh sửa đầu trang, chân trang, trang chủ và các bài viết chia sẻ, cùng với hệ thống CRM tinh gọn để theo dõi tiến trình của từng học viên dã ngoại, cắm trại, sinh tồn một cách bảo mật cao.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#eee]">
                <div>
                  <h4 className="font-bold text-[#23282d] text-sm">Bắt đầu nhanh</h4>
                  <div className="mt-2 space-y-2 text-xs text-[#0073aa]">
                    <button onClick={() => { setActiveAdminTab('posts'); setIsEditingArticle(true); }} className="block hover:underline cursor-pointer">✍️ Viết bài viết chia sẻ kỹ năng mới</button>
                    <button onClick={() => { setActiveAdminTab('projects'); }} className="block hover:underline cursor-pointer">🏕️ Đăng chương trình dã ngoại mới</button>
                    <button onClick={() => setActiveAdminTab('appearance')} className="block hover:underline cursor-pointer">🎨 Thay đổi Headline & Banner trang chủ</button>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-[#23282d] text-sm">Quản lý nội dung hiện tại</h4>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <p>📂 {news.length} bài viết chia sẻ & video phương pháp</p>
                    <p>📄 {cms?.pages.length || 0} trang tĩnh (Giới thiệu, Liên hệ)</p>
                    <p>🏕️ {projects.length} dự án dã ngoại đang hiển thị</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-[#23282d] text-sm">Chỉ số CRM</h4>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <p>🧑‍🎓 {stats.studentCount} học viên dã ngoại đã theo dõi học bạ</p>
                    <p>🏢 {stats.corporateCount} doanh nghiệp/trường học kết nối</p>
                    <p>💰 Doanh thu: <span className="font-bold text-emerald-600 font-mono">{stats.totalRevenue.toLocaleString('vi-VN')} VNĐ</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-mono tracking-wider">Tổng doanh thu</span>
                  <p className="text-xl font-bold font-mono text-[#23282d] mt-1">{(stats.totalRevenue).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
              </div>
              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-mono tracking-wider">Học viên dã ngoại</span>
                  <p className="text-xl font-bold font-mono text-[#23282d] mt-1">{stats.studentCount} trẻ</p>
                </div>
                <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600"><Users className="h-5 w-5" /></div>
              </div>
              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-mono tracking-wider">Sự kiện doanh nghiệp</span>
                  <p className="text-xl font-bold font-mono text-[#23282d] mt-1">{stats.corporateCount} hợp đồng</p>
                </div>
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><CheckCircle className="h-5 w-5" /></div>
              </div>
              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-mono tracking-wider">Bài viết tin tức</span>
                  <p className="text-xl font-bold font-mono text-[#23282d] mt-1">{news.length} bài đăng</p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600"><FileText className="h-5 w-5" /></div>
              </div>
            </div>

            {/* Recent activity list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg space-y-3">
                <h3 className="font-serif text-base text-[#23282d] border-b pb-2">Lịch sử giao dịch CRM mới nhất</h3>
                <div className="space-y-3 text-xs">
                  {stats.transactions.map((txn, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{txn.clientName} ({txn.type})</p>
                        <p className="text-slate-400 text-[10px]">{txn.description}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-800">{txn.amount.toLocaleString('vi-VN')}đ</span>
                        <p className="text-[9px] text-emerald-600 font-bold">{txn.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#ccd0d4] p-5 shadow-sm rounded-lg space-y-3">
                <h3 className="font-serif text-base text-[#23282d] border-b pb-2">Học viên dã ngoại cập nhật gần đây</h3>
                <div className="space-y-3 text-xs">
                  {parents.slice(0, 3).map((parent, pIdx) => (
                    <div key={pIdx} className="space-y-1 py-1 border-b border-dashed border-slate-100">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Học viên: {parent.children[0].studentName}</span>
                        <span className="text-[10px] font-mono text-orange-500 font-normal">SĐT: {parent.parentPhone}</span>
                      </div>
                      {parent.children[0].progressLog && parent.children[0].progressLog.length > 0 ? (
                        <p className="text-slate-500 italic truncate">
                          🎯 {parent.children[0].progressLog[0].skillName}: {parent.children[0].progressLog[0].notes}
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">Chưa cập nhật đánh giá học bạ kỹ năng dã ngoại.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. POSTS (BAI VIET TIN TUC / VIDEO) TAB */}
        {activeAdminTab === 'posts' && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span>Quản lý Bài viết & Video chia sẻ (Posts Manager)</span>
                </h2>
                <p className="text-slate-400 text-xs">Soạn thảo, đăng tải và phân loại bài viết chia sẻ kỹ năng, dã ngoại, cắm trại cho phụ huynh.</p>
              </div>
              <button
                onClick={() => {
                  setIsEditingArticle(!isEditingArticle);
                  setArticleForm({
                    title: '',
                    excerpt: '',
                    content: '',
                    category: 'Phương pháp giáo dục',
                    type: 'article',
                    mediaUrl: '',
                    author: 'Chuyên gia KynangCK'
                  });
                }}
                className="bg-[#0073aa] hover:bg-[#006291] text-white text-xs px-3 py-2 rounded font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isEditingArticle ? 'Xem danh sách bài đăng' : 'Viết bài viết mới'}</span>
              </button>
            </div>

            {articleSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded font-bold">
                ✓ Bài viết dã ngoại đã được cập nhật và xuất bản trực tuyến thành công!
              </div>
            )}

            {isEditingArticle ? (
              /* ARTICLE WRITING FORM */
              <form onSubmit={handleSaveArticle} className="space-y-4 max-w-4xl text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tiêu đề bài viết/video</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: Cẩm nang sơ cấp cứu khi con dã ngoại cùng KynangCK"
                      value={articleForm.title}
                      onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tác giả bài viết</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      value={articleForm.author}
                      onChange={e => setArticleForm({ ...articleForm, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Chuyên mục bài viết</label>
                    <select
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                      value={articleForm.category}
                      onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                    >
                      {Array.from(new Set([
                        ...(articleForm.type === 'image'
                          ? (localPostTree["Hình ảnh"] || cms?.postCategoryTree?.["Hình ảnh"] || defaultPostCategoryTree["Hình ảnh"])
                          : articleForm.type === 'video'
                          ? (localPostTree["Video"] || cms?.postCategoryTree?.["Video"] || defaultPostCategoryTree["Video"])
                          : (localPostTree["Bài viết"] || cms?.postCategoryTree?.["Bài viết"] || defaultPostCategoryTree["Bài viết"])),
                        articleForm.category
                      ])).filter(Boolean).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Định dạng nội dung</label>
                    <select
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                      value={articleForm.type}
                      onChange={e => setArticleForm({ ...articleForm, type: e.target.value as any })}
                    >
                      <option value="article">Văn bản chia sẻ (Article)</option>
                      <option value="image">Hình ảnh thực tế (Image)</option>
                      <option value="video">Video thực hành dã ngoại (YouTube Video)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Đường dẫn Video YouTube / Nguồn ảnh (nếu có)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: https://www.youtube.com/embed/gD6vWeD9X4E hoặc dán link Facebook Reels"
                      value={articleForm.mediaUrl}
                      onChange={e => setArticleForm({ ...articleForm, mediaUrl: e.target.value })}
                    />
                    {articleForm.type === 'video' && (
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        💡 Hỗ trợ: <strong>Link YouTube thường, Shorts, Facebook Reels, Facebook Video thường, hoặc mã nhúng &lt;iframe&gt;</strong> bất kỳ. Hệ thống tự động chuyển đổi thành mã chạy chuẩn.
                      </p>
                    )}
                    {articleForm.type === 'video' && articleForm.mediaUrl && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <p className="text-[10px] font-mono font-bold text-orange-700">✓ Link nhúng đã nhận dạng:</p>
                        <p className="text-[10px] font-mono text-slate-600 break-all bg-white p-1.5 border border-slate-100 rounded">
                          {parseVideoEmbedUrl(articleForm.mediaUrl)}
                        </p>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                          <iframe
                            src={parseVideoEmbedUrl(articleForm.mediaUrl)}
                            className="w-full h-full border-0"
                            title="Preview video general"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tóm tắt ngắn (Excerpt)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Mô tả tóm tắt ngắn khoảng 1-2 câu..."
                      value={articleForm.excerpt}
                      onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Thumbnail / Ảnh đại diện bài đăng (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                        placeholder="Nhập URL ảnh đại diện cho bài viết..."
                        value={articleForm.thumbnailUrl}
                        onChange={e => setArticleForm({ ...articleForm, thumbnailUrl: e.target.value })}
                      />
                      {articleForm.thumbnailUrl && (
                        <img
                          src={articleForm.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-10 h-10 object-cover rounded border"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'; }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">Nội dung chi tiết bài viết (Hỗ trợ Markdown hoặc Builder)</label>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBuilderTarget('post');
                          setShowPuckBuilder(true);
                        }}
                        className="bg-[#5C7A3E] hover:bg-[#4A6431] text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>🎨 Puck Editor (React)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBuilderTarget('post');
                          setShowVisualBuilder(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-white" />
                        <span>✨ Elementor-CK</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Soạn thảo nội dung chia sẻ chi tiết ở đây..."
                    value={articleForm.content}
                    onChange={e => setArticleForm({ ...articleForm, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded cursor-pointer shadow-sm"
                  >
                    {articleForm.id ? 'Cập nhật bài viết' : 'Xuất bản bài viết'}
                  </button>
                </div>
              </form>
            ) : (
              /* ARTICLES LIST TABLE */
              <div className="space-y-4">
                {/* Category filter bar for Articles */}
                {(() => {
                  const articleTaxonomyCats = ['Tất cả', ...Array.from(new Set([
                    ...(localPostTree["Bài viết"] || defaultPostCategoryTree["Bài viết"]),
                    ...news.filter(art => art.type === 'article' || !art.type).map(art => art.category).filter(Boolean)
                  ]))];
                  const filteredArticlesList = news.filter(art => {
                    if (art.type && art.type !== 'article') return false;
                    if (selectedArticleCategoryFilter !== 'Tất cả' && art.category !== selectedArticleCategoryFilter) return false;
                    return true;
                  });

                  return (
                    <>
                      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-1">Lọc theo chuyên mục:</span>
                        {articleTaxonomyCats.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedArticleCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                              selectedArticleCategoryFilter === cat
                                ? 'bg-[#0073aa] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider">
                              <th className="p-3">Tiêu đề bài viết</th>
                              <th className="p-3">Tác giả</th>
                              <th className="p-3">Chuyên mục</th>
                              <th className="p-3">Loại bài đăng</th>
                              <th className="p-3">Ngày xuất bản</th>
                              <th className="p-3 text-right">Quản lý</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredArticlesList.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                  Không có bài viết nào thuộc chuyên mục này.
                                </td>
                              </tr>
                            ) : (
                              filteredArticlesList.map((art) => (
                                <tr key={art.id} className="border-b border-slate-100 hover:bg-slate-50 transition text-slate-700">
                                  <td className="p-3">
                                    <p className="font-bold text-[#0073aa] text-sm hover:underline cursor-pointer" onClick={() => handleEditArticleClick(art)}>
                                      {art.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{art.excerpt}</p>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-500">{art.author}</td>
                                  <td className="p-3">
                                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium border border-orange-100">
                                      {art.category}
                                    </span>
                                  </td>
                                  <td className="p-3 uppercase font-mono text-[10px] text-slate-400">
                                    {art.type === 'video' ? '📺 Video YouTube' : '📝 Văn bản'}
                                  </td>
                                  <td className="p-3 font-mono text-slate-400">{art.date}</td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        onClick={() => setPreviewArticle(art)}
                                        className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-slate-100 cursor-pointer"
                                        title="Xem bài viết ngoài Frontend"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleEditArticleClick(art)}
                                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-slate-100 cursor-pointer"
                                        title="Chỉnh sửa bài đăng"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteArticle(art.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                                        title="Xóa bài"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 3. PAGES (TRANG TINH WORDPRESS) TAB */}
        {activeAdminTab === 'pages' && cms && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <Files className="h-5 w-5 text-orange-500" />
                  <span>Quản lý Trang tĩnh</span>
                </h2>
                <p className="text-slate-400 text-xs">Chỉnh sửa nội dung các trang thông tin tĩnh như trang Liên hệ, Giới thiệu, các trang chính sách, điều khoản, bảo mật...</p>
              </div>
              <button
                onClick={() => {
                  setIsEditingPage(!isEditingPage);
                  setPageForm({ title: '', slug: '', content: '' });
                }}
                className="bg-[#0073aa] hover:bg-[#006291] text-white text-xs px-3 py-2 rounded font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isEditingPage ? 'Xem danh sách các trang' : 'Tạo trang mới'}</span>
              </button>
            </div>

            {pageSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded font-bold">
                ✓ Đã cập nhật nội dung trang tĩnh dã ngoại KynangCK thành công!
              </div>
            )}

            {isEditingPage ? (
              /* STATIC PAGE EDIT FORM */
              <form onSubmit={handleSavePage} className="space-y-4 max-w-4xl text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tiêu đề trang</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: Giới thiệu trung tâm dã ngoại KynangCK"
                      value={pageForm.title}
                      onChange={e => {
                        const title = e.target.value;
                        const slug = title.toLowerCase()
                          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        setPageForm({ ...pageForm, title, slug });
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Đường dẫn tĩnh (Slug URL)</label>
                    <div className="flex items-center border border-slate-300 rounded overflow-hidden">
                      <span className="bg-slate-100 text-slate-400 px-2 font-mono text-[10px]">{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/</span>
                      <input
                        type="text"
                        className="w-full p-2.5 focus:outline-none text-xs font-mono"
                        placeholder="about"
                        value={pageForm.slug}
                        onChange={e => setPageForm({ ...pageForm, slug: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">Nội dung văn bản chi tiết (Markdown hoặc Builder)</label>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBuilderTarget('page');
                          setShowPuckBuilder(true);
                        }}
                        className="bg-[#5C7A3E] hover:bg-[#4A6431] text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>🎨 Puck Editor (React)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBuilderTarget('page');
                          setShowVisualBuilder(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-white" />
                        <span>✨ Elementor-CK</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={12}
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Soạn thảo nội dung trang tĩnh..."
                    value={pageForm.content}
                    onChange={e => setPageForm({ ...pageForm, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingPage(false)}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded cursor-pointer shadow-sm"
                  >
                    Lưu trang tĩnh
                  </button>
                </div>
              </form>
            ) : (
              /* PAGES LIST TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider">
                      <th className="p-3">Tiêu đề trang</th>
                      <th className="p-3">Đường dẫn URL tĩnh (Slug)</th>
                      <th className="p-3">Ngày khởi tạo</th>
                      <th className="p-3 text-right">Quản lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cms.pages.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition text-slate-700">
                        <td className="p-3">
                          <p className="font-bold text-[#0073aa] text-sm hover:underline cursor-pointer" onClick={() => handleEditPageClick(p)}>
                            {p.title}
                          </p>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/{p.slug}</td>
                        <td className="p-3 font-mono text-slate-400">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setPreviewPage(p)}
                              className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-slate-100 cursor-pointer"
                              title="Xem trang ngoài Frontend"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditPageClick(p)}
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-slate-100 cursor-pointer"
                              title="Sửa trang"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePage(p.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                              title="Xóa trang"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. PROJECTS (COURSES/KHÓA DÃ NGOẠI) TAB */}
        {activeAdminTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-orange-500" />
                    <span>Quản lý CPT Dự Án & Khóa Dã Ngoại (Projects CPT Manager)</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Mỗi dự án là một Custom Post Type độc lập với giao diện hình ảnh, thông số độ tuổi, trạng thái, địa điểm và các gói dịch vụ trực quan.
                  </p>
                </div>
                <div>
                  {!isEditingProject ? (
                    <button
                      type="button"
                      onClick={() => {
                        resetProjectForm();
                        setIsEditingProject(true);
                        setEditingProjectId(null);
                      }}
                      className="bg-[#5C7A3E] hover:bg-[#4a6332] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm Dự Án Mới</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProject(false);
                        setEditingProjectId(null);
                        resetProjectForm();
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Quay lại danh sách CPT Dự Án</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Category Tabs & Subcategory Filter Bar */}
              {!isEditingProject && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {/* 4 Main Category Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase font-mono">
                        Danh mục cha:
                      </span>
                      {['Tất cả', 'Khóa Học', 'Trải Nghiệm', 'Sân Chơi', 'Cộng Đồng'].map((main) => {
                        const count = main === 'Tất cả'
                          ? projects.length
                          : projects.filter(p => {
                              const pMain = p.mainCategory || 'Khóa Học';
                              return pMain === main || (main === 'Khóa Học' && pMain === 'Khóa học') || p.category?.toLowerCase().includes(main.toLowerCase());
                            }).length;

                        const isActive = selectedProjMainTab === main || (selectedProjMainTab === 'Khóa học' && main === 'Khóa Học');
                        return (
                          <button
                            key={main}
                            type="button"
                            onClick={() => {
                              setSelectedProjMainTab(main);
                              setSelectedProjSubFilter('Tất cả');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                              isActive
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                            }`}
                          >
                            <span>
                              {main === 'Tất cả'
                                ? '📁 Tất cả'
                                : main === 'Khóa Học'
                                ? '🎓 Khóa Học'
                                : main === 'Trải Nghiệm'
                                ? '🏕️ Trải Nghiệm'
                                : main === 'Sân Chơi'
                                ? '🎯 Sân Chơi'
                                : '🤝 Cộng Đồng'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subcategory Filter Buttons */}
                  {(() => {
                    let availableSubs: string[] = [];
                    if (selectedProjMainTab === 'Tất cả') {
                      (Object.values(localProjectTree) as string[][]).forEach(subs => {
                        subs.forEach(s => { if (!availableSubs.includes(s)) availableSubs.push(s); });
                      });
                    } else {
                      availableSubs = [...(localProjectTree[selectedProjMainTab] || [])];
                    }
                    
                    // Collect any subcategories present in actual project items
                    projects.forEach(p => {
                      if (selectedProjMainTab === 'Tất cả' || p.mainCategory === selectedProjMainTab || p.category?.toLowerCase().includes(selectedProjMainTab.toLowerCase())) {
                        if (p.subCategory && !availableSubs.includes(p.subCategory)) {
                          availableSubs.push(p.subCategory);
                        }
                      }
                    });

                    if (availableSubs.length === 0) return null;

                    return (
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 text-xs pt-1">
                        <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase font-mono">
                          Lọc con:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedProjSubFilter('Tất cả')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            selectedProjSubFilter === 'Tất cả'
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          Tất cả danh mục con
                        </button>
                        {availableSubs.map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setSelectedProjSubFilter(sub)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              selectedProjSubFilter === sub
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* VISUAL CPT PROJECTS GRID */}
              {!isEditingProject && (
                <div>
                  {(() => {
                    const filteredProjects = projects.filter(proj => {
                      if (selectedProjMainTab !== 'Tất cả') {
                        const pMain = proj.mainCategory || (proj.category ? proj.category.split('»')[0].trim() : '');
                        const isMainMatch = pMain === selectedProjMainTab ||
                                           proj.category?.toLowerCase().includes(selectedProjMainTab.toLowerCase());
                        if (!isMainMatch) return false;
                      }
                      if (selectedProjSubFilter !== 'Tất cả') {
                        const pSub = proj.subCategory || (proj.category ? proj.category.split('»')[1]?.trim() : '');
                        const isSubMatch = pSub === selectedProjSubFilter ||
                                           proj.category?.toLowerCase().includes(selectedProjSubFilter.toLowerCase());
                        if (!isSubMatch) return false;
                      }
                      return true;
                    });

                    if (filteredProjects.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                          <Layers className="h-10 w-10 text-slate-300 mx-auto" />
                          <p className="font-bold text-slate-600 text-sm">Chưa có dự án nào thuộc danh mục "{selectedProjMainTab}" {selectedProjSubFilter !== 'Tất cả' ? `/ "${selectedProjSubFilter}"` : ''}</p>
                          <button
                            type="button"
                            onClick={() => { resetProjectForm(); setIsEditingProject(true); setEditingProjectId(null); }}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Tạo dự án mới ngay</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredProjects.map((proj) => (
                          <div
                            key={proj.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between overflow-hidden group"
                          >
                            {/* Thumbnail Container */}
                            <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                              <img
                                src={proj.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'}
                                alt={proj.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80';
                                }}
                              />

                              {/* Status Badge Top-Left */}
                              <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                                <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1 ${
                                  proj.status === 'sắp diễn ra'
                                    ? 'bg-amber-500 text-white'
                                    : proj.status === 'đang thực hiện'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 text-white'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>{proj.status}</span>
                                </span>
                              </div>

                              {/* Age Range Badge Top-Right */}
                              <div className="absolute top-3 right-3">
                                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                                  🎯 {proj.ageRange || 'Mọi độ tuổi'}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded font-mono truncate max-w-[200px]" title={proj.category}>
                                    📁 {proj.category || `${proj.mainCategory || 'Dự án'} » ${proj.subCategory || ''}`}
                                  </span>
                                  {proj.duration && (
                                    <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                      ⏱️ {proj.duration}
                                    </span>
                                  )}
                                </div>

                                <h4
                                  onClick={() => handleEditProjectClick(proj)}
                                  className="font-bold text-slate-800 text-sm hover:text-[#0073aa] cursor-pointer transition line-clamp-2 leading-snug"
                                  title="Nhấp để chỉnh sửa dự án này"
                                >
                                  {proj.title}
                                </h4>

                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                  {proj.description}
                                </p>
                              </div>

                              <div className="space-y-1.5 text-[11px] text-slate-500 border-t pt-2.5 border-slate-100 font-sans">
                                {proj.location && (
                                  <p className="flex items-center space-x-1 truncate text-slate-600" title={proj.location}>
                                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                    <span className="truncate">{proj.location}</span>
                                  </p>
                                )}
                                {proj.eventTime && (
                                  <p className="flex items-center space-x-1 truncate text-slate-400">
                                    <Calendar className="h-3 w-3 text-indigo-500 shrink-0" />
                                    <span>{proj.eventTime}</span>
                                  </p>
                                )}
                              </div>

                              {/* Bottom Action Footer */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">
                                  {proj.pricingPackages?.length || 0} Gói dịch vụ
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditProjectClick(proj)}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer text-xs flex items-center space-x-1 transition shadow-2xs"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Chỉnh sửa</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProject(proj.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1.5 rounded-lg cursor-pointer text-xs transition shadow-2xs"
                                    title="Xóa dự án này"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* EXPANDED PROJECT CREATING / EDITING FORM */}
            {isEditingProject && (
              <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
                <div className="border-b pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-[#23282d] flex items-center space-x-1.5">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      <span>{editingProjectId ? `Chỉnh Sửa Dự Án: ${newProj.title}` : 'Thêm / Xuất Bản Dự Án Dã Ngoại Mới'}</span>
                    </h3>
                    <p className="text-slate-400 text-xs">Quản lý đầy đủ danh mục Taxonomy (Khóa học / Trải Nghiệm / Sân Chơi / Cộng Đồng), Thời gian diễn ra, Chi tiết hành trình, Giá trị nhận được, FAQ và Các gói phí.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProject(false);
                      setEditingProjectId(null);
                      resetProjectForm();
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    ✕ Đóng form
                  </button>
                </div>

              <form onSubmit={handleCreateProject} className="space-y-6 text-xs">
                {/* 1. THÔNG TIN CƠ BẢN & PHÂN LOẠI TAXONOMY */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5 border-b pb-2">
                    <Layers className="h-4 w-4 text-orange-500" />
                    <span>1. Thông tin cơ bản & Phân loại Taxonomy Dự Án</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Tên dự án *</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Ví dụ: Chiến Binh Rừng Xanh - Sinh Tồn Dã Ngoại"
                        value={newProj.title}
                        onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Danh mục chính (Taxonomy Cha)</label>
                      <select
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        value={newProj.mainCategory}
                        onChange={e => {
                          const main = e.target.value;
                          const subs = localProjectTree[main] || [];
                          setNewProj({
                            ...newProj,
                            mainCategory: main,
                            subCategory: subs[0] || '',
                            category: `${main} » ${subs[0] || ''}`
                          });
                        }}
                      >
                        <option value="Khóa Học">Khóa Học</option>
                        <option value="Trải Nghiệm">Trải Nghiệm</option>
                        <option value="Sân Chơi">Sân Chơi</option>
                        <option value="Cộng Đồng">Cộng Đồng</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Danh mục con (Sub-category)</label>
                      <select
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        value={newProj.subCategory}
                        onChange={e => {
                          const sub = e.target.value;
                          setNewProj({
                            ...newProj,
                            subCategory: sub,
                            category: `${newProj.mainCategory} » ${sub}`
                          });
                        }}
                      >
                        {(localProjectTree[newProj.mainCategory] || localProjectTree[newProj.mainCategory === 'Khóa Học' ? 'Khóa học' : 'Khóa Học'] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Thời gian diễn ra</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Ví dụ: 15/08/2026 - 20/08/2026"
                        value={newProj.eventTime}
                        onChange={e => setNewProj({ ...newProj, eventTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Trạng thái ngoài Frontend</label>
                      <select
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white font-bold text-orange-700"
                        value={newProj.status}
                        onChange={e => setNewProj({ ...newProj, status: e.target.value as any })}
                      >
                        <option value="sắp diễn ra">Sắp Diễn Ra</option>
                        <option value="đang thực hiện">Đang Thực Hiện</option>
                        <option value="đã hoàn thành">Đã Hoàn Thành</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Độ tuổi phù hợp</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Ví dụ: 6 - 15 tuổi"
                        value={newProj.ageRange}
                        onChange={e => setNewProj({ ...newProj, ageRange: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Thời lượng trải nghiệm</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Ví dụ: 3 ngày 2 đêm"
                        value={newProj.duration}
                        onChange={e => setNewProj({ ...newProj, duration: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Địa điểm cắm trại / Học tập</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Ví dụ: Vườn Quốc Gia Cát Tiên, Đồng Nai"
                        value={newProj.location}
                        onChange={e => setNewProj({ ...newProj, location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Hình ảnh đại diện (Thumbnail)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        placeholder="Link URL hình ảnh"
                        value={newProj.imageUrl}
                        onChange={e => setNewProj({ ...newProj, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. MÔ TẢ NGẮN & CHI TIẾT HÀNH TRÌNH */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5 border-b pb-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <span>2. Mô tả ngắn & Chi tiết hành trình</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Mô tả ngắn (Mô tả tóm tắt dự án)</label>
                    <textarea
                      rows={2}
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                      placeholder="Nhập mô tả tóm tắt dự án..."
                      value={newProj.description}
                      onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block">Chi tiết hành trình (Đã dựng bởi Visual Page Builder hoặc nhập HTML/Nội dung)</label>
                      <div className="flex items-center space-x-1.5 mb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setBuilderTarget('project');
                            setShowPuckBuilder(true);
                          }}
                          className="bg-[#5C7A3E] hover:bg-[#4A6431] text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>🎨 Puck Editor (React)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBuilderTarget('project');
                            setShowVisualBuilder(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                          <span>✨ Elementor-CK</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white font-mono"
                      placeholder="Chi tiết hành trình 3 ngày 2 đêm..."
                      value={newProj.journeyDetails}
                      onChange={e => setNewProj({ ...newProj, journeyDetails: e.target.value })}
                    />
                  </div>
                </div>

                {/* 3. GIÁ TRỊ HỌC VIÊN NHẬN ĐƯỢC */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>3. Giá trị học viên nhận được (Learner Values)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setLearnerValues([...learnerValues, { text: '' }])}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Thêm giá trị</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {learnerValues.map((lv, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400 text-xs font-bold w-5">#{idx + 1}</span>
                        <input
                          type="text"
                          className="flex-grow border border-slate-300 p-2 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
                          placeholder="Ví dụ: Rèn luyện kỹ năng sinh tồn thực tế"
                          value={lv.text}
                          onChange={e => {
                            const updated = [...learnerValues];
                            updated[idx] = { ...updated[idx], text: e.target.value };
                            setLearnerValues(updated);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setLearnerValues(learnerValues.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1 font-bold cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. GIẢI ĐÁP LO LẮNG PHỤ HUYNH (FAQ) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <HelpCircle className="h-4 w-4 text-indigo-600" />
                      <span>4. FAQ Giải đáp lo lắng phụ huynh</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setProjectFaqs([...projectFaqs, { question: '', answer: '' }])}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Thêm FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projectFaqs.map((faq, idx) => (
                      <div key={idx} className="bg-white p-3 border border-slate-200 rounded-lg space-y-2 relative">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                          <span>Câu hỏi FAQ #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setProjectFaqs(projectFaqs.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-2 rounded text-xs focus:outline-none focus:border-indigo-500 font-bold"
                          placeholder="Câu hỏi: Bé có cần tự chuẩn bị đồ dùng không?"
                          value={faq.question}
                          onChange={e => {
                            const updated = [...projectFaqs];
                            updated[idx] = { ...updated[idx], question: e.target.value };
                            setProjectFaqs(updated);
                          }}
                        />
                        <textarea
                          rows={2}
                          className="w-full border border-slate-300 p-2 rounded text-xs focus:outline-none focus:border-indigo-500"
                          placeholder="Trả lời: BTC sẽ phát toàn bộ bộ kit sinh tồn cho bé..."
                          value={faq.answer}
                          onChange={e => {
                            const updated = [...projectFaqs];
                            updated[idx] = { ...updated[idx], answer: e.target.value };
                            setProjectFaqs(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. CẤU HÌNH STICKY SIDEBAR PHẢI & GÓI HỌC PHÍ / DỊCH VỤ */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5 border-b pb-2">
                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                    <span>5. Cấu hình Right Sidebar & Gói Học Bổng / Dịch Vụ</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Tiêu đề Sidebar chọn gói</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded text-xs bg-white"
                        value={sidebarConfig.title}
                        onChange={e => setSidebarConfig({ ...sidebarConfig, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Mô tả phụ dưới tiêu đề (Căn giữa)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded text-xs bg-white"
                        value={sidebarConfig.subtitle}
                        onChange={e => setSidebarConfig({ ...sidebarConfig, subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Tiêu đề Khối An Tâm</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded text-xs bg-white"
                        value={sidebarConfig.trustTitle}
                        onChange={e => setSidebarConfig({ ...sidebarConfig, trustTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Mô tả Khối An Tâm</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2.5 rounded text-xs bg-white"
                        value={sidebarConfig.trustDescription}
                        onChange={e => setSidebarConfig({ ...sidebarConfig, trustDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Pricing packages list */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-800 text-xs">Các gói dịch vụ & giá học phí:</label>
                      <button
                        type="button"
                        onClick={() => setPricingPkgs([...pricingPkgs, { id: `pkg-${Date.now()}`, name: 'Gói mới', price: 2000000, description: 'Mô tả gói mới', benefits: ['Quyền lợi 1'] }])}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Thêm gói mới</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {pricingPkgs.map((pkg, pIdx) => (
                        <div key={pkg.id || pIdx} className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-3 relative">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                            <span>Gói dịch vụ #{pIdx + 1}</span>
                            {pricingPkgs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPricingPkgs(pricingPkgs.filter((_, i) => i !== pIdx))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">Tên gói *</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 p-2 rounded text-xs font-bold"
                                value={pkg.name}
                                onChange={e => {
                                  const updated = [...pricingPkgs];
                                  updated[pIdx].name = e.target.value;
                                  setPricingPkgs(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">Giá tiền (VNĐ) *</label>
                              <input
                                type="number"
                                className="w-full border border-slate-300 p-2 rounded text-xs font-bold font-mono text-orange-600"
                                value={pkg.price}
                                onChange={e => {
                                  const updated = [...pricingPkgs];
                                  updated[pIdx].price = Number(e.target.value) || 0;
                                  setPricingPkgs(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">Mô tả ngắn gói</label>
                              <input
                                type="text"
                                className="w-full border border-slate-300 p-2 rounded text-xs"
                                value={pkg.description}
                                onChange={e => {
                                  const updated = [...pricingPkgs];
                                  updated[pIdx].description = e.target.value;
                                  setPricingPkgs(updated);
                                }}
                              />
                            </div>
                          </div>

                          {/* Benefits of package */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[10px] font-bold text-slate-500">Danh sách quyền lợi đặc quyền:</label>
                            {(pkg.benefits || []).map((ben, bIdx) => (
                              <div key={bIdx} className="flex items-center space-x-1.5">
                                <span className="text-emerald-500 font-bold text-xs">✓</span>
                                <input
                                  type="text"
                                  className="flex-grow border border-slate-200 p-1.5 rounded text-xs bg-slate-50 focus:bg-white"
                                  value={ben}
                                  onChange={e => {
                                    const updated = [...pricingPkgs];
                                    const benefitsList = [...(updated[pIdx].benefits || [])];
                                    benefitsList[bIdx] = e.target.value;
                                    updated[pIdx].benefits = benefitsList;
                                    setPricingPkgs(updated);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...pricingPkgs];
                                    updated[pIdx].benefits = (updated[pIdx].benefits || []).filter((_, i) => i !== bIdx);
                                    setPricingPkgs(updated);
                                  }}
                                  className="text-red-400 hover:text-red-600 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...pricingPkgs];
                                updated[pIdx].benefits = [...(updated[pIdx].benefits || []), 'Quyền lợi mới'];
                                setPricingPkgs(updated);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] mt-1 cursor-pointer inline-block"
                            >
                              + Thêm quyền lợi cho gói này
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Landing Builder Section */}
                <div className="bg-[#f0f8ff] border border-[#bce0ff] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#004085] flex items-center space-x-1">
                        <Sparkles className="h-4 w-4" />
                        <span>Gemini 3.5 Flash Landing Page Optimizer</span>
                      </h4>
                      <p className="text-[#383d41] text-[10px]">Tự động viết Headline và FAQ thuyết phục, thúc đẩy chuyển đổi đăng ký.</p>
                    </div>
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={runAiLandingOptimization}
                      className="bg-[#0073aa] hover:bg-[#006291] disabled:bg-slate-400 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition flex items-center space-x-1"
                    >
                      {isAiGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      <span>{isAiGenerating ? 'AI Đang suy nghĩ...' : 'Tối ưu hóa Landing Page'}</span>
                    </button>
                  </div>

                  {aiStatusMessage && (
                    <p className="text-[10px] font-mono text-indigo-700 animate-pulse">{aiStatusMessage}</p>
                  )}

                  {aiLandingConfig && (
                    <div className="bg-white border rounded-xl p-3 space-y-2 text-slate-600">
                      <p className="font-bold text-[11px] text-emerald-600">✓ Đã thiết kế cấu hình Landing Page AI:</p>
                      <p><strong>Tiêu đề:</strong> {aiLandingConfig.headline}</p>
                      <p><strong>Mô tả phụ:</strong> {aiLandingConfig.subheadline}</p>
                      <p><strong>Giá trị đạt được:</strong> {aiLandingConfig.keyTakeaways?.join(' • ')}</p>
                    </div>
                  )}
                </div>

                {/* Submit bar */}
                <div className="flex justify-end space-x-2 pt-2">
                  {isEditingProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProject(false);
                        setEditingProjectId(null);
                        resetProjectForm();
                      }}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm text-xs"
                  >
                    {isEditingProject ? '✓ Cập nhật Chương Trình Dã Ngoại' : '✓ Xuất bản Chương Trình Dã Ngoại'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

        {/* 4.1 IMAGES MEDIA LIBRARY TAB */}
        {activeAdminTab === 'images' && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-orange-500" />
                  <span>Thư viện Hình ảnh dã ngoại (Media Library)</span>
                </h2>
                <p className="text-slate-400 text-xs">Quản lý toàn bộ hình ảnh thực tế học sinh trải nghiệm học tập, dã ngoại sinh tồn KynangCK.</p>
              </div>
              <button
                onClick={() => {
                  setIsEditingImage(!isEditingImage);
                  setImageForm({
                    title: '',
                    category: (localPostTree["Hình ảnh"] || defaultPostCategoryTree["Hình ảnh"])[0] || 'Hoạt động dã ngoại',
                    url: '',
                    content: ''
                  });
                }}
                className="bg-[#0073aa] hover:bg-[#006291] text-white text-xs px-3 py-2 rounded font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isEditingImage ? 'Xem thư viện ảnh' : 'Đăng hình ảnh mới'}</span>
              </button>
            </div>

            {imageSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded font-bold">
                ✓ Hình ảnh đã được cập nhật và lưu trữ vào thư viện thành công!
              </div>
            )}

            {isEditingImage ? (
              /* IMAGE EDIT / UPLOAD FORM */
              <form onSubmit={handleSaveImage} className="space-y-4 max-w-2xl text-xs bg-slate-50 p-5 rounded-xl border">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                  <ImageIcon className="h-4 w-4 text-orange-500" />
                  <span>{imageForm.id ? 'Cập nhật thông tin hình ảnh' : 'Thêm hình ảnh vào thư viện'}</span>
                </h3>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tiêu đề hình ảnh</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Ví dụ: Bé tập dựng lều chữ A tại bãi dã ngoại Đồng Nai"
                    value={imageForm.title}
                    onChange={e => setImageForm({ ...imageForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Danh mục hình ảnh</label>
                    <select
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                      value={imageForm.category}
                      onChange={e => setImageForm({ ...imageForm, category: e.target.value })}
                    >
                      {(localPostTree["Hình ảnh"] || defaultPostCategoryTree["Hình ảnh"]).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Đường dẫn hình ảnh (URL)</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Nhập link ảnh (ví dụ: https://images.unsplash.com/...)"
                      value={imageForm.url}
                      onChange={e => setImageForm({ ...imageForm, url: e.target.value })}
                    />
                  </div>
                </div>

                {imageForm.url && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block text-[10px]">Xem trước hình ảnh:</label>
                    <img
                      src={imageForm.url}
                      alt="Preview"
                      className="max-h-48 object-contain rounded-lg border bg-white p-1"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'; }}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mô tả ngắn về bức ảnh (không bắt buộc)</label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Bức ảnh này ghi lại khoảnh khắc các con tự lập chia nhau cắm trại dã ngoại..."
                    value={imageForm.content}
                    onChange={e => setImageForm({ ...imageForm, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingImage(false)}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded cursor-pointer"
                  >
                    Quay lại thư viện
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-5 py-2 rounded cursor-pointer shadow-sm"
                  >
                    {imageForm.id ? '✓ Cập nhật bức ảnh' : '✓ Lưu bức ảnh'}
                  </button>
                </div>
              </form>
            ) : (
              /* GRID OF IMAGES (MEDIA MANAGER) */
              <div className="space-y-4">
                {/* Taxonomy / Category filter bar */}
                {(() => {
                  const imageTaxonomyCats = ['Tất cả', ...Array.from(new Set([
                    ...(localPostTree["Hình ảnh"] || defaultPostCategoryTree["Hình ảnh"]),
                    ...news.filter(art => art.type === 'image').map(art => art.category)
                  ]))];
                  const filteredImagesList = news.filter(art => {
                    if (art.type !== 'image') return false;
                    if (selectedImageCategoryFilter !== 'Tất cả' && art.category !== selectedImageCategoryFilter) return false;
                    return true;
                  });

                  return (
                    <>
                      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-1">Lọc theo danh mục:</span>
                        {imageTaxonomyCats.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedImageCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                              selectedImageCategoryFilter === cat
                                ? 'bg-[#0073aa] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {filteredImagesList.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 font-medium text-xs">Không tìm thấy hình ảnh nào thuộc danh mục này!</p>
                          <p className="text-slate-400 text-[11px] mt-1">Hãy chọn danh mục khác hoặc bấm nút "Đăng hình ảnh mới".</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {filteredImagesList.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => {
                                setImageForm({
                                  id: img.id,
                                  title: img.title,
                                  category: img.category,
                                  url: img.mediaUrl || '',
                                  content: img.content || ''
                                });
                                setIsEditingImage(true);
                              }}
                              className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 transition hover:shadow-md"
                            >
                              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                <img
                                  src={img.mediaUrl || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'}
                                  alt={img.title}
                                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'; }}
                                />
                                <span className="absolute bottom-1.5 left-1.5 bg-slate-900/70 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase backdrop-blur-xs">
                                  {img.category}
                                </span>
                              </div>
                              <div className="p-2 text-xs">
                                <p className="font-bold text-slate-700 line-clamp-1 group-hover:text-orange-600 transition">
                                  {img.title}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Click để chỉnh sửa</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteArticle(img.id);
                                }}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                                title="Xóa ảnh này"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 4.2 VIDEOS EMBED MANAGEMENT TAB */}
        {activeAdminTab === 'videos' && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <VideoIcon className="h-5 w-5 text-orange-500" />
                  <span>Thư viện Video hướng dẫn & Chia sẻ (Video Manager)</span>
                </h2>
                <p className="text-slate-400 text-xs">Nhúng các video thực tế từ Youtube, Facebook, Tiktok hướng dẫn kỹ năng sống dã ngoại KynangCK.</p>
              </div>
              <button
                onClick={() => {
                  setIsEditingVideo(!isEditingVideo);
                  setVideoForm({
                    title: '',
                    category: cms?.postCategoryTree?.["Video"]?.[0] || 'Video thực hành',
                    mediaUrl: '',
                    excerpt: '',
                    content: ''
                  });
                }}
                className="bg-[#0073aa] hover:bg-[#006291] text-white text-xs px-3 py-2 rounded font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isEditingVideo ? 'Xem thư viện video' : 'Thêm video mới'}</span>
              </button>
            </div>

            {videoSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded font-bold">
                ✓ Video dã ngoại đã được cập nhật và lưu trữ thành công!
              </div>
            )}

            {isEditingVideo ? (
              /* VIDEO EDIT FORM */
              <form onSubmit={handleSaveVideo} className="space-y-4 max-w-2xl text-xs bg-slate-50 p-5 rounded-xl border">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                  <VideoIcon className="h-4 w-4 text-orange-500" />
                  <span>{videoForm.id ? 'Cập nhật thông tin Video' : 'Nhúng video mới vào thư viện'}</span>
                </h3>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tiêu đề Video</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Ví dụ: Bài thực hành thắt nút dây thuyền chài sinh tồn dã ngoại"
                    value={videoForm.title}
                    onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Danh mục video</label>
                    <select
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                      value={videoForm.category}
                      onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                    >
                      {(localPostTree["Video"] || defaultPostCategoryTree["Video"]).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Link mã nhúng (YouTube URL hoặc Iframe Embed)</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: https://www.youtube.com/embed/gD6vWeD9X4E hoặc dán link Facebook Reels"
                      value={videoForm.mediaUrl}
                      onChange={e => setVideoForm({ ...videoForm, mediaUrl: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      💡 Hỗ trợ: <strong>Link YouTube thường, Shorts, Facebook Reels, Facebook Video thường, hoặc mã nhúng &lt;iframe&gt;</strong> bất kỳ. Hệ thống tự động chuyển đổi thành mã chạy chuẩn.
                    </p>
                    {videoForm.mediaUrl && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <p className="text-[10px] font-mono font-bold text-orange-700">✓ Link nhúng đã nhận dạng:</p>
                        <p className="text-[10px] font-mono text-slate-600 break-all bg-white p-1.5 border border-slate-100 rounded">
                          {parseVideoEmbedUrl(videoForm.mediaUrl)}
                        </p>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                          <iframe
                            src={parseVideoEmbedUrl(videoForm.mediaUrl)}
                            className="w-full h-full border-0"
                            title="Preview video"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tóm tắt ngắn</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Tóm tắt ngắn gọn nội dung bài thực hành video..."
                    value={videoForm.excerpt}
                    onChange={e => setVideoForm({ ...videoForm, excerpt: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mô tả chi tiết / Ghi chú kỹ thuật</label>
                  <textarea
                    rows={4}
                    className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Ghi chú chi tiết hoặc mã markdown hướng dẫn cách thức thắt nút thuyền chài..."
                    value={videoForm.content}
                    onChange={e => setVideoForm({ ...videoForm, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingVideo(false)}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded cursor-pointer"
                  >
                    Quay lại thư viện
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-5 py-2 rounded cursor-pointer shadow-sm"
                  >
                    {videoForm.id ? '✓ Cập nhật video' : '✓ Lưu video'}
                  </button>
                </div>
              </form>
            ) : (
              /* GRID OF VIDEOS (MEDIA MANAGER) */
              <div className="space-y-4">
                {/* Taxonomy / Category filter bar */}
                {(() => {
                  const videoTaxonomyCats = ['Tất cả', ...Array.from(new Set([
                    ...(localPostTree["Video"] || defaultPostCategoryTree["Video"]),
                    ...news.filter(art => art.type === 'video').map(art => art.category)
                  ]))];
                  const filteredVideosList = news.filter(art => {
                    if (art.type !== 'video') return false;
                    if (selectedVideoCategoryFilter !== 'Tất cả' && art.category !== selectedVideoCategoryFilter) return false;
                    return true;
                  });

                  return (
                    <>
                      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-1">Lọc theo danh mục:</span>
                        {videoTaxonomyCats.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedVideoCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                              selectedVideoCategoryFilter === cat
                                ? 'bg-[#0073aa] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {filteredVideosList.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <VideoIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 font-medium text-xs">Không tìm thấy video nào thuộc danh mục này!</p>
                          <p className="text-slate-400 text-[11px] mt-1">Hãy chọn danh mục khác hoặc bấm nút "Thêm video mới".</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {filteredVideosList.map((vid) => (
                            <div
                              key={vid.id}
                              onClick={() => {
                                setVideoForm({
                                  id: vid.id,
                                  title: vid.title,
                                  category: vid.category,
                                  mediaUrl: vid.mediaUrl || '',
                                  excerpt: vid.excerpt || '',
                                  content: vid.content || ''
                                });
                                setIsEditingVideo(true);
                              }}
                              className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 transition hover:shadow-md flex flex-col justify-between"
                            >
                              <div className="aspect-video bg-black relative">
                                {vid.mediaUrl ? (
                                  <iframe
                                    src={parseVideoEmbedUrl(vid.mediaUrl)}
                                    className="w-full h-full pointer-events-none"
                                    title={vid.title}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                    <VideoIcon className="h-8 w-8" />
                                  </div>
                                )}
                                <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase backdrop-blur-xs">
                                  {vid.category}
                                </span>
                              </div>
                              <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                                <div>
                                  <p className="font-bold text-slate-700 line-clamp-1 group-hover:text-orange-600 transition">
                                    {vid.title}
                                  </p>
                                  <p className="text-slate-400 text-[10px] line-clamp-2 mt-1">{vid.excerpt}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">Click để chỉnh sửa</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteArticle(vid.id);
                                }}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                                title="Xóa video này"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 4.5 CATEGORIES MANAGEMENT TAB */}
        {activeAdminTab === 'categories' && cms && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#5C7A3E]" />
                <span>Quản lý Sơ đồ Danh mục hệ thống</span>
              </h2>
              <p className="text-slate-400 text-xs">Cấu hình cây thư mục phân cấp cha - con cho cả Bài viết (Post Category Tree) và Dự án/Chương trình (Project Category Tree).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              
              {/* POSTS CATEGORY TREE */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
                <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                  <FileText className="h-4 w-4 text-[#5C7A3E]" />
                  <span>Sơ đồ danh mục Bài viết & Custom Post Types</span>
                </h3>
                <p className="text-slate-400 text-[11px]">Đồng bộ 3 danh mục cha chính: <strong>Bài viết, Hình ảnh, Video</strong>. Bạn có thể thêm/bớt danh mục con cho từng loại CPT hoặc tạo nhánh cha mới.</p>

                <div className="space-y-4">
                  {Object.keys(localPostTree).map(parent => (
                    <div key={parent} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <span>📁 {parent}</span>
                          {parent === 'Bài viết' && <span className="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.5 rounded ml-1 font-mono">Main Posts</span>}
                          {parent === 'Hình ảnh' && <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded ml-1 font-mono">CPT Photos</span>}
                          {parent === 'Video' && <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded ml-1 font-mono">CPT Videos</span>}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Nhánh cha</span>
                          {!['Bài viết', 'Hình ảnh', 'Video'].includes(parent) && (
                            <button
                              type="button"
                              onClick={() => {
                                const { [parent]: _, ...rest } = localPostTree;
                                setLocalPostTree(rest);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                              title="Xóa nhánh cha này"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subcategories list */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {(localPostTree[parent] || []).length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">Chưa có danh mục con</span>
                        ) : (
                          (localPostTree[parent] || []).map(sub => (
                            <span key={sub} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-1 rounded-md font-medium flex items-center space-x-1">
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePostSubcategory(parent, sub)}
                                className="text-red-500 hover:text-red-700 font-bold ml-1 hover:scale-110 transition cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add subcategory input */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <input
                          type="text"
                          placeholder={`Thêm danh mục con cho ${parent}...`}
                          className="border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-emerald-500 text-xs flex-grow focus:outline-none"
                          value={newPostSub[parent] || ''}
                          onChange={e => setNewPostSub({ ...newPostSub, [parent]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddPostSubcategory(parent)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-colors text-xs shrink-0"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new parent branch input for Posts / CPTs */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-700 text-[11px]">Tạo thêm nhánh danh mục cha mới:</p>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Ví dụ: Cẩm nang PDF, Podcast..."
                      className="border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-emerald-500 text-xs flex-grow focus:outline-none bg-white"
                      value={newPostParent}
                      onChange={e => setNewPostParent(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddPostParent}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-colors text-xs shrink-0"
                    >
                      + Thêm nhánh cha
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSavePostCategoryTree}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded cursor-pointer transition-colors text-xs shadow-sm flex items-center space-x-1"
                  >
                    <span>✓ Lưu sơ đồ danh mục Bài viết & CPT</span>
                  </button>
                </div>
              </div>

              {/* PROJECTS CATEGORY TREE */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
                <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                  <Layers className="h-4 w-4 text-[#5C7A3E]" />
                  <span>Sơ đồ danh mục Dự án dã ngoại</span>
                </h3>
                <p className="text-slate-400 text-[11px]">Hệ thống có các danh mục cha: <strong>Khóa Học, Trải Nghiệm, Sân Chơi, Cộng Đồng</strong>. Bạn có thể thêm/bớt danh mục con hoặc tạo nhánh cha mới.</p>

                <div className="space-y-4">
                  {Object.keys(localProjectTree).map(parent => (
                    <div key={parent} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>📁 {parent}</span>
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Nhánh cha</span>
                          {!['Khóa Học', 'Khóa học', 'Trải Nghiệm', 'Sân Chơi', 'Cộng Đồng'].includes(parent) && (
                            <button
                              type="button"
                              onClick={() => {
                                const { [parent]: _, ...rest } = localProjectTree;
                                setLocalProjectTree(rest);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                              title="Xóa nhánh cha này"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subcategories list */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {(localProjectTree[parent] || []).length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">Chưa có danh mục con</span>
                        ) : (
                          (localProjectTree[parent] || []).map(sub => (
                            <span key={sub} className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-1 rounded-md font-medium flex items-center space-x-1">
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveProjectSubcategory(parent, sub)}
                                className="text-amber-600 hover:text-amber-800 font-bold ml-1 hover:scale-110 transition cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add subcategory input */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <input
                          type="text"
                          placeholder={`Thêm danh mục con cho ${parent}...`}
                          className="border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-amber-500 text-xs flex-grow focus:outline-none"
                          value={newProjSub[parent] || ''}
                          onChange={e => setNewProjSub({ ...newProjSub, [parent]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddProjectSubcategory(parent)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded cursor-pointer transition-colors text-xs shrink-0"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new parent branch input for Projects */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-700 text-[11px]">Tạo thêm nhánh danh mục cha mới cho Dự án:</p>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Ví dụ: Workshop Cuối Tuần..."
                      className="border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-amber-500 text-xs flex-grow focus:outline-none bg-white"
                      value={newProjParent}
                      onChange={e => setNewProjParent(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddProjParent}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-colors text-xs shrink-0"
                    >
                      + Thêm nhánh cha
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProjectCategoryTree}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded cursor-pointer transition-colors text-xs shadow-sm flex items-center space-x-1"
                  >
                    <span>✓ Lưu sơ đồ danh mục Dự án</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. APPEARANCE (GIAO DIEN WP - HEADER/FOOTER/HOMEPAGE) TAB */}
        {activeAdminTab === 'appearance' && cms && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                <Palette className="h-5 w-5 text-orange-500" />
                <span>Thiết lập Giao diện Website (Appearance Settings)</span>
              </h2>
              <p className="text-slate-400 text-xs">Thay đổi tên thương hiệu KynangCK, logo, thông tin liên hệ ở chân trang và banner trang chủ dễ dàng giống cách vận hành của WordPress Customizer.</p>
            </div>

            {appearanceSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded font-bold">
                ✓ {appearanceSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* SECTION HEADER & HOME */}
              <div className="space-y-6">
                {/* WEB TITLE SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span>Cấu hình Tiêu đề & Thông tin Trang Web (Web Title Settings)</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tiêu đề tiêu chuẩn hệ thống (Web Title)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 font-bold text-slate-800"
                      value={siteTitle}
                      onChange={e => setSiteTitle(e.target.value)}
                      placeholder="Connect Kids - Kỹ Năng cho bé"
                    />
                    <p className="text-[10px] text-slate-400">Tiêu đề hiển thị ở thanh tiêu đề trình duyệt và thanh Header thương hiệu.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Mô tả ngắn trang web & Chân trang (SEO / Footer Description)</label>
                    <textarea
                      rows={3}
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                      value={siteDescription}
                      onChange={e => setSiteDescription(e.target.value)}
                      placeholder="Mô tả ngắn trang web..."
                    />
                    <p className="text-[10px] text-slate-400">Mô tả tóm tắt hiển thị ở chân trang (Footer) và mô tả trang chủ khi chia sẻ link mạng xã hội (Facebook, Zalo, app chat).</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Đường dẫn Icon Favicon (Favicon URL)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 text-xs text-slate-800"
                        value={faviconUrl}
                        onChange={e => setFaviconUrl(e.target.value)}
                        placeholder="https://i.ibb.co/LDd2ggmC/logo-kynangck.webp"
                      />
                      {faviconUrl && (
                        <img
                          src={faviconUrl}
                          alt="Favicon preview"
                          className="h-8 w-8 object-contain rounded border border-slate-200 bg-white p-0.5 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">Biểu tượng nhãn tab trình duyệt (.webp / .png / .ico).</p>
                  </div>

                  <button
                    onClick={handleSaveSiteTitle}
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-3 py-1.5 rounded cursor-pointer transition shadow-sm text-xs"
                  >
                    ✓ Lưu Web Title & Cấu hình Trang
                  </button>
                </div>

                {/* HEAD SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span>Cấu hình Đầu trang (Header Customizer)</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tên thương hiệu (Brand Name)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={headerForm.brandName}
                      onChange={e => setHeaderForm({ ...headerForm, brandName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Địa chỉ Logo hình ảnh (URL)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      placeholder="Dán URL logo thương hiệu (Ví dụ: https://ibb.co/JWjMppVz)"
                      value={headerForm.logoUrl}
                      onChange={e => setHeaderForm({ ...headerForm, logoUrl: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleSaveHeaderSettings}
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Lưu cấu hình Header
                  </button>
                </div>

                {/* SUPPORT CTA BOX SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <HelpCircle className="h-4 w-4 text-emerald-600" />
                    <span>Cấu hình "Cần Hỗ Trợ Trực Tiếp?" (Thư Viện CTA)</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">Nội dung ô kêu gọi hành động hiển thị ở cuối bài viết trong Thư viện.</p>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Tiêu đề ô hỗ trợ</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                        value={supportCtaForm.title}
                        onChange={e => setSupportCtaForm({ ...supportCtaForm, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Mô tả ngắn</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                        value={supportCtaForm.description}
                        onChange={e => setSupportCtaForm({ ...supportCtaForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Nút bấm Label</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                          value={supportCtaForm.buttonText}
                          onChange={e => setSupportCtaForm({ ...supportCtaForm, buttonText: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Chuyển sang Tab (Link)</label>
                        <select
                          className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 bg-white"
                          value={supportCtaForm.buttonLink}
                          onChange={e => setSupportCtaForm({ ...supportCtaForm, buttonLink: e.target.value })}
                        >
                          <option value="home">Trang chủ (home)</option>
                          <option value="projects-list">Dự Án (projects-list)</option>
                          <option value="hub">Thư Viện (hub)</option>
                          <option value="parent-portal">Phụ Huynh (parent-portal)</option>
                          <option value="corporate-portal">Hợp Tác (corporate-portal)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSupportCta}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    ✓ Lưu cấu hình Khung Hỗ Trợ
                  </button>
                </div>

                {/* MENU DESIGNER SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Layers className="h-4 w-4 text-orange-500" />
                    <span>Thiết kế Thanh Menu Header (Menu Builder)</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">Chọn các trang thông tin hoặc tính năng sẽ xuất hiện trên thanh điều hướng đầu trang và thay đổi thứ tự sắp xếp của chúng.</p>
                  
                  {/* Current menu items */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">Thứ tự Menu hiện tại:</p>
                    {headerForm.menuItems.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">Chưa cấu hình menu. Sẽ sử dụng menu mặc định.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {headerForm.menuItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm space-x-2">
                            <div className="flex-grow flex items-center space-x-2">
                              <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded truncate max-w-[80px]">{item.tab}</span>
                              <input
                                type="text"
                                className="border-b border-slate-200 focus:border-orange-500 focus:outline-none p-0.5 font-sans font-bold text-slate-800 text-xs w-28"
                                value={item.label}
                                onChange={e => {
                                  const updated = [...headerForm.menuItems];
                                  updated[index].label = e.target.value;
                                  setHeaderForm({ ...headerForm, menuItems: updated });
                                }}
                                placeholder="Tên hiển thị"
                              />
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => {
                                  if (index === 0) return;
                                  const updated = [...headerForm.menuItems];
                                  const temp = updated[index];
                                  updated[index] = updated[index - 1];
                                  updated[index - 1] = temp;
                                  setHeaderForm({ ...headerForm, menuItems: updated });
                                }}
                                className="p-1 hover:bg-slate-100 text-slate-500 rounded disabled:opacity-30 cursor-pointer font-bold text-[10px]"
                                title="Di chuyển lên"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={index === headerForm.menuItems.length - 1}
                                onClick={() => {
                                  if (index === headerForm.menuItems.length - 1) return;
                                  const updated = [...headerForm.menuItems];
                                  const temp = updated[index];
                                  updated[index] = updated[index + 1];
                                  updated[index + 1] = temp;
                                  setHeaderForm({ ...headerForm, menuItems: updated });
                                }}
                                className="p-1 hover:bg-slate-100 text-slate-500 rounded disabled:opacity-30 cursor-pointer font-bold text-[10px]"
                                title="Di chuyển xuống"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = headerForm.menuItems.filter((_, idx) => idx !== index);
                                  setHeaderForm({ ...headerForm, menuItems: updated });
                                }}
                                className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded cursor-pointer font-bold text-[10px]"
                                title="Xóa bỏ"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add item selector */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="font-bold text-slate-700 mb-1">Thêm mục vào Menu:</p>
                    <div className="flex space-x-2">
                      <select
                        id="select-add-menu-item"
                        className="flex-grow border border-slate-300 p-1.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Chọn Trang/Liên kết để thêm --</option>
                        <option value="home|Trang chủ">Trang chủ</option>
                        <option value="projects-list|Dự Án">Dự Án (Danh sách dự án)</option>
                        <option value="game|Trò Chơi">Trò Chơi (Sân chơi Kỹ năng)</option>
                        <option value="hub|Thư Viện">Thư Viện (Tin tức & Video)</option>
                        <option value="parent-portal|Phụ Huynh">Phụ Huynh (Cổng tra cứu CRM)</option>
                        <option value="corporate-portal|Hợp Tác">Hợp Tác (Dành cho Trường học & Doanh nghiệp)</option>
                        {/* Dynamic Pages from Single Source of Truth cms.pages */}
                        {cms.pages.map(p => (
                          <option key={p.id} value={`page-${p.slug}|${p.title}`}>
                            Trang tĩnh: {p.title} ({p.slug})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const selectEl = document.getElementById('select-add-menu-item') as HTMLSelectElement;
                          if (!selectEl || !selectEl.value) return;
                          const [tab, label] = selectEl.value.split('|');
                          
                          // Check if tab already exists in menuItems
                          if (headerForm.menuItems.some(item => item.tab === tab)) {
                            alert('Mục này đã tồn tại trong Menu!');
                            return;
                          }
                          
                          const updated = [...headerForm.menuItems, { label, tab }];
                          setHeaderForm({ ...headerForm, menuItems: updated });
                          selectEl.value = ''; // Reset select
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition text-xs flex-shrink-0"
                      >
                        Thêm mục
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const default4 = [
                            { label: 'Trang chủ', tab: 'home' },
                            { label: 'Trò Chơi', tab: 'game' },
                            { label: 'Thư Viện', tab: 'hub' },
                            { label: 'Phụ Huynh', tab: 'parent-portal' }
                          ];
                          setHeaderForm({ ...headerForm, menuItems: default4 });
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded cursor-pointer transition text-xs flex-shrink-0"
                        title="Khôi phục 4 mục mặc định"
                      >
                        Khôi phục Mặc định
                      </button>
                    </div>
                  </div>

                  {/* Save button for entire header schema including menu items */}
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={handleSaveHeaderSettings}
                      className="w-full bg-[#0073aa] hover:bg-[#006291] text-white font-bold py-2 rounded-lg cursor-pointer transition shadow-sm text-center"
                    >
                      Lưu Thiết Kế Thanh Menu & Header
                    </button>
                  </div>
                </div>

                {/* HOME SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Palette className="h-4 w-4 text-orange-500" />
                    <span>Thông tin Trang chủ (Homepage Banner)</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Headline chính của trang</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={homepageForm.headline}
                      onChange={e => setHomepageForm({ ...homepageForm, headline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tiêu đề phụ giải thích (Subheadline)</label>
                    <textarea
                      rows={2}
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={homepageForm.subheadline}
                      onChange={e => setHomepageForm({ ...homepageForm, subheadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Đường dẫn Banner dã ngoại chính (Banner URL)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={homepageForm.bannerUrl}
                      onChange={e => setHomepageForm({ ...homepageForm, bannerUrl: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleSaveHomepageSettings}
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Lưu cấu hình Trang chủ
                  </button>
                </div>
              </div>

              {/* SECTION FOOTER & CATEGORIES */}
              <div className="space-y-6">
                {/* FOOTER SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Settings className="h-4 w-4 text-orange-500" />
                    <span>Cấu hình Chân trang (Footer Customizer)</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Hotline liên hệ CRM</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={footerForm.hotline}
                      onChange={e => setFooterForm({ ...footerForm, hotline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Văn phòng đại diện</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={footerForm.officeAddress}
                      onChange={e => setFooterForm({ ...footerForm, officeAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Bãi cắm trại dã ngoại chính</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={footerForm.campAddress}
                      onChange={e => setFooterForm({ ...footerForm, campAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Dòng chữ bản quyền (Copyright)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500"
                      value={footerForm.copyright}
                      onChange={e => setFooterForm({ ...footerForm, copyright: e.target.value })}
                    />
                  </div>

                  {/* 4 Social Media Links */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <p className="font-bold text-slate-800 text-xs">Liên kết Mạng xã hội Chân trang (Zalo / Facebook / Youtube / Tiktok):</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px] text-[#0068FF]">Link Zalo</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                          placeholder="https://zalo.me/..."
                          value={footerForm.zaloUrl || ''}
                          onChange={e => setFooterForm({ ...footerForm, zaloUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px] text-[#1877F2]">Link Facebook</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-blue-500 text-xs"
                          placeholder="https://facebook.com/..."
                          value={footerForm.facebookUrl || ''}
                          onChange={e => setFooterForm({ ...footerForm, facebookUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px] text-[#FF0000]">Link Youtube</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-red-500 text-xs"
                          placeholder="https://youtube.com/c/..."
                          value={footerForm.youtubeUrl || ''}
                          onChange={e => setFooterForm({ ...footerForm, youtubeUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px] text-slate-900">Link Tiktok</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-slate-900 text-xs"
                          placeholder="https://tiktok.com/@..."
                          value={footerForm.tiktokUrl || ''}
                          onChange={e => setFooterForm({ ...footerForm, tiktokUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFooterSettings}
                    className="bg-[#0073aa] hover:bg-[#006291] text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Lưu cấu hình Footer
                  </button>
                </div>

                {/* THEME COLOR SETTINGS */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Palette className="h-4 w-4 text-emerald-600" />
                    <span>Bảng màu Giao diện & Thương hiệu</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">Thay đổi màu sắc chủ đạo của nút, liên kết và hình nền trên toàn bộ hệ thống dã ngoại công cộng.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nút bình thường</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.primaryColor}`}
                          onChange={e => setThemeForm({ ...themeForm, primaryColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.primaryColor}
                          onChange={e => setThemeForm({ ...themeForm, primaryColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nút đặc biệt/Thanh toán</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.accentColor}`}
                          onChange={e => setThemeForm({ ...themeForm, accentColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.accentColor}
                          onChange={e => setThemeForm({ ...themeForm, accentColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nền website</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.webBgColor}`}
                          onChange={e => setThemeForm({ ...themeForm, webBgColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.webBgColor}
                          onChange={e => setThemeForm({ ...themeForm, webBgColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nền thanh đầu trang</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.headerBgColor}`}
                          onChange={e => setThemeForm({ ...themeForm, headerBgColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.headerBgColor}
                          onChange={e => setThemeForm({ ...themeForm, headerBgColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Nền chân trang (Footer)</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.footerBgColor}`}
                          onChange={e => setThemeForm({ ...themeForm, footerBgColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.footerBgColor}
                          onChange={e => setThemeForm({ ...themeForm, footerBgColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Màu liên kết (Link Color)</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={`#${themeForm.linkColor}`}
                          onChange={e => setThemeForm({ ...themeForm, linkColor: e.target.value.replace('#', '') })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 font-mono text-center text-xs"
                          value={themeForm.linkColor}
                          onChange={e => setThemeForm({ ...themeForm, linkColor: e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '') })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveThemeSettings}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow-sm text-center font-sans text-xs"
                    >
                      ✓ Lưu Bảng Màu Hệ Thống
                    </button>
                  </div>
                </div>

                {/* B2B CORPORATE CMS CUSTOMIZER */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
                  <h3 className="font-bold text-slate-800 border-b pb-1.5 flex items-center space-x-1.5 text-sm">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span>Quản lý Nội dung Mục Hợp tác (B2B Content CMS)</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">Chỉnh sửa mọi tiêu đề, mô tả và nội dung các thẻ dịch vụ dành cho Tổ chức, Doanh nghiệp và Trường học.</p>

                  {/* Hero banner edits */}
                  <div className="space-y-2 border-b pb-3">
                    <h4 className="font-bold text-slate-700 text-xs">Phần đầu (Hero Banner)</h4>
                    <div className="space-y-1.5">
                      <label className="text-slate-600 font-medium text-[11px]">Tiêu đề chính (Hero Title)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                        value={corporateForm.heroTitle}
                        onChange={e => setCorporateForm({ ...corporateForm, heroTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 mt-1.5">
                      <label className="text-slate-600 font-medium text-[11px]">Tiêu đề phụ (Hero Subheadline)</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-300 p-2 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                        value={corporateForm.heroSub}
                        onChange={e => setCorporateForm({ ...corporateForm, heroSub: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Tabs content edits */}
                  <div className="space-y-3">
                    {/* Organization tab */}
                    <div className="space-y-2 border-b pb-3">
                      <h4 className="font-bold text-[#F08C3A] text-xs">Tab 1: Tổ chức & Đoàn thể</h4>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Tiêu đề thẻ</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.organization.title}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            organization: { ...corporateForm.organization, title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Mô tả chi tiết</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.organization.description}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            organization: { ...corporateForm.organization, description: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 1</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.organization.focusItems[0] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.organization.focusItems];
                            newItems[0] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              organization: { ...corporateForm.organization, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 2</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.organization.focusItems[1] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.organization.focusItems];
                            newItems[1] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              organization: { ...corporateForm.organization, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Nhãn nổi bật (Xanh lá)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.organization.highlightText}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            organization: { ...corporateForm.organization, highlightText: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    {/* Business tab */}
                    <div className="space-y-2 border-b pb-3">
                      <h4 className="font-bold text-[#F08C3A] text-xs">Tab 2: Doanh nghiệp</h4>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Tiêu đề thẻ</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.business.title}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            business: { ...corporateForm.business, title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Mô tả chi tiết</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.business.description}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            business: { ...corporateForm.business, description: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 1</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.business.focusItems[0] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.business.focusItems];
                            newItems[0] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              business: { ...corporateForm.business, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 2</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.business.focusItems[1] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.business.focusItems];
                            newItems[1] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              business: { ...corporateForm.business, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Nhãn nổi bật (Vàng cát)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.business.highlightText}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            business: { ...corporateForm.business, highlightText: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    {/* School tab */}
                    <div className="space-y-2 pb-3">
                      <h4 className="font-bold text-[#F08C3A] text-xs">Tab 3: Trường học</h4>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Tiêu đề thẻ</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.school.title}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            school: { ...corporateForm.school, title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Mô tả chi tiết</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.school.description}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            school: { ...corporateForm.school, description: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 1</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.school.focusItems[0] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.school.focusItems];
                            newItems[0] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              school: { ...corporateForm.school, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Điểm trọng tâm 2</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.school.focusItems[1] || ''}
                          onChange={e => {
                            const newItems = [...corporateForm.school.focusItems];
                            newItems[1] = e.target.value;
                            setCorporateForm({
                              ...corporateForm,
                              school: { ...corporateForm.school, focusItems: newItems }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-medium text-[11px]">Nhãn nổi bật (Cam nhạt)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-300 p-1.5 rounded focus:ring-1 focus:ring-orange-500 text-xs"
                          value={corporateForm.school.highlightText}
                          onChange={e => setCorporateForm({
                            ...corporateForm,
                            school: { ...corporateForm.school, highlightText: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveCorporateSettings}
                      className="w-full bg-[#F08C3A] hover:bg-[#d97c30] text-white font-bold py-2 rounded-lg cursor-pointer transition shadow-sm text-center font-sans text-xs"
                    >
                      ✓ Lưu Thiết Kế & Nội Dung Hợp Tác (B2B)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. CRM STUDENT PROGRESS TAB */}
        {activeAdminTab === 'crm' && (
          <div className="space-y-6">
            {/* PROGRESS LOG WRITING FORM */}
            <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-serif text-lg text-[#23282d] flex items-center space-x-1.5">
                  <ShieldCheck className="h-5 w-5 text-orange-500" />
                  <span>Cập nhật học bạ phát triển kỹ năng (CRM Student Ledger)</span>
                </h3>
                <p className="text-slate-400 text-xs">Cập nhật phản hồi từ huấn luyện viên dã ngoại về tiến độ học tập, tự lập của bé. Hệ thống tự động gửi thông báo email cho cha mẹ ngay sau khi lưu.</p>
              </div>

              <form onSubmit={handleUpdateStudentProgress} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border">
                    <label className="font-bold text-slate-700 block">A. Chọn phụ huynh học viên</label>
                    <select
                      className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white mt-1"
                      value={selectedParentId}
                      onChange={e => {
                        setSelectedParentId(e.target.value);
                        setSelectedChildIndex(0);
                      }}
                    >
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>{p.parentName} ({p.parentPhone})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border">
                    <label className="font-bold text-slate-700 block">B. Chọn bé học viên dã ngoại</label>
                    <select
                      className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white mt-1"
                      value={selectedChildIndex}
                      onChange={e => setSelectedChildIndex(Number(e.target.value))}
                    >
                      {selectedParent?.children.map((c, idx) => (
                        <option key={idx} value={idx}>{c.studentName} ({c.studentAge} tuổi)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border">
                    <label className="font-bold text-slate-700 block">C. Đánh giá rèn luyện</label>
                    <select
                      className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs bg-white mt-1"
                      value={newProgress.status}
                      onChange={e => setNewProgress({ ...newProgress, status: e.target.value as any })}
                    >
                      <option value="Đang rèn luyện">🎯 Đang rèn luyện</option>
                      <option value="Đã hoàn thành">🏆 Đã hoàn thành xuất sắc</option>
                      <option value="Chưa đạt">⚠️ Chưa đạt mục tiêu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tên kỹ năng rèn luyện (VD: Thắt nút lều hoang dã)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: Kỹ năng nhóm lửa dã chiến bằng đá lửa"
                      value={newProgress.skillName}
                      onChange={e => setNewProgress({ ...newProgress, skillName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Ghi chú cụ thể của HLV dã ngoại</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                      placeholder="Ví dụ: Bé thăng tiến nhanh, tự tin dẫn dắt nhóm chiến binh củi khô..."
                      value={newProgress.notes}
                      onChange={e => setNewProgress({ ...newProgress, notes: e.target.value })}
                    />
                  </div>
                </div>

                {progressSuccess && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2 text-xs text-emerald-800 rounded font-bold">
                    ✓ Đã cập nhật học bạ & gửi email thông báo tự động cho gia đình thành công!
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProgressUpdating}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer transition shadow-sm text-xs"
                  >
                    {isProgressUpdating ? 'Đang cập nhật CRM...' : 'Lưu học bạ & Gửi thông báo ngay'}
                  </button>
                </div>
              </form>
            </div>

            {/* REGISTERED PARENTS LIST DETAILS */}
            <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-4">
              <h3 className="font-serif text-lg text-[#23282d] border-b pb-2">Danh sách Phụ huynh & Tra cứu học bạ của trẻ</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wide">
                      <th className="py-2">Tên cha mẹ</th>
                      <th className="py-2">Thông tin liên hệ</th>
                      <th className="py-2">Tên các bé</th>
                      <th className="py-2">Chương trình học</th>
                      <th className="py-2 font-mono">Đã đóng</th>
                      <th className="py-2">Học bạ kỹ năng chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">{p.parentName}</td>
                        <td className="py-3 font-mono text-[11px] text-slate-500">
                          <p>📱 {p.parentPhone}</p>
                          <p>✉️ {p.parentEmail}</p>
                        </td>
                        <td className="py-3 font-semibold text-orange-600">
                          {p.children.map(c => `${c.studentName} (${c.studentAge}t)`).join(', ')}
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-slate-800">{p.packageName}</p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">ID: {p.registeredProjectId}</p>
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-600">{p.amountPaid.toLocaleString('vi-VN')}đ</td>
                        <td className="py-3 text-slate-500 max-w-[280px]">
                          {p.children.map((c, cIdx) => (
                            <div key={cIdx} className="bg-slate-100 p-2 rounded-lg border mt-1 text-[10px] space-y-1">
                              <p className="font-bold text-slate-700">{c.studentName}:</p>
                              {c.progressLog && c.progressLog.length > 0 ? (
                                c.progressLog.map((log, lIdx) => (
                                  <div key={lIdx} className="border-t border-slate-200 pt-1 mt-1 text-slate-600">
                                    <span className="font-bold">{log.skillName}</span> ({log.date}) - <span className="text-orange-500 font-bold">{log.status}</span>: <p className="italic text-[10px] text-slate-500 inline">{log.notes}</p>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-400 italic">Chưa rèn luyện kỹ năng nào.</span>
                              )}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. CRM CORPORATE / BUSINESS EVENTS TAB */}
        {activeAdminTab === 'corporate' && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span>Quản lý Đối Tác Doanh Nghiệp (Corporate Bookings Ledger)</span>
              </h2>
              <p className="text-slate-400 text-xs"> CRM tổng hợp các chủ doanh nghiệp, trường học, đoàn thể đặt dã ngoại team building cắm trại hoặc huấn luyện sinh tồn.</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-3">Tên Doanh nghiệp/Tổ chức</th>
                    <th className="py-3">Thông tin Người đại diện</th>
                    <th className="py-3">Chương trình trải nghiệm</th>
                    <th className="py-3 font-mono">Thành viên</th>
                    <th className="py-3 font-mono">Doanh thu tạm tính</th>
                    <th className="py-3">Hợp đồng</th>
                    <th className="py-3">Thanh toán</th>
                    <th className="py-3 text-right">Quản lý CRM</th>
                  </tr>
                </thead>
                <tbody>
                  {corporates.map((corp) => (
                    <tr key={corp.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition">
                      <td className="py-3 font-extrabold text-slate-900">{corp.corporateName}</td>
                      <td className="py-3 font-mono text-slate-500">
                        <p className="font-bold text-slate-700">{corp.contactPerson}</p>
                        <p className="text-[10px]">📱 {corp.contactPhone} • ✉️ {corp.contactEmail}</p>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">{corp.pricePackage}</td>
                      <td className="py-3 font-mono text-center font-bold text-slate-800">{corp.numberOfParticipants}</td>
                      <td className="py-3 font-mono font-bold text-emerald-600">{corp.amount.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          corp.status === 'Đã hoàn thành'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : corp.status === 'Đã lên lịch'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {corp.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          corp.paymentStatus === 'Đã thanh toán'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {corp.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right space-y-1">
                        {corp.status === 'Chờ duyệt' && (
                          <button
                            onClick={() => handleApproveCorporate(corp.id, 'Đã lên lịch')}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] px-2 py-1.5 rounded font-bold cursor-pointer transition block w-full text-center"
                          >
                            Duyệt hợp đồng
                          </button>
                        )}
                        {corp.paymentStatus === 'Chờ thanh toán' && (
                          <button
                            onClick={() => handleApproveCorporatePayment(corp.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-1.5 rounded font-bold cursor-pointer transition block w-full text-center shadow-sm"
                          >
                            Duyệt thanh toán
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. AUTOMATED NOTIFICATIONS LOGS TAB */}
        {activeAdminTab === 'notifications' && stats && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <span>Lịch sử gửi thông báo tự động (Automated Notifications Logs)</span>
                </h2>
                <p className="text-slate-400 text-xs">Mọi thông báo xác nhận thanh toán trực tuyến và cập nhật học bạ kỹ năng của trẻ em sẽ tự động gửi qua email và log lại đây để tránh thất thoát thông tin.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-200">AUTOMATION LOG ONLINE</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wide">
                    <th className="py-2">Thời gian gửi</th>
                    <th className="py-2">Người nhận</th>
                    <th className="py-2">Phân loại</th>
                    <th className="py-2">Tiêu đề thông báo</th>
                    <th className="py-2">Chi tiết nội dung đã gửi</th>
                    <th className="py-2 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.notifications.map((notif) => (
                    <tr key={notif.id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50">
                      <td className="py-3 font-mono text-[10px] text-slate-400">{new Date(notif.sentAt).toLocaleString('vi-VN')}</td>
                      <td className="py-3 font-bold">{notif.recipient}</td>
                      <td className="py-3 font-mono text-[10px] uppercase text-slate-400">{notif.type}</td>
                      <td className="py-3 font-semibold text-slate-800">{notif.title}</td>
                      <td className="py-3 text-slate-500 max-w-[320px] truncate" title={notif.content}>{notif.content}</td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-100">
                          {notif.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. PARENT FEEDBACKS TAB */}
        {activeAdminTab === 'feedbacks' && (
          <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-[#5C7A3E]" />
                  <span>Ý kiến & Góp ý từ Phụ huynh (Parent Feedback Panel)</span>
                </h2>
                <p className="text-slate-400 text-xs">Tổng hợp ý kiến đóng góp, phản hồi hoàn thiện và đánh giá sao từ phụ huynh gửi về từ frontend.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-200">ACTIVE CLIENT REVIEWS</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase tracking-wide">
                    <th className="py-2">Thời gian</th>
                    <th className="py-2">Phụ huynh</th>
                    <th className="py-2">Số điện thoại</th>
                    <th className="py-2 text-center">Đánh giá</th>
                    <th className="py-2">Ý kiến góp ý</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Chưa có ý kiến góp ý nào được gửi về.
                      </td>
                    </tr>
                  ) : (
                    feedbacks.map((fb) => (
                      <tr key={fb.id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50">
                        <td className="py-3 font-mono text-[10px] text-slate-400">
                          {new Date(fb.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 font-bold text-slate-800">{fb.parentName}</td>
                        <td className="py-3 font-mono text-slate-500">{fb.parentPhone || 'Chưa cung cấp'}</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center space-x-0.5 text-amber-500">
                            {Array.from({ length: fb.rating }).map((_, i) => (
                              <Sparkles key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 max-w-md break-words">{fb.content}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showVisualBuilder && (
        <VisualPageBuilder
          initialContent={builderTarget === 'post' ? articleForm.content : (builderTarget === 'project' ? newProj.journeyDetails : pageForm.content)}
          onSave={(compiledContent) => {
            if (builderTarget === 'post') {
              setArticleForm({ ...articleForm, content: compiledContent });
            } else if (builderTarget === 'page') {
              setPageForm({ ...pageForm, content: compiledContent });
            } else if (builderTarget === 'project') {
              setNewProj({ ...newProj, journeyDetails: compiledContent });
            }
            setShowVisualBuilder(false);
          }}
          onClose={() => setShowVisualBuilder(false)}
        />
      )}

      {showPuckBuilder && (
        <PuckEditorModal
          initialContent={builderTarget === 'post' ? articleForm.content : (builderTarget === 'project' ? newProj.journeyDetails : pageForm.content)}
          onSave={(compiledContent) => {
            if (builderTarget === 'post') {
              setArticleForm({ ...articleForm, content: compiledContent });
            } else if (builderTarget === 'page') {
              setPageForm({ ...pageForm, content: compiledContent });
            } else if (builderTarget === 'project') {
              setNewProj({ ...newProj, journeyDetails: compiledContent });
            }
            setShowPuckBuilder(false);
          }}
          onClose={() => setShowPuckBuilder(false)}
        />
      )}

      {/* FRONTEND LIVE PREVIEW MODAL FOR STATIC PAGE */}
      {previewPage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>Xem trang ngoài Frontend</span>
                    <span className="bg-emerald-500 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">Live Page</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/?page={previewPage.slug}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/?page=${previewPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Mở thẻ mới</span>
                </a>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-grow bg-slate-50">
              <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="border-b pb-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Trang Tĩnh CMS</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{previewPage.title}</h1>
                  <p className="text-xs text-slate-400 font-mono">Đường dẫn slug: /{previewPage.slug} • Khởi tạo: {new Date(previewPage.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>

                {previewPage.content.includes('<') ? (
                  <div className="prose max-w-none text-slate-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: previewPage.content }} />
                ) : (
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed text-sm sm:text-base">
                    {previewPage.content}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t flex justify-end shrink-0">
              <button
                onClick={() => setPreviewPage(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
              >
                Đóng cửa sổ xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FRONTEND LIVE PREVIEW MODAL FOR POST/ARTICLE */}
      {previewArticle && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500/20 text-orange-400 p-2 rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>Xem bài viết ngoài Frontend</span>
                    <span className="bg-orange-500 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">Live Article</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/?article={previewArticle.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/?article=${previewArticle.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
                  <span>Mở thẻ mới</span>
                </a>
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-grow bg-slate-50">
              <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="border-b pb-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                    {previewArticle.category || 'Tin Tức'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{previewArticle.title}</h1>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Tác giả: <strong className="text-slate-800">{previewArticle.author || 'Connect Kids Admin'}</strong></span>
                    <span>•</span>
                    <span>Ngày đăng: {previewArticle.date}</span>
                  </div>
                </div>

                {previewArticle.type === 'video' && previewArticle.mediaUrl && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <iframe
                      src={parseVideoEmbedUrl(previewArticle.mediaUrl)}
                      title={previewArticle.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {previewArticle.imageUrl && previewArticle.type !== 'video' && (
                  <img
                    src={previewArticle.imageUrl}
                    alt={previewArticle.title}
                    className="w-full max-h-[400px] object-cover rounded-2xl shadow-md"
                  />
                )}

                {previewArticle.content?.includes('<') ? (
                  <div className="prose max-w-none text-slate-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
                ) : (
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed text-sm sm:text-base">
                    {previewArticle.content || previewArticle.excerpt}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t flex justify-end shrink-0">
              <button
                onClick={() => setPreviewArticle(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
              >
                Đóng cửa sổ xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
