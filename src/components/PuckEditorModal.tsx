import React, { useState, useEffect } from 'react';
import { Puck, Data } from '@measured/puck';
import '@measured/puck/puck.css';
import { Save, Layout, X, Sparkles, Undo, Redo, Eye } from 'lucide-react';
import { puckConfig } from '../config/puck.config';

interface PuckEditorModalProps {
  initialContent: string;
  onSave: (compiledHtml: string) => void;
  onClose: () => void;
}

// Initial Puck Data Template
const initialPuckData: Data = {
  content: [
    {
      type: 'HeroBanner',
      props: {
        id: 'hero-1',
        title: 'Hành Trình Dã Ngoại Sinh Tồn KynangCK',
        subtitle: 'Rèn luyện bản lĩnh tự lập, tinh thần đồng đội và kỹ năng ứng biến hoang dã cho học sinh.',
        badge: 'Trải Nghiệm Thực Tế',
        bgImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Đăng Ký Khóa Học',
        buttonLink: '#contact'
      }
    },
    {
      type: 'Heading',
      props: {
        id: 'heading-1',
        title: 'Mục Tiêu Đào Tạo Kỹ Năng',
        size: 'medium',
        align: 'center'
      }
    },
    {
      type: 'Paragraph',
      props: {
        id: 'para-1',
        text: 'Nội dung chia sẻ chi tiết về chuyến dã ngoại. Các con học sinh sẽ được tham gia trực tiếp vào các hoạt động thực tế dưới sự hướng dẫn của huấn luyện viên chuyên nghiệp.',
        align: 'left'
      }
    },
    {
      type: 'FeatureCards',
      props: {
        id: 'features-1',
        mainTitle: 'Giá Trị Nổi Bật Của Khóa Học',
        item1Title: 'Tự Lập & Tự Giác',
        item1Desc: 'Tự phục vụ bản thân, quản lý đồ dùng cá nhân và sắp xếp thời gian.',
        item2Title: 'Ứng Phó Sinh Tồn',
        item2Desc: 'Biết dựng lều, nhóm lửa, tìm nước sạch và phát tín hiệu SOS.',
        item3Title: 'Đồng Đội & Kỷ Luật',
        item3Desc: 'Gắn kết bạn bè, nâng cao tinh thần trách nhiệm tập thể.'
      }
    },
    {
      type: 'ButtonCTA',
      props: {
        id: 'cta-1',
        text: 'Đăng Ký Tư Vấn Ngay',
        link: '#contact',
        variant: 'primary',
        size: 'lg',
        align: 'center'
      }
    }
  ],
  root: { props: { title: 'KynangCK Visual Editor Page' } }
};

// Safe Base64 Helpers to prevent HTML comment breaks
const safeBase64Encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch (e) {
    return '';
  }
};

const safeBase64Decode = (str: string): string => {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch (e) {
    return '';
  }
};

export const parsePuckDataFromContent = (content: string): Data => {
  if (!content) return initialPuckData;

  // 1. Try Base64 encoded comment format (most robust)
  const b64Match = content.match(/<!-- PUCK_DATA_B64:\s*([A-Za-z0-9+/=]+)\s*-->/);
  if (b64Match && b64Match[1]) {
    const decoded = safeBase64Decode(b64Match[1]);
    if (decoded) {
      try {
        const parsed = JSON.parse(decoded);
        if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse Puck Base64 data:', e);
      }
    }
  }

  // 2. Try raw comment format <!-- PUCK_DATA: ... -->
  const match = content.match(/<!-- PUCK_DATA:\s*([\s\S]*?)\s*-->/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse Puck raw data:', e);
    }
  }

  // 3. Fallback: If content has plain text or HTML, import into RichText block
  if (content.trim().length > 0) {
    return {
      content: [
        {
          type: 'RichText',
          props: {
            id: 'imported-content-1',
            content: content
          }
        }
      ],
      root: { props: { title: 'KynangCK Visual Editor Page' } }
    };
  }

  return initialPuckData;
};

