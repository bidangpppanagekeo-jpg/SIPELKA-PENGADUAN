import React, { useState } from 'react';
import { MapPin, Users, Building, ShieldCheck, ChevronRight } from 'lucide-react';
import { NAGEKEO_KECAMATAN_DATA } from '../data/mockData';
import { NagekeoKecamatan } from '../types';

interface DistrictSectionProps {
  onReportInDistrict: (kecamatan: NagekeoKecamatan) => void;
}

export const DistrictSection: React.FC<DistrictSectionProps> = ({ onReportInDistrict }) => {
  const [activeKecamatan, setActiveKecamatan] = useState<NagekeoKecamatan>('Aesesa');

  const districtDetails: Record<NagekeoKecamatan, { center: string; posko: string; polsek: string; note: string }> = {
    'Aesesa': {
      center: 'Ibukota Kabupaten (Mbay)',
      posko: 'Kantor UPTD PPA Dinsos (Kompleks Civic Center Mbay)',
      polsek: 'Polsek Aesesa & Sat Reskrim Polres Nagekeo (Aeramo)',
      note: 'Pusat rujukan penanganan utama, shelter rumah aman, dan layanan visum RSUD Aeramo.'
    },
    'Aesesa Selatan': {
      center: 'Jawakisa',
      posko: 'Posko Perlindungan Perempuan & Anak Kantor Camat Aesesa Selatan',
      polsek: 'Wilayah Hukum Polsek Aesesa',
      note: 'Tim penjangkauan mobile UPTD PPA siap menjangkau wilayah Rendu dan sekitarnya.'
    },
    'Boawae': {
      center: 'Boawae',
      posko: 'Pos Pelayanan D-SAPA Boawae (Depan Kantor Camat)',
      polsek: 'Polsek Boawae',
      note: 'Fasilitas rujukan cepat untuk pencegahan perkawinan anak dan perlindungan hak pendidikan.'
    },
    'Mauponggo': {
      center: 'Mauponggo',
      posko: 'Posko Sahabat Perempuan dan Anak Mauponggo',
      polsek: 'Polsek Mauponggo',
      note: 'Pendampingan terpadu wilayah pesisir selatan dan perbukitan Mauponggo.'
    },
    'Nangaroro': {
      center: 'Nangaroro',
      posko: 'Pos Reaksi Cepat Perlindungan Anak Nangaroro',
      polsek: 'Polsek Nangaroro',
      note: 'Titik rujukan lintas batas timur Nagekeo dengan koordinasi satgas desa.'
    },
    'Keo Tengah': {
      center: 'Witurombaua',
      posko: 'Pos Konseling Terpadu Keo Tengah',
      polsek: 'Wilayah Hukum Polsek Mauponggo / Pos Pol Keo Tengah',
      note: 'Pemberdayaan relawan desa dan perlindungan perempuan korban KDRT.'
    },
    'Wolowae': {
      center: 'Totomala',
      posko: 'Pos Layanan Pengaduan Masyarakat Wolowae',
      polsek: 'Wilayah Hukum Polsek Aesesa / Pos Pol Wolowae',
      note: 'Penanganan cepat kasus eksploitasi dan perlindungan hak anak di pesisir utara.'
    }
  };

  const currentDetail = districtDetails[activeKecamatan];
  const villages = NAGEKEO_KECAMATAN_DATA[activeKecamatan] || [];

  return (
    <section className="py-16 px-4 lg:px-8 bg-stone-100/60 border-t border-stone-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block mb-1">
            Jangkauan 7 Kecamatan di Nagekeo
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Layanan Menjangkau Seluruh Pelosok Kabupaten Nagekeo
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Tim Reaksi Cepat UPTD PPA bekerjasama dengan Kepolisian Sektor (Polsek), Puskesmas, dan Relawan Desa Sahabat Perempuan dan Anak (D-SAPA).
          </p>
        </div>

        {/* District Selector & Details */}
        <div className="grid lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-stone-200 p-6 lg:p-8 shadow-xs">
          {/* Left Column: District Buttons (4 cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Pilih Wilayah Kecamatan:
            </span>
            {(Object.keys(NAGEKEO_KECAMATAN_DATA) as NagekeoKecamatan[]).map((kec) => (
              <button
                key={kec}
                onClick={() => setActiveKecamatan(kec)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  activeKecamatan === kec
                    ? 'bg-teal-800 text-white shadow-xs font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span>Kecamatan {kec}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${activeKecamatan === kec ? 'text-teal-200' : 'text-stone-400'}`} />
              </button>
            ))}
          </div>

          {/* Right Column: Active District Information (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-800" />
                  <h3 className="text-lg font-bold text-stone-900">
                    Kecamatan {activeKecamatan}
                  </h3>
                  <span className="text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
                    {currentDetail.center}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {currentDetail.note}
                </p>
              </div>

              {/* Service Hubs in this District */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <Building className="w-4 h-4 text-teal-800" />
                    <span>Posko Layanan Terdekat</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{currentDetail.posko}</p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <ShieldCheck className="w-4 h-4 text-teal-800" />
                    <span>Mitra Kepolisian Wilayah</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{currentDetail.polsek}</p>
                </div>
              </div>

              {/* Village tags unboxed clean list */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 block">
                  Daftar Desa / Kelurahan Terlayani di Kec. {activeKecamatan}:
                </span>
                <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                  {villages.map((v, i) => (
                    <span key={v} className="bg-stone-100 px-2.5 py-1 rounded text-[11px] text-stone-800">
                      Desa {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                Punya laporan atau informasi kekerasan di wilayah {activeKecamatan}?
              </span>
              <button
                onClick={() => onReportInDistrict(activeKecamatan)}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Laporkan Kejadian di Kec. {activeKecamatan}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
