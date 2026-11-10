import React, { useState } from 'react';
import { 
  BookOpen, X, Shield, CheckCircle2, ChevronRight, HelpCircle, 
  Printer, PhoneCall, AlertTriangle, Lock, FileText, MapPin, User, HeartHandshake, Eye
} from 'lucide-react';

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForm?: () => void;
}

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
  onOpenForm
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'langkah' | 'privasi' | 'faq'>('langkah');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Apakah kerahasiaan identitas saya dan korban terjamin aman?',
      a: 'YA, 100% TERJAMIN RAHASIA. Undang-Undang Perlindungan Saksi dan Korban serta Peraturan Daerah Nagekeo menjamin bahwa identitas pelapor dan korban dilindungi penuh oleh UPTD PPA Dinas PMDP3A Kabupaten Nagekeo.'
    },
    {
      q: 'Bagaimana jika saya takut melaporkan karena diancam oleh pelaku?',
      a: 'Anda dapat memilih opsi "Samarkan Nama" atau meminta layanan Rumah Aman (Safe House). Tim Reaksi Cepat UPTD PPA akan mendampingi Anda bersama pihak kepolisian untuk memastikan perlindungan fisik dan hukum.'
    },
    {
      q: 'Apakah ada biaya untuk mendapatkan bantuan dari UPTD PPA Nagekeo?',
      a: 'TIDAK ADA BIAYA (GRATIS). Seluruh layanan penjangkauan korban, konseling psikologis, pendampingan hukum, dan pengamanan korban oleh Dinas PMDP3A Kab. Nagekeo tidak dipungut biaya apapun.'
    },
    {
      q: 'Bagaimana proses tindak lanjut setelah pengaduan dikirim?',
      a: 'Setelah formulir dikirim, petugas UPTD PPA Dinas PMDP3A Kab. Nagekeo akan segera memverifikasi laporan dan menghubungi nomor kontak/WhatsApp yang Anda cantumkan untuk koordinasi penanganan.'
    },
    {
      q: 'Apakah bisa melaporkan kejadian kekerasan yang dialami oleh tetangga/kerabat?',
      a: 'BISA. Anda dapat memilih status "Pelapor sebagai Tetangga / Kerabat / Warga Masyarakat". Opsi ini membantu korban yang tidak berani melapor sendiri.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900 animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-teal-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 border border-teal-700 flex items-center justify-center text-teal-200 shadow-inner shrink-0">
              <BookOpen className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Buku Panduan Pengisian Pengaduan
                </h2>
                <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full border border-teal-700 font-semibold">
                  Resmi UPTD PPA
                </span>
              </div>
              <p className="text-xs text-teal-200/90">
                Dinas PMDP3A Kabupaten Nagekeo · Nusa Tenggara Timur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-teal-700"
              title="Cetak Buku Panduan Pengaduan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Panduan</span>
            </button>
            <button
              onClick={onClose}
              className="text-teal-200 hover:text-white p-2 rounded-xl hover:bg-teal-800/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Guidebook */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex gap-1 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveGuideTab('langkah')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGuideTab === 'langkah'
                ? 'bg-white text-teal-900 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-800" />
            <span>Tahap Pengisian (1-4)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('privasi')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGuideTab === 'privasi'
                ? 'bg-white text-teal-900 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <Shield className="w-4 h-4 text-teal-800" />
            <span>Privasi & Keamanan</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('faq')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeGuideTab === 'faq'
                ? 'bg-white text-teal-900 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-teal-800" />
            <span>Tanya Jawab (FAQ)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-stone-700 leading-relaxed">
          
          {/* TAB 1: STEPS 1-4 */}
          {activeGuideTab === 'langkah' && (
            <div className="space-y-6">
              
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex gap-3 items-start">
                <Shield className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-teal-950 text-xs sm:text-sm">
                    Prinsip Pengisian Formulir SI-PELKA Nagekeo
                  </h4>
                  <p className="text-teal-900 text-[11px] leading-relaxed">
                    Pengisian formulir terdiri dari 3 langkah utama. Formulir ini dirancang mudah, aman, dan dapat diisi melalui HP/Laptop bahkan jika Anda hanya mengetahui sebagian data.
                  </p>
                </div>
              </div>

              {/* LANGKAH 1 */}
              <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 relative overflow-hidden shadow-2xs">
                <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm border-b border-stone-100 pb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-teal-800 text-white flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                    1
                  </span>
                  <h3>LANGKAH 1: Data Pelapor & Tingkat Privasi</h3>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <p className="font-semibold text-stone-800">Hal-hal yang perlu Anda perhatikan pada Langkah 1:</p>
                  <ul className="list-disc pl-4 space-y-1.5 marker:text-teal-800">
                    <li>
                      <strong>Tingkat Kerahasiaan:</strong> Anda dapat memilih opsi <em>"Rahasia (Resmi)"</em> jika pelapor dari identitas resmi, atau opsi <em>"Samarkan Nama"</em> jika ingin nama pelapor disamarkan dari dokumen umum.
                    </li>
                    <li>
                      <strong>Nama Pelapor:</strong> Isikan nama lengkap atau nama panggilan pelapor.
                    </li>
                    <li>
                      <strong>Hubungan dengan Korban:</strong> Pilih apakah Anda melapor sebagai Korban Sendiri, Orang Tua, Kerabat, atau Tetangga/Warga.
                    </li>
                    <li>
                      <strong>Nomor WhatsApp Active (Penting):</strong> Masukkan nomor telepon/WhatsApp aktif agar Tim UPTD PPA Dinas PMDP3A Nagekeo dapat mengonfirmasi laporan dan memberikan pendampingan cepat.
                    </li>
                  </ul>
                </div>
              </div>

              {/* LANGKAH 2 */}
              <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 relative overflow-hidden shadow-2xs">
                <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm border-b border-stone-100 pb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-teal-800 text-white flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                    2
                  </span>
                  <h3>LANGKAH 2: Data Korban & Wilayah Kejadian</h3>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <p className="font-semibold text-stone-800">Hal-hal yang perlu Anda perhatikan pada Langkah 2:</p>
                  <ul className="list-disc pl-4 space-y-1.5 marker:text-teal-800">
                    <li>
                      <strong>Nama Korban:</strong> Isikan nama lengkap korban. Jika memikirkan perlindungan privasi anak, Anda dapat mengisi inisial nama korban.
                    </li>
                    <li>
                      <strong>Jenis Kelamin & Usia:</strong> Opsi jenis kelamin mencakup Perempuan atau Anak Laki-laki. Tuliskan perkiraan usia korban dalam satuan tahun.
                    </li>
                    <li>
                      <strong>Pilihan Kecamatan & Desa di Nagekeo:</strong> Pilih salah satu dari 7 Kecamatan (Aesesa, Aesesa Selatan, Boawae, Mauponggo, Nangaroro, Keo Tengah, Wolowae) serta pilih Desa/Kelurahan lokasi kejadian.
                    </li>
                    <li>
                      <strong>Detail Alamat:</strong> Tuliskan rincian Dusun, Kampung, RT/RW, atau petunjuk lokasi terdekat tempat tinggal korban.
                    </li>
                  </ul>
                </div>
              </div>

              {/* LANGKAH 3 */}
              <div className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 relative overflow-hidden shadow-2xs">
                <div className="flex items-center gap-2.5 text-teal-900 font-bold text-sm border-b border-stone-100 pb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-teal-800 text-white flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                    3
                  </span>
                  <h3>LANGKAH 3: Data Pelaku, Kronologi & Layanan Bantuan</h3>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <p className="font-semibold text-stone-800">Hal-hal yang perlu Anda perhatikan pada Langkah 3:</p>
                  <ul className="list-disc pl-4 space-y-1.5 marker:text-teal-800">
                    <li>
                      <strong>Identitas Terduga Pelaku:</strong> Pilih apakah pelaku dikenal (misal: suami, kerabat, tetangga) atau tidak dikenal. Isikan nama dan alamat pelaku jika diketahui.
                    </li>
                    <li>
                      <strong>Bentuk Kekerasan:</strong> Pilih jenis peristiwa seperti KDRT Fisik, Kekerasan Seksual, Kekerasan Psikologis, Penelantaran Rumah Tangga, atau Perundungan Anak.
                    </li>
                    <li>
                      <strong>Kronologi Peristiwa:</strong> Uraikan secara ringkas apa yang terjadi, waktu kejadian, serta kondisi fisik/mental korban saat ini.
                    </li>
                    <li>
                      <strong>Kebutuhan Layanan Darurat:</strong> Centang layanan yang dibutuhkan segera, seperti:
                      <div className="grid grid-cols-2 gap-1.5 mt-1 font-medium text-[11px] text-stone-700">
                        <span className="bg-stone-100 p-1.5 rounded">✓ Visum RSUD Aeramo</span>
                        <span className="bg-stone-100 p-1.5 rounded">✓ Safe House / Rumah Aman</span>
                        <span className="bg-stone-100 p-1.5 rounded">✓ Pendampingan Polres</span>
                        <span className="bg-stone-100 p-1.5 rounded">✓ Counseling / Trauma Healing</span>
                      </div>
                    </li>
                    <li>
                      <strong>Lampiran Foto Bukti (Opsional):</strong> Anda dapat mengunggah foto luka, pesan ancaman, atau bukti fisik pendukung lainnya.
                    </li>
                  </ul>
                </div>
              </div>

              {/* LANGKAH 4 */}
              <div className="border border-emerald-200 rounded-2xl p-4 sm:p-5 bg-emerald-50/50 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm border-b border-emerald-200/60 pb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                    4
                  </span>
                  <h3>SETELAH FORMULIR TERKIRIM (Tanda Bukti & Konfirmasi Petugas)</h3>
                </div>

                <div className="space-y-2 text-xs text-emerald-900">
                  <p className="font-semibold">Setelah Anda mengklik tombol "Kirim Pengaduan Lengkap":</p>
                  <ul className="list-disc pl-4 space-y-1.5 marker:text-emerald-800">
                    <li>
                      <strong>Bukti Lapor Resmi:</strong> Layar akan menampilkan Bukti Lapor Pengaduan yang berisi <strong>Nomor Tiket Pengaduan</strong> (Contoh: <code>PPA-NGK-2026-8111</code>) sebagai tanda pengenal resmi berkas aduan Anda.
                    </li>
                    <li>
                      <strong>Tombol WhatsApp Cepat:</strong> Anda dapat langsung mengklik tombol <em>"Kirim Konfirmasi Cepat ke WhatsApp UPTD PPA"</em> untuk menghubungi tim petugas dinas (<code>0822-6635-5313</code>).
                    </li>
                    <li>
                      <strong>Tindak Lanjut oleh Petugas:</strong> Pengaduan langsung masuk ke sistem Dinas PMDP3A Nagekeo, dan petugas UPTD PPA akan segera menghubungi nomor kontak Anda untuk proses verifikasi serta pendampingan langsung.
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRIVACY & SECURITY */}
          {activeGuideTab === 'privasi' && (
            <div className="space-y-5">
              <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-teal-300 font-bold text-sm">
                  <Lock className="w-5 h-5 text-teal-400" />
                  <h3>Jaminan Perlindungan Hukum & Privasi Pelapor</h3>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Pemerintah Kabupaten Nagekeo melalui Dinas PMDP3A menjamin perlindungan hukum sepenuhnya bagi setiap warga negara yang melaporkan kasus kekerasan terhadap perempuan dan anak.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-teal-800" />
                    Kerahasiaan Identitas Pelapor
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Identitas pelapor dan korban disimpan dalam database terenkripsi UPTD PPA dan tidak akan dipublikasikan ke media massa atau khalayak umum.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-teal-800" />
                    Fasilitas Rumah Aman (Safe House)
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Bagi korban yang berada dalam ancaman keselamatan fisik, UPTD PPA menyediakan fasilitas Rumah Aman rahasia yang dijaga ketat selama alur penanganan berlangsung.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Fitur Keluar Cepat (Quick Exit) untuk Keselamatan Korban</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Jika Anda sedang mengisi pengaduan dan merasa terancam (misalnya pelaku tiba-tiba mendekat), tekan tombol <strong>"Keluar Cepat"</strong> atau tekan tombol <code>Esc</code> pada keyboard. Aplikasi akan seketika mengalihkan tampilan layar Anda ke halaman pencarian cuaca netral.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeGuideTab === 'faq' && (
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-2">
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                  Pertanyaan Sering Diajukan (FAQ) Pengaduan UPTD PPA
                </h3>
                <p className="text-[11px] text-stone-500">
                  Jawaban atas keraguan umum seputar pelaporan kasus kekerasan perempuan & anak di Kab. Nagekeo.
                </p>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-stone-200 rounded-2xl overflow-hidden bg-white transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left font-bold text-stone-900 text-xs flex items-center justify-between gap-3 hover:bg-stone-50 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-teal-800 shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-3.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-700 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Directly Contact Officers Box */}
              <div className="bg-stone-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 pt-4 mt-6">
                <div>
                  <h4 className="font-bold text-xs text-white">Butuh Penjelasan Langsung?</h4>
                  <p className="text-[11px] text-stone-400">Tim Konselor UPTD PPA Dinas PMDP3A Siap Membantu 24 Jam.</p>
                </div>
                <a
                  href="https://wa.me/6282266355313?text=Halo%20UPTD%20PPA%20Dinas%20PMDP3A%20Kabupaten%20Nagekeo,%20saya%20ingin%20bertanya%20mengenai%20panduan%20pengajuan%20pengaduan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Hubungi 0822-6635-5313</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            Aplikasi Resmi UPTD PPA Dinas PMDP3A Kabupaten Nagekeo, NTT
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Tutup Panduan
            </button>

            {onOpenForm && (
              <button
                onClick={() => {
                  onClose();
                  onOpenForm();
                }}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <span>Mulai Isi Pengaduan Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
