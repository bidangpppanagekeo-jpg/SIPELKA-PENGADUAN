import React from 'react';
import { Shield, PhoneCall, Mail, MapPin, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onOpenReport: () => void;
  onOpenTracker: () => void;
  onOpenEmergency: () => void;
  onOpenAdmin: () => void;
  onToggleDisguise: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReport,
  onOpenTracker,
  onOpenEmergency,
  onOpenAdmin,
  onToggleDisguise
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 px-4 lg:px-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
                <Shield className="w-4 h-4 text-teal-200" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SI-PELKA Nagekeo</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Sistem Informasi Pengaduan dan Pelindungan Korban Kekerasan Terhadap Perempuan dan Anak Kabupaten Nagekeo, Nusa Tenggara Timur.
            </p>
            <div className="text-[11px] text-teal-400 font-medium">
              UPTD PPA Dinas PMDP3A Kabupaten Nagekeo
            </div>
          </div>

          {/* Col 2: Alamat & Kontak Resmi */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Kantor Pelayanan</h4>
            <div className="space-y-2.5 text-stone-400 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Kompleks Perkantoran Civic Center, Jl. Soekarno-Hatta, Mbay, Kab. Nagekeo, NTT 86472</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Hotline 24 Jam: 0812-3987-1290</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>bidangpppanagekeo@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Layanan Cepat */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Akses Mandiri</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={onOpenReport} className="hover:text-white transition-colors cursor-pointer text-left">
                  Buat Pengaduan Kasus Baru
                </button>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-white transition-colors cursor-pointer text-left">
                  Lacak Progres Kasus dengan Kode Tiket
                </button>
              </li>
              <li>
                <button onClick={onOpenEmergency} className="hover:text-white transition-colors cursor-pointer text-left">
                  Kontak Darurat Polsek & RSUD Aeramo
                </button>
              </li>
              <li>
                <button onClick={onToggleDisguise} className="hover:text-white transition-colors cursor-pointer text-left text-amber-400">
                  Mode Samaran (Halaman Resep & Cuaca)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Pengelola & Petugas */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Akses Khusus Dinas</h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Bagi aparatur Bidang PPPA Dinas PMDP3A Kab. Nagekeo untuk mengelola verifikasi kasus, disposisi visum, dan berita acara.
            </p>
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-teal-300 font-semibold rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer border border-stone-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Portal Petugas</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>© 2026 Dinas Pemberdayaan Masyarakat dan Desa, Pemberdayaan Perempuan dan Perlindungan Anak (Dinas PMDP3A) Kabupaten Nagekeo.</p>
          <div className="flex items-center gap-4">
            <span>UU No. 12 Tahun 2022 (TPKS)</span>
            <span>·</span>
            <span>UU No. 23 Tahun 2004 (PKDRT)</span>
            <span>·</span>
            <span>UU No. 35 Tahun 2014 (Perlindungan Anak)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
