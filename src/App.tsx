import React, { useState, useEffect } from 'react';
import { 
  Shield, PhoneCall, PlusCircle, Search, Lock, LogOut, EyeOff, 
  MapPin, CheckCircle2, Copy, Check, Send, AlertTriangle, 
  Camera, FileText, ChevronRight, ChevronLeft, ArrowLeft,
  X, MessageCircle, Clock, HeartHandshake, User, RefreshCw
} from 'lucide-react';
import { NAGEKEO_KECAMATAN_DATA, EMERGENCY_CONTACTS, CATEGORY_LABELS, INITIAL_REPORTS } from './data/mockData';
import { ReportItem, CaseStatus, ReportCategory, NagekeoKecamatan, ConfidentialityLevel } from './types';
import { DisguiseView } from './components/DisguiseView';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  // Load reports from localStorage with fallback
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('sipelka_nagekeo_reports') || localStorage.getItem('sapa_nagekeo_reports');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REPORTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sipelka_nagekeo_reports', JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
  }, [reports]);

  // Main navigation tab: 'lapor' (Form) | 'lacak' (Check Status)
  const [activeTab, setActiveTab] = useState<'lapor' | 'lacak'>('lapor');
  const [isDisguised, setIsDisguised] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);

  // Form State
  const [formStep, setFormStep] = useState<number>(1);
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('rahasia');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [victimType, setVictimType] = useState<string>('saya_sendiri');
  
  const [category, setCategory] = useState<ReportCategory>('kdrt_fisik');
  const [kecamatan, setKecamatan] = useState<NagekeoKecamatan>('Aesesa');
  const [desaKelurahan, setDesaKelurahan] = useState<string>('Danga');
  const [incidentDetail, setIncidentDetail] = useState<string>('');
  const [incidentStory, setIncidentStory] = useState<string>('');
  
  const [urgency, setUrgency] = useState<'darurat' | 'mendesak' | 'standar'>('mendesak');
  const [needVisum, setNeedVisum] = useState<boolean>(true);
  const [needSafeHouse, setNeedSafeHouse] = useState<boolean>(false);
  const [needLegal, setNeedLegal] = useState<boolean>(true);
  const [needCounseling, setNeedCounseling] = useState<boolean>(true);
  
  const [evidenceName, setEvidenceName] = useState<string>('');
  const [submittedTicket, setSubmittedTicket] = useState<ReportItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Tracker State
  const [searchTicket, setSearchTicket] = useState<string>('');
  const [searchPin, setSearchPin] = useState<string>('');
  const [foundReport, setFoundReport] = useState<ReportItem | null>(null);
  const [trackerError, setTrackerError] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');

  // Quick exit handler for safety
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com/search?q=cuaca+mbay+nagekeo+ntt');
  };

  // Keyboard shortcut Esc for safety disguise
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDisguised((prev) => !prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Update desa when kecamatan changes
  const handleKecamatanChange = (kec: NagekeoKecamatan) => {
    setKecamatan(kec);
    const desaList = NAGEKEO_KECAMATAN_DATA[kec];
    if (desaList && desaList.length > 0) {
      setDesaKelurahan(desaList[0]);
    }
  };

  // Submit pengaduan
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
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
      reporterType: victimType === 'saya_sendiri' ? 'korban' : 'keluarga_kerabat',
      confidentiality,
      reporterName: confidentiality === 'anonim' ? 'Anonim (Dirahasiakan)' : (reporterName.trim() || 'Warga Nagekeo'),
      reporterContact: confidentiality === 'anonim' ? undefined : reporterContact.trim(),
      victimName: confidentiality === 'anonim' ? 'Korban (Inisial Terlindungi)' : (victimType === 'saya_sendiri' ? (reporterName || 'Penyintas') : 'Anggota Keluarga / Anak'),
      victimAgeGroup: 'dewasa_18_59',
      victimGender: 'perempuan',
      kecamatan,
      desaKelurahan,
      incidentLocationDetail: incidentDetail || `Desa ${desaKelurahan}, Kec. ${kecamatan}`,
      incidentDate: new Date().toISOString().split('T')[0],
      incidentDescription: incidentStory,
      perpetratorRelationship: 'suami_istri',
      perpetratorNameMasked: 'Pihak Terlapor',
      servicesNeeded: {
        medisVisum: needVisum,
        rumahAman: needSafeHouse,
        bantuanHukum: needLegal,
        konselingPsikologis: needCounseling,
        mediasiKeluarga: false,
        bantuanSosialDarurat: false
      },
      attachments: evidenceName ? [
        {
          id: `att_${Date.now()}`,
          name: evidenceName,
          type: 'foto',
          url: '',
          size: 'Tersimpan Aman'
        }
      ] : [],
      officerNotes: [
        {
          id: `note_${Date.now()}`,
          officerName: 'Sistem Penerimaan UPTD PPA',
          date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
          summary: `Pengaduan baru diterima via SI-PELKA Nagekeo (${urgency.toUpperCase()}). Menunggu telaah tim penjangkauan.`,
          actionPlan: 'Penjadwalan verifikasi awal dan koordinasi tim pendamping Dinas PMDP3A.',
          assignedUnit: 'UPTD PPA Kabupaten Nagekeo'
        }
      ],
      messages: []
    };

    setReports([newReport, ...reports]);
    setSubmittedTicket(newReport);
    setFormStep(3); // Success step
  };

  // Search case tracker
  const handleSearchCase = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackerError('');
    const tCode = searchTicket.trim().toUpperCase();
    const pin = searchPin.trim();

    const found = reports.find(
      (r) => r.ticketCode.toUpperCase() === tCode && r.secretPin === pin
    );

    if (found) {
      setFoundReport(found);
    } else {
      setTrackerError('Nomor Tiket atau PIN tidak cocok. Silakan periksa kembali bukti lapor Anda.');
      setFoundReport(null);
    }
  };

  // Send message in case tracker
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !foundReport) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'pelapor' as const,
      senderName: foundReport.confidentiality === 'anonim' ? 'Pelapor (Anonim)' : 'Pelapor',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA'
    };

    const updatedReports = reports.map((r) =>
      r.ticketCode === foundReport.ticketCode
        ? { ...r, messages: [...r.messages, newMsg], updatedAt: new Date().toISOString() }
        : r
    );

    setReports(updatedReports);
    setFoundReport({
      ...foundReport,
      messages: [...foundReport.messages, newMsg]
    });
    setChatInput('');
  };

  // Reset form
  const handleResetForm = () => {
    setFormStep(1);
    setSubmittedTicket(null);
    setIncidentStory('');
    setReporterName('');
    setReporterContact('');
    setEvidenceName('');
  };

  if (isDisguised) {
    return <DisguiseView onDeactivate={() => setIsDisguised(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-30 bg-teal-900 text-white shadow-md">
        {/* Safety & Emergency Bar */}
        <div className="bg-stone-900 px-3 py-1.5 flex items-center justify-between text-xs border-b border-stone-800">
          <span className="text-rose-300 font-medium flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="truncate">Layanan Siaga Perempuan & Anak Nagekeo</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsDisguised(true)}
              title="Sembunyikan tampilan"
              className="px-2 py-1 bg-stone-800 text-stone-200 hover:bg-stone-700 text-[11px] rounded flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>Samarkan</span>
            </button>
            <button
              onClick={handleQuickExit}
              title="Keluar seketika ke Google Cuaca"
              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[11px] rounded flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Main Brand Area */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center text-teal-200 shadow-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-tight">
                SI-PELKA Nagekeo
              </h1>
              <p className="text-[11px] text-teal-200 leading-tight">
                Pengaduan Perempuan & Anak · Dinas PMDP3A
              </p>
            </div>
          </div>

          {/* Quick Hotline Call Button */}
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer touch-manipulation min-h-[38px]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Hotline 24J</span>
          </button>
        </div>

        {/* Segmented Control (Only 2 Main Tabs: Buat Laporan vs Cek Status) */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 p-1 bg-teal-950/60 rounded-xl gap-1 border border-teal-800/60">
            <button
              onClick={() => setActiveTab('lapor')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] touch-manipulation ${
                activeTab === 'lapor'
                  ? 'bg-white text-teal-950 shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Pengaduan</span>
            </button>

            <button
              onClick={() => setActiveTab('lacak')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] touch-manipulation ${
                activeTab === 'lacak'
                  ? 'bg-white text-teal-950 shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Aduan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Optimized for Single-Handed Mobile Use */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {/* ================= VIEW 1: FORMULIR PENGADUAN ================= */}
        {activeTab === 'lapor' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Step 1: Informasi Kejadian & Wilayah Nagekeo */}
            {formStep === 1 && (
              <div className="p-4 sm:p-5 space-y-5">
                {/* Privacy Banner */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Shield className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
                  <div className="text-xs text-teal-900 leading-relaxed">
                    <span className="font-bold block">100% Rahasia & Aman</span>
                    Ceritakan masalah Anda. Identitas dan keselamatan Anda dilindungi penuh oleh UU TPKS dan Tim UPTD PPA Nagekeo.
                  </div>
                </div>

                {/* Siapa Anda */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Siapa yang Mengalami Kekerasan?
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setVictimType('saya_sendiri')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[48px] touch-manipulation ${
                        victimType === 'saya_sendiri'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      Saya Sendiri (Korban)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVictimType('orang_lain')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[48px] touch-manipulation ${
                        victimType === 'orang_lain'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      Anak / Kerabat / Tetangga
                    </button>
                  </div>
                </div>

                {/* Bentuk Kekerasan */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Bentuk Kekerasan yang Dialami:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key as ReportCategory)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all min-h-[50px] touch-manipulation flex flex-col justify-center ${
                          category === key
                            ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="text-xs leading-snug">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lokasi di Nagekeo */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <MapPin className="w-4 h-4 text-teal-800" />
                    <span>Lokasi Kejadian di Kabupaten Nagekeo:</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Kecamatan:
                    </label>
                    <select
                      value={kecamatan}
                      onChange={(e) => handleKecamatanChange(e.target.value as NagekeoKecamatan)}
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                    >
                      {Object.keys(NAGEKEO_KECAMATAN_DATA).map((kec) => (
                        <option key={kec} value={kec}>
                          Kecamatan {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Desa / Kelurahan:
                    </label>
                    <select
                      value={desaKelurahan}
                      onChange={(e) => setDesaKelurahan(e.target.value)}
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                    >
                      {NAGEKEO_KECAMATAN_DATA[kecamatan]?.map((desa) => (
                        <option key={desa} value={desa}>
                          Desa / Kel. {desa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cerita Singkat */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Ceritakan Singkat Apa yang Terjadi:
                  </label>
                  <textarea
                    rows={4}
                    value={incidentStory}
                    onChange={(e) => setIncidentStory(e.target.value)}
                    placeholder="Contoh: Terjadi pemukulan, ancaman, atau pelecehan di rumah tinggal. Korban merasa ketakutan..."
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-3 focus:border-teal-700 focus:outline-none leading-relaxed bg-white"
                  />
                </div>

                {/* Tombol Lanjut ke Langkah 2 */}
                <button
                  type="button"
                  onClick={() => {
                    if (!incidentStory.trim()) {
                      alert('Mohon tuliskan cerita singkat kejadian terlebih dahulu.');
                      return;
                    }
                    setFormStep(2);
                  }}
                  className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                >
                  <span>Lanjutkan: Privasi & Bantuan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Privasi, Bantuan & Bukti */}
            {formStep === 2 && (
              <div className="p-4 sm:p-5 space-y-5">
                {/* Pilihan Kerahasiaan */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Pilihan Kerahasiaan Nama Anda:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setConfidentiality('rahasia')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[52px] touch-manipulation flex flex-col justify-center ${
                        confidentiality === 'rahasia'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-teal-800" /> Rahasia (Resmi)
                      </span>
                      <span className="text-[10px] text-stone-500 font-normal">Hanya untuk Tim P3A</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfidentiality('anonim')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[52px] touch-manipulation flex flex-col justify-center ${
                        confidentiality === 'anonim'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-teal-800" /> Anonim Total
                      </span>
                      <span className="text-[10px] text-stone-500 font-normal">Tanpa nama & kontak</span>
                    </button>
                  </div>
                </div>

                {/* Kontak jika bukan anonim */}
                {confidentiality !== 'anonim' && (
                  <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Nama / Inisial Anda:
                      </label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Contoh: Maria / Ibu M."
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Nomor HP / WhatsApp yang Aman Dihubungi:
                      </label>
                      <input
                        type="tel"
                        value={reporterContact}
                        onChange={(e) => setReporterContact(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {/* Kebutuhan Layanan Terpenting */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Bantuan yang Dibutuhkan Segera:
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer min-h-[46px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={needVisum}
                        onChange={(e) => setNeedVisum(e.target.checked)}
                        className="w-4 h-4 text-teal-800 rounded focus:ring-teal-700"
                      />
                      <span className="font-medium text-stone-900">Pemeriksaan Medis & Visum RSUD Aeramo</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer min-h-[46px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={needSafeHouse}
                        onChange={(e) => setNeedSafeHouse(e.target.checked)}
                        className="w-4 h-4 text-teal-800 rounded focus:ring-teal-700"
                      />
                      <span className="font-medium text-stone-900">Tempat Tinggal Aman (Rumah Aman UPTD PPA)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer min-h-[46px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={needLegal}
                        onChange={(e) => setNeedLegal(e.target.checked)}
                        className="w-4 h-4 text-teal-800 rounded focus:ring-teal-700"
                      />
                      <span className="font-medium text-stone-900">Perlindungan Polisi (Unit PPA Polres Nagekeo)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer min-h-[46px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={needCounseling}
                        onChange={(e) => setNeedCounseling(e.target.checked)}
                        className="w-4 h-4 text-teal-800 rounded focus:ring-teal-700"
                      />
                      <span className="font-medium text-stone-900">Konseling & Pendampingan Psikologis</span>
                    </label>
                  </div>
                </div>

                {/* Upload Foto Bukti (Opsional) */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Foto Bukti / Luka (Opsional):
                  </label>
                  <div className="border border-dashed border-stone-300 rounded-xl p-3 flex items-center justify-between bg-stone-50">
                    <div className="flex items-center gap-2 text-xs text-stone-600 truncate">
                      <Camera className="w-5 h-5 text-stone-400 shrink-0" />
                      <span className="truncate">{evidenceName || 'Pilih foto jika ada bukti fisik/chat'}</span>
                    </div>
                    <label className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-medium cursor-pointer shrink-0 min-h-[38px] flex items-center">
                      <span>Pilih Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEvidenceName(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Tombol Aksi Bawah */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    className="w-2/3 py-3 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kirim Pengaduan Sekarang</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Sukses & Kode Tiket */}
            {formStep === 3 && submittedTicket && (
              <div className="p-5 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Pengaduan Berhasil Terkirim!
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Laporan telah diterima Tim Reaksi Cepat UPTD PPA Dinas PMDP3A Kabupaten Nagekeo.
                  </p>
                </div>

                {/* Tiket Box */}
                <div className="bg-stone-50 border-2 border-dashed border-teal-800 rounded-2xl p-4 text-left space-y-2">
                  <div className="text-[11px] text-stone-500">SIMPAN BUKTI LAPOR INI:</div>
                  
                  <div>
                    <span className="text-[11px] text-stone-500 block">Kode Tiket Pengaduan:</span>
                    <span className="text-xl font-bold font-mono tracking-wider text-teal-950">
                      {submittedTicket.ticketCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block">PIN Rahasia Pelacak:</span>
                    <span className="text-base font-bold font-mono tracking-widest text-stone-800">
                      {submittedTicket.secretPin}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-xs">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Tiket: ${submittedTicket.ticketCode} | PIN: ${submittedTicket.secretPin}`);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 3000);
                      }}
                      className="w-full py-2 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg font-semibold text-teal-900 flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Kode & PIN Berhasil Disalin!' : 'Salin Nomor Tiket & PIN'}</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Direct Option */}
                <a
                  href={`https://wa.me/6281239871290?text=Halo%20UPTD%20PPA%20Dinas%20PMDP3A%20Nagekeo,%20saya%20telah%20mengirim%20pengaduan%20dengan%20Kode%20Tiket:%20${submittedTicket.ticketCode}%20dan%20membutuhkan%20bantuan%20segera.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[46px] touch-manipulation"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Notifikasi Cepat ke WhatsApp UPTD PPA</span>
                </a>

                <div className="pt-2">
                  <button
                    onClick={handleResetForm}
                    className="text-xs text-stone-500 hover:text-stone-800 underline py-2 cursor-pointer"
                  >
                    Buat Pengaduan Lainnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: CEK STATUS ADUAN ================= */}
        {activeTab === 'lacak' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Lacak Pengaduan Anda</h2>
              <p className="text-xs text-stone-500">
                Masukkan Kode Tiket dan PIN rahasia untuk memeriksa perkembangan penanganan kasus.
              </p>
            </div>

            <form onSubmit={handleSearchCase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Tiket:
                </label>
                <input
                  type="text"
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  placeholder="Contoh: PPA-NGK-2026-1042"
                  className="w-full text-base sm:text-xs font-mono font-medium border border-stone-300 rounded-xl p-3 bg-stone-50 uppercase focus:bg-white focus:border-teal-700 focus:outline-none min-h-[44px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  PIN 4 Digit:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={searchPin}
                  onChange={(e) => setSearchPin(e.target.value)}
                  placeholder="PIN Rahasia"
                  maxLength={4}
                  className="w-full text-base sm:text-xs font-mono font-medium border border-stone-300 rounded-xl p-3 bg-stone-50 tracking-widest text-center focus:bg-white focus:border-teal-700 focus:outline-none min-h-[44px]"
                  required
                />
              </div>

              {trackerError && (
                <p className="text-xs text-rose-600 font-medium">{trackerError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] touch-manipulation"
              >
                <Search className="w-4 h-4" />
                <span>Cari Status Pengaduan</span>
              </button>
            </form>

            {/* Quick Demo Hint */}
            <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              Contoh Tiket Aktif: <button type="button" onClick={() => { setSearchTicket('PPA-NGK-2026-1042'); setSearchPin('4921'); }} className="text-teal-800 font-bold underline">PPA-NGK-2026-1042 (PIN: 4921)</button>
            </div>

            {/* Result Display */}
            {foundReport && (
              <div className="pt-3 border-t border-stone-200 space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-teal-950">{foundReport.ticketCode}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-800 text-white">
                      Status: {foundReport.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700">
                    <strong>Wilayah:</strong> Desa {foundReport.desaKelurahan}, Kec. {foundReport.kecamatan}
                  </div>
                  <div className="text-xs text-stone-700">
                    <strong>Bentuk Kekerasan:</strong> {CATEGORY_LABELS[foundReport.category]?.label || foundReport.category}
                  </div>
                </div>

                {/* Catatan Petugas */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-800" />
                    <span>Catatan Tim UPTD PPA Dinas PMDP3A:</span>
                  </div>
                  {foundReport.officerNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span className="font-bold text-teal-900">{note.officerName}</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-stone-800">{note.summary}</p>
                      <p className="text-stone-600 text-[11px] bg-white p-2 rounded border border-stone-100">
                        <strong>Tindakan:</strong> {note.actionPlan}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pesan Rahasia 2 Arah */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-teal-800" />
                    <span>Kirim Pesan Tambahan ke Petugas:</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    {foundReport.messages.length > 0 ? (
                      foundReport.messages.map((m) => (
                        <div key={m.id} className={`text-xs p-2 rounded-lg max-w-[85%] ${
                          m.sender === 'pelapor' ? 'bg-teal-800 text-white ml-auto' : 'bg-white border border-stone-200 mr-auto'
                        }`}>
                          <div className="text-[9px] opacity-75">{m.senderName} ({m.timestamp})</div>
                          <div>{m.text}</div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-stone-400 italic block py-1 text-center">
                        Belum ada pesan obrolan.
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tulis pesan ke petugas..."
                      className="flex-1 text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-white focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Simplified Bar for Phone */}
      <footer className="bg-stone-900 text-stone-300 text-xs px-4 py-4 mt-auto border-t border-stone-800 space-y-3">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-bold text-white text-xs">
              SI-PELKA Nagekeo
            </div>
            <p className="text-[11px] text-stone-400">
              Dinas PMDP3A Kabupaten Nagekeo, Flores, NTT
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Kontak Darurat</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-teal-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Petugas Dinas</span>
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto text-center text-[10px] text-stone-500 pt-2 border-t border-stone-800">
          Dilindungi UU Tindak Pidana Kekerasan Seksual (UU No. 12 Th 2022) & UU Perlindungan Anak
        </div>
      </footer>

      {/* Emergency Hotline Modal (Bottom Sheet on Mobile) */}
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-rose-200">
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <PhoneCall className="w-5 h-5" />
                <span>Panggilan Darurat Nagekeo</span>
              </div>
              <button
                onClick={() => setIsEmergencyOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {EMERGENCY_CONTACTS.map((c) => (
                <div key={c.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="font-bold text-stone-900">{c.name}</div>
                  <div className="text-[11px] text-stone-500">{c.role}</div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                      className="flex-1 py-2 bg-teal-800 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1.5 min-h-[42px] touch-manipulation"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                    {c.whatsapp && (
                      <a
                        href={`https://wa.me/${c.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 min-h-[42px] touch-manipulation"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WA</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsEmergencyOpen(false)}
              className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Admin Portal Modal (For bidangpppanagekeo@gmail.com) */}
      {isAdminOpen && (
        <AdminPortal
          reports={reports}
          onUpdateStatus={(ticketCode, newStatus) => {
            setReports((prev) =>
              prev.map((r) =>
                r.ticketCode === ticketCode ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
              )
            );
          }}
          onAddOfficerNote={(ticketCode, summary, actionPlan, assignedUnit) => {
            setReports((prev) =>
              prev.map((r) =>
                r.ticketCode === ticketCode
                  ? {
                      ...r,
                      officerNotes: [
                        ...r.officerNotes,
                        {
                          id: `note_${Date.now()}`,
                          officerName: 'Maria Yasinta, S.Sos (Konselor Dinas PMDP3A)',
                          date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                          summary,
                          actionPlan,
                          assignedUnit
                        }
                      ],
                      updatedAt: new Date().toISOString()
                    }
                  : r
              )
            );
          }}
          onOfficerSendMessage={(ticketCode, text) => {
            setReports((prev) =>
              prev.map((r) =>
                r.ticketCode === ticketCode
                  ? {
                      ...r,
                      messages: [
                        ...r.messages,
                        {
                          id: `msg_${Date.now()}`,
                          sender: 'petugas',
                          senderName: 'Konselor UPTD PPA Dinas PMDP3A',
                          text,
                          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA'
                        }
                      ],
                      updatedAt: new Date().toISOString()
                    }
                  : r
              )
            );
          }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
