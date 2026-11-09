import React from 'react';
import { 
  ShieldAlert, AlertTriangle, HeartHandshake, UserX, 
  Users, Briefcase, Smartphone, Baby, ArrowRight 
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/mockData';

interface CategoriesSectionProps {
  onSelectCategory: (categoryKey: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectCategory }) => {
  const getIcon = (key: string) => {
    switch (key) {
      case 'kdrt_fisik': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'kekerasan_seksual': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'psikis_intimidasi': return <HeartHandshake className="w-5 h-5 text-indigo-600" />;
      case 'penelantaran_anak': return <UserX className="w-5 h-5 text-stone-600" />;
      case 'perkawinan_anak': return <Users className="w-5 h-5 text-teal-700" />;
      case 'tppo_human_trafficking': return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'kbgo_cyberbullying': return <Smartphone className="w-5 h-5 text-cyan-600" />;
      case 'eksploitasi_anak': return <Baby className="w-5 h-5 text-orange-600" />;
      default: return <ShieldAlert className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <section className="py-16 px-4 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block mb-1">
              Bentuk Kekerasan yang Ditangani
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Kenali Bentuk Kekerasan Terhadap Perempuan & Anak
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              Jangan ragu untuk melapor jika Anda atau seseorang di sekitar Anda di wilayah Kabupaten Nagekeo mengalami salah satu dari bentuk perlakuan berikut:
            </p>
          </div>
        </div>

        {/* 8 Category Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
            <div
              key={key}
              onClick={() => onSelectCategory(key)}
              className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-teal-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  {getIcon(key)}
                </div>
                <h3 className="font-bold text-stone-900 text-sm group-hover:text-teal-900 transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Buat Laporan Ini</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
