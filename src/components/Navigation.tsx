import React, { useState } from 'react';
import { Compass, Trophy, Users, BookOpen, Shield, Info, PhoneCall, Building, GraduationCap, Menu, X } from 'lucide-react';
import { CMSData } from '../types';

interface NavigationProps {
  currentRole: 'parent' | 'child' | 'corporate' | 'admin';
  setRole: (role: 'parent' | 'child' | 'corporate' | 'admin') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cms: CMSData | null;
}

export default function Navigation({ currentRole, setRole, activeTab, setActiveTab, cms }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const brandName = cms?.header?.brandName || 'Connect Kids';
  const defaultLogo = 'https://i.ibb.co/LDd2ggmC/logo-kynangck.webp';
  const logoUrl = cms?.header?.logoUrl || defaultLogo;

  const defaultItems = [
    { label: 'Trang chủ', tab: 'home' },
    { label: 'Trò Chơi', tab: 'game' },
    { label: 'Thư Viện', tab: 'hub' },
    { label: 'Phụ Huynh', tab: 'parent-portal' }
  ];

  const rawMenuItems = cms?.header?.menuItems;
  let menuItems = defaultItems;
  if (Array.isArray(rawMenuItems) && rawMenuItems.length > 0) {
    menuItems = rawMenuItems.map((item: any) => {
      let label = item.label || 'Trang';
      let tab = item.tab || (item.link ? item.link.replace(/^\//, '') : 'home');
      return { label, tab };
    });
  }

  // Helper render icons corresponding to the menu tabs
  const renderIcon = (tab: string) => {
    switch (tab) {
      case 'home':
        return <Compass className="h-4 w-4" />;
      case 'projects-list':
        return <GraduationCap className="h-4 w-4" />;
      case 'game':
        return <Trophy className="h-4 w-4" />;
      case 'parent-portal':
        return <Users className="h-4 w-4" />;
      case 'hub':
        return <BookOpen className="h-4 w-4" />;
      case 'corporate-portal':
        return <Building className="h-4 w-4" />;
      case 'page-team':
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'page-about':
        return <Info className="h-4 w-4" />;
      case 'page-contact':
        return <PhoneCall className="h-4 w-4" />;
      default:
        return <Compass className="h-4 w-4" />;
    }
  };

  const getTabClass = (tab: string) => {
    const isActive = activeTab === tab || (tab === 'projects-list' && activeTab.startsWith('project-'));
    if (isActive) {
      return 'active';
    }
    return '';
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-header-theme text-slate-900 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Connect Kids */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
            <img
              src={logoUrl}
              alt="Connect Kids Logo"
              className="w-[50px] h-[50px] object-contain shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = defaultLogo;
              }}
            />
            <div>
              <h1 className="text-base sm:text-lg font-sans font-extrabold tracking-tight text-slate-900 leading-snug">
                {brandName}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.tab)}
                className={`header-nav-btn flex items-center space-x-1 px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition cursor-pointer shrink-0 ${getTabClass(item.tab)}`}
              >
                {renderIcon(item.tab)}
                <span>{item.label}</span>
              </button>
            ))}
            
            {currentRole === 'admin' && (
              <button
                onClick={() => handleNavClick('admin-portal')}
                className={`flex items-center space-x-1 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition cursor-pointer shrink-0 border ${
                  activeTab === 'admin-portal'
                    ? 'bg-white border-primary-theme text-primary-theme shadow-sm'
                    : 'btn-theme-primary border-transparent'
                }`}
              >
                <Shield className={`h-4 w-4 ${activeTab === 'admin-portal' ? 'text-primary-theme' : 'text-white'}`} />
                <span>Quản trị hệ thống</span>
              </button>
            )}
          </nav>

          {/* Mobile 3-line Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#5C7A3E]" />
              ) : (
                <Menu className="h-6 w-6 text-[#5C7A3E]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-1.5 shadow-xl animate-fadeIn">
          {menuItems.map((item, index) => {
            const isActive = activeTab === item.tab || (item.tab === 'projects-list' && activeTab.startsWith('project-'));
            return (
              <button
                key={index}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#5C7A3E] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {renderIcon(item.tab)}
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentRole === 'admin' && (
            <button
              onClick={() => handleNavClick('admin-portal')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer mt-2 border ${
                activeTab === 'admin-portal'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Shield className="h-5 w-5 text-amber-600" />
              <span>Quản trị hệ thống</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
