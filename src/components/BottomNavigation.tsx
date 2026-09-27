import React from 'react';
import { Home, History, Tag, BookOpen, Scale, CreditCard, BarChart3, Database } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ role, activeTab, onSelectTab }) => {
  const nasabahTabs = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'katalog', label: 'Katalog', icon: Tag },
    { id: 'panduan', label: 'Panduan', icon: BookOpen },
  ];

  const adminTabs = [
    { id: 'setor', label: 'Setor Cepat', icon: Scale },
    { id: 'tarik', label: 'Tarik Saldo', icon: CreditCard },
    { id: 'rekap', label: 'Rekapitulasi', icon: BarChart3 },
    { id: 'integrasi', label: 'Database GAS', icon: Database },
  ];

  const tabs = role === 'admin' ? adminTabs : nasabahTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg shadow-black/5"
      role="navigation"
      aria-label="Navigasi Utama"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all relative ${
                isActive ? 'text-[#1B5E20] font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#1B5E20] rounded-b-full" />
              )}
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#E8F5E9] text-[#1B5E20] scale-105' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[11px] leading-tight mt-0.5 truncate max-w-full px-1 ${
                isActive ? 'text-[#1B5E20]' : 'text-slate-600'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
