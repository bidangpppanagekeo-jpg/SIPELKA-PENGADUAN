import React from 'react';
import { 
  ShieldCheck, HeartHandshake, Scale, Home, AlertOctagon, 
  BookOpen, CheckCircle2, MapPin, Users 
} from 'lucide-react';

interface EducationSectionProps {
  onOpenReport: () => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ onOpenReport }) => {
  return (
    <section id="edukasi" className="py-16 px-4 lg:px-8 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Heading */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dasar Hukum & Hak Korban</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-snug">
            Hak Anda Dilindungi Penuh oleh Undang-Undang
          </h2>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            Pemerintah Kabupaten Nagekeo berkomitmen memberikan penanganan komprehensif, perlindungan fisik, serta pemulihan martabat bagi setiap perempuan dan anak yang mengalami kekerasan.
          </p>
        </div>

        {/* 3 Hak Pokok Korban sesuai UU TPKS No. 12 Tahun 2022 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">1. Hak Atas Penanganan</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Korban berhak mendapatkan layanan pengaduan yang mudah, pemeriksaan medis segera, visum et repertum gratis di RSUD Aeramo, serta pendampingan psikologis awal tanpa dipersulit.
            </p>
            <span className="text-[11px] text-teal-800 font-medium block pt-1">Pasal 67 UU TPKS No. 12/2022</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">2. Hak Atas Pelindungan</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Penyediaan tempat tinggal sementara (Rumah Aman / Safe House) yang dirahasiakan, bebas dari ancaman fisik pelaku, serta perlindungan kerahasiaan identitas dari pemberitaan publik.
            </p>
            <span className="text-[11px] text-teal-800 font-medium block pt-1">Pasal 68 UU TPKS No. 12/2022</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">3. Hak Atas Pemulihan</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Rehabilitasi kesehatan fisik, trauma healing bersama konselor, bantuan hukum cuma-cuma, serta reintegrasi sosial berkelanjutan agar korban dapat kembali berdaya di masyarakat.
            </p>
            <span className="text-[11px] text-teal-800 font-medium block pt-1">Pasal 70 UU TPKS No. 12/2022</span>
          </div>
        </div>

        {/* Alur 5 Langkah Penanganan Kasus di Nagekeo */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 lg:p-8 space-y-6">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-stone-900">Alur Layanan Pengaduan UPTD PPA Kabupaten Nagekeo</h3>
            <p className="text-xs text-stone-500 mt-1">
              Setiap laporan ditindaklanjuti secara sistematis dan rahasia oleh Tim Reaksi Cepat Dinas PMDP3A Nagekeo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800">Langkah 01</span>
              <h4 className="text-sm font-bold text-stone-900">Penerimaan Aduan</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pelapor mengisi formulir online (SI-PELKA Nagekeo) atau menghubungi hotline siaga 24 jam.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800">Langkah 02</span>
              <h4 className="text-sm font-bold text-stone-900">Verifikasi & Triage</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Konselor menilai tingkat kedaruratan (Darurat, Mendesak, Standar) dan kerahasiaan dalam 1–2 jam.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800">Langkah 03</span>
              <h4 className="text-sm font-bold text-stone-900">Penjangkauan Lapangan</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tim Reaksi Cepat mendatangi lokasi di 7 kecamatan Nagekeo untuk mengamankan korban jika terancam.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800">Langkah 04</span>
              <h4 className="text-sm font-bold text-stone-900">Pendampingan Terpadu</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pemeriksaan visum di RSUD Aeramo, safe house, serta pendampingan hukum di Satreskrim Polres Nagekeo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-800">Langkah 05</span>
              <h4 className="text-sm font-bold text-stone-900">Pemulihan & Monitoring</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pemantauan berkala bersama kader Desa Ramah Perempuan & Peduli Anak (D-KRPPA) di tingkat desa.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Split with Consultation Room Photo */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-stone-200 p-6 lg:p-8">
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-stone-200">
            <img
              src="/src/assets/images/nagekeo_safe_center_1794205236918.jpg"
              alt="Ruang Konseling & Rumah Aman UPTD PPA Kabupaten Nagekeo"
              referrerPolicy="no-referrer"
              className="w-full h-72 object-cover object-center"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
              Fasilitas Safe House & Konseling Nagekeo
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              Ruang Konsultasi Ramah Anak & Perlindungan Nyaman
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              UPTD PPA Dinas PMDP3A Kabupaten Nagekeo menyediakan ruang konsultasi dan rumah aman sementara yang dilengkapi sarana bermain anak, privasi kedap suara, dan suasana menenangkan agar ibu dan anak merasa tenteram menceritakan apa yang dialami.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenReport}
                className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 active:bg-teal-950 rounded-xl sm:rounded-lg shadow-sm transition-colors cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center"
              >
                Konsultasikan Masalah Anda Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
