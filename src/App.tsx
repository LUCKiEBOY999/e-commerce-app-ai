/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { SellerPortalView } from './components/SellerPortalView';
import { TabType, Language } from './types';
import { Database, LogIn } from 'lucide-react';
import produceBg from './assets/images/fresh_produce_bg_1790088137359.jpg';

export default function App() {
  // Start on general login page where user enters name and password
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [selectedClusterId, setSelectedClusterId] = useState<number>(1);
  const [language, setLanguage] = useState<Language>('th'); // Default to Thai

  // Active logged-in user credential
  const [userName, setUserName] = useState<string>('คุณกานต์พล');

  const handleSelectCluster = (clusterId: number) => {
    setSelectedClusterId(clusterId);
  };

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    handleNavigate('seller');
  };

  return (
    <div className="relative min-h-screen flex flex-col font-['Prompt','Plus_Jakarta_Sans',sans-serif] text-[#3D2722] selection:bg-[#FFEDAD] selection:text-[#3D2722]">
      {/* Decorative Fixed Fruits & Vegetables Background Wallpaper */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Organic fresh produce image backdrop */}
        <img
          src={produceBg}
          alt="Fresh fruits and vegetables background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 filter contrast-105"
        />
        {/* Soft atmospheric gradient wash matching Butter Yellow & Columbia Blue */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF8]/90 via-[#F7FAFD]/85 to-[#FFFDF8]/95 backdrop-blur-[1px]" />

        {/* Ambient color light spots */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#FFEDAD]/25 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-[#C8D9EC]/30 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-[#8E1825]/8 blur-3xl" />
      </div>

      {/* Top Sticky Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleNavigate} 
        language={language}
        setLanguage={setLanguage}
        userName={userName}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* 1. Universal Name & Password Login Page */}
        {activeTab === 'login' && (
          <LoginView 
            onLogin={handleLogin}
            language={language}
            setLanguage={setLanguage}
            initialUserName={userName}
          />
        )}

        {/* 2. Main Analytics & Management Portal */}
        {activeTab === 'seller' && (
          <SellerPortalView 
            onSelectCluster={handleSelectCluster}
            language={language}
            selectedClusterId={selectedClusterId}
            onSelectClusterId={setSelectedClusterId}
            userName={userName}
          />
        )}
      </main>

      {/* Clean Professional Footer */}
      <footer className="relative z-10 mt-auto border-t border-[#3D2722]/10 bg-white/95 backdrop-blur-md">
        {/* Subtle top stripe accent */}
        <div className="h-1 w-full bg-awning-stripes-slim opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3D2722]/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#8E1825] text-[#FFEDAD] flex items-center justify-center font-bold text-xs shadow-xs">
              🍒
            </div>
            <span className="font-semibold text-[#3D2722]">
              {language === 'th' ? 'ระบบจัดกลุ่มสินค้าอีคอมเมิร์ซด้วย AI (K-Means)' : 'E-Commerce AI Clustering System'}
            </span>
            <span>•</span>
            <span className="text-[#3D2722]/80">
              {language === 'th' ? 'โมเดล Machine Learning (k=4 คลัสเตอร์)' : 'K-Means Machine Learning Model (k=4)'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFEDAD]/60 border border-[#FFEDAD] text-[#3D2722] font-medium">
              <Database className="w-3.5 h-3.5 text-[#8E1825]" />
              <span>{language === 'th' ? 'ฐานข้อมูล 82,103 รายการ' : '82,103 Evaluated Products'}</span>
            </span>
            <span>•</span>
            <button
              onClick={() => handleNavigate('login')}
              className="text-[#8E1825] hover:underline font-bold cursor-pointer flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>{language === 'th' ? 'เข้าสู่ระบบใหม่' : 'Sign In Again'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
