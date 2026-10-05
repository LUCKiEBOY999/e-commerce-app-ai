import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Apple,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { Language } from '../types';

interface LoginViewProps {
  onLogin: (userName: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  initialUserName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  language,
  setLanguage,
  initialUserName = 'คุณกานต์พล'
}) => {
  const [userName, setUserName] = useState(initialUserName);
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError(language === 'th' ? '⚠️ กรุณากรอกชื่อผู้ใช้งาน' : '⚠️ Please enter your name / username');
      return;
    }
    if (!password.trim()) {
      setError(language === 'th' ? '⚠️ กรุณากรอกรหัสผ่าน' : '⚠️ Please enter your password');
      return;
    }
    setError('');
    onLogin(userName.trim());
  };

  const handleQuickDemo = (name: string, pass: string) => {
    setUserName(name);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 px-4 sm:px-6 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner / System Title */}
      <div className="max-w-md w-full text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEDAD]/80 border border-[#8E1825]/20 shadow-xs text-xs font-bold text-[#8E1825]">
          <Sparkles className="w-4 h-4 text-[#8E1825]" />
          <span>
            {language === 'th' 
              ? 'ระบบจำแนกและจัดกลุ่มสินค้าอีคอมเมิร์ซ (K-Means AI)' 
              : 'E-Commerce Product Segmentation with K-Means AI'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3D2722] tracking-tight leading-tight">
          {language === 'th' ? (
            <>
              เข้าสู่ระบบ <span className="text-[#8E1825] underline decoration-[#FFEDAD] decoration-wavy decoration-2">เข้าใช้งาน</span>
            </>
          ) : (
            <>
              Sign In • <span className="text-[#8E1825] underline decoration-[#FFEDAD] decoration-wavy decoration-2">System Access</span>
            </>
          )}
        </h1>

        <p className="text-xs sm:text-sm text-[#3D2722]/80">
          {language === 'th' 
            ? 'กรุณากรอกชื่อและรหัสผ่านเพื่อเข้าใช้งานระบบวิเคราะห์และจัดกลุ่มสินค้า' 
            : 'Please enter your username and password to access the analytics system.'}
        </p>

        {/* Quick Language Toggle */}
        <div className="flex justify-center items-center gap-2 pt-1">
          <span className="text-xs text-[#3D2722]/60 font-medium">
            {language === 'th' ? 'เลือกภาษา / Language:' : 'Language:'}
          </span>
          <div className="inline-flex p-1 rounded-xl bg-white border border-[#3D2722]/15 shadow-2xs">
            <button
              onClick={() => setLanguage('th')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'th'
                  ? 'bg-[#8E1825] text-white shadow-xs'
                  : 'text-[#3D2722]/70 hover:text-[#8E1825]'
              }`}
            >
              🇹🇭 ภาษาไทย
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#8E1825] text-white shadow-xs'
                  : 'text-[#3D2722]/70 hover:text-[#8E1825]'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full">
        <div className="relative bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#3D2722]/15 shadow-xl overflow-hidden">
          {/* Top striped awning accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8E1825] via-[#C8D9EC] to-[#FFEDAD]" />

          <div className="space-y-5">
            {/* Header Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8E1825] text-white flex items-center justify-center shadow-md shrink-0">
                <Apple className="w-6 h-6 text-[#FFEDAD]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#3D2722]">
                  {language === 'th' ? 'กรอกชื่อและรหัสผ่าน' : 'Enter Name & Password'}
                </h2>
                <p className="text-xs text-[#3D2722]/70">
                  {language === 'th' ? 'ระบบเข้าใช้งานทั่วไป' : 'Sign in to your account'}
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Field 1: Name / Username */}
              <div>
                <label className="block text-xs font-bold text-[#3D2722] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#8E1825]" />
                    <span>{language === 'th' ? 'ชื่อ / ชื่อผู้ใช้งาน *' : 'Name / Username *'}</span>
                  </span>
                  <span className="text-[10px] text-[#8E1825] font-semibold">
                    {language === 'th' ? '(จำเป็น)' : '(Required)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={language === 'th' ? 'เช่น คุณกานต์พล หรือ admin' : 'e.g. John Doe'}
                    className="w-full px-4 py-3 rounded-xl border border-[#3D2722]/20 bg-white text-sm font-semibold text-[#3D2722] focus:outline-hidden focus:border-[#8E1825] focus:ring-2 focus:ring-[#8E1825]/20 transition-all"
                  />
                  {userName && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3.5 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Field 2: Password / Code */}
              <div>
                <label className="block text-xs font-bold text-[#3D2722] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#8E1825]" />
                    <span>{language === 'th' ? 'รหัสผ่าน / รหัส *' : 'Password / Code *'}</span>
                  </span>
                  <span className="text-[10px] text-[#8E1825] font-semibold">
                    {language === 'th' ? '(จำเป็น)' : '(Required)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={language === 'th' ? 'กรอกรหัสผ่านของคุณ' : 'Enter password'}
                    className="w-full px-4 py-3 rounded-xl border border-[#3D2722]/20 bg-white text-sm font-semibold text-[#3D2722] focus:outline-hidden focus:border-[#8E1825] focus:ring-2 focus:ring-[#8E1825]/20 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#3D2722]/50 hover:text-[#3D2722] transition cursor-pointer"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              {/* Quick Preset Buttons */}
              <div className="bg-[#FFFDF8] p-3 rounded-2xl border border-[#FFEDAD] space-y-1.5">
                <span className="text-[11px] font-bold text-[#7A5806] block">
                  {language === 'th' ? '⚡ ปุ่มทดสอบเข้าสู่ระบบด่วน (1-Click):' : '⚡ 1-Click Quick Demo Sign In:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('คุณกานต์พล', '123456')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFEDAD] text-[#7A5806] border border-[#7A5806]/30 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    👤 คุณกานต์พล (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Admin User', 'admin2026')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#C8D9EC] text-[#2C4A6F] border border-[#2C4A6F]/30 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    🛡️ Admin User
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#8E1825] hover:bg-[#6E121C] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                >
                  <LogIn className="w-5 h-5 text-[#FFEDAD]" />
                  <span>{language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#3D2722]/10 flex items-center justify-between text-xs text-[#3D2722]/60">
            <span>{language === 'th' ? '✓ ปลอดภัยและรวดเร็ว' : '✓ Secure & Fast'}</span>
            <span>{language === 'th' ? '✓ AI Product Analytics' : '✓ AI Product Analytics'}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-[#3D2722]/60 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>
          {language === 'th' 
            ? '💡 เข้าสู่ระบบด้วยชื่อและรหัสผ่านเพื่อเข้าถึงระบบเต็มรูปแบบ' 
            : '💡 Sign in with your name and password for full system access'}
        </span>
      </div>
    </div>
  );
};
