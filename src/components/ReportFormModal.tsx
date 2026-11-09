import React, { useState } from 'react';
import { 
  X, Shield, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, 
  MapPin, Clock, UserCheck, FileText, Heart, Lock, Copy, Check, Upload, HelpCircle 
} from 'lucide-react';
import { 
  ReportItem, UrgencyLevel, ReportCategory, ReporterType, 
  ConfidentialityLevel, NagekeoKecamatan 
} from '../types';
import { NAGEKEO_KECAMATAN_DATA, CATEGORY_LABELS } from '../data/mockData';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: ReportItem) => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport
}) => {
  const [step, setStep] = useState<number>(1);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<ReportItem | null>(null);

  // Form State
  const [urgency, setUrgency] = useState<UrgencyLevel>('mendesak');
  const [reporterType, setReporterType] = useState<ReporterType>('korban');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('rahasia');
  
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [victimName, setVictimName] = useState<string>('');
  const [victimAgeGroup, setVictimAgeGroup] = useState<ReportItem['victimAgeGroup']>('dewasa_18_59');
  const [victimGender, setVictimGender] = useState<'perempuan' | 'laki-laki_anak'>('perempuan');

  const [category, setCategory] = useState<ReportCategory>('kdrt_fisik');
  const [kecamatan, setKecamatan] = useState<NagekeoKecamatan>('Aesesa');
  const [desaKelurahan, setDesaKelurahan] = useState<string>('Danga');
  const [incidentLocationDetail, setIncidentLocationDetail] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  
  const [perpetratorRelationship, setPerpetratorRelationship] = useState<ReportItem['perpetratorRelationship']>('suami_istri');
  const [perpetratorNameMasked, setPerpetratorNameMasked] = useState<string>('');

  const [servicesNeeded, setServicesNeeded] = useState({
    medisVisum: true,
    bantuanHukum: true,
    konselingPsikologis: true,
    rumahAman: false,
    mediasiKeluarga: false,
    bantuanSosialDarurat: false
  });

  const [evidenceDescription, setEvidenceDescription] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleKecamatanChange = (kec: NagekeoKecamatan) => {
    setKecamatan(kec);
    const availableDesa = NAGEKEO_KECAMATAN_DATA[kec];
    if (availableDesa && availableDesa.length > 0) {
      setDesaKelurahan(availableDesa[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate Ticket Code and Secret PIN
    const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const ticketCode = `PPA-NGK-${new Date().getFullYear()}-${randomTicketNum}`;

    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      ticketCode,
      secretPin: randomPin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      urgency,
      category,
      status: 'masuk',
      reporterType,
      confidentiality,
      reporterName: confidentiality === 'anonim' ? 'Anonim (Dirahasiakan)' : (reporterName || 'Pelapor Warga Nagekeo'),
      reporterContact: confidentiality === 'anonim' ? undefined : reporterContact,
      victimName: confidentiality === 'anonim' ? 'Korban (Inisial Terlindungi)' : (victimName || 'Korban Terlindungi'),
      victimAgeGroup,
      victimGender,
      kecamatan,
      desaKelurahan,
      incidentLocationDetail: incidentLocationDetail || `Desa ${desaKelurahan}, Kec. ${kecamatan}`,
      incidentDate,
      incidentDescription,
      perpetratorRelationship,
      perpetratorNameMasked: perpetratorNameMasked || 'Pihak Terlapor',
      servicesNeeded,
      attachments: selectedFileName ? [
        {
          id: `att_${Date.now()}`,
          name: selectedFileName,
          type: 'foto',
          url: '/src/assets/images/nagekeo_safe_center_1794205236918.jpg',
          size: 'Terunggah Aman'
        }
      ] : [],
      officerNotes: [
        {
          id: `note_${Date.now()}`,
          officerName: 'Sistem Penerimaan Otomatis UPTD PPA',
          date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
          summary: `Laporan pengaduan masuk dengan tingkat kegawatan ${urgency.toUpperCase()}. Menunggu verifikasi tim reaksi cepat Dinas PMDP3A Nagekeo.`,
          actionPlan: 'Penugasan petugas penjangkauan kasus dan penyiapan rujukan sesuai kebutuhan yang dipilih.',
          assignedUnit: 'UPTD PPA Kabupaten Nagekeo'
        }
      ],
      messages: []
    };

    onSubmitReport(newReport);
    setGeneratedResult(newReport);
    setStep(5); // Success step
  };

  const copyTicketCode = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(`Kode Tiket: ${generatedResult.ticketCode} | PIN: ${generatedResult.secretPin}`);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 3000);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setGeneratedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        {/* Top Header with Mobile Sheet Handle */}
        <div className="bg-teal-900 text-white px-5 sm:px-6 pt-3 sm:pt-4 pb-3.5 sm:pb-4 flex flex-col shrink-0">
          <div className="w-10 h-1 bg-teal-600/60 rounded-full mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold leading-tight">Formulir Pengaduan Kekerasan</h2>
                <p className="text-[11px] sm:text-xs text-teal-200">Dinas PMDP3A Kabupaten Nagekeo</p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="text-teal-200 hover:text-white p-2 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Tutup Formulir"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator (Only if not in success step) */}
        {step < 5 && (
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 1 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>1</span>
              <span className={step === 1 ? 'font-semibold text-teal-900' : ''}>Privasi & Pelapor</span>
            </div>
            <span className="text-stone-300">/</span>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 2 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>2</span>
              <span className={step === 2 ? 'font-semibold text-teal-900' : ''}>Kejadian di Nagekeo</span>
            </div>
            <span className="text-stone-300">/</span>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 3 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>3</span>
              <span className={step === 3 ? 'font-semibold text-teal-900' : ''}>Layanan & Bukti</span>
            </div>
            <span className="text-stone-300">/</span>
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${step === 4 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>4</span>
              <span className={step === 4 ? 'font-semibold text-teal-900' : ''}>Konfirmasi</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Privasi & Pelapor */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Kegawatan Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Apakah saat ini korban dalam bahaya langsung yang mengancam nyawa?</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUrgency('darurat')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                      urgency === 'darurat'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-rose-700">🚨 Darurat</div>
                    <div className="text-[11px] text-stone-500">Butuh evakuasi segera ke Rumah Aman</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('mendesak')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                      urgency === 'mendesak'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-amber-700">⚠️ Mendesak</div>
                    <div className="text-[11px] text-stone-500">Terjadi baru-baru ini / Visum & pengamanan</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('standar')}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                      urgency === 'standar'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-teal-800">📋 Standar</div>
                    <div className="text-[11px] text-stone-500">Konseling pemulihan & mediasi</div>
                  </button>
                </div>
              </div>

              {/* Pilihan Kerahasiaan Identitas */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Tingkat Kerahasiaan Identitas Anda
                </label>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  <label className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    confidentiality === 'rahasia'
                      ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="confidentiality"
                      value="rahasia"
                      checked={confidentiality === 'rahasia'}
                      onChange={() => setConfidentiality('rahasia')}
                      className="sr-only"
                    />
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-700" /> Rahasia (Direkomendasikan)
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Hanya diketahui tim konselor resmi UPTD PPA Nagekeo. Tidak disebarkan ke publik.
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    confidentiality === 'anonim'
                      ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="confidentiality"
                      value="anonim"
                      checked={confidentiality === 'anonim'}
                      onChange={() => setConfidentiality('anonim')}
                      className="sr-only"
                    />
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-stone-600" /> Anonim Total
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Tanpa nama dan kontak. Lacak perkembangan menggunakan Kode Tiket & PIN rahasia saja.
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    confidentiality === 'terbuka'
                      ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="confidentiality"
                      value="terbuka"
                      checked={confidentiality === 'terbuka'}
                      onChange={() => setConfidentiality('terbuka')}
                      className="sr-only"
                    />
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-stone-600" /> Terbuka / Lapor Resmi
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Untuk langsung diteruskan ke proses hukum Satreskrim Polres Nagekeo.
                    </span>
                  </label>
                </div>
              </div>

              {/* Siapa Anda */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Hubungan Pelapor dengan Korban
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'korban', label: 'Saya Sendiri (Korban)' },
                    { id: 'keluarga_kerabat', label: 'Keluarga / Kerabat' },
                    { id: 'saksi_warga', label: 'Saksi / Tetangga' },
                    { id: 'tokoh_masyarakat_guru', label: 'Guru / Tokoh Desa' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReporterType(item.id as ReporterType)}
                      className={`px-3 py-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                        reporterType === item.id
                          ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Pelapor jika bukan anonim */}
              {confidentiality !== 'anonim' && (
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Pelapor (atau Inisial)
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Contoh: Maria R. / Ibu M."
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nomor HP / WhatsApp yang Aman Dihubungi
                    </label>
                    <input
                      type="text"
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Data Usia Korban */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Kelompok Usia Korban
                  </label>
                  <select
                    value={victimAgeGroup}
                    onChange={(e) => setVictimAgeGroup(e.target.value as ReportItem['victimAgeGroup'])}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white"
                  >
                    <option value="anak_dibawah_12">Anak-Anak (0 - 11 Tahun)</option>
                    <option value="remaja_12_17">Remaja (12 - 17 Tahun)</option>
                    <option value="dewasa_18_59">Perempuan Dewasa (18 - 59 Tahun)</option>
                    <option value="lansia_60_keatas">Perempuan Lansia (60+ Tahun)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Jenis Kelamin Korban
                  </label>
                  <select
                    value={victimGender}
                    onChange={(e) => setVictimGender(e.target.value as 'perempuan' | 'laki-laki_anak')}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white"
                  >
                    <option value="perempuan">Perempuan</option>
                    <option value="laki-laki_anak">Laki-Laki (Khusus Anak)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Kejadian & Wilayah Nagekeo */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Kategori Kekerasan */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Bentuk / Kategori Kekerasan yang Terjadi
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                    <div
                      key={key}
                      onClick={() => setCategory(key as ReportCategory)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        category === key
                          ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-bold text-stone-900">{item.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{item.desc}</div>
                      <div className="text-[10px] text-teal-800 mt-1 font-medium">{item.legalRef}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wilayah di Kabupaten Nagekeo */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <span>Lokasi Kejadian di Wilayah Kabupaten Nagekeo</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Kecamatan di Nagekeo
                    </label>
                    <select
                      value={kecamatan}
                      onChange={(e) => handleKecamatanChange(e.target.value as NagekeoKecamatan)}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white font-medium"
                    >
                      {Object.keys(NAGEKEO_KECAMATAN_DATA).map((kec) => (
                        <option key={kec} value={kec}>
                          Kecamatan {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Desa / Kelurahan
                    </label>
                    <select
                      value={desaKelurahan}
                      onChange={(e) => setDesaKelurahan(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white font-medium"
                    >
                      {NAGEKEO_KECAMATAN_DATA[kecamatan]?.map((desa) => (
                        <option key={desa} value={desa}>
                          Desa / Kel. {desa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Detail Lokasi (Contoh: Rumah, Kebun, Dekat Pasar, Jalan)
                    </label>
                    <input
                      type="text"
                      value={incidentLocationDetail}
                      onChange={(e) => setIncidentLocationDetail(e.target.value)}
                      placeholder="Misal: Rumah tinggal di Dusun II"
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Perkiraan Tanggal Kejadian
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Uraian Kronologi */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ceritakan Kejadian Secara Singkat (Kronologi)
                </label>
                <textarea
                  rows={4}
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Jelaskan secara ringkas apa yang terjadi, apa yang dialami korban, dan jika ada kondisi luka/ancaman saat ini. Kami menjaga kerahasiaan cerita Anda sepenuhnya."
                  className="w-full text-xs border border-stone-300 rounded-lg p-3 focus:border-teal-700 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Pelaku, Layanan & Bukti */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Hubungan Pelaku */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Hubungan Terduga Pelaku dengan Korban
                </label>
                <select
                  value={perpetratorRelationship}
                  onChange={(e) => setPerpetratorRelationship(e.target.value as ReportItem['perpetratorRelationship'])}
                  className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:border-teal-700 focus:outline-none bg-white"
                >
                  <option value="suami_istri">Suami / Pasangan / Mantan Pasangan</option>
                  <option value="orang_tua_wali">Orang Tua / Wali / Mertua</option>
                  <option value="kerabat_keluarga">Kerabat / Saudara Kandung / Paman</option>
                  <option value="tetangga_kenalan">Tetangga / Kenalan Desa</option>
                  <option value="majikan_atasan">Majikan / Atasan Kerja</option>
                  <option value="orang_tak_dikenal">Orang Tidak Dikenal</option>
                </select>
              </div>

              {/* Layanan yang dibutuhkan */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Layanan Bantuan yang Paling Dibutuhkan Korban Saat Ini (Dapat dipilih lebih dari satu)
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.medisVisum}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, medisVisum: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Pemeriksaan Medis / Visum RSUD Aeramo</span>
                      <span className="text-[11px] text-stone-500">Pengobatan luka fisik & bukti medis visum et repertum</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.rumahAman}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, rumahAman: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Rumah Aman (Safe House UPTD PPA)</span>
                      <span className="text-[11px] text-stone-500">Tempat tinggal sementara aman dari jangkauan pelaku</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.konselingPsikologis}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, konselingPsikologis: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Konseling & Trauma Healing</span>
                      <span className="text-[11px] text-stone-500">Pendampingan psikososial oleh psikolog/konselor terlatih</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.bantuanHukum}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, bantuanHukum: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Pendampingan Hukum & Kepolisian</span>
                      <span className="text-[11px] text-stone-500">Didampingi advokat ke Unit PPA Satreskrim Polres Nagekeo</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.mediasiKeluarga}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, mediasiKeluarga: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Mediasi Restoratif / Keluarga</span>
                      <span className="text-[11px] text-stone-500">Fasilitasi penyelesaian perkara ringan & perlindungan anak</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={servicesNeeded.bantuanSosialDarurat}
                      onChange={(e) => setServicesNeeded({ ...servicesNeeded, bantuanSosialDarurat: e.target.checked })}
                      className="mt-0.5 rounded text-teal-800 focus:ring-teal-700"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">Bantuan Pangan & Sosial Darurat</span>
                      <span className="text-[11px] text-stone-500">Bantuan kebutuhan pokok anak dan keluarga terlantar Dinsos</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Upload Bukti */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Bukti Pendukung (Opsional - Foto luka/memar, screenshot pesan, atau dokumen)
                </label>
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-teal-700 transition-colors">
                  <Upload className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-600 mb-1">
                    {selectedFileName ? (
                      <span className="font-semibold text-teal-800">Berkas terlampir: {selectedFileName}</span>
                    ) : (
                      'Pilih berkas foto/dokumen dari perangkat'
                    )}
                  </p>
                  <p className="text-[11px] text-stone-400 mb-2">JPG, PNG, PDF, atau MP3 (Maksimal 10MB)</p>
                  <input
                    type="file"
                    id="evidence-file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label
                    htmlFor="evidence-file"
                    className="inline-block px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md cursor-pointer transition-colors"
                  >
                    Pilih File Bukti
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Konfirmasi Akhir */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="font-bold text-teal-950 text-sm mb-1">Ringkasan Pengaduan Anda</h3>
                <p className="text-xs text-teal-800">
                  Pastikan informasi berikut telah sesuai sebelum dikirim ke UPTD PPA Kabupaten Nagekeo.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-stone-500">Tingkat Kegawatan:</span>
                  <span className="font-bold text-stone-900 uppercase">{urgency}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-stone-500">Kerahasiaan:</span>
                  <span className="font-semibold text-stone-900 capitalize">{confidentiality}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-stone-500">Kategori:</span>
                  <span className="font-semibold text-stone-900">{CATEGORY_LABELS[category]?.label}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-stone-500">Wilayah:</span>
                  <span className="font-semibold text-stone-900">Desa {desaKelurahan}, Kec. {kecamatan}, Kab. Nagekeo</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-stone-500">Tanggal Kejadian:</span>
                  <span className="font-mono text-stone-900">{incidentDate}</span>
                </div>
                <div className="p-3">
                  <span className="text-stone-500 block mb-1">Kronologi Singkat:</span>
                  <p className="text-stone-800 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    {incidentDescription || '(Tidak ada uraian kronologi tambahan)'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-start gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  Dengan mengirim formulir ini, laporan Anda akan langsung diterima oleh Tim Reaksi Cepat UPTD PPA Dinas PMDP3A Kabupaten Nagekeo. Kami menjamin perlindungan saksi dan korban sesuai ketentuan UU TPKS No. 12 Tahun 2022.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Sukses & Kode Tiket */}
          {step === 5 && generatedResult && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">Pengaduan Berhasil Terkirim!</h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1">
                  Laporan Anda telah tercatat pada basis data pengaduan Dinas PMDP3A Kabupaten Nagekeo. Simpan Kode Tiket dan PIN di bawah ini untuk mengecek respon petugas.
                </p>
              </div>

              {/* Tiket Box */}
              <div className="bg-stone-50 border-2 border-dashed border-teal-700 rounded-2xl p-5 max-w-md mx-auto text-left relative shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-800" />
                    <span className="text-xs font-bold text-teal-900">BUKTI LAPOR UPTD PPA NAGEKEO</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date(generatedResult.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Kode Tiket Pengaduan:</span>
                    <span className="text-xl font-bold font-mono tracking-wider text-teal-950">
                      {generatedResult.ticketCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block">PIN Rahasia Pelacak:</span>
                    <span className="text-base font-bold font-mono tracking-widest text-stone-800">
                      {generatedResult.secretPin}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200">
                    <span className="font-semibold">Kecamatan:</span> {generatedResult.kecamatan} · <span className="font-semibold">Desa:</span> {generatedResult.desaKelurahan}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={copyTicketCode}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 cursor-pointer"
                  >
                    {copiedTicket ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Kode & PIN Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode & PIN</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-stone-400">Jaga kerahasiaan PIN</span>
                </div>
              </div>

              {/* Action recommendation */}
              <div className="max-w-md mx-auto text-left bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold">Langkah Selanjutnya:</div>
                <p className="text-[11px] leading-relaxed">
                  1. Tim Asesmen UPTD PPA Nagekeo akan memverifikasi kasus dalam 1–2 jam.<br />
                  2. Anda dapat membuka menu <strong>"Lacak Kasus"</strong> kapan saja untuk melihat catatan petugas atau berkirim pesan rahasia secara aman.<br />
                  3. Jika situasi menjadi sangat darurat saat ini, hubungi nomor hotline 24 Jam: <strong>0812-3987-1290</strong>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow transition-colors cursor-pointer"
                >
                  Selesai & Tutup Jendela
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Pengaduan Sekarang</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
