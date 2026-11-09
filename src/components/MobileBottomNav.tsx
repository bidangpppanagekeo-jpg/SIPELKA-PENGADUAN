import React from 'react';
import { Home, Search, PlusCircle, PhoneCall, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenTracker: () => void;
  onOpenEmergency: () => void;
  onOpenAdmin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenReport,
  onOpenTracker,
  onOpenEmergency,
  onOpenAdmin
}) => {
  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 pb-safe"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Tab 1: Beranda */}
        <button
          onClick={() => {
            onSelectTab('beranda');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-transform active:scale-95 ${
            activeTab === 'beranda' ? 'text-teal-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1 leading-tight">Beranda</span>
        </button>

        {/* Tab 2: Lacak Kasus */}
        <button
          onClick={onOpenTracker}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-stone-500 hover:text-stone-800 cursor-pointer transition-transform active:scale-95"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1 leading-tight">Lacak</span>
        </button>

        {/* Tab 3: Central Primary Action (LAPOR) */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onOpenReport}
            title="Buat Pengaduan Sekarang"
            className="w-12 h-12 rounded-full bg-teal-800 hover:bg-teal-900 active:scale-95 text-white flex items-center justify-center shadow-md shadow-teal-950/20 transition-all cursor-pointer -mt-4 border-2 border-white ring-2 ring-teal-700/30"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-teal-900 mt-0.5 leading-tight">
            Lapor
          </span>
        </div>

        {/* Tab 4: Kontak Darurat */}
        <button
          onClick={onOpenEmergency}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-rose-700 hover:text-rose-800 cursor-pointer transition-transform active:scale-95"
        >
          <PhoneCall className="w-5 h-5 text-rose-600" />
          <span className="text-[10px] font-semibold mt-1 leading-tight">Darurat</span>
        </button>

        {/* Tab 5: Portal Petugas */}
        <button
          onClick={onOpenAdmin}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-transform active:scale-95 ${
            activeTab === 'admin' ? 'text-teal-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Lock className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1 leading-tight">Petugas</span>
        </button>
      </div>
    </nav>
  );
};
