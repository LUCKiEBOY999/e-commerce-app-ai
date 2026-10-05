import React from 'react';
import { TabType, Language } from '../types';
import { 
  Sparkles, 
  Apple, 
  LogIn, 
  LogOut, 
  User, 
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab,
  language,
  setLanguage,
  userName = 'คุณกานต์พล'
}) => {
  const isLoginView = activeTab === 'login';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#3D2722]/10 shadow-xs">
      {/* Top Striped Awning Accent (Cherry Red #8E1825 & Columbia Blue #C8D9EC) */}
      <div className="h-1.5 w-full bg-awning-stripes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => {
              if (!isLoginView) setActiveTab('seller');
            }}
            title={language === 'th' ? 'ระบบจัดกลุ่มสินค้าอีคอมเมิร์ซ' : 'E-Commerce AI Clustering'}
          >
            <div className="w-10 h-10 rounded-xl bg-[#8E1825] text-white flex items-center justify-center shadow-md shrink-0 border border-[#8E1825]/30 group-hover:scale-105 transition-transform">
              <Apple className="w-5 h-5 text-[#FFEDAD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#3D2722] text-sm sm:text-base tracking-tight font-['Prompt',sans-serif]">
                  {language === 'th' ? 'ระบบจัดกลุ่มสินค้าอีคอมเมิร์ซ (AI)' : 'E-Commerce AI Clustering'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEDAD] text-[#7A5806] border border-[#7A5806]/30 shadow-2xs">
                  <Sparkles className="w-3 h-3 mr-1 text-[#8E1825]" /> K-Means (k=4)
                </span>
              </div>
              <p className="text-[11px] text-[#3D2722]/70 font-medium hidden md:block">
                {language === 'th' ? 'แดชบอร์ด, การจัดกลุ่มสินค้า, รายการสินค้า และระบบจำลองราคา' : 'Dashboard, Clustering, Catalog & Simulator'}
              </p>
            </div>
          </div>

          {/* Central Active User Status Banner */}
          {!isLoginView ? (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FFFDF8] border border-[#3D2722]/15 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-[#3D2722] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8E1825]" />
                <span>{language === 'th' ? 'ผู้ใช้งาน:' : 'User:'}</span>
                <span className="text-[#8E1825] font-extrabold">{userName}</span>
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFEDAD]/50 border border-[#FFEDAD] text-xs text-[#7A5806] font-semibold">
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'กรุณากรอกชื่อและรหัสเพื่อเข้าสู่ระบบ' : 'Please enter name and password to sign in'}</span>
            </div>
          )}

          {/* Right Action Bar: Logout & Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoginView ? (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-[#8E1825] border border-[#8E1825]/30 text-xs font-bold transition-all shadow-2xs hover:border-[#8E1825] cursor-pointer"
                title={language === 'th' ? 'ออกจากระบบ / เข้าสู่ระบบใหม่' : 'Sign out / Log in again'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>
                  {language === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
                </span>
              </button>
            ) : null}

            {/* Language Switcher */}
            <div className="flex items-center bg-[#C8D9EC]/30 p-0.5 rounded-lg border border-[#C8D9EC] text-xs font-semibold">
              <button
                onClick={() => setLanguage('th')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  language === 'th'
                    ? 'bg-[#8E1825] text-white shadow-2xs font-bold'
                    : 'text-[#3D2722]/80 hover:text-[#3D2722]'
                }`}
                title="สลับเป็นภาษาไทย"
              >
                🇹🇭 ไทย
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#8E1825] text-white shadow-2xs font-bold'
                    : 'text-[#3D2722]/80 hover:text-[#3D2722]'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
