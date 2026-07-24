import React, { useState, useEffect } from 'react';
import { parseVideoEmbedUrl } from '../types';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon,
  List as ListIcon,
  Heading as HeadingIcon,
  Quote as QuoteIcon,
  Columns as ColumnsIcon,
  FileText,
  Check,
  Compass,
  MapPin,
  Sparkles,
  Settings,
  Edit3,
  Eye,
  Save,
  Grid
} from 'lucide-react';

export interface BuilderBlock {
  id: string;
  type: 'hero' | 'paragraph' | 'image' | 'table' | 'bullet-list' | 'video' | 'quote' | 'columns-2';
  data: any;
}

interface VisualPageBuilderProps {
  initialContent: string;
  onSave: (compiledHtml: string) => void;
  onClose: () => void;
}

const IMAGE_PRESETS = [
  { name: 'Cắm trại đêm sao', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hành trình leo núi', url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lửa trại ấm áp', url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Đầu bếp nhí thực hành', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sơ cứu chấn thương dã ngoại', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bản đồ & La bàn sinh tồn', url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80' }
];

export const VisualPageBuilder: React.FC<VisualPageBuilderProps> = ({
  initialContent,
  onSave,
  onClose
}) => {
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Initialize and parse content
  useEffect(() => {
    const blockDataMatch = initialContent.match(/<!-- ELEMENTOR_BLOCKS:\s*([\s\S]*?)\s*-->/);
    if (blockDataMatch) {
      try {
        const parsedBlocks = JSON.parse(blockDataMatch[1]);
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
          setSelectedBlockId(parsedBlocks[0].id);
          return;
        }
      } catch (e) {
        console.error('Lỗi phân tích khối dữ liệu Elementor:', e);
      }
    }

    // Fallback to importing current text as a single Paragraph block if there are no blocks
    if (initialContent.trim()) {
      // Strip blocks comments if any corrupted remains
      const cleanContent = initialContent.replace(/<!-- ELEMENTOR_BLOCKS:[\s\S]*?-->/g, '').trim();
      setBlocks([
        {
          id: 'block-fallback-1',
          type: 'paragraph',
          data: {
            text: cleanContent,
            align: 'left',
            size: 'normal',
            bold: false,
            italic: false
          }
        }
      ]);
      setSelectedBlockId('block-fallback-1');
    } else {
      // Empty content starts with a Hero Headline and a Paragraph
      const initialBlocks: BuilderBlock[] = [
        {
          id: 'initial-hero',
          type: 'hero',
          data: {
            title: 'Tiêu Đề Dự Án/Bài Viết Mới',
            subtitle: 'Khẩu hiệu phụ thu hút hoặc tóm tắt ngắn về hoạt động dã ngoại.',
            color: 'emerald',
            size: 'large'
          }
        },
        {
          id: 'initial-p',
          type: 'paragraph',
          data: {
            text: 'Bấm trực tiếp vào các khối thông tin này để sửa nội dung của trang, hoặc dùng bảng điều khiển bên phải để định dạng hình ảnh, bảng biểu và video cực kỳ tiện lợi giống như Elementor!',
            align: 'left',
            size: 'normal'
          }
        }
      ];
      setBlocks(initialBlocks);
      setSelectedBlockId('initial-hero');
    }
  }, [initialContent]);

  // Compile blocks back to standard HTML with embedded block comment JSON
  const handleCompileAndSave = () => {
    let html = '';
    blocks.forEach(block => {
      switch (block.type) {
        case 'hero': {
          const colorClass = block.data.color === 'emerald' ? 'text-emerald-700' : block.data.color === 'amber' ? 'text-amber-600' : 'text-slate-800';
          const sizeClass = block.data.size === 'large' ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl';
          html += `<div style="text-align: center; margin-bottom: 2rem; padding: 1.5rem 0;" class="elementor-block-hero">\n`;
          html += `  <h1 class="${sizeClass} font-extrabold ${colorClass} tracking-tight">${block.data.title || ''}</h1>\n`;
          if (block.data.subtitle) {
            html += `  <p style="margin-top: 0.5rem;" class="text-sm text-slate-500 max-w-2xl mx-auto">${block.data.subtitle}</p>\n`;
          }
          html += `</div>\n\n`;
          break;
        }
        case 'paragraph': {
          const align = block.data.align || 'left';
          const isBold = block.data.bold ? 'font-bold' : '';
          const isItalic = block.data.italic ? 'italic' : '';
          const size = block.data.size === 'large' ? 'text-base sm:text-lg' : block.data.size === 'small' ? 'text-xs' : 'text-sm';
          const textWithLineBreaks = (block.data.text || '').replace(/\n/g, '<br/>');
          html += `<p style="text-align: ${align}; margin-bottom: 1.25rem; line-height: 1.7;" class="${size} ${isBold} ${isItalic} text-slate-700 elementor-block-paragraph">\n`;
          html += `  ${textWithLineBreaks}\n`;
          html += `</p>\n\n`;
          break;
        }
        case 'image': {
          const caption = block.data.caption ? `<p style="text-align: center; margin-top: 0.5rem;" class="text-xs text-slate-400 italic">${block.data.caption}</p>\n` : '';
          html += `<div style="margin: 1.5rem 0; text-align: center;" class="elementor-block-image">\n`;
          html += `  <img src="${block.data.url}" alt="${block.data.caption || 'Hình ảnh dã ngoại'}" style="max-height: 400px; width: 100%; object-fit: cover; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />\n`;
          html += `  ${caption}`;
          html += `</div>\n\n`;
          break;
        }
        case 'table': {
          html += `<div class="overflow-x-auto my-6 elementor-block-table">\n`;
          html += `  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow: hidden;">\n`;
          
          // Header
          if (block.data.headers && block.data.headers.length > 0) {
            html += `    <thead style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">\n`;
            html += `      <tr>\n`;
            block.data.headers.forEach((h: string) => {
              html += `        <th style="padding: 0.75rem 1rem; font-weight: 700; color: #1e293b;">${h}</th>\n`;
            });
            html += `      </tr>\n`;
            html += `    </thead>\n`;
          }

          // Rows
          if (block.data.rows && block.data.rows.length > 0) {
            html += `    <tbody>\n`;
            block.data.rows.forEach((row: string[], rIdx: number) => {
              const bg = rIdx % 2 === 1 ? 'background-color: #f8fafc;' : '';
              html += `      <tr style="border-bottom: 1px solid #e2e8f0; ${bg}">\n`;
              row.forEach((cell: string) => {
                html += `        <td style="padding: 0.75rem 1rem; color: #334155;">${cell}</td>\n`;
              });
              html += `      </tr>\n`;
            });
            html += `    </tbody>\n`;
          }
          
          html += `  </table>\n`;
          html += `</div>\n\n`;
          break;
        }
        case 'bullet-list': {
          html += `<ul style="margin-bottom: 1.5rem; space-y: 0.5rem; padding-left: 0.5rem;" class="elementor-block-list">\n`;
          (block.data.items || []).forEach((item: string) => {
            html += `  <li style="display: flex; items-start: flex-start; margin-bottom: 0.5rem; font-size: 0.875rem; color: #334155;">\n`;
            html += `    <span style="color: #10b981; margin-right: 0.5rem; font-weight: bold;">✓</span>\n`;
            html += `    <span>${item}</span>\n`;
            html += `  </li>\n`;
          });
          html += `</ul>\n\n`;
          break;
        }
        case 'video': {
          const embedUrl = parseVideoEmbedUrl(block.data.url || '');
          html += `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border-radius: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" class="elementor-block-video">\n`;
          html += `  <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen title="Dã ngoại KynangCK video"></iframe>\n`;
          html += `</div>\n\n`;
          break;
        }
        case 'quote': {
          html += `<blockquote style="border-left: 4px solid #10b981; padding-left: 1rem; font-style: italic; margin: 1.5rem 0; color: #475569;" class="elementor-block-quote">\n`;
          html += `  <p style="font-size: 1rem; line-height: 1.6; font-weight: 500;">"${block.data.text || ''}"</p>\n`;
          if (block.data.author) {
            html += `  <cite style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #64748b; font-weight: 600;">— ${block.data.author}</cite>\n`;
          }
          html += `</blockquote>\n\n`;
          break;
        }
        case 'columns-2': {
          html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;" class="elementor-block-columns-2">\n`;
          // Left Column
          html += `  <div style="display: flex; flex-direction: column; justify-content: center;">\n`;
          html += `    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b;">${block.data.leftTitle || ''}</h3>\n`;
          html += `    <p style="font-size: 0.85rem; color: #475569; line-height: 1.6;">${block.data.leftText || ''}</p>\n`;
          html += `  </div>\n`;
          // Right Column
          html += `  <div>\n`;
          if (block.data.rightUrl) {
            html += `    <img src="${block.data.rightUrl}" alt="KynangCK Camp Content" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 0.75rem;" />\n`;
          } else {
            html += `    <p style="font-size: 0.85rem; color: #475569; line-height: 1.6;">${block.data.rightText || ''}</p>\n`;
          }
          html += `  </div>\n`;
          html += `</div>\n\n`;
          break;
        }
      }
    });

    // Add JSON state comment at the very end
    html += `\n<!-- ELEMENTOR_BLOCKS: ${JSON.stringify(blocks)} -->`;
    onSave(html);
  };

  // Block creation helper
  const addNewBlock = (type: BuilderBlock['type']) => {
    const id = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let data = {};

    switch (type) {
      case 'hero':
        data = { title: 'Dã Ngoại Thực Tế & Sinh Tồn', subtitle: 'Lựa chọn trải nghiệm tuyệt vời giúp bé mạnh dạn khám phá thế giới.', color: 'emerald', size: 'large' };
        break;
      case 'paragraph':
        data = { text: 'Nội dung văn bản chia sẻ chi tiết được gõ tại đây. Bạn có thể nhấn trực tiếp vào đây để bắt đầu gõ chữ mới thay thế nội dung mẫu này.', align: 'left', size: 'normal', bold: false, italic: false };
        break;
      case 'image':
        data = { url: IMAGE_PRESETS[0].url, caption: 'Hình ảnh cắm trại dã ngoại sinh tồn' };
        break;
      case 'table':
        data = {
          headers: ['Thời gian', 'Nội dung hoạt động', 'Mục tiêu rèn luyện'],
          rows: [
            ['Ngày 1: 08:00', 'Di chuyển đến khu cắm trại, phổ biến nội quy an toàn dã ngoại', 'Xây dựng kỷ luật tập thể'],
            ['Ngày 1: 14:00', 'Huấn luyện dựng lều, thực hành tìm nguồn nước sạch hoang dã', 'Kỹ năng sinh tồn cơ bản'],
            ['Ngày 2: 09:00', 'Hành trình trekking vượt địa hình, học xem bản đồ và la bàn', 'Bản lĩnh tự lập, kiên trì']
          ]
        };
        break;
      case 'bullet-list':
        data = {
          items: [
            'Học sinh tự quản lý hành lý cá nhân độc lập.',
            'Tự chuẩn bị dụng cụ bảo hộ trước khi tham gia trekking.',
            'Biết cách nhóm lửa trại an toàn không dùng hộp quẹt ga.'
          ]
        };
        break;
      case 'video':
        data = { url: 'https://www.youtube.com/embed/gD6vWeD9X4E' };
        break;
      case 'quote':
        data = { text: 'Tự lập không phải là sống một mình, mà là có bản lĩnh tự giải quyết các vấn đề phát sinh trong cuộc sống một cách chủ động.', author: 'Chuyên Gia Kỹ Năng KynangCK' };
        break;
      case 'columns-2':
        data = { leftTitle: 'Tinh thần kỷ luật đồng đội', leftText: 'Thông qua việc cắm trại dã ngoại sinh tồn thực tế, các con học cách phối hợp giúp đỡ bạn bè cùng vượt qua khó khăn để đi đến chặng cuối.', rightUrl: IMAGE_PRESETS[2].url, rightText: '' };
        break;
    }

    const newBlock: BuilderBlock = { id, type, data };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  // Reordering helpers
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  const deleteBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    if (selectedBlockId === id) {
      setSelectedBlockId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const updateBlockData = (id: string, updatedFields: any) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === id) {
        return {
          ...block,
          data: { ...block.data, ...updatedFields }
        };
      }
      return block;
    }));
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-600 text-white p-1.5 rounded-xl">
              <Grid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center">
                <span>Trình dựng trang Elementor-CK</span>
                <span className="ml-2 bg-emerald-100 text-emerald-800 text-[9px] uppercase px-1.5 py-0.5 rounded-full font-mono font-bold">Visual Live Editor</span>
              </h2>
              <p className="text-slate-400 text-[10px]">Kéo thả, click soạn thảo nội dung trực quan cho bài viết dã ngoại & trang tĩnh.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition ${
                previewMode
                  ? 'bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{previewMode ? 'Bật soạn thảo trực quan' : 'Bật xem thử giao diện'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold text-xs hover:bg-slate-50 cursor-pointer transition"
            >
              Thoát (Hủy)
            </button>

            <button
              onClick={handleCompileAndSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer shadow-sm flex items-center space-x-1 transition"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Áp dụng vào nội dung chính</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-grow flex overflow-hidden bg-slate-100">
          
          {/* LEFT SIDEBAR: CONTENT BLOCKS TOOLBOX */}
          {!previewMode && (
            <aside className="w-64 border-r border-slate-200 bg-white p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono">Hộp Công Cụ Khối</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Nhấp vào một khối bất kỳ dưới đây để thêm ngay vào trang của bạn.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => addNewBlock('hero')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <HeadingIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Tiêu Đề Lớn</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('paragraph')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <FileText className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Đoạn Văn Bản</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('image')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <ImageIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Hình Ảnh</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('table')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <TableIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Bảng Biểu</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('bullet-list')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <ListIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Danh Sách</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('video')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <VideoIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Video Nhúng</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('quote')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <QuoteIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Khối Trích Dẫn</span>
                  </button>

                  <button
                    onClick={() => addNewBlock('columns-2')}
                    className="flex flex-col items-center justify-center p-3 border border-slate-100 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-600 font-bold transition cursor-pointer"
                  >
                    <ColumnsIcon className="h-4.5 w-4.5 text-emerald-600 mb-1" />
                    <span>Hai Cột</span>
                  </button>
                </div>
              </div>

              {/* TIPS FOR USER */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1.5 text-[10px] text-slate-500 mt-4 leading-relaxed">
                <p className="font-bold text-slate-700 flex items-center">
                  <Sparkles className="h-3 w-3 text-emerald-600 mr-1" />
                  Mẹo Thiết Kế Nhanh:
                </p>
                <p>1. Nhấp trực tiếp vào bất kỳ khối nào trong khung giữa để kích hoạt chỉnh sửa chi tiết.</p>
                <p>2. Dùng mũi tên để đổi thứ tự khối.</p>
                <p>3. Khi hoàn tất, nhấn "Áp dụng vào nội dung chính" để lưu lại.</p>
              </div>
            </aside>
          )}

          {/* MAIN CANVAS: DRAG & DROP & LIVE EDIT VIEW */}
          <main className="flex-grow p-6 overflow-y-auto">
            {blocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <FileText className="h-10 w-10 text-slate-300" />
                <div>
                  <p className="font-extrabold text-slate-700 text-sm">Trang trống rỗng</p>
                  <p className="text-slate-400 text-xs">Sử dụng thanh công cụ bên trái để bắt đầu thêm khối thông tin.</p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {blocks.map((block, index) => {
                  const isSelected = selectedBlockId === block.id && !previewMode;
                  return (
                    <div
                      key={block.id}
                      onClick={() => {
                        if (!previewMode) setSelectedBlockId(block.id);
                      }}
                      className={`relative bg-white rounded-2xl transition group ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 shadow-md'
                          : 'border border-slate-200/70 hover:border-emerald-500/40 shadow-sm cursor-pointer'
                      }`}
                    >
                      {/* INTERACTIVE COMPONENT CONTROLS (HOVER OVER BLOCK) */}
                      {!previewMode && (
                        <div className="absolute -top-3.5 right-3 bg-slate-800 text-white rounded-lg py-1 px-2 text-[10px] flex items-center space-x-2 shadow-md opacity-0 group-hover:opacity-100 transition duration-150 z-20">
                          <span className="font-mono text-emerald-400 font-bold uppercase text-[8px]">{block.type}</span>
                          <span className="text-slate-500">|</span>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, 'up');
                            }}
                            className="hover:text-emerald-400 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === blocks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, 'down');
                            }}
                            className="hover:text-emerald-400 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                          <span className="text-slate-500">|</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            className="text-red-400 hover:text-red-500 cursor-pointer font-bold"
                            title="Xóa khối"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </div>
                      )}

                      {/* BLOCK RENDERER */}
                      <div className="p-5">
                        {block.type === 'hero' && (
                          <div className="text-center py-4">
                            <h2 className={`font-extrabold ${block.data.size === 'large' ? 'text-2xl sm:text-3xl' : 'text-xl'} ${
                              block.data.color === 'emerald' ? 'text-emerald-700' : block.data.color === 'amber' ? 'text-amber-600' : 'text-slate-800'
                            }`}>
                              {block.data.title || 'Nhấn để nhập tiêu đề...'}
                            </h2>
                            {block.data.subtitle && (
                              <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">{block.data.subtitle}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'paragraph' && (
                          <div
                            style={{ textAlign: block.data.align || 'left' }}
                            className={`text-slate-700 leading-relaxed text-xs sm:text-sm ${block.data.bold ? 'font-bold' : ''} ${
                              block.data.italic ? 'italic' : ''
                            }`}
                          >
                            {block.data.text ? (
                              <span className="whitespace-pre-wrap">{block.data.text}</span>
                            ) : (
                              <span className="text-slate-300 italic">Nhập văn bản chi tiết ở đây...</span>
                            )}
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="text-center space-y-1.5">
                            <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 max-h-60">
                              <img
                                src={block.data.url}
                                alt="Visual block"
                                className="w-full h-full object-cover max-h-60"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {block.data.caption && (
                              <p className="text-[10px] text-slate-400 italic text-center">{block.data.caption}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'table' && (
                          <div className="overflow-x-auto my-2">
                            <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  {(block.data.headers || []).map((h: string, idx: number) => (
                                    <th key={idx} className="p-2 font-bold text-slate-700">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(block.data.rows || []).map((row: string[], rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                    {row.map((cell: string, cIdx: number) => (
                                      <td key={cIdx} className="p-2 text-slate-600">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {block.type === 'bullet-list' && (
                          <ul className="space-y-1.5 pl-2">
                            {(block.data.items || []).map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {block.type === 'video' && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative">
                            {block.data.url ? (
                              <iframe
                                src={parseVideoEmbedUrl(block.data.url)}
                                className="w-full h-full border-0"
                                title="Video review"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-1">
                                <VideoIcon className="h-8 w-8" />
                                <span className="text-xs">Chưa cài đặt URL video nhúng</span>
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="border-l-4 border-emerald-500 pl-4 py-1 italic text-slate-600 my-2">
                            <p className="text-sm font-medium">"{block.data.text || 'Nhập câu trích dẫn...'}"</p>
                            {block.data.author && (
                              <p className="text-[10px] text-slate-400 font-bold mt-1">— {block.data.author}</p>
                            )}
                          </div>
                        )}

                        {block.type === 'columns-2' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col justify-center space-y-1.5">
                              <h4 className="font-bold text-slate-800 text-sm">{block.data.leftTitle || 'Tiêu đề cột trái'}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{block.data.leftText || 'Nội dung cột trái...'}</p>
                            </div>
                            <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 max-h-40">
                              {block.data.rightUrl ? (
                                <img src={block.data.rightUrl} alt="Col right" className="w-full h-full object-cover max-h-40" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="p-4 text-xs text-slate-400 italic flex items-center justify-center h-full">Không có ảnh cột phải</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR: CURRENT BLOCK PROPERTIES EDITOR */}
          {!previewMode && (
            <aside className="w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
              {selectedBlock ? (
                <div className="space-y-4">
                  <div className="border-b pb-2 flex items-center space-x-1.5">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono">Định Dạng Chi Tiết</p>
                      <p className="text-[9px] text-slate-400 font-mono">Loại khối: {selectedBlock.type.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* HERO PROPERTIES */}
                  {selectedBlock.type === 'hero' && (
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Tiêu đề lớn</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 font-sans text-xs"
                          value={selectedBlock.data.title || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Tiêu đề phụ</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 font-sans text-xs"
                          value={selectedBlock.data.subtitle || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { subtitle: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Cỡ chữ</label>
                          <select
                            className="w-full border border-slate-200 p-1.5 rounded text-xs bg-white"
                            value={selectedBlock.data.size || 'large'}
                            onChange={e => updateBlockData(selectedBlock.id, { size: e.target.value })}
                          >
                            <option value="normal">Vừa phải</option>
                            <option value="large">Cực lớn (H1)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Màu sắc</label>
                          <select
                            className="w-full border border-slate-200 p-1.5 rounded text-xs bg-white"
                            value={selectedBlock.data.color || 'emerald'}
                            onChange={e => updateBlockData(selectedBlock.id, { color: e.target.value })}
                          >
                            <option value="emerald">Xanh lục (Camper)</option>
                            <option value="amber">Màu cam dã ngoại</option>
                            <option value="slate">Xám đen tuyền</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PARAGRAPH PROPERTIES */}
                  {selectedBlock.type === 'paragraph' && (
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Nội dung văn bản</label>
                        <textarea
                          rows={8}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 font-sans text-xs"
                          value={selectedBlock.data.text || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { text: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Căn lề</label>
                          <select
                            className="w-full border border-slate-200 p-1.5 rounded text-xs bg-white"
                            value={selectedBlock.data.align || 'left'}
                            onChange={e => updateBlockData(selectedBlock.id, { align: e.target.value })}
                          >
                            <option value="left">Trái</option>
                            <option value="center">Giữa</option>
                            <option value="right">Phải</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Cỡ chữ</label>
                          <select
                            className="w-full border border-slate-200 p-1.5 rounded text-xs bg-white"
                            value={selectedBlock.data.size || 'normal'}
                            onChange={e => updateBlockData(selectedBlock.id, { size: e.target.value })}
                          >
                            <option value="small">Nhỏ gọn</option>
                            <option value="normal">Mặc định</option>
                            <option value="large">Nổi bật</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-4 pt-1">
                        <label className="flex items-center space-x-1.5 font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedBlock.data.bold}
                            onChange={e => updateBlockData(selectedBlock.id, { bold: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>Chữ in đậm</span>
                        </label>
                        <label className="flex items-center space-x-1.5 font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedBlock.data.italic}
                            onChange={e => updateBlockData(selectedBlock.id, { italic: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>Chữ in nghiêng</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* IMAGE PROPERTIES */}
                  {selectedBlock.type === 'image' && (
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Địa chỉ ảnh (URL/Link)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.url || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { url: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Chú thích ảnh</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.caption || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { caption: e.target.value })}
                        />
                      </div>

                      {/* Presets Grid */}
                      <div className="pt-2 border-t">
                        <p className="font-bold text-slate-700 mb-2 block">Thư viện ảnh mẫu dã ngoại:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {IMAGE_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => updateBlockData(selectedBlock.id, { url: preset.url })}
                              className="group relative rounded overflow-hidden h-14 border border-slate-200/50 cursor-pointer text-[9px] text-left hover:border-emerald-500 transition shrink-0"
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 flex items-end p-1 text-white font-bold opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                                {preset.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TABLE PROPERTIES */}
                  {selectedBlock.type === 'table' && (
                    <div className="space-y-3 text-xs">
                      <p className="font-bold text-slate-700">Chỉnh sửa bảng biểu:</p>
                      
                      {/* Headers Edit */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-600 block">Các tiêu đề cột (Ngăn cách bằng dấu phẩy)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 font-mono text-[10px]"
                          value={(selectedBlock.data.headers || []).join(', ')}
                          onChange={e => {
                            const val = e.target.value.split(',').map(s => s.trim());
                            updateBlockData(selectedBlock.id, { headers: val });
                          }}
                        />
                      </div>

                      {/* Raw Data Editor */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-600 block">Dữ liệu hàng (Định dạng: cột1 | cột2 | cột3)</label>
                        <textarea
                          rows={6}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 font-mono text-[10px] leading-relaxed"
                          value={(selectedBlock.data.rows || []).map((row: string[]) => row.join(' | ')).join('\n')}
                          onChange={e => {
                            const rows = e.target.value.split('\n').map(line => line.split('|').map(s => s.trim()));
                            updateBlockData(selectedBlock.id, { rows });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* BULLET LIST PROPERTIES */}
                  {selectedBlock.type === 'bullet-list' && (
                    <div className="space-y-3 text-xs">
                      <label className="font-bold text-slate-700 block">Các mục danh sách (Mỗi dòng là một mục mới)</label>
                      <textarea
                        rows={6}
                        className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-sans leading-relaxed"
                        value={(selectedBlock.data.items || []).join('\n')}
                        onChange={e => {
                          const items = e.target.value.split('\n').filter(s => s.trim() !== '');
                          updateBlockData(selectedBlock.id, { items });
                        }}
                      />
                    </div>
                  )}

                  {/* VIDEO PROPERTIES */}
                  {selectedBlock.type === 'video' && (
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Đường dẫn Video nhúng YouTube</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                          placeholder="https://www.youtube.com/embed/gD6vWeD9X4E"
                          value={selectedBlock.data.url || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { url: e.target.value })}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Lưu ý: Bạn nên sử dụng đường dẫn dạng nhúng (embed) của YouTube để video hiển thị chính xác nhất (ví dụ có chứa <code>/embed/</code>).</p>
                    </div>
                  )}

                  {/* BLOCKQUOTE PROPERTIES */}
                  {selectedBlock.type === 'quote' && (
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Câu trích dẫn</label>
                        <textarea
                          rows={4}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.text || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { text: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Người phát ngôn</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.author || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { author: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* TWO COLUMN PROPERTIES */}
                  {selectedBlock.type === 'columns-2' && (
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Tiêu đề cột trái</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.leftTitle || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { leftTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Nội dung cột trái</label>
                        <textarea
                          rows={3}
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs font-sans"
                          value={selectedBlock.data.leftText || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { leftText: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Hình ảnh cột phải (URL)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 p-2 rounded focus:ring-1 focus:ring-emerald-500 text-xs"
                          value={selectedBlock.data.rightUrl || ''}
                          onChange={e => updateBlockData(selectedBlock.id, { rightUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs italic">
                  Chưa chọn khối nào để chỉnh sửa.
                </div>
              )}
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};