export const PuckEditorModal: React.FC<PuckEditorModalProps> = ({
  initialContent,
  onSave,
  onClose
}) => {
  const [puckData, setPuckData] = useState<Data>(() => parsePuckDataFromContent(initialContent));
  const [editorKey, setEditorKey] = useState<number>(() => Date.now());

  // Update Puck state and force re-mount if initialContent prop changes
  useEffect(() => {
    const parsed = parsePuckDataFromContent(initialContent);
    setPuckData(parsed);
    setEditorKey(Date.now());
  }, [initialContent]);

  const compilePuckDataToHtml = (data: Data): string => {
    let compiledHtml = '';

    (data.content || []).forEach((item) => {
      const props = item.props || {};
      switch (item.type) {
        case 'HeroBanner':
          compiledHtml += `<div class="puck-hero rounded-3xl overflow-hidden my-6 py-14 px-8 text-white bg-cover bg-center shadow-lg" style="background-image: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('${props.bgImage || ''}')">
  <div class="max-w-2xl space-y-3">
    ${props.badge ? `<span class="bg-[#5C7A3E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">${props.badge}</span>` : ''}
    <h1 class="text-3xl sm:text-5xl font-black text-white mt-2">${props.title || ''}</h1>
    <p class="text-slate-100 text-sm sm:text-base leading-relaxed">${props.subtitle || ''}</p>
    ${props.buttonText ? `<div class="pt-2"><a href="${props.buttonLink || '#'}" class="inline-block bg-amber-400 text-slate-900 font-extrabold px-6 py-2.5 rounded-xl text-xs">${props.buttonText}</a></div>` : ''}
  </div>
</div>\n\n`;
          break;
        case 'Heading':
          compiledHtml += `<div class="my-6 text-${props.align || 'center'}">
  <h2 class="${props.size === 'large' ? 'text-3xl sm:text-4xl font-black' : 'text-2xl font-extrabold'} text-slate-900">${props.title || ''}</h2>
</div>\n\n`;
          break;
        case 'Subheading':
          compiledHtml += `<div class="my-2 text-${props.align || 'center'}">
  <p class="text-sm font-semibold text-[#5C7A3E] uppercase tracking-wider">${props.text || ''}</p>
</div>\n\n`;
          break;
        case 'Paragraph':
          compiledHtml += `<p class="my-4 text-slate-700 leading-relaxed text-sm sm:text-base text-${props.align || 'left'}">${props.text || ''}</p>\n\n`;
          break;
        case 'RichText':
          compiledHtml += `<div class="my-4 text-slate-800 text-sm leading-relaxed">${props.content || ''}</div>\n\n`;
          break;
        case 'ImageBlock':
          compiledHtml += `<div class="my-6 text-center">
  <img src="${props.url || ''}" alt="${props.alt || ''}" class="w-full max-h-[450px] object-cover rounded-2xl shadow-md mx-auto" />
  ${props.caption ? `<p class="text-xs text-slate-500 italic mt-2">${props.caption}</p>` : ''}
</div>\n\n`;
          break;
        case 'ButtonCTA':
          compiledHtml += `<div class="my-4 text-${props.align || 'center'}">
  <a href="${props.link || '#'}" class="inline-block bg-[#5C7A3E] text-white font-extrabold px-6 py-2.5 rounded-xl text-sm shadow">${props.text || ''}</a>
</div>\n\n`;
          break;
        case 'FeatureCards':
          compiledHtml += `<div class="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
  ${props.mainTitle ? `<h3 class="text-xl font-extrabold text-slate-900 text-center">${props.mainTitle}</h3>` : ''}
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-5 rounded-2xl border border-slate-200">
      <h4 class="font-bold text-slate-900">${props.item1Title || ''}</h4>
      <p class="text-xs text-slate-600 mt-1">${props.item1Desc || ''}</p>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200">
      <h4 class="font-bold text-slate-900">${props.item2Title || ''}</h4>
      <p class="text-xs text-slate-600 mt-1">${props.item2Desc || ''}</p>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200">
      <h4 class="font-bold text-slate-900">${props.item3Title || ''}</h4>
      <p class="text-xs text-slate-600 mt-1">${props.item3Desc || ''}</p>
    </div>
  </div>
</div>\n\n`;
          break;
        case 'StatsGrid':
          compiledHtml += `<div class="my-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#E8EFD9]/60 p-6 rounded-3xl border border-[#5C7A3E]/30 text-center">
  <div>
    <div class="text-3xl font-black text-[#5C7A3E]">${props.stat1Number || ''}</div>
    <div class="text-xs font-bold text-slate-700">${props.stat1Label || ''}</div>
  </div>
  <div class="sm:border-x sm:border-[#5C7A3E]/20">
    <div class="text-3xl font-black text-[#5C7A3E]">${props.stat2Number || ''}</div>
    <div class="text-xs font-bold text-slate-700">${props.stat2Label || ''}</div>
  </div>
  <div>
    <div class="text-3xl font-black text-[#5C7A3E]">${props.stat3Number || ''}</div>
    <div class="text-xs font-bold text-slate-700">${props.stat3Label || ''}</div>
  </div>
</div>\n\n`;
          break;
        case 'TimelineSteps':
          compiledHtml += `<div class="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
  ${props.mainTitle ? `<h3 class="text-xl font-black text-slate-900 text-center">${props.mainTitle}</h3>` : ''}
  <div class="space-y-4">
    <div class="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
      <span class="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">01</span>
      <div>
        <h4 class="font-bold text-slate-900 text-sm">${props.step1Title || ''}</h4>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed">${props.step1Desc || ''}</p>
      </div>
    </div>
    <div class="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
      <span class="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">02</span>
      <div>
        <h4 class="font-bold text-slate-900 text-sm">${props.step2Title || ''}</h4>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed">${props.step2Desc || ''}</p>
      </div>
    </div>
    <div class="flex items-start space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
      <span class="bg-[#5C7A3E] text-amber-300 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">03</span>
      <div>
        <h4 class="font-bold text-slate-900 text-sm">${props.step3Title || ''}</h4>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed">${props.step3Desc || ''}</p>
      </div>
    </div>
  </div>
</div>\n\n`;
          break;
        case 'QuoteBlock':
          compiledHtml += `<blockquote class="my-6 border-l-4 border-[#5C7A3E] pl-6 py-3 bg-[#E8EFD9]/40 rounded-r-2xl text-slate-800 italic">
  <p class="text-base font-medium">"${props.quote || ''}"</p>
  ${props.author ? `<cite class="block mt-2 text-xs font-bold text-[#5C7A3E] not-italic">— ${props.author}</cite>` : ''}
</blockquote>\n\n`;
          break;
        case 'NoticeAlert':
          compiledHtml += `<div class="my-6 p-5 rounded-2xl border ${props.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' : props.type === 'info' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} space-y-1.5">
  ${props.title ? `<h4 class="font-extrabold text-sm">${props.title}</h4>` : ''}
  <p class="text-xs leading-relaxed opacity-90">${props.content || ''}</p>
</div>\n\n`;
          break;
        case 'VideoEmbed':
          compiledHtml += `<div class="my-8 space-y-3">
  ${props.title ? `<h3 class="text-lg font-bold text-slate-900 text-center">${props.title}</h3>` : ''}
  <div class="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200">
    <iframe src="${props.videoUrl || ''}" title="${props.title || ''}" class="w-full h-full" allowfullscreen></iframe>
  </div>
  ${props.caption ? `<p class="text-xs text-slate-500 text-center italic">${props.caption}</p>` : ''}
</div>\n\n`;
          break;
        case 'TwoColumnLayout':
          compiledHtml += `<div class="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
  ${props.imagePosition === 'left' ? `<img src="${props.imageUrl || ''}" alt="${props.title || ''}" class="w-full h-64 object-cover rounded-2xl shadow-md" />` : ''}
  <div class="space-y-3">
    <h3 class="text-2xl font-bold text-slate-900">${props.title || ''}</h3>
    <p class="text-slate-700 text-sm leading-relaxed">${props.text || ''}</p>
  </div>
  ${props.imagePosition === 'right' ? `<img src="${props.imageUrl || ''}" alt="${props.title || ''}" class="w-full h-64 object-cover rounded-2xl shadow-md" />` : ''}
</div>\n\n`;
          break;
        case 'EquipmentChecklist':
          compiledHtml += `<div class="my-6 p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
  ${props.title ? `<h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">${props.title}</h3>` : ''}
  <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
    ${props.item1 ? `<li class="flex items-center space-x-2"><span class="text-[#5C7A3E] font-bold">✓</span><span>${props.item1}</span></li>` : ''}
    ${props.item2 ? `<li class="flex items-center space-x-2"><span class="text-[#5C7A3E] font-bold">✓</span><span>${props.item2}</span></li>` : ''}
    ${props.item3 ? `<li class="flex items-center space-x-2"><span class="text-[#5C7A3E] font-bold">✓</span><span>${props.item3}</span></li>` : ''}
    ${props.item4 ? `<li class="flex items-center space-x-2"><span class="text-[#5C7A3E] font-bold">✓</span><span>${props.item4}</span></li>` : ''}
  </ul>
</div>\n\n`;
          break;
        default:
          if (props.title || props.text || props.content) {
            compiledHtml += `<div class="my-4 p-4 border border-slate-200 rounded-xl">
  ${props.title ? `<h3 class="font-bold text-slate-900 mb-2">${props.title}</h3>` : ''}
  ${props.text || props.content ? `<p class="text-slate-700 text-sm">${props.text || props.content}</p>` : ''}
</div>\n\n`;
          }
          break;
      }
    });

    const jsonStr = JSON.stringify(data);
    const b64Str = safeBase64Encode(jsonStr);

    compiledHtml += `\n<!-- PUCK_DATA_B64: ${b64Str} -->`;
    compiledHtml += `\n<!-- PUCK_DATA: ${jsonStr} -->`;
    return compiledHtml;
  };

  const handlePublish = (data: Data) => {
    setPuckData(data);
    const compiledHtml = compilePuckDataToHtml(data);
    onSave(compiledHtml);
  };

  const handleManualSave = () => {
    const compiledHtml = compilePuckDataToHtml(puckData);
    onSave(compiledHtml);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col backdrop-blur-sm animate-fadeIn">
      {/* FIXED TOP HEADER & TOOLBAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between text-white shrink-0 gap-3 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-[#5C7A3E] p-2 rounded-xl text-amber-300">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-black text-sm tracking-tight flex items-center space-x-2">
              <span>Puck React Visual Editor</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold">
                KynangCK Builder
              </span>
            </h2>
            <p className="text-slate-400 text-[11px]">Soạn thảo các trang Bài Viết, Trang Tĩnh & Landing Page kỹ năng</p>
          </div>
        </div>

        {/* TOP TOOLBAR: PUBLISH, UNDO, REDO, CANCEL */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              title="Khôi phục trạng thái (Sử dụng Ctrl+Z trong canvas)"
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-not-allowed opacity-75"
            >
              <Undo className="h-3.5 w-3.5" />
              <span>Undo (Ctrl+Z)</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              title="Làm lại (Sử dụng Ctrl+Y trong canvas)"
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-not-allowed opacity-75"
            >
              <Redo className="h-3.5 w-3.5" />
              <span>Redo (Ctrl+Y)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleManualSave}
            className="px-5 py-2 rounded-xl bg-[#5C7A3E] hover:bg-[#4A6431] text-amber-300 font-extrabold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer border border-[#5C7A3E]"
          >
            <Save className="h-4 w-4" />
            <span>Lưu & Xuất Bản</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Thoát</span>
          </button>
        </div>
      </div>

      {/* PUCK CANVAS AREA */}
      <div className="flex-grow overflow-hidden bg-slate-100 relative">
        <div key={editorKey} className="w-full h-full">
          <Puck
            config={puckConfig}
            data={puckData}
            onChange={(newData) => setPuckData(newData)}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </div>
  );
};
