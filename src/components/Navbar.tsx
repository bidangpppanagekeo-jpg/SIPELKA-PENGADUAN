import React from 'react';
import { Shield, EyeOff, LogOut, PhoneCall, PlusCircle, Search, Lock, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenReport: () => void;
  onOpenTracker: () => void;
  onOpenEmergency: () => void;
  onOpenEducation: () => void;
  onToggleDisguise: () => void;
  onOpenAdmin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReport,
  onOpenTracker,
  onOpenEmergency,
  onOpenEducation,
  onToggleDisguise,
  onOpenAdmin,
  activeTab,
  setActiveTab
}) => {
  // Quick exit to a safe educational / weather site
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com/search?q=cuaca+mbay+nagekeo+ntt');
  };

  return (
    <>
      {/* Top Emergency Action Bar for Safety First */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-rose-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Layanan Siaga Kekerasan Perempuan & Anak Nagekeo
          </span>
          <span className="hidden sm:inline text-stone-400">·</span>
          <span className="hidden sm:inline text-stone-400">Dinsos P3A Kabupaten Nagekeo, NTT</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Disguise Mode Switch */}
          <button
            onClick={onToggleDisguise}
            title="Sembunyikan halaman ini jika ada orang mendekat"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Mode Samaran</span>
          </button>

          {/* Quick Exit Button */}
          <button
            onClick={handleQuickExit}
            title="Tutup halaman seketika & buka Google Cuaca"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-rose-700 hover:bg-rose-800 text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Cepat</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar adhering to Top Bar Contract: [Brand title] - [4-5 links] - [1 action] */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 px-4 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('beranda');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold shadow-sm">
              <Shield className="w-5 h-5 text-teal-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-stone-900 group-hover:text-teal-800 transition-colors">
                SAPA Nagekeo
              </span>
              <span className="text-[11px] text-stone-500 font-normal leading-tight">
                UPTD PPA Kab. Nagekeo
              </span>
            </div>
          </a>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              onClick={() => {
                setActiveTab('beranda');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'beranda' ? 'text-teal-800 font-semibold' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={onOpenTracker}
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4 text-stone-400" />
              Lacak Kasus
            </button>
            <button
              onClick={onOpenEmergency}
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-stone-400" />
              Hotline 24 Jam
            </button>
            <button
              onClick={onOpenEducation}
              className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-stone-400" />
              Hak & Perlindungan
            </button>
            <button
              onClick={onOpenAdmin}
              className={`hover:text-teal-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin' ? 'text-teal-800 font-semibold' : ''
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              Portal Petugas
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Pengaduan</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
