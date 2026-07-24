import React from 'react';
import { Config, DropZone } from '@measured/puck';
import { 
  Sparkles, Shield, CheckCircle, Info, Star, Award, Heart, BookOpen, 
  MapPin, Phone, Mail, Clock, ArrowRight, Play, Check, AlertTriangle, 
  Users, ChevronDown, Calendar, Send, HelpCircle, Eye, ArrowUp, Instagram, Facebook, Youtube
} from 'lucide-react';

export const puckCategories = {
  'Basic Blocks': {
    title: 'Basic Blocks',
    components: [
      'HeroBanner', 'Heading', 'Subheading', 'Paragraph', 'RichText', 
      'ImageBlock', 'ButtonCTA', 'IconBlock', 'Divider', 'Spacer'
    ],
    defaultExpanded: true,
  },
  'Layout Blocks': {
    title: 'Layout Blocks',
    components: [
      'SectionContainer', 'InnerSection', 'TwoColumnLayout', 'ThreeColumnLayout', 
      'FlexLayout', 'GridLayout', 'ColumnBlock'
    ],
    defaultExpanded: false,
  },
  'Content Blocks': {
    title: 'Content Blocks',
    components: [
      'FeatureCards', 'StatsGrid', 'TimelineSteps', 'ContentList', 
      'IconList', 'QuoteBlock', 'NoticeAlert'
    ],
    defaultExpanded: false,
  },
  'Media Blocks': {
    title: 'Media Blocks',
    components: [
      'VideoEmbed', 'ImageWithText', 'ImageGallery', 'LogoCarousel', 'BeforeAfter'
    ],
    defaultExpanded: false,
  },
  'Advanced Blocks': {
    title: 'Advanced Blocks',
    components: [
      'PricingTable', 'PricingCards', 'TestimonialCarousel', 'TestimonialGrid', 
      'FAQAccordion', 'TeamMembers', 'PortfolioGrid', 'CountdownTimer', 
      'FlipBox', 'ContactForm', 'NewsletterForm', 'EquipmentChecklist'
    ],
    defaultExpanded: false,
  },
  'Footer & Misc': {
    title: 'Footer & Misc',
    components: [
      'FooterBlock', 'FooterColumn', 'SocialIcons', 'CopyrightBar', 
      'BackToTop', 'LegalLinks', 'NewsletterSignup'
    ],
    defaultExpanded: false,
  },
};

