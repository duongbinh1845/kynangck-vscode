import React, { useState, useEffect } from 'react';
import { NewsArticle, CMSData, parseVideoEmbedUrl } from '../types';
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  Calendar,
  ArrowLeft,
  Search,
  BookOpen,
  Sparkles,
  Tag,
  HelpCircle
} from 'lucide-react';

interface LibraryPortalProps {
  newsArticles: NewsArticle[];
  cms?: CMSData | null;
  onNavigate?: (tab: string) => void;
}

// Helper to extract block data if created with Visual Page Builder
interface BuilderBlock {
  id: string;
  type: string;
  data: any;
}

export const LibraryPortal: React.FC<LibraryPortalProps> = ({ newsArticles, cms, onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'article' | 'image' | 'video'>('article');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Advanced Lightbox Gallery State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number>(0);

  // Scroll to top on article change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticle]);

  // Reset category selection when changing tabs
  useEffect(() => {
    setSelectedCategory('Tất cả');
  }, [activeSubTab]);

  // Single Source of Truth: extract photos directly from CMS Database newsArticles
  const databaseImages = newsArticles.filter(art => art.type === 'image');
  const combinedPhotos = databaseImages.map(db => ({
    id: db.id,
    title: db.title,
    category: db.category,
    url: db.mediaUrl || db.thumbnailUrl || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80'
  }));

  // Dynamic Categories based on active tab
  const getSubTabCategories = () => {
    if (activeSubTab === 'article') {
      const items = newsArticles.filter(art => art.type === 'article' || !art.type);
      return ['Tất cả', ...Array.from(new Set(items.map(art => art.category)))];
    } else if (activeSubTab === 'image') {
      return ['Tất cả', ...Array.from(new Set(combinedPhotos.map(p => p.category)))];
    } else {
      const items = newsArticles.filter(art => art.type === 'video');
      return ['Tất cả', ...Array.from(new Set(items.map(art => art.category)))];
    }
  };

  const categories = getSubTabCategories();

  // Filter content
  const textArticles = newsArticles.filter(art => {
    if (art.type && art.type !== 'article') return false;
    const matchesCategory = selectedCategory === 'Tất cả' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const videoArticles = newsArticles.filter(art => {
    if (art.type !== 'video') return false;
    const matchesCategory = selectedCategory === 'Tất cả' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredPhotos = combinedPhotos.filter(photo => {
    const matchesCategory = selectedCategory === 'Tất cả' || photo.category === selectedCategory;
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render article body blocks or text
  const renderArticleBody = (article: NewsArticle) => {
    const blockDataMatch = article.content.match(/<!-- ELEMENTOR_BLOCKS:\s*([\s\S]*?)\s*-->/);
    if (blockDataMatch) {
      try {
        const blocks: BuilderBlock[] = JSON.parse(blockDataMatch[1]);
        if (Array.isArray(blocks) && blocks.length > 0) {
          return (
            <div className="space-y-6 mt-6">
              {blocks.map((block) => {
                switch (block.type) {
                  case 'hero': {
                    const colorClass = block.data.color === 'emerald' ? 'text-emerald-700 bg-emerald-50' : block.data.color === 'amber' ? 'text-amber-700 bg-amber-50' : 'text-slate-800 bg-slate-50';
                    return (
                      <div key={block.id} className={`text-center py-8 px-6 rounded-3xl ${colorClass} border border-dashed border-slate-200/50`}>
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                          {block.data.title}
                        </h2>
                        {block.data.subtitle && (
                          <p className="text-xs text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">{block.data.subtitle}</p>
                        )}
                      </div>
                    );
                  }
                  case 'paragraph': {
                    const align = block.data.align || 'left';
                    const isBold = block.data.bold ? 'font-bold' : '';
                    const isItalic = block.data.italic ? 'italic' : '';
                    const size = block.data.size === 'large' ? 'text-sm sm:text-base' : block.data.size === 'small' ? 'text-xs' : 'text-xs sm:text-sm';
                    return (
                      <p
                        key={block.id}
                        style={{ textAlign: align }}
                        className={`${size} ${isBold} ${isItalic} text-slate-600 leading-relaxed whitespace-pre-wrap`}
                      >
                        {block.data.text}
                      </p>
                    );
                  }
                  case 'heading': {
                    const align = block.data.align || 'left';
                    const level = block.data.level || 'h2';
                    const sizeClass = level === 'h1' ? 'text-lg sm:text-xl font-black text-slate-900' : 'text-base font-extrabold text-slate-800';
                    return (
                      <div key={block.id} style={{ textAlign: align }} className="pt-2">
                        <h3 className={sizeClass}>{block.data.text}</h3>
                      </div>
                    );
                  }
                  case 'image': {
                    return (
                      <div key={block.id} className="space-y-2 my-4">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-96">
                          <img src={block.data.url} alt={block.data.caption || 'Image block'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        {block.data.caption && (
                          <p className="text-[11px] text-center text-slate-400 italic">{block.data.caption}</p>
                        )}
                      </div>
                    );
                  }
                  case 'video': {
                    const embedUrl = parseVideoEmbedUrl(block.data.url);
                    return (
                      <div key={block.id} className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen title="Video block"></iframe>
                      </div>
                    );
                  }
                  case 'quote': {
                    return (
                      <div key={block.id} className="border-l-4 border-emerald-500 bg-emerald-50/20 pl-4 py-2 italic text-slate-600 rounded-r-2xl">
                        <p className="text-sm font-medium">"{block.data.text}"</p>
                        {block.data.author && (
                          <p className="text-[10px] text-slate-400 font-extrabold mt-1">— {block.data.author}</p>
                        )}
                      </div>
                    );
                  }
                  case 'columns-2': {
                    return (
                      <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-slate-800 text-sm">{block.data.leftTitle}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{block.data.leftText}</p>
                        </div>
                        {block.data.rightUrl && (
                          <div className="rounded-2xl overflow-hidden shadow-sm max-h-48 border">
                            <img src={block.data.rightUrl} alt="Col 2" className="w-full h-full object-cover max-h-48" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          );
        }
      } catch (e) {
        console.error('Lỗi hiển thị Visual Block:', e);
      }
    }

    // Check if content is HTML (e.g. edited via Puck or Rich Text Editor)
    if (article.content && (article.content.includes('<') || article.content.includes('<!-- PUCK_DATA:'))) {
      return (
        <div
          className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed mt-6 space-y-4 font-sans"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      );
    }

    return (
      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4 whitespace-pre-line mt-6 font-sans">
        {article.content}
      </div>
    );
  };

  // Get related posts filtered strictly to same parent category/type
  const getRelatedPosts = (curr: NewsArticle) => {
    const currType = curr.type || 'article';
    const matched = newsArticles.filter(art => {
      if (art.id === curr.id) return false;
      const artType = art.type || 'article';
      if (artType !== currType) return false;
      return art.category === curr.category;
    });

    if (matched.length < 3) {
      const fallback = newsArticles.filter(art => art.id !== curr.id && (art.type || 'article') === currType);
      return fallback.slice(0, 6);
    }
    return matched.slice(0, 6);
  };

  const getThumbnail = (art: NewsArticle) => {
    const imageMatch = art.content.match(/"url":"(.*?)"/);
    if (imageMatch && imageMatch[1]) {
      return imageMatch[1];
    }
    if (art.category === 'Kỹ năng sinh tồn') return 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=400&q=80';
    if (art.category === 'Kỹ năng cắm trại') return 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80';
  };

  // Support CTA config
  const ctaTitle = cms?.supportCta?.title || 'Cần hỗ trợ trực tiếp?';
  const ctaDescription = cms?.supportCta?.description || 'Đăng ký tham gia dã ngoại ngay tại Trang chủ để rèn luyện kỹ năng thực tế cho bé.';
  const ctaButtonText = cms?.supportCta?.buttonText || 'Xem lịch tuyển sinh';
  const ctaButtonLink = cms?.supportCta?.buttonLink || 'home';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* 1. READER VIEW (WHEN ARTICLE IS SELECTED) */}
      {selectedArticle ? (
        <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
          {/* Main article block */}
          <div className="bg-white border border-transparent rounded-3xl p-6 sm:p-10 shadow-sm space-y-10">
            {/* Back button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="group inline-flex items-center space-x-2 text-slate-500 hover:text-emerald-600 transition font-bold text-xs bg-slate-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-slate-100 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition" />
              <span>Quay lại thư viện bài viết</span>
            </button>

            {/* Post Header */}
            <div className="space-y-4">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-extrabold">
                {selectedArticle.category}
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono border-b border-slate-50 pb-4">
                <div className="flex items-center space-x-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedArticle.author || 'Chuyên gia Connect Kids'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Xuất bản: {selectedArticle.date}</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <article className="prose prose-slate max-w-none">
              {selectedArticle.type === 'video' && selectedArticle.mediaUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md mb-6">
                  <iframe
                    src={parseVideoEmbedUrl(selectedArticle.mediaUrl)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={selectedArticle.title}
                  ></iframe>
                </div>
              )}
              {renderArticleBody(selectedArticle)}
            </article>
          </div>

          {/* 2. RELATED POSTS SECTION (6 posts) */}
          <div className="pt-8 border-t border-slate-200/60 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-[#5C7A3E]" />
              <span>Bài viết liên quan cùng danh mục</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {getRelatedPosts(selectedArticle).map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div className="space-y-2.5">
                    <div className="h-28 overflow-hidden bg-slate-100 relative">
                      <img src={getThumbnail(post)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-3 pt-0">
                      <h4 className="text-[11px] font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-[#5C7A3E] transition">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <p className="text-[10px] text-[#5C7A3E] font-bold font-mono text-right flex items-center justify-end">
                      <span>Đọc tiếp</span>
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SUPPORT CTA AT BOTTOM OF ARTICLE */}
          <div className="bg-gradient-to-r from-[#5C7A3E] via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/50">
            <div className="space-y-2 text-center md:text-left relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 bg-white/10 text-amber-300 text-[10px] font-extrabold uppercase font-mono px-2.5 py-1 rounded-full backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tư Vấn Dã Ngoại Kỹ Năng</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{ctaTitle}</h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">{ctaDescription}</p>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate(ctaButtonLink);
              }}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl cursor-pointer transition shadow-lg flex items-center space-x-2 group"
            >
              <span>{ctaButtonText}</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

        </div>
      ) : (
        
        /* 2. STANDARD GALLERY / GRID VIEWS (FULL WIDTH, NO SIDEBAR) */
        <div className="space-y-8 max-w-6xl mx-auto">
          
          {/* HEADER TITLE & SEARCH BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
                <BookOpen className="h-6 w-6 text-[#5C7A3E]" />
                <span>Thư Viện Kỹ Năng & Dã Ngoại</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1">Cung cấp kiến thức dã ngoại, cẩm nang cắm trại, phương pháp nuôi dạy con tự lập chuẩn mực.</p>
            </div>

            {/* Combined Search bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                className="w-full border border-slate-200 bg-white/80 backdrop-blur rounded-2xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#5C7A3E] focus:outline-none focus:bg-white transition"
                placeholder="Tìm bài viết, hình ảnh, video dã ngoại..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* REDESIGNED 3 BIG TABS (Matching Parent / Corporate Portals - Custom Theme Colors) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 max-w-xl mx-auto shadow-inner">
            <button
              onClick={() => setActiveSubTab('article')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeSubTab === 'article'
                  ? 'bg-[#F08C3A] text-white shadow-md shadow-[#F08C3A]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F3ECDC]'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Bài Viết</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeSubTab === 'article' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {textArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('image')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeSubTab === 'image'
                  ? 'bg-[#F08C3A] text-white shadow-md shadow-[#F08C3A]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F3ECDC]'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Hình Ảnh</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeSubTab === 'image' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {filteredPhotos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('video')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeSubTab === 'video'
                  ? 'bg-[#F08C3A] text-white shadow-md shadow-[#F08C3A]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F3ECDC]'
              }`}
            >
              <VideoIcon className="h-4 w-4" />
              <span>Video</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeSubTab === 'video' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {videoArticles.length}
              </span>
            </button>
          </div>

          {/* PILL CATEGORY FILTERS (DẠNG VIÊN THUỐC) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#5C7A3E] text-white shadow-sm ring-2 ring-[#5C7A3E]/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#E8EFD9] hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* MAIN GRID RENDER */}
          <main className="space-y-6">
            
            {/* TAB 1: ARTICLES GRID */}
            {activeSubTab === 'article' && (
              textArticles.length === 0 ? (
                <div className="h-60 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <FileText className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-medium">Không tìm thấy bài viết nào thuộc danh mục này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {textArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#5C7A3E]/30 transition duration-300 cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="h-44 overflow-hidden bg-slate-100 relative">
                          <img src={getThumbnail(art)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                          <span className="absolute top-3 left-3 bg-[#5C7A3E] text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                            {art.category}
                          </span>
                        </div>

                        <div className="px-5 space-y-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#5C7A3E] transition">
                            {art.title}
                          </h3>
                          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                            {art.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="font-semibold text-slate-500 truncate max-w-[120px]">✍ {art.author || 'Chuyên gia Connect Kids'}</span>
                          <span className="flex items-center text-[#5C7A3E] font-extrabold">
                            Đọc bài
                            <ChevronRight className="h-3.5 w-3.5 ml-0.5 transform group-hover:translate-x-0.5 transition" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: IMAGES GALLERY */}
            {activeSubTab === 'image' && (
              filteredPhotos.length === 0 ? (
                <div className="h-60 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-medium">Không có hình ảnh phù hợp trong danh mục này.</p>
                </div>
              ) : (
                <div className="columns-2 sm:columns-3 md:columns-4 gap-4 [column-fill:_balance] box-border">
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      onClick={() => setActivePhotoIndex(index)}
                      className="break-inside-avoid mb-4 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#5C7A3E]/30 transition duration-300 cursor-pointer relative group"
                    >
                      <div className="relative overflow-hidden bg-slate-50">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-auto object-cover group-hover:scale-103 transition duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'; }}
                        />
                        <span className="absolute top-2.5 left-2.5 bg-slate-900/70 text-white text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs font-mono z-10">
                          {photo.category}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-3 text-white backdrop-blur-xs">
                          <p className="font-extrabold text-[11px] leading-snug line-clamp-2">
                            {photo.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 3: VIDEOS GRID */}
            {activeSubTab === 'video' && (
              videoArticles.length === 0 ? (
                <div className="h-60 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <VideoIcon className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-medium">Chưa có video dã ngoại thực tế nào thuộc danh mục này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {videoArticles.map((art) => {
                    const embedUrl = parseVideoEmbedUrl(art.mediaUrl || '');
                    return (
                      <div
                        key={art.id}
                        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="aspect-video bg-slate-900 w-full relative">
                          {embedUrl ? (
                            <iframe
                              src={embedUrl}
                              className="w-full h-full border-0"
                              title={art.title}
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
                              KHÔNG CÓ URL VIDEO
                            </div>
                          )}
                        </div>

                        <div
                          onClick={() => setSelectedArticle(art)}
                          className="p-5 space-y-2 cursor-pointer hover:bg-slate-50/80 transition flex-1 flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="bg-orange-50 text-orange-800 border border-orange-100 text-[8px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full font-bold">
                                {art.category}
                              </span>
                              <span className="text-[10px] text-[#5C7A3E] font-extrabold flex items-center group-hover:translate-x-0.5 transition">
                                Xem bài viết
                                <ChevronRight className="h-3 w-3 ml-0.5" />
                              </span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-[#5C7A3E] transition">
                              {art.title}
                            </h3>
                            <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed">
                              {art.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </main>

          {/* BOTTOM "CẦN HỖ TRỢ TRỰC TIẾP?" CTA BOX */}
          <div className="bg-gradient-to-r from-[#5C7A3E] via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 mt-12 border border-emerald-700/50">
            <div className="space-y-2 text-center md:text-left relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 bg-white/10 text-amber-300 text-[10px] font-extrabold uppercase font-mono px-2.5 py-1 rounded-full backdrop-blur-xs">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Hỗ Trợ Tư Vấn Dã Ngoại</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{ctaTitle}</h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">{ctaDescription}</p>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate(ctaButtonLink);
              }}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl cursor-pointer transition shadow-lg flex items-center space-x-2 group"
            >
              <span>{ctaButtonText}</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

        </div>
      )}

      {/* COMPREHENSIVE LIGHTBOX GALLERY MODAL */}
      {activePhotoIndex !== null && filteredPhotos[activePhotoIndex] && (
        <div
          className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-4 md:p-6 backdrop-blur-md select-none touch-none"
          onTouchStart={(e) => setTouchStartX(e.changedTouches[0].screenX)}
          onTouchEnd={(e) => {
            const endX = e.changedTouches[0].screenX;
            if (touchStartX - endX > 60) {
              setActivePhotoIndex((activePhotoIndex + 1) % filteredPhotos.length);
            } else if (endX - touchStartX > 60) {
              setActivePhotoIndex((activePhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
            }
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3 z-10">
            <div>
              <span className="bg-emerald-500 text-white font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                {filteredPhotos[activePhotoIndex].category}
              </span>
              <h4 className="text-xs md:text-sm font-bold text-slate-100 mt-1 line-clamp-1">
                {filteredPhotos[activePhotoIndex].title}
              </h4>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {activePhotoIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 transition duration-150 text-white p-2 rounded-full cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Stage with Navigation controls */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((activePhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
              }}
              className="absolute left-2 md:left-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition duration-150 cursor-pointer hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="max-w-full max-h-[60vh] sm:max-h-[65vh] flex items-center justify-center relative">
              <img
                src={filteredPhotos[activePhotoIndex].url}
                alt={filteredPhotos[activePhotoIndex].title}
                className="max-w-full max-h-[60vh] sm:max-h-[65vh] object-contain rounded-2xl shadow-2xl border border-white/15 animate-fade-in pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((activePhotoIndex + 1) % filteredPhotos.length);
              }}
              className="absolute right-2 md:right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition duration-150 cursor-pointer hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Row Carousel */}
          <div className="border-t border-white/10 pt-3 flex flex-col space-y-2 z-10">
            <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wide flex items-center justify-between">
              <span>ẢNH KHÁC TRONG CHUYÊN MỤC</span>
              <span className="sm:hidden text-emerald-400">Vuốt trái/phải trên hình để chuyển ảnh</span>
            </p>
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/35'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
