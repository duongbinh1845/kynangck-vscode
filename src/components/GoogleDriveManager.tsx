import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Folder as FolderIcon, RefreshCw, FileText, Image as ImageIcon, Video as VideoIcon, Check, Copy } from 'lucide-react';
import { adminFetch } from '../lib/adminAuth';

export const GoogleDriveManager: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await adminFetch('/api/auth/google/status');
      const data = await res.json();
      setIsAuthenticated(!!data.authenticated);
      if (data.authenticated) {
        fetchFiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await adminFetch('/api/drive/files');
      if (res.status === 401) {
        setIsAuthenticated(false);
        setFiles([]);
        return;
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    onSuccess: async (codeResponse) => {
      setIsAuthenticating(true);
      try {
        const res = await adminFetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          fetchFiles();
        }
      } catch (e) {
        console.error(e);
        alert('Lỗi đăng nhập Google Drive');
      } finally {
        setIsAuthenticating(false);
      }
    },
    onError: (errorResponse) => {
      console.error(errorResponse);
      setIsAuthenticating(false);
      alert('Lỗi kết nối Google Drive');
    }
  });

  const handleLogout = async () => {
    try {
      await adminFetch('/api/auth/google/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setFiles([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-[#ccd0d4] p-6 shadow-sm rounded-lg space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-normal text-[#23282d] font-serif flex items-center space-x-2">
            <FolderIcon className="h-5 w-5 text-blue-600" />
            <span>Thư viện Media từ Google Drive (Google Drive Manager)</span>
          </h2>
          <p className="text-slate-400 text-xs">Kết nối Google Drive để lấy hình ảnh, video chèn vào Bài viết, Khóa học bằng ID hoặc Link.</p>
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchFiles}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f0f0f1] hover:bg-[#e5e5e5] border border-[#8c8f94] text-[#2c3338] text-sm rounded shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} />
              <span>Tải lại file</span>
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-sm rounded transition-colors cursor-pointer"
            >
              Ngắt kết nối
            </button>
          </div>
        ) : null}
      </div>

      {!isAuthenticated ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <FolderIcon className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Kết nối tài khoản Google Drive</h3>
          <p className="text-slate-500 max-w-md text-sm">
            Vui lòng cấp quyền truy cập để có thể chọn hình ảnh, video từ Google Drive vào hệ thống CMS của Connect Kids.
            Hãy đảm bảo các file hình ảnh/video của bạn trên Drive đã được thiết lập <strong>"Bất kỳ ai có liên kết" (Anyone with the link)</strong> để có thể hiển thị công khai trên website.
          </p>
          <button
            onClick={() => handleGoogleLogin()}
            disabled={isAuthenticating}
            className="mt-4 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            {isAuthenticating ? 'Đang kết nối...' : 'Đăng nhập với Google'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {loadingFiles ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin mb-4 text-blue-500" />
              <p>Đang tải dữ liệu từ Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p>Không tìm thấy hình ảnh hoặc video nào trong Google Drive của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map((file) => {
                const isImage = file.mimeType?.includes('image');
                const isVideo = file.mimeType?.includes('video');
                
                // Embed link for video, Direct View link for Image
                let embedUrl = '';
                if (isVideo) {
                  embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
                } else if (isImage) {
                  embedUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
                }
                
                return (
                  <div key={file.id} className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {isImage && file.thumbnailLink ? (
                        <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          {isVideo ? <VideoIcon className="w-10 h-10 mb-2" /> : <FileText className="w-10 h-10 mb-2" />}
                          <span className="text-xs uppercase font-bold">{isVideo ? 'Video' : 'File'}</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <button 
                          onClick={() => handleCopy(embedUrl, file.id + '_url')}
                          className="w-full py-1.5 bg-white/20 hover:bg-white/40 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === file.id + '_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy URL {isVideo ? 'Nhúng' : 'Ảnh'}
                        </button>
                        <button 
                          onClick={() => handleCopy(file.id, file.id + '_id')}
                          className="w-full py-1.5 bg-white/20 hover:bg-white/40 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === file.id + '_id' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy File ID
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 border-t border-slate-100 flex-1 flex flex-col">
                      <p className="text-xs font-medium text-slate-800 line-clamp-2" title={file.name}>
                        {file.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