export const puckConfig: Config = {
  categories: puckCategories as any,
  components: {
    // ==========================================
    // 1. BASIC BLOCKS
    // ==========================================
    HeroBanner: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Hero' },
        subtitle: { type: 'textarea', label: 'Mô tả ngắn' },
        badge: { type: 'text', label: 'Nhãn Badge' },
        bgImage: { type: 'text', label: 'Link Ảnh Nền (URL)' },
        buttonText: { type: 'text', label: 'Nút Hành Động' },
        buttonLink: { type: 'text', label: 'Link Nút' },
        overlayOpacity: {
          type: 'select',
          label: 'Độ mờ phủ đen',
          options: [
            { label: 'Nhẹ (30%)', value: '30' },
            { label: 'Vừa (50%)', value: '50' },
            { label: 'Đậm (70%)', value: '70' },
          ],
        },
      },
      defaultProps: {
        title: 'Hành Trình Dã Ngoại Sinh Tồn KynangCK',
        subtitle: 'Rèn luyện bản lĩnh tự lập, tinh thần đồng đội và kỹ năng ứng biến hoang dã cho học sinh.',
        badge: 'Trải Nghiệm Thực Tế',
        bgImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Khám Phá Lịch Trình',
        buttonLink: '#details',
        overlayOpacity: '50',
      },
      render: ({ title, subtitle, badge, bgImage, buttonText, buttonLink, overlayOpacity, puck }) => (
        <section
          className="relative rounded-3xl overflow-hidden py-16 px-8 text-white my-4 bg-cover bg-center shadow-lg"
          style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.${overlayOpacity || '5'}), rgba(0,0,0,0.${overlayOpacity || '5'})), url(${bgImage})` }}
        >
          <div className="max-w-2xl space-y-4 relative z-10">
            {badge && (
              <span className="inline-block bg-[#5C7A3E] text-white text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                {badge}
              </span>
            )}
            <h1
              className="text-3xl sm:text-5xl font-black leading-tight text-white outline-none focus:ring-2 focus:ring-amber-300 rounded px-1"
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {title}
            </h1>
            <p
              className="text-slate-100 text-sm sm:text-base leading-relaxed outline-none focus:ring-2 focus:ring-amber-300 rounded px-1"
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {subtitle}
            </p>
            {buttonText && (
              <div className="pt-2">
                <a href={buttonLink || '#'} className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm shadow transition">
                  {buttonText}
                </a>
              </div>
            )}
          </div>
        </section>
      ),
    },

    Heading: {
      fields: {
        title: { type: 'text', label: 'Nội dung Tiêu đề' },
        size: {
          type: 'select',
          label: 'Cỡ chữ',
          options: [
            { label: 'Cực lớn (H1)', value: 'large' },
            { label: 'Vừa (H2)', value: 'medium' },
            { label: 'Nhỏ (H3)', value: 'small' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Căn lề',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
        color: {
          type: 'select',
          label: 'Màu sắc',
          options: [
            { label: 'Xanh Lá KynangCK', value: '#5C7A3E' },
            { label: 'Xám Đậm', value: '#0f172a' },
            { label: 'Cam Hổ Phách', value: '#d97706' },
          ],
        },
      },
      defaultProps: {
        title: 'Mục Tiêu Rèn Luyện Kỹ Năng',
        size: 'medium',
        align: 'center',
        color: '#0f172a',
      },
      render: ({ title, size, align, color, puck }) => {
        const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
        const sizeClass = size === 'large' ? 'text-3xl sm:text-4xl font-black' : size === 'small' ? 'text-xl font-bold' : 'text-2xl font-extrabold';
        return (
          <div className={`my-6 ${alignClass}`}>
            <h2
              className={`${sizeClass} tracking-tight outline-none focus:ring-2 focus:ring-emerald-400 rounded px-1`}
              style={{ color: color || '#0f172a' }}
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {title}
            </h2>
          </div>
        );
      },
    },

    Subheading: {
      fields: {
        text: { type: 'text', label: 'Nội dung Subheading' },
        align: {
          type: 'radio',
          label: 'Căn lề',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: 'Chương trình rèn luyện tính tự lập & sinh tồn chuẩn quốc tế cho học sinh.',
        align: 'center',
      },
      render: ({ text, align, puck }) => (
        <div className={`my-2 text-${align}`}>
          <p
            className="text-sm font-semibold text-[#5C7A3E] uppercase tracking-wider outline-none focus:ring-2 focus:ring-emerald-300 rounded px-1"
            contentEditable={puck?.isEditing}
            suppressContentEditableWarning
          >
            {text}
          </p>
        </div>
      ),
    },

    Paragraph: {
      fields: {
        text: { type: 'textarea', label: 'Văn bản đoạn' },
        align: {
          type: 'radio',
          label: 'Căn lề',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: 'Nội dung chia sẻ chi tiết về chuyến dã ngoại. Các con học sinh sẽ được tham gia trực tiếp vào các hoạt động thực tế dưới sự hướng dẫn của huấn luyện viên chuyên nghiệp.',
        align: 'left',
      },
      render: ({ text, align, puck }) => (
        <div className={`my-4 text-slate-700 leading-relaxed text-sm sm:text-base text-${align}`}>
          <p
            className="outline-none focus:ring-2 focus:ring-emerald-300 rounded p-1 whitespace-pre-wrap"
            contentEditable={puck?.isEditing}
            suppressContentEditableWarning
          >
            {text}
          </p>
        </div>
      ),
    },

    RichText: {
      fields: {
        content: { type: 'textarea', label: 'Nội dung Rich Text (Hỗ trợ HTML/Markdown)' },
      },
      defaultProps: {
        content: '<b>KynangCK</b> mang đến phương pháp giảng dạy <i>học thông qua trải nghiệm thực tế</i>. Giúp học sinh chủ động giải quyết vấn đề.',
      },
      render: ({ content, puck }) => (
        <div className="my-4 prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed">
          <div
            className="outline-none focus:ring-2 focus:ring-emerald-300 rounded p-1"
            contentEditable={puck?.isEditing}
            dangerouslySetInnerHTML={{ __html: content }}
            suppressContentEditableWarning
          />
        </div>
      ),
    },

    ImageBlock: {
      fields: {
        url: { type: 'text', label: 'Link Ảnh (URL)' },
        caption: { type: 'text', label: 'Chú thích bên dưới' },
        alt: { type: 'text', label: 'Thẻ Alt mô tả' },
        rounded: {
          type: 'select',
          label: 'Bo góc ảnh',
          options: [
            { label: 'Nhiều (2xl)', value: 'rounded-2xl' },
            { label: 'Tròn hẳn (3xl)', value: 'rounded-3xl' },
            { label: 'Vuông nhẹ', value: 'rounded-lg' },
          ],
        },
      },
      defaultProps: {
        url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80',
        caption: 'Học sinh thực hành băng rừng & định vị la bàn',
        alt: 'Dã ngoại sinh tồn KynangCK',
        rounded: 'rounded-2xl',
      },
      render: ({ url, caption, alt, rounded, puck }) => (
        <div className="my-6 text-center">
          <img src={url} alt={alt || caption} className={`w-full max-h-[450px] object-cover ${rounded || 'rounded-2xl'} shadow-md mx-auto`} />
          {caption && (
            <p
              className="text-xs text-slate-500 italic mt-2 outline-none focus:ring-2 focus:ring-emerald-300 rounded px-1"
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {caption}
            </p>
          )}
        </div>
      ),
    },

    ButtonCTA: {
      fields: {
        text: { type: 'text', label: 'Chữ trên Nút' },
        link: { type: 'text', label: 'Đường dẫn (Link)' },
        variant: {
          type: 'select',
          label: 'Kiểu nút',
          options: [
            { label: 'Xanh KynangCK', value: 'primary' },
            { label: 'Vàng Hổ Phách', value: 'secondary' },
            { label: 'Viền Khung', value: 'outline' },
          ],
        },
        size: {
          type: 'select',
          label: 'Kích thước',
          options: [
            { label: 'Vừa', value: 'md' },
            { label: 'Lớn', value: 'lg' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Căn lề',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: 'Đăng Ký Tư Vấn Ngay',
        link: '#contact',
        variant: 'primary',
        size: 'md',
        align: 'center',
      },
      render: ({ text, link, variant, size, align, puck }) => {
        const bg = variant === 'secondary' ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' : variant === 'outline' ? 'border-2 border-[#5C7A3E] text-[#5C7A3E] hover:bg-[#5C7A3E] hover:text-white' : 'bg-[#5C7A3E] text-white hover:bg-[#4A6431]';
        const padding = size === 'lg' ? 'px-8 py-3.5 text-base' : 'px-6 py-2.5 text-sm';
        return (
          <div className={`my-4 text-${align}`}>
            <a
              href={link || '#'}
              className={`inline-block font-extrabold rounded-xl shadow-sm transition ${bg} ${padding} outline-none focus:ring-2 focus:ring-amber-300`}
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {text}
            </a>
          </div>
        );
      },
    },

    IconBlock: {
      fields: {
        iconType: {
          type: 'select',
          label: 'Biểu tượng',
          options: [
            { label: 'Ngôi sao (Star)', value: 'Star' },
            { label: 'Khiên bảo vệ (Shield)', value: 'Shield' },
            { label: 'Trái tim (Heart)', value: 'Heart' },
            { label: 'Sách (BookOpen)', value: 'BookOpen' },
            { label: 'Huy chương (Award)', value: 'Award' },
            { label: 'Địa điểm (MapPin)', value: 'MapPin' },
          ],
        },
        size: {
          type: 'select',
          label: 'Cỡ icon',
          options: [
            { label: 'Nhỏ (24px)', value: '24' },
            { label: 'Vừa (36px)', value: '36' },
            { label: 'Lớn (48px)', value: '48' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Căn lề',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
      },
      defaultProps: {
        iconType: 'Shield',
        size: '36',
        align: 'center',
      },
      render: ({ iconType, size, align }) => {
        const sz = parseInt(size || '36', 10);
        return (
          <div className={`my-4 text-${align} text-[#5C7A3E]`}>
            {iconType === 'Star' && <Star size={sz} className="inline-block" />}
            {iconType === 'Shield' && <Shield size={sz} className="inline-block" />}
            {iconType === 'Heart' && <Heart size={sz} className="inline-block" />}
            {iconType === 'BookOpen' && <BookOpen size={sz} className="inline-block" />}
            {iconType === 'Award' && <Award size={sz} className="inline-block" />}
            {iconType === 'MapPin' && <MapPin size={sz} className="inline-block" />}
          </div>
        );
      },
    },

    Divider: {
      fields: {
        style: {
          type: 'select',
          label: 'Kiểu đường kẻ',
          options: [
            { label: 'Nét liền (Solid)', value: 'border-solid' },
            { label: 'Nét đứt (Dashed)', value: 'border-dashed' },
            { label: 'Dấu chấm (Dotted)', value: 'border-dotted' },
          ],
        },
      },
      defaultProps: {
        style: 'border-solid',
      },
      render: ({ style }) => (
        <hr className={`my-8 border-t-2 border-slate-200/80 ${style}`} />
      ),
    },

    Spacer: {
      fields: {
        height: {
          type: 'select',
          label: 'Khoảng cách chiều cao',
          options: [
            { label: 'Nhỏ (16px)', value: 'h-4' },
            { label: 'Vừa (32px)', value: 'h-8' },
            { label: 'Lớn (64px)', value: 'h-16' },
            { label: 'Rất lớn (96px)', value: 'h-24' },
          ],
        },
      },
      defaultProps: {
        height: 'h-8',
      },
      render: ({ height }) => <div className={`${height} w-full`} />,
    },

    // ==========================================
    // 2. LAYOUT BLOCKS
    // ==========================================
    SectionContainer: {
      fields: {
        bgColor: {
          type: 'select',
          label: 'Màu nền',
          options: [
            { label: 'Trắng', value: 'bg-white' },
            { label: 'Xám Nhẹ', value: 'bg-slate-50' },
            { label: 'Xanh Nhạt KynangCK', value: 'bg-[#E8EFD9]/50' },
            { label: 'Tối Màu', value: 'bg-slate-900 text-white' },
          ],
        },
        paddingY: {
          type: 'select',
          label: 'Khoảng đệm trên dưới',
          options: [
            { label: 'Vừa (py-8)', value: 'py-8' },
            { label: 'Dày (py-16)', value: 'py-16' },
          ],
        },
      },
      defaultProps: {
        bgColor: 'bg-white',
        paddingY: 'py-8',
      },
      render: ({ bgColor, paddingY }) => (
        <section className={`my-4 ${bgColor} ${paddingY} px-6 rounded-3xl border border-slate-200/70 shadow-xs min-h-[120px]`}>
          <DropZone zone="section-content" />
        </section>
      ),
    },

    InnerSection: {
      render: () => (
        <div className="my-4 p-4 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/20 min-h-[100px]">
          <DropZone zone="inner-content" />
        </div>
      ),
    },

    TwoColumnLayout: {
      fields: {
        gap: {
          type: 'select',
          label: 'Khoảng cách giữa 2 cột',
          options: [
            { label: 'Nhỏ (16px)', value: 'gap-4' },
            { label: 'Vừa (24px)', value: 'gap-6' },
            { label: 'Lớn (32px)', value: 'gap-8' },
          ],
        },
      },
      defaultProps: { gap: 'gap-6' },
      render: ({ gap }) => (
        <div className={`my-6 grid grid-cols-1 md:grid-cols-2 ${gap} items-start`}>
          <div className="p-3 border border-dashed border-slate-300 rounded-2xl min-h-[100px]">
            <DropZone zone="col-1" />
          </div>
          <div className="p-3 border border-dashed border-slate-300 rounded-2xl min-h-[100px]">
            <DropZone zone="col-2" />
          </div>
        </div>
      ),
    },

    ThreeColumnLayout: {
      fields: {
        gap: {
          type: 'select',
          label: 'Khoảng cách cột',
          options: [
            { label: 'Nhỏ (16px)', value: 'gap-4' },
            { label: 'Vừa (24px)', value: 'gap-6' },
          ],
        },
      },
      defaultProps: { gap: 'gap-4' },
      render: ({ gap }) => (
        <div className={`my-6 grid grid-cols-1 md:grid-cols-3 ${gap} items-start`}>
          <div className="p-3 border border-dashed border-slate-300 rounded-2xl min-h-[100px]">
            <DropZone zone="col-1" />
          </div>
          <div className="p-3 border border-dashed border-slate-300 rounded-2xl min-h-[100px]">
            <DropZone zone="col-2" />
          </div>
          <div className="p-3 border border-dashed border-slate-300 rounded-2xl min-h-[100px]">
            <DropZone zone="col-3" />
          </div>
        </div>
      ),
    },

    FlexLayout: {
      render: () => (
        <div className="my-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[80px]">
          <DropZone zone="flex-content" />
        </div>
      ),
    },

    GridLayout: {
      fields: {
        columns: {
          type: 'select',
          label: 'Số cột desktop',
          options: [
            { label: '2 Cột', value: 'grid-cols-2' },
            { label: '3 Cột', value: 'grid-cols-3' },
            { label: '4 Cột', value: 'grid-cols-4' },
          ],
        },
      },
      defaultProps: { columns: 'grid-cols-3' },
      render: ({ columns }) => (
        <div className={`my-6 grid grid-cols-1 md:${columns} gap-4`}>
          <DropZone zone="grid-items" />
        </div>
      ),
    },

    ColumnBlock: {
      render: () => (
        <div className="p-4 bg-white border border-slate-200 rounded-xl min-h-[80px]">
          <DropZone zone="column-content" />
        </div>
      ),
    },

    // ==========================================
    // 3. CONTENT BLOCKS
    // ==========================================
    FeatureCards: {
      fields: {
        mainTitle: { type: 'text', label: 'Tiêu đề chung' },
        item1Title: { type: 'text', label: 'Cột 1: Tiêu đề' },
        item1Desc: { type: 'textarea', label: 'Cột 1: Mô tả' },
        item2Title: { type: 'text', label: 'Cột 2: Tiêu đề' },
        item2Desc: { type: 'textarea', label: 'Cột 2: Mô tả' },
        item3Title: { type: 'text', label: 'Cột 3: Tiêu đề' },
        item3Desc: { type: 'textarea', label: 'Cột 3: Mô tả' },
      },
      defaultProps: {
        mainTitle: 'Giá Trị Nổi Bật Của Khóa Học',
        item1Title: 'Lý Lý Kỹ Năng Tự Lập',
        item1Desc: 'Tự phục vụ bản thân, quản lý đồ dùng cá nhân và sắp xếp thời gian sinh hoạt.',
        item2Title: 'Ứng Phó Khẩn Cấp',
        item2Desc: 'Kỹ năng nhóm lửa, dựng lều dã ngoại, tìm nước sạch và phát tín hiệu SOS.',
        item3Title: 'Đồng Đội & Kỷ Luật',
        item3Desc: 'Gắn kết bạn bè, nâng cao tinh thần trách nhiệm tập thể và sự tự tin.',
      },
      render: ({ mainTitle, item1Title, item1Desc, item2Title, item2Desc, item3Title, item3Desc, puck }) => (
        <div className="my-8 p-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-6">
          {mainTitle && (
            <h3
              className="text-xl font-extrabold text-slate-900 text-center outline-none focus:ring-2 focus:ring-emerald-300 rounded px-1"
              contentEditable={puck?.isEditing}
              suppressContentEditableWarning
            >
              {mainTitle}
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item1Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item1Desc}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item2Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item2Desc}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item3Title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item3Desc}</p>
            </div>
          </div>
        </div>
      ),
    },

    StatsGrid: {
      fields: {
        stat1Number: { type: 'text', label: 'Chỉ số 1: Số' },
        stat1Label: { type: 'text', label: 'Chỉ số 1: Nhãn' },
        stat2Number: { type: 'text', label: 'Chỉ số 2: Số' },
        stat2Label: { type: 'text', label: 'Chỉ số 2: Nhãn' },
        stat3Number: { type: 'text', label: 'Chỉ số 3: Số' },
        stat3Label: { type: 'text', label: 'Chỉ số 3: Nhãn' },
      },
      defaultProps: {
        stat1Number: '15,000+',
        stat1Label: 'Học Sinh Đã Tham Gia',
        stat2Number: '100%',
        stat2Label: 'Chuẩn An Toàn Quốc Tế',
        stat3Number: '12+',
        stat3Label: 'Năm Kinh Nghiệm Dã Ngoại',
      },
      render: ({ stat1Number, stat1Label, stat2Number, stat2Label, stat3Number, stat3Label }) => (
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#E8EFD9]/60 p-6 rounded-3xl border border-[#5C7A3E]/30 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-black text-[#5C7A3E]">{stat1Number}</div>
            <div className="text-xs font-bold text-slate-700">{stat1Label}</div>
          </div>
          <div className="space-y-1 sm:border-x sm:border-[#5C7A3E]/20">
            <div className="text-3xl font-black text-[#5C7A3E]">{stat2Number}</div>
            <div className="text-xs font-bold text-slate-700">{stat2Label}</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-[#5C7A3E]">{stat3Number}</div>
            <div className="text-xs font-bold text-slate-700">{stat3Label}</div>
          </div>
        </div>
      ),
    },

    TimelineSteps: {
      fields: {
        mainTitle: { type: 'text', label: 'Tiêu đề Lộ Trình' },
        step1Title: { type: 'text', label: 'Bước 1: Tiêu đề' },
        step1Desc: { type: 'textarea', label: 'Bước 1: Nội dung' },
        step2Title: { type: 'text', label: 'Bước 2: Tiêu đề' },
        step2Desc: { type: 'textarea', label: 'Bước 2: Nội dung' },
        step3Title: { type: 'text', label: 'Bước 3: Tiêu đề' },
        step3Desc: { type: 'textarea', label: 'Bước 3: Nội dung' },
      },
      defaultProps: {
        mainTitle: 'Lịch Trình Trải Nghiệm 3 Ngày 2 Đêm',
        step1Title: 'Ngày 1: Tập Tập & Nhập Trại Sinh Tồn',
        step1Desc: 'Phổ biến nội quy trại, chia đội nhóm, thực hành dựng lều dã ngoại và làm quen rừng núi.',
        step2Title: 'Ngày 2: Chinh Phục Rừng Già & Kỹ Năng Nước',
        step2Desc: 'Định vị bằng la bàn, vượt chướng ngại vật hoang dã, thực hành lọc nước sạch và đêm lửa trại.',
        step3Title: 'Ngày 3: Tổng Kết & Trao Chứng Nhận',
        step3Desc: 'Thu dọn hành trang, tổng kết bài học tự lập, trao huy hiệu chiến binh KynangCK.',
      },
      render: ({ mainTitle, step1Title, step1Desc, step2Title, step2Desc, step3Title, step3Desc }) => (
        <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
          {mainTitle && <h3 className="text-xl font-black text-slate-900 text-center">{mainTitle}</h3>}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">01</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{step1Title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step1Desc}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">02</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{step2Title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step2Desc}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">03</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{step3Title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    ContentList: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Danh sách' },
        item1: { type: 'text', label: 'Mục 1' },
        item2: { type: 'text', label: 'Mục 2' },
        item3: { type: 'text', label: 'Mục 3' },
      },
      defaultProps: {
        title: 'Quyền Lợi Của Học Viên',
        item1: 'Được trang bị đồng phục sinh tồn & dụng cụ bảo hộ chuẩn',
        item2: 'Bảo hiểm du lịch dã ngoại trọn gói suốt hành trình',
        item3: 'Bảng đánh giá năng lực tâm lý & kỹ năng cá nhân gửi phụ huynh',
      },
      render: ({ title, item1, item2, item3 }) => (
        <div className="my-6 space-y-3">
          {title && <h3 className="font-bold text-slate-900 text-base">{title}</h3>}
          <ul className="list-disc list-inside space-y-1.5 text-slate-700 text-sm">
            {item1 && <li>{item1}</li>}
            {item2 && <li>{item2}</li>}
            {item3 && <li>{item3}</li>}
          </ul>
        </div>
      ),
    },

    IconList: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề' },
        item1: { type: 'text', label: 'Mục 1' },
        item2: { type: 'text', label: 'Mục 2' },
        item3: { type: 'text', label: 'Mục 3' },
      },
      defaultProps: {
        title: 'Cam Kết An Toàn Tối Đa',
        item1: 'Tỷ lệ 1 huấn luyện viên theo sát 5 học sinh',
        item2: 'Y tế lưu động trực 24/24 suốt chuyến đi',
        item3: 'Cập nhật nhật ký & hình ảnh cho phụ huynh theo giờ',
      },
      render: ({ title, item1, item2, item3 }) => (
        <div className="my-6 p-5 bg-[#E8EFD9]/40 border border-[#5C7A3E]/30 rounded-2xl space-y-3">
          {title && <h3 className="font-extrabold text-[#5C7A3E] text-base">{title}</h3>}
          <div className="space-y-2">
            {item1 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-800 font-medium">
                <Check className="h-4 w-4 text-[#5C7A3E] shrink-0" />
                <span>{item1}</span>
              </div>
            )}
            {item2 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-800 font-medium">
                <Check className="h-4 w-4 text-[#5C7A3E] shrink-0" />
                <span>{item2}</span>
              </div>
            )}
            {item3 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-800 font-medium">
                <Check className="h-4 w-4 text-[#5C7A3E] shrink-0" />
                <span>{item3}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },

    QuoteBlock: {
      fields: {
        quote: { type: 'textarea', label: 'Lời trích dẫn' },
        author: { type: 'text', label: 'Tác giả / Nguồn' },
      },
      defaultProps: {
        quote: 'Mỗi chuyến đi dã ngoại là một bài học thực tế vô giá giúp con tự khai phá tiềm năng của chính mình.',
        author: 'Ban Cố Vấn Dã Ngoại Connect Kids',
      },
      render: ({ quote, author, puck }) => (
        <blockquote className="my-6 border-l-4 border-[#5C7A3E] pl-6 py-3 bg-[#E8EFD9]/40 rounded-r-2xl text-slate-800 italic">
          <p
            className="text-base font-medium outline-none focus:ring-2 focus:ring-emerald-300 rounded px-1"
            contentEditable={puck?.isEditing}
            suppressContentEditableWarning
          >
            "{quote}"
          </p>
          {author && <cite className="block mt-2 text-xs font-bold text-[#5C7A3E] not-italic">— {author}</cite>}
        </blockquote>
      ),
    },

    NoticeAlert: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Thông Báo' },
        content: { type: 'textarea', label: 'Nội dung chú ý' },
        type: {
          type: 'select',
          label: 'Loại thông báo',
          options: [
            { label: 'Cảnh báo / Lưu ý (Vàng)', value: 'warning' },
            { label: 'Tin tức / Mẹo (Xanh lá)', value: 'info' },
            { label: 'Quan trọng (Đỏ)', value: 'danger' },
          ],
        },
      },
      defaultProps: {
        title: 'Lưu Ý Quan Trọng Cho Phụ Huynh',
        content: 'Phụ huynh vui lòng chuẩn bị trang phục thể thao thoải mái, giày leo núi và mang theo bình nước cá nhân cho các con trước ngày khởi hành 1 ngày.',
        type: 'warning',
      },
      render: ({ title, content, type }) => {
        const bg = type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' : type === 'info' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900';
        return (
          <div className={`my-6 p-5 rounded-2xl border ${bg} space-y-1.5`}>
            {title && <h4 className="font-extrabold text-sm">{title}</h4>}
            <p className="text-xs leading-relaxed opacity-90">{content}</p>
          </div>
        );
      },
    },

    // ==========================================
    // 4. MEDIA BLOCKS
    // ==========================================
    VideoEmbed: {
      fields: {
        videoUrl: { type: 'text', label: 'Link Video (YouTube Embed URL)' },
        title: { type: 'text', label: 'Tiêu đề Video' },
        caption: { type: 'text', label: 'Chú thích bên dưới' },
      },
      defaultProps: {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Video Toàn Cảnh Chuyến Dã Ngoại Sinh Tồn',
        caption: 'Ghi lại những khoảnh khắc đáng nhớ của các chiến binh nhí KynangCK.',
      },
      render: ({ videoUrl, title, caption }) => (
        <div className="my-8 space-y-3">
          {title && <h3 className="text-lg font-bold text-slate-900 text-center">{title}</h3>}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <iframe src={videoUrl} title={title} className="w-full h-full" allowFullScreen />
          </div>
          {caption && <p className="text-xs text-slate-500 text-center italic">{caption}</p>}
        </div>
      ),
    },

    ImageWithText: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề' },
        text: { type: 'textarea', label: 'Mô tả nội dung' },
        imageUrl: { type: 'text', label: 'Link Ảnh (URL)' },
        layout: {
          type: 'radio',
          label: 'Vị trí ảnh',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Phải', value: 'right' },
          ],
        },
      },
      defaultProps: {
        title: 'Học Thông Qua Trải Nghiệm Thực Tế',
        text: 'Giúp trẻ em phát triển tư duy sáng tạo, tự lập và tự tin đối mặt thử thách.',
        imageUrl: 'https://images.unsplash.com/photo-1476514525535-ce74f45814d0?auto=format&fit=crop&w=800&q=80',
        layout: 'left',
      },
      render: ({ title, text, imageUrl, layout }) => (
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {layout === 'left' && <img src={imageUrl} alt={title} className="w-full h-64 object-cover rounded-2xl shadow-md" />}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-700 text-sm leading-relaxed">{text}</p>
          </div>
          {layout === 'right' && <img src={imageUrl} alt={title} className="w-full h-64 object-cover rounded-2xl shadow-md" />}
        </div>
      ),
    },

    ImageGallery: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Bộ Ảnh' },
        img1: { type: 'text', label: 'Link Ảnh 1' },
        img2: { type: 'text', label: 'Link Ảnh 2' },
        img3: { type: 'text', label: 'Link Ảnh 3' },
      },
      defaultProps: {
        title: 'Thư Viện Khoảnh Khắc Dã Ngoại',
        img1: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
        img2: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=600&q=80',
        img3: 'https://images.unsplash.com/photo-1476514525535-ce74f45814d0?auto=format&fit=crop&w=600&q=80',
      },
      render: ({ title, img1, img2, img3 }) => (
        <div className="my-8 space-y-4">
          {title && <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {img1 && <img src={img1} alt="Gallery 1" className="w-full h-48 object-cover rounded-2xl shadow-xs" />}
            {img2 && <img src={img2} alt="Gallery 2" className="w-full h-48 object-cover rounded-2xl shadow-xs" />}
            {img3 && <img src={img3} alt="Gallery 3" className="w-full h-48 object-cover rounded-2xl shadow-xs" />}
          </div>
        </div>
      ),
    },

    LogoCarousel: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Đối Tác' },
      },
      defaultProps: {
        title: 'Đơn Vị Đồng Hành & Đối Tác Trường Học',
      },
      render: ({ title }) => (
        <div className="my-8 text-center space-y-4 bg-slate-50 py-6 px-4 rounded-3xl border border-slate-200/80">
          {title && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80 font-bold text-slate-700 text-sm sm:text-base">
            <span className="bg-white px-4 py-2 rounded-xl border border-slate-200">🏫 Vinschool</span>
            <span className="bg-[#E8EFD9] px-4 py-2 rounded-xl text-[#5C7A3E]">🍃 KynangCK</span>
            <span className="bg-white px-4 py-2 rounded-xl border border-slate-200">🚀 Connect Kids</span>
            <span className="bg-white px-4 py-2 rounded-xl border border-slate-200">⛺ CampMaster</span>
          </div>
        </div>
      ),
    },

    BeforeAfter: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề So Sánh' },
        beforeText: { type: 'textarea', label: 'Trước khi tham gia' },
        afterText: { type: 'textarea', label: 'Sau khi tham gia' },
      },
      defaultProps: {
        title: 'Sự Trưởng Thành Của Học Sinh',
        beforeText: 'Ngại ngùng, phụ thuộc vào bố mẹ, thiếu kỹ năng xử lý tình huống bất ngờ.',
        afterText: 'Tự tin, biết lắng nghe, chủ động dựng lều, nấu ăn và hỗ trợ bạn bè.',
      },
      render: ({ title, beforeText, afterText }) => (
        <div className="my-8 p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
          {title && <h3 className="text-lg font-black text-slate-900 text-center">{title}</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-rose-700 uppercase">Trước Chuyến Đi</span>
              <p className="text-xs text-rose-900 leading-relaxed">{beforeText}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase">Sau Chuyến Đi</span>
              <p className="text-xs text-emerald-900 leading-relaxed">{afterText}</p>
            </div>
          </div>
        </div>
      ),
    },

    // ==========================================
    // 5. ADVANCED BLOCKS
    // ==========================================
    PricingCards: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Học Phí' },
        packageName: { type: 'text', label: 'Tên Khóa Học' },
        price: { type: 'text', label: 'Giá Học Phí' },
        unit: { type: 'text', label: 'Đơn vị / Thời lượng' },
        feature1: { type: 'text', label: 'Đặc quyền 1' },
        feature2: { type: 'text', label: 'Đặc quyền 2' },
        feature3: { type: 'text', label: 'Đặc quyền 3' },
      },
      defaultProps: {
        title: 'Chi Phí Tham Gia Dã Ngoại',
        packageName: 'Khóa Sinh Tồn 2 Ngày 1 Đêm',
        price: '2.500.000 VNĐ',
        unit: '/ Học sinh',
        feature1: 'Trọn gói xe đưa đón & ăn uống 4 bữa',
        feature2: 'Bộ trang phục chiến binh & huy hiệu KynangCK',
        feature3: 'Bảo hiểm dã ngoại trọn gói',
      },
      render: ({ title, packageName, price, unit, feature1, feature2, feature3 }) => (
        <div className="my-8 space-y-4 max-w-md mx-auto">
          {title && <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>}
          <div className="p-6 bg-white border-2 border-[#5C7A3E] rounded-3xl shadow-md text-center space-y-4">
            <div className="inline-block bg-[#E8EFD9] text-[#5C7A3E] text-xs font-bold px-3 py-1 rounded-full uppercase">
              Gói Ưa Chuộng Nhất
            </div>
            <h4 className="text-lg font-black text-slate-900">{packageName}</h4>
            <div className="text-3xl font-black text-[#5C7A3E]">
              {price} <span className="text-xs text-slate-500 font-normal">{unit}</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 text-left pt-2 border-t border-slate-100">
              {feature1 && <li>✓ {feature1}</li>}
              {feature2 && <li>✓ {feature2}</li>}
              {feature3 && <li>✓ {feature3}</li>}
            </ul>
            <button className="w-full bg-[#5C7A3E] text-white font-extrabold py-3 rounded-xl text-xs hover:bg-[#4A6431] transition">
              Đăng Ký Giữ Chỗ
            </button>
          </div>
        </div>
      ),
    },

    PricingTable: {
      render: () => (
        <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 text-center">
          <h3 className="font-extrabold text-slate-900">Bảng So Sánh Chi Tiết Các Gói Dã Ngoại</h3>
          <p className="text-xs text-slate-500">Mời bạn chọn khóa học 1 ngày, 2 ngày 1 đêm hoặc 3 ngày 2 đêm phù hợp với con.</p>
        </div>
      ),
    },

    TestimonialGrid: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Cảm Nhận' },
        parent1Name: { type: 'text', label: 'Phụ huynh 1' },
        comment1: { type: 'textarea', label: 'Nội dung 1' },
        parent2Name: { type: 'text', label: 'Phụ huynh 2' },
        comment2: { type: 'textarea', label: 'Nội dung 2' },
      },
      defaultProps: {
        title: 'Phụ Huynh Nói Gì Về KynangCK',
        parent1Name: 'Chị Minh Anh (Mẹ bé Đức Minh - 10 tuổi)',
        comment1: 'Bé đi dã ngoại về ngoan hẳn ra, biết tự gấp chăn mền và xếp gọn quần áo. Rất tự hào về con!',
        parent2Name: 'Anh Quốc Bảo (Bố bé Bảo Nam - 12 tuổi)',
        comment2: 'Chuyến đi an toàn, HLV theo sát chu đáo. Bé bảo chuyến dã ngoại này vui nhất từ trước đến nay!',
      },
      render: ({ title, parent1Name, comment1, parent2Name, comment2 }) => (
        <div className="my-8 space-y-4">
          {title && <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <div className="text-amber-400 text-xs">★★★★★</div>
              <p className="text-xs text-slate-700 italic">"{comment1}"</p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">— {parent1Name}</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
              <div className="text-amber-400 text-xs">★★★★★</div>
              <p className="text-xs text-slate-700 italic">"{comment2}"</p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">— {parent2Name}</div>
            </div>
          </div>
        </div>
      ),
    },

    TestimonialCarousel: {
      render: () => (
        <div className="my-6 p-6 bg-[#E8EFD9]/50 border border-[#5C7A3E]/30 rounded-3xl text-center space-y-2">
          <div className="text-amber-500 font-bold text-sm">★★★★★</div>
          <p className="text-sm italic text-slate-800">"Chương trình dã ngoại thực sự chất lượng, con tôi có thêm nhiều bạn mới và tự tin hơn hẳn."</p>
          <p className="text-xs font-bold text-[#5C7A3E]">— Phụ huynh Học Viên KynangCK</p>
        </div>
      ),
    },

    FAQAccordion: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề FAQ' },
        q1: { type: 'text', label: 'Câu hỏi 1' },
        a1: { type: 'textarea', label: 'Trả lời 1' },
        q2: { type: 'text', label: 'Câu hỏi 2' },
        a2: { type: 'textarea', label: 'Trả lời 2' },
      },
      defaultProps: {
        title: 'Câu Hỏi Thường Gặp (FAQ)',
        q1: 'Độ tuổi nào phù hợp tham gia chuyến dã ngoại?',
        a1: 'Chương trình được thiết kế tối ưu cho học sinh từ 6 đến 15 tuổi, chia nhóm theo độ tuổi tương đồng.',
        q2: 'Nếu thời tiết xấu mưa lớn thì xử lý ra sao?',
        a2: 'Ban tổ chức luôn có phương án B tại khu vực lều bạt kiên cố và nhà đa năng đảm bảo an toàn tuyệt đối.',
      },
      render: ({ title, q1, a1, q2, a2 }) => (
        <div className="my-8 space-y-4 max-w-2xl mx-auto">
          {title && <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>}
          <div className="space-y-3">
            <details className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer shadow-xs">
              <summary className="font-bold text-slate-900 text-sm">{q1}</summary>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a1}</p>
            </details>
            <details className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer shadow-xs">
              <summary className="font-bold text-slate-900 text-sm">{q2}</summary>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a2}</p>
            </details>
          </div>
        </div>
      ),
    },

    TeamMembers: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Đội Ngũ' },
        m1Name: { type: 'text', label: 'HLV 1: Tên' },
        m1Role: { type: 'text', label: 'HLV 1: Chức danh' },
        m2Name: { type: 'text', label: 'HLV 2: Tên' },
        m2Role: { type: 'text', label: 'HLV 2: Chức danh' },
      },
      defaultProps: {
        title: 'Đội Ngũ Huấn Luyện Viên Hàng Đầu',
        m1Name: 'Thầy Nguyễn Văn Nam',
        m1Role: 'Tổng Trưởng Trại Sinh Tồn KynangCK',
        m2Name: 'Cô Trần Hải Yến',
        m2Role: 'Chuyên Gia Tâm Lý Trẻ Em',
      },
      render: ({ title, m1Name, m1Role, m2Name, m2Role }) => (
        <div className="my-8 space-y-4">
          {title && <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-2 shadow-xs">
              <div className="w-16 h-16 bg-[#5C7A3E] text-amber-300 font-black text-xl rounded-full flex items-center justify-center mx-auto">
                HLV
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{m1Name}</h4>
              <p className="text-xs text-slate-500">{m1Role}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-2 shadow-xs">
              <div className="w-16 h-16 bg-[#5C7A3E] text-amber-300 font-black text-xl rounded-full flex items-center justify-center mx-auto">
                HLV
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{m2Name}</h4>
              <p className="text-xs text-slate-500">{m2Role}</p>
            </div>
          </div>
        </div>
      ),
    },

    PortfolioGrid: {
      render: () => (
        <div className="my-6 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Các Điểm Trại Dã Ngoại Tiêu Biểu</h3>
          <p className="text-xs text-slate-500">Ba Vì • Cúc Phương • Ba Bể • Cát Bà</p>
        </div>
      ),
    },

    CountdownTimer: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Đếm Ngược' },
        targetDate: { type: 'text', label: 'Ngày hết hạn' },
      },
      defaultProps: {
        title: 'Chỉ Còn Vài Ngày Để Đăng Ký Giảm 20% Học Phí',
        targetDate: '3 Ngày : 12 Giờ : 45 Phút',
      },
      render: ({ title, targetDate }) => (
        <div className="my-6 p-6 bg-amber-400 text-slate-900 rounded-3xl text-center space-y-3 shadow-md">
          <h3 className="font-black text-lg">{title}</h3>
          <div className="text-2xl font-mono font-extrabold bg-slate-900 text-amber-300 py-2 px-4 rounded-xl inline-block">
            {targetDate}
          </div>
        </div>
      ),
    },

    FlipBox: {
      fields: {
        frontText: { type: 'text', label: 'Mặt trước' },
        backText: { type: 'textarea', label: 'Mặt sau' },
      },
      defaultProps: {
        frontText: '💡 Rèn Luyện Bản Lĩnh Tự Lập',
        backText: 'Trẻ tự phân công công việc, giải quyết bất đồng nhóm và tự tin đưa ra quyết định.',
      },
      render: ({ frontText, backText }) => (
        <div className="my-6 p-6 bg-gradient-to-r from-[#5C7A3E] to-[#4A6431] text-white rounded-2xl text-center space-y-2 shadow-sm">
          <h4 className="font-extrabold text-base">{frontText}</h4>
          <p className="text-xs text-slate-100">{backText}</p>
        </div>
      ),
    },

    ContactForm: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Form' },
        subtitle: { type: 'text', label: 'Mô tả phụ' },
      },
      defaultProps: {
        title: 'Đăng Ký Tư Vấn & Giữ Chỗ Dã Ngoại',
        subtitle: 'Để lại thông tin, tư vấn viên Connect Kids sẽ liên hệ ngay trong 15 phút.',
      },
      render: ({ title, subtitle }) => (
        <div className="my-8 p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-md max-w-lg mx-auto">
          <div className="text-center space-y-1">
            <h3 className="font-black text-slate-900 text-lg">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Họ tên phụ huynh *" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" readOnly />
            <input type="text" placeholder="Số điện thoại Zalo *" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" readOnly />
            <input type="text" placeholder="Tuổi của bé *" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" readOnly />
            <button className="w-full bg-[#5C7A3E] text-white font-extrabold py-3 rounded-xl text-xs hover:bg-[#4A6431] transition">
              Gửi Đăng Ký Trực Tiếp
            </button>
          </div>
        </div>
      ),
    },

    NewsletterForm: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Newsletter' },
      },
      defaultProps: {
        title: 'Nhận Cẩm Nang Kỹ Năng Cho Trẻ Hàng Tuần',
      },
      render: ({ title }) => (
        <div className="my-6 p-6 bg-[#E8EFD9] rounded-3xl text-center space-y-3 border border-[#5C7A3E]/30">
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
          <div className="flex items-center max-w-md mx-auto gap-2">
            <input type="email" placeholder="Nhập Email của bạn..." className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs" readOnly />
            <button className="bg-[#5C7A3E] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0">Đăng Ký</button>
          </div>
        </div>
      ),
    },

    EquipmentChecklist: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Danh Sách' },
        item1: { type: 'text', label: 'Mục 1' },
        item2: { type: 'text', label: 'Mục 2' },
        item3: { type: 'text', label: 'Mục 3' },
        item4: { type: 'text', label: 'Mục 4' },
      },
      defaultProps: {
        title: 'Hành Trang Cần Chuẩn Bị Cho Bé',
        item1: '02 Bộ quần áo thể thao co giãn & 01 áo khoác nhẹ',
        item2: 'Giày thể thao ôm chân & 02 đôi tất cổ cao',
        item3: 'Bình nước dã ngoại cá nhân (tối thiểu 800ml)',
        item4: 'Mũ lưỡi trai, kem chống muỗi & thuốc cá nhân (nếu có)',
      },
      render: ({ title, item1, item2, item3, item4 }) => (
        <div className="my-6 p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
          {title && <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">{title}</h3>}
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {item1 && <li className="flex items-center space-x-2"><span className="text-[#5C7A3E] font-bold">✓</span><span>{item1}</span></li>}
            {item2 && <li className="flex items-center space-x-2"><span className="text-[#5C7A3E] font-bold">✓</span><span>{item2}</span></li>}
            {item3 && <li className="flex items-center space-x-2"><span className="text-[#5C7A3E] font-bold">✓</span><span>{item3}</span></li>}
            {item4 && <li className="flex items-center space-x-2"><span className="text-[#5C7A3E] font-bold">✓</span><span>{item4}</span></li>}
          </ul>
        </div>
      ),
    },

    // ==========================================
    // 6. FOOTER & MISC
    // ==========================================
    FooterBlock: {
      fields: {
        brandName: { type: 'text', label: 'Tên Thương Hiệu' },
        description: { type: 'textarea', label: 'Mô tả Footer' },
        phone: { type: 'text', label: 'Hotline' },
        email: { type: 'text', label: 'Email' },
      },
      defaultProps: {
        brandName: 'Connect Kids - KynangCK',
        description: 'Hệ thống giáo dục kỹ năng dã ngoại & trải nghiệm sinh tồn thực tế cho trẻ em Việt Nam.',
        phone: '0988 123 456',
        email: 'lienhe@connectkids.edu.vn',
      },
      render: ({ brandName, description, phone, email }) => (
        <footer className="my-8 bg-slate-900 text-slate-300 p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-white font-black text-base">{brandName}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm">Liên Hệ</h5>
              <p className="text-xs text-slate-400">📞 {phone}</p>
              <p className="text-xs text-slate-400">✉️ {email}</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm">Theo Dõi Kết Nối</h5>
              <p className="text-xs text-slate-400">Facebook | YouTube | TikTok KynangCK</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </div>
        </footer>
      ),
    },

    FooterColumn: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề Cột' },
        l1: { type: 'text', label: 'Link 1' },
        l2: { type: 'text', label: 'Link 2' },
        l3: { type: 'text', label: 'Link 3' },
      },
      defaultProps: {
        title: 'Chương Trình',
        l1: 'Dã ngoại sinh tồn 2D1N',
        l2: 'Trải nghiệm kỹ năng sống',
        l3: 'Hoạt động trường học',
      },
      render: ({ title, l1, l2, l3 }) => (
        <div className="space-y-2 text-xs">
          <h5 className="font-bold text-slate-900">{title}</h5>
          <ul className="space-y-1 text-slate-600">
            {l1 && <li>• {l1}</li>}
            {l2 && <li>• {l2}</li>}
            {l3 && <li>• {l3}</li>}
          </ul>
        </div>
      ),
    },

    SocialIcons: {
      render: () => (
        <div className="my-4 flex items-center justify-center space-x-4 text-slate-600">
          <span className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 cursor-pointer">🌐 Facebook</span>
          <span className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 cursor-pointer">📺 YouTube</span>
          <span className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 cursor-pointer">📸 Instagram</span>
        </div>
      ),
    },

    CopyrightBar: {
      fields: {
        text: { type: 'text', label: 'Nội dung Bản quyền' },
      },
      defaultProps: {
        text: '© 2026 Connect Kids - Học Viện Kỹ Năng Dã Ngoại. Bảo lưu mọi quyền.',
      },
      render: ({ text }) => (
        <div className="my-4 py-4 text-center text-xs text-slate-500 border-t border-slate-200">
          {text}
        </div>
      ),
    },

    BackToTop: {
      render: () => (
        <div className="my-4 text-center">
          <button className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold transition">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Về Đầu Trang</span>
          </button>
        </div>
      ),
    },

    LegalLinks: {
      render: () => (
        <div className="my-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <a href="#terms" className="hover:underline">Điều Khoản Sử Dụng</a>
          <span>•</span>
          <a href="#privacy" className="hover:underline">Chính Sách Bảo Mật</a>
          <span>•</span>
          <a href="#safety" className="hover:underline">Quy Chuẩn An Toàn</a>
        </div>
      ),
    },

    NewsletterSignup: {
      fields: {
        title: { type: 'text', label: 'Tiêu đề' },
      },
      defaultProps: {
        title: 'Đăng ký nhận tin tức khóa học mới',
      },
      render: ({ title }) => (
        <div className="my-4 p-4 bg-slate-900 text-white rounded-2xl text-center space-y-2">
          <p className="text-xs font-bold">{title}</p>
          <div className="flex gap-2 max-w-xs mx-auto">
            <input type="email" placeholder="Email..." className="px-3 py-1.5 rounded-lg text-slate-900 text-xs flex-1" readOnly />
            <button className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold">Gửi</button>
          </div>
        </div>
      ),
    },
  },
};
