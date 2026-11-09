import React from 'react';
import { ShieldCheck, HeartHandshake, PhoneCall, PlusCircle, Search, HelpCircle, AlertTriangle } from 'lucide-react';

interface HeroSectionProps {
  onOpenReport: () => void;
  onOpenTracker: () => void;
  onOpenEmergency: () => void;
  onOpenEducation: () => void;
  onOpenAssessment: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenReport,
  onOpenTracker,
  onOpenEmergency,
  onOpenEducation,
  onOpenAssessment
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-teal-900 to-stone-900 text-white pt-8 pb-16 lg:py-20 px-4 lg:px-8">
      {/* Subtle organic background mesh */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Reassurance & Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Kicker */}
            <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Dinas Sosial, Pemberdayaan Perempuan & Perlindungan Anak Kab. Nagekeo</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance">
              Anda Tidak Sendiri. Kami Hadir Melindungi Perempuan dan Anak Nagekeo.
            </h1>

            {/* Empathetic Subtext */}
            <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-2xl font-normal">
              Layanan pengaduan resmi, cepat, dan aman bagi korban maupun saksi tindak kekerasan di Kabupaten Nagekeo. Identitas Anda dapat dirahasiakan sepenuhnya. Tim UPTD PPA siap mendampingi pemulihan medis, hukum, dan psikologis.
            </p>

            {/* Reassurance Trust Points - Zero Pill unboxed clean typography */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
                <span>100% Rahasia & Terlindungi</span>
              </div>
              <span className="text-stone-500" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Pendampingan & Visum Gratis</span>
              </div>
              <span className="text-stone-500" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Respon Tanggap Cepat Lapangan</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenReport}
                className="px-6 py-3 text-sm font-semibold text-teal-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Lapor Kasus Sekarang</span>
              </button>

              <button
                onClick={onOpenTracker}
                className="px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-teal-300" />
                <span>Lacak Status Kasus</span>
              </button>

              <button
                onClick={onOpenEmergency}
                className="px-4 py-3 text-sm font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>Hotline Darurat</span>
              </button>
            </div>

            {/* Self-Assessment recommendation link */}
            <div className="pt-1">
              <button
                onClick={onOpenAssessment}
                className="text-xs text-stone-300 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-300" />
                <span>Ragu apakah situasi Anda termasuk kekerasan? Coba panduan asesmen awal 1 menit</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Photo (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-stone-900 group">
              <img
                src="/src/assets/images/nagekeo_pppa_hero_1794205236728.jpg"
                alt="Pendampingan perlindungan perempuan dan anak oleh petugas konselor ramah di Kabupaten Nagekeo, NTT"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              {/* Subtle gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-xs text-stone-200">
                <p className="font-medium text-white">UPTD PPA Kabupaten Nagekeo</p>
                <p className="text-[11px] text-stone-300">
                  Konseling humanis, rumah aman (safe house), dan advokasi terpadu di 7 Kecamatan se-Nagekeo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
