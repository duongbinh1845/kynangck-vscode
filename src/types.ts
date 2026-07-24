export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export interface StudentProgress {
  date: string;
  skillName: string;
  status: 'Chưa đạt' | 'Đang rèn luyện' | 'Đã hoàn thành';
  notes: string;
}

export interface Child {
  studentName: string;
  studentAge: number;
  progressLog: StudentProgress[];
}

export interface ParentCRM {
  id: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  children: Child[];
  registeredProjectId: string;
  packageName: string;
  amountPaid: number;
  paymentStatus: 'Đã thanh toán' | 'Chưa thanh toán';
  createdAt: string;
}

export interface CorporateCRM {
  id: string;
  corporateName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  eventType: 'Kỹ năng sinh tồn' | 'Kỹ năng cắm trại' | 'Team building tập thể' | 'Hoạt động trải nghiệm ngắn ngày';
  numberOfParticipants: number;
  status: 'Chờ duyệt' | 'Đã lên lịch' | 'Đã hoàn thành';
  pricePackage: string;
  amount: number;
  paymentStatus: 'Đã thanh toán' | 'Chờ thanh toán';
  createdAt: string;
}

export interface TransactionHistory {
  id: string;
  date: string;
  amount: number;
  clientName: string;
  type: 'Phụ huynh' | 'Doanh nghiệp';
  description: string;
  status: 'Thành công' | 'Thất bại' | 'Đang xử lý';
}

export interface AILandingConfig {
  headline: string;
  subheadline: string;
  description: string;
  keyTakeaways: string[];
  bannerColor: string;
  accentColor: string;
  faq: { question: string; answer: string }[];
}

export interface LearnerValue {
  id?: string;
  icon?: string;
  title?: string;
  text: string;
}

export interface ProjectFAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface SidebarConfig {
  title?: string;
  subtitle?: string;
  trustTitle?: string;
  trustDescription?: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'đang thực hiện' | 'đã hoàn thành' | 'sắp diễn ra';
  category: string;
  mainCategory?: string;
  subCategory?: string;
  eventTime?: string;
  description: string;
  imageUrl: string;
  ageRange: string;
  duration: string;
  location: string;
  journeyDetails?: string;
  learnerValues?: (LearnerValue | string)[];
  faqs?: ProjectFAQ[];
  sidebarConfig?: SidebarConfig;
  pricingPackages: PricingPackage[];
  aiLandingPage?: AILandingConfig;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: 'video' | 'article' | 'image';
  mediaUrl?: string; // YouTube embedding or video link
  thumbnailUrl?: string; // Article thumbnail/avatar
  date: string;
  author: string;
}

export interface NotificationLog {
  id: string;
  recipient: string;
  type: 'Email' | 'SMS';
  title: string;
  content: string;
  status: 'Đã gửi' | 'Chờ gửi';
  sentAt: string;
}

export interface CMSHeader {
  brandName: string;
  logoUrl?: string;
  menuItems: { label: string; tab: string }[];
}

export interface CMSFooter {
  campAddress: string;
  officeAddress: string;
  hotline: string;
  copyright: string;
  shortDescription?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

export interface CMSHomepage {
  headline: string;
  subheadline: string;
  bannerUrl: string;
}

export interface CMSStaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
}

export interface CMSTheme {
  primaryColor: string;
  accentColor: string;
  webBgColor: string;
  headerBgColor: string;
  footerBgColor: string;
  linkColor: string;
}

export interface CorporateTabContent {
  title: string;
  description: string;
  focusTitle: string;
  focusItems: string[];
  highlightText: string;
}

export interface CMSCorporate {
  heroTitle: string;
  heroSub: string;
  organization: CorporateTabContent;
  business: CorporateTabContent;
  school: CorporateTabContent;
}

export interface SupportCtaConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface CMSData {
  siteTitle?: string;
  siteDescription?: string;
  faviconUrl?: string;
  header: CMSHeader;
  footer: CMSFooter;
  homepage: CMSHomepage;
  pages: CMSStaticPage[];
  postCategories: string[];
  pageCategories: string[];
  postCategoryTree?: { [parent: string]: string[] };
  projectCategoryTree?: { [parent: string]: string[] };
  theme?: CMSTheme;
  corporate?: CMSCorporate;
  supportCta?: SupportCtaConfig;
}

export interface Feedback {
  id: string;
  parentName: string;
  parentPhone: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface GuessingScreen {
  id: string;
  level: number;
  screenIndex: number;
  image: string;
  answer: string;
  hint: string;
}

export interface DBData {
  projects: Project[];
  parents: ParentCRM[];
  corporates: CorporateCRM[];
  transactions: TransactionHistory[];
  news: NewsArticle[];
  notifications: NotificationLog[];
  feedbacks?: Feedback[];
  guessingGameScreens?: GuessingScreen[];
  cms: CMSData;
}

export function parseVideoEmbedUrl(input: string): string {
  if (!input) return '';
  let url = input.trim();

  // 1. Check if the input is an iframe or contains HTML
  if (url.includes('<iframe') && url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      url = match[1].trim();
    }
  }

  // 2. Unescape XML/HTML entities (like &amp;)
  url = url.replace(/&amp;/g, '&');

  // 3. Process URL
  // A. YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('/embed/')) {
      return url;
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      const idAndQuery = parts[1] || '';
      const id = idAndQuery.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('v=')) {
      const match = url.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      const id = (parts[1] || '').split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  // B. Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.gg')) {
    if (url.includes('facebook.com/plugins/video.php')) {
      return url;
    }
    // Convert watch/reels/posts links to plugin iframe player
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=500`;
  }

  return url;
}
