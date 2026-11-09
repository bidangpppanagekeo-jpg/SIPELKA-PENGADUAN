import React, { useState, useEffect } from 'react';
import { 
  Shield, PhoneCall, PlusCircle, Search, Lock, LogOut, EyeOff, 
  MapPin, CheckCircle2, Copy, Check, Send, AlertTriangle, 
  Camera, FileText, ChevronRight, ChevronLeft, ArrowLeft,
  X, MessageCircle, Clock, HeartHandshake, User, Users, Calendar,
  AlertCircle
} from 'lucide-react';
import { NAGEKEO_KECAMATAN_DATA, EMERGENCY_CONTACTS, CATEGORY_LABELS, INITIAL_REPORTS } from './data/mockData';
import { ReportItem, CaseStatus, ReportCategory, NagekeoKecamatan, ConfidentialityLevel } from './types';
import { DisguiseView } from './components/DisguiseView';
import { AdminPortal } from './components/AdminPortal';
import { getAccessToken, initAuth } from './services/googleAuth';
import { getSavedSpreadsheetInfo, appendComplaintToSpreadsheet } from './services/googleSheets';
import { sendReportToAppsScript } from './services/appsScript';

const OFFICIAL_DINAS_EMAIL = 'bidangpppanagekeo@gmail.com';

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

  // Dinas Officer Gate (Only active when bidangpppanagekeo@gmail.com is logged in)
  const [currentOfficerEmail, setCurrentOfficerEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sipelka_officer_email') || null;
    } catch {
      return null;
    }
  });

  const isDinasOfficer = currentOfficerEmail?.trim().toLowerCase() === OFFICIAL_DINAS_EMAIL;

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        const email = user.email?.trim().toLowerCase() || null;
        if (email === OFFICIAL_DINAS_EMAIL) {
          setCurrentOfficerEmail(email);
          try { localStorage.setItem('sipelka_officer_email', email); } catch {}
        } else {
          setCurrentOfficerEmail(null);
          try { localStorage.removeItem('sipelka_officer_email'); } catch {}
        }
      },
      () => {
        // Keep current state
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  // Check URL parameter ?admin, ?petugas, or ?dinas for initial dinas officer login
  const [logoClickCount, setLogoClickCount] = useState<number>(0);

  useEffect(() => {
    if (window.location.search.includes('admin') || window.location.search.includes('petugas') || window.location.search.includes('dinas')) {
      setIsAdminOpen(true);
    }
  }, []);

  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    if (nextCount >= 3) {
      setIsAdminOpen(true);
      setLogoClickCount(0);
    } else {
      setLogoClickCount(nextCount);
      setTimeout(() => setLogoClickCount(0), 2000);
    }
  };

  // Form Step State (1: Data Pelapor & Privasi -> 2: Data Korban & Waktu -> 3: Data Pelaku & Kejadian -> 4: Sukses)
  const [formStep, setFormStep] = useState<number>(1);

  // 1. DATA PELAPOR
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('rahasia');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterRelationship, setReporterRelationship] = useState<string>('Korban Sendiri');
  const [reporterContact, setReporterContact] = useState<string>('');

  // 2. DATA KORBAN
  const [victimName, setVictimName] = useState<string>('');
  const [victimGender, setVictimGender] = useState<'perempuan' | 'laki-laki'>('perempuan');
  const [victimAge, setVictimAge] = useState<string>('');
  const [kecamatan, setKecamatan] = useState<NagekeoKecamatan>('Aesesa');
  const [desaKelurahan, setDesaKelurahan] = useState<string>('Danga');
  const [victimAddressDetail, setVictimAddressDetail] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState<string>('Siang / Sore Hari');
  const [incidentPlace, setIncidentPlace] = useState<string>('Rumah Tinggal');

  // 3. DATA PELAKU
  const [perpetratorKnown, setPerpetratorKnown] = useState<boolean>(true);
  const [perpetratorName, setPerpetratorName] = useState<string>('');
  const [perpetratorAge, setPerpetratorAge] = useState<string>('');
  const [perpetratorAddress, setPerpetratorAddress] = useState<string>('');
  const [perpetratorRelationship, setPerpetratorRelationship] = useState<string>('Suami / Pasangan');

  // BENTUK KEKERASAN & BANTUAN
  const [category, setCategory] = useState<ReportCategory>('kdrt_fisik');
  const [incidentStory, setIncidentStory] = useState<string>('');
  const [urgency, setUrgency] = useState<'darurat' | 'mendesak' | 'standar'>('mendesak');
  const [needVisum, setNeedVisum] = useState<boolean>(true);
  const [needSafeHouse, setNeedSafeHouse] = useState<boolean>(false);
  const [needLegal, setNeedLegal] = useState<boolean>(true);
  const [needCounseling, setNeedCounseling] = useState<boolean>(true);
  const [evidenceName, setEvidenceName] = useState<string>('');

  // Result & Tracker State
  const [submittedTicket, setSubmittedTicket] = useState<ReportItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [searchTicket, setSearchTicket] = useState<string>('');
  const [searchPin, setSearchPin] = useState<string>('');
  const [foundReport, setFoundReport] = useState<ReportItem | null>(null);
  const [trackerError, setTrackerError] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');

  // Quick exit handler
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com/search?q=cuaca+mbay+nagekeo+ntt');
  };

  // Keyboard shortcut Esc
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

  // Synchronize reporterName and victimName if reporter is victim herself
  const handleReporterRelationshipChange = (rel: string) => {
    setReporterRelationship(rel);
    if (rel === 'Korban Sendiri' && reporterName && !victimName) {
      setVictimName(reporterName);
    }
  };

  // Form Step Validation
  const handleNextStep1 = () => {
    if (!reporterContact.trim()) {
      alert('Mohon masukkan Nomor Kontak / WhatsApp aktif agar petugas UPTD PPA mudah menghubungi Anda untuk konfirmasi.');
      return;
    }
    setFormStep(2);
  };

  const handleNextStep2 = () => {
    if (!victimName.trim()) {
      alert('Mohon masukkan Nama Korban (atau nama inisial jika privasi).');
      return;
    }
    setFormStep(3);
  };

  // Submit pengaduan lengkap
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!incidentStory.trim()) {
      alert('Mohon ceritakan uraian singkat kejadian yang dialami.');
      return;
    }

    const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const ticketCode = `PPA-NGK-${new Date().getFullYear()}-${randomTicketNum}`;

    const fullVictimAddress = victimAddressDetail.trim()
      ? `${victimAddressDetail.trim()}, Desa ${desaKelurahan}, Kec. ${kecamatan}`
      : `Desa ${desaKelurahan}, Kec. ${kecamatan}, Kab. Nagekeo`;

    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      ticketCode,
      secretPin: randomPin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      urgency,
      category,
      status: 'masuk',
      confidentiality,

      // 1. DATA KORBAN
      victimName: confidentiality === 'anonim' ? `Korban (${victimName ? victimName.charAt(0) + '...' : 'Inisial'})` : victimName.trim(),
      victimGender,
      victimAge: victimAge.trim() || 'Dewasa',
      victimAddress: fullVictimAddress,
      kecamatan,
      desaKelurahan,
      incidentDate,
      incidentTime,
      incidentPlace,
      incidentDescription: incidentStory.trim(),

      // 2. DATA PELAKU
      perpetratorKnown,
      perpetratorName: perpetratorKnown ? (perpetratorName.trim() || 'Pihak Terlapor') : 'Tidak Diketahui',
      perpetratorAge: perpetratorKnown ? (perpetratorAge.trim() || '-') : '-',
      perpetratorAddress: perpetratorKnown ? (perpetratorAddress.trim() || '-') : '-',
      perpetratorRelationship: perpetratorKnown ? perpetratorRelationship : 'Orang Tidak Dikenal',

      // 3. DATA PELAPOR
      reporterName: confidentiality === 'anonim' ? 'Pelapor (Dirahasiakan)' : (reporterName.trim() || 'Warga Nagekeo'),
      reporterRelationship,
      reporterContact: reporterContact.trim(),

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
          summary: `Pengaduan lengkap diterima via SI-PELKA Nagekeo (${urgency.toUpperCase()}). Menunggu verifikasi tim reaksi cepat.`,
          actionPlan: `Konfirmasi ke pelapor (${reporterContact}) dan penyiapan rujukan kasus.`,
          assignedUnit: 'UPTD PPA Kabupaten Nagekeo'
        }
      ],
      messages: []
    };

    setReports([newReport, ...reports]);
    setSubmittedTicket(newReport);
    setFormStep(4); // Success step

    // Auto-sync ke Google Apps Script Web App & Google Sheets
    (async () => {
      try {
        await sendReportToAppsScript(newReport);
        const token = await getAccessToken();
        const activeSheet = getSavedSpreadsheetInfo();
        if (token && activeSheet?.id) {
          await appendComplaintToSpreadsheet(token, activeSheet.id, newReport);
        }
      } catch (err) {
        console.warn('Auto-sync Apps Script / Google Sheets skipped:', err);
      }
    })();
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
    setReporterName('');
    setReporterContact('');
    setVictimName('');
    setVictimAge('');
    setVictimAddressDetail('');
    setPerpetratorName('');
    setPerpetratorAge('');
    setPerpetratorAddress('');
    setIncidentStory('');
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
          <div onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer select-none">
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

        {/* Segmented Control (Buat Laporan vs Cek Status) */}
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
              <span>Formulir Pengaduan</span>
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

      {/* Main Container - Optimized for Mobile Use */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {/* ================= VIEW 1: FORMULIR PENGADUAN ================= */}
        {activeTab === 'lapor' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Step Progress Bar (Only during steps 1-3) */}
            {formStep < 4 && (
              <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${formStep === 1 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>1</span>
                  <span className={formStep === 1 ? 'font-bold text-teal-900' : ''}>Data Pelapor</span>
                </div>
                <span className="text-stone-300">/</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${formStep === 2 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>2</span>
                  <span className={formStep === 2 ? 'font-bold text-teal-900' : ''}>Data Korban</span>
                </div>
                <span className="text-stone-300">/</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${formStep === 3 ? 'bg-teal-800 text-white' : 'bg-stone-200 text-stone-700'}`}>3</span>
                  <span className={formStep === 3 ? 'font-bold text-teal-900' : ''}>Data Pelaku & Kasus</span>
                </div>
              </div>
            )}

            {/* ---------- LANGKAH 1: DATA PELAPOR ---------- */}
            {formStep === 1 && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <User className="w-4 h-4 text-teal-800" />
                    <span>BAGIAN 1: DATA PELAPOR</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Informasi pihak yang menyampaikan pengaduan agar petugas dapat melakukan konfirmasi.
                  </p>
                </div>

                {/* Hubungan Pelapor dengan Korban */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Hubungan Anda dengan Korban:
                  </label>
                  <select
                    value={reporterRelationship}
                    onChange={(e) => handleReporterRelationshipChange(e.target.value)}
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                  >
                    <option value="Korban Sendiri">Saya Sendiri (Korban)</option>
                    <option value="Orang Tua / Wali">Orang Tua / Wali Korban</option>
                    <option value="Saudara / Kerabat">Saudara Kandung / Kerabat Keluarga</option>
                    <option value="Tetangga / Warga">Tetangga / Warga Sekitar</option>
                    <option value="Guru / Pihak Sekolah">Guru / Pihak Sekolah</option>
                    <option value="Kader Posyandu / Desa">Kader Desa / Posyandu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Nama Pelapor */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Nama Pelapor:
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Masukkan nama lengkap / panggilan Anda"
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                  />
                </div>

                {/* Nomor Kontak yang Mudah Dihubungi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-800">
                      Nomor Kontak / WhatsApp Aktif: <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-teal-800 font-medium">Wajib diisi</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890 (Mudah dihubungi petugas)"
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                    required
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Petugas UPTD PPA Dinas PMDP3A akan menghubungi nomor ini untuk konfirmasi awal secara rahasia.
                  </p>
                </div>

                {/* Kerahasiaan Identitas */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-semibold text-stone-800">
                    Tingkat Kerahasiaan Identitas:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setConfidentiality('rahasia')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all min-h-[44px] ${
                        confidentiality === 'rahasia'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="block font-bold">🔒 Rahasia (Resmi)</span>
                      <span className="text-[10px] text-stone-500 font-normal">Hanya tim UPTD PPA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfidentiality('anonim')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all min-h-[44px] ${
                        confidentiality === 'anonim'
                          ? 'border-teal-700 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-700'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="block font-bold">🛡️ Samarkan Nama</span>
                      <span className="text-[10px] text-stone-500 font-normal">Nama disamarkan</span>
                    </button>
                  </div>
                </div>

                {/* Tombol Lanjut ke Langkah 2 */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <span>Lanjut ke Data Korban (Langkah 2)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------- LANGKAH 2: DATA KORBAN & WAKTU KEJADIAN ---------- */}
            {formStep === 2 && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <HeartHandshake className="w-4 h-4 text-teal-800" />
                    <span>BAGIAN 2: DATA KORBAN & WAKTU KEJADIAN</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Informasi mengenai korban yang mengalami kekerasan dan tempat terjadinya peristiwa.
                  </p>
                </div>

                {/* Nama Korban */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-800">
                      Nama Korban: <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Bisa inisial jika privasi</span>
                  </div>
                  <input
                    type="text"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    placeholder="Masukkan nama korban (contoh: Maria T. / Inisial M.)"
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                    required
                  />
                </div>

                {/* Jenis Kelamin & Usia */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Jenis Kelamin Korban:
                    </label>
                    <select
                      value={victimGender}
                      onChange={(e) => setVictimGender(e.target.value as 'perempuan' | 'laki-laki')}
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                    >
                      <option value="perempuan">Perempuan</option>
                      <option value="laki-laki">Laki-Laki (Anak)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Usia Korban (Tahun):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={victimAge}
                      onChange={(e) => setVictimAge(e.target.value)}
                      placeholder="Contoh: 15 / 32"
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Wilayah / Alamat Korban di Kabupaten Nagekeo */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <MapPin className="w-4 h-4 text-teal-800" />
                    <span>Alamat Korban di Kabupaten Nagekeo:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                            Kec. {kec}
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
                            Desa {desa}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Detail Alamat / Dusun / RT / RW:
                    </label>
                    <input
                      type="text"
                      value={victimAddressDetail}
                      onChange={(e) => setVictimAddressDetail(e.target.value)}
                      placeholder="Contoh: Dusun II, RT 03 dekat Balai Desa / Pasar"
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Waktu dan Tempat Kejadian */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Calendar className="w-4 h-4 text-teal-800" />
                    <span>Waktu dan Tempat Kejadian:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Tanggal Kejadian:
                      </label>
                      <input
                        type="date"
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white font-mono focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Perkiraan Waktu / Jam:
                      </label>
                      <input
                        type="text"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                        placeholder="Contoh: Pagi / 21:00 WITA"
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Tempat Kejadian:
                    </label>
                    <input
                      type="text"
                      value={incidentPlace}
                      onChange={(e) => setIncidentPlace(e.target.value)}
                      placeholder="Contoh: Rumah tinggal / Kebun / Jalan umum / Sekolah"
                      className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Tombol Navigasi */}
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
                    onClick={handleNextStep2}
                    className="w-2/3 py-3 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <span>Lanjut ke Data Pelaku & Kasus</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------- LANGKAH 3: DATA PELAKU & KASUS ---------- */}
            {formStep === 3 && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>BAGIAN 3: DATA PELAKU (JIKA DIKETAHUI) & URAIAN KASUS</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Identitas terduga pelaku (jika Anda mengenalnya) serta rincian bantuan yang dibutuhkan.
                  </p>
                </div>

                {/* Pelaku Diketahui atau Tidak */}
                <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-xs font-semibold text-stone-800">Apakah Pelaku Dikenali / Diketahui?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPerpetratorKnown(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        perpetratorKnown ? 'bg-teal-800 text-white' : 'bg-white border border-stone-300 text-stone-600'
                      }`}
                    >
                      Ya, Dikenal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerpetratorKnown(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        !perpetratorKnown ? 'bg-teal-800 text-white' : 'bg-white border border-stone-300 text-stone-600'
                      }`}
                    >
                      Tidak Kenal
                    </button>
                  </div>
                </div>

                {/* Form Data Pelaku jika Dikenal */}
                {perpetratorKnown && (
                  <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Nama Terduga Pelaku:
                      </label>
                      <input
                        type="text"
                        value={perpetratorName}
                        onChange={(e) => setPerpetratorName(e.target.value)}
                        placeholder="Masukkan nama / panggilan pelaku"
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Perkiraan Usia Pelaku:
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={perpetratorAge}
                          onChange={(e) => setPerpetratorAge(e.target.value)}
                          placeholder="Contoh: 35 tahun"
                          className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Hubungan dengan Korban:
                        </label>
                        <select
                          value={perpetratorRelationship}
                          onChange={(e) => setPerpetratorRelationship(e.target.value)}
                          className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                        >
                          <option value="Suami / Pasangan">Suami / Pasangan</option>
                          <option value="Orang Tua / Wali">Orang Tua / Wali</option>
                          <option value="Saudara / Kerabat">Saudara / Kerabat</option>
                          <option value="Tetangga / Kenalan">Tetangga / Kenalan</option>
                          <option value="Majikan / Atasan">Majikan / Atasan</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Alamat Pelaku (jika diketahui):
                      </label>
                      <input
                        type="text"
                        value={perpetratorAddress}
                        onChange={(e) => setPerpetratorAddress(e.target.value)}
                        placeholder="Contoh: Desa / Kelurahan tempat tinggal pelaku"
                        className="w-full text-base sm:text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700 min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {/* Bentuk Kekerasan */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Bentuk Kekerasan yang Terjadi:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-2.5 bg-white font-medium focus:border-teal-700 focus:outline-none min-h-[44px]"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Uraian Singkat Kejadian */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Ceritakan Kronologi Singkat Kejadian: <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-teal-800 font-medium">Wajib diisi</span>
                  </div>
                  <textarea
                    rows={3}
                    value={incidentStory}
                    onChange={(e) => setIncidentStory(e.target.value)}
                    placeholder="Jelaskan apa yang terjadi, apa ancaman yang dihadapi, luka fisik yang dialami, dsb."
                    className="w-full text-base sm:text-xs border border-stone-300 rounded-xl p-3 focus:border-teal-700 focus:outline-none leading-relaxed bg-white"
                    required
                  />
                </div>

                {/* Layanan yang Dibutuhkan Segera */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Bantuan Layanan yang Dibutuhkan Korban:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needVisum}
                        onChange={(e) => setNeedVisum(e.target.checked)}
                        className="rounded text-teal-800 focus:ring-teal-700"
                      />
                      <span className="leading-tight">Visum RSUD Aeramo</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needSafeHouse}
                        onChange={(e) => setNeedSafeHouse(e.target.checked)}
                        className="rounded text-teal-800 focus:ring-teal-700"
                      />
                      <span className="leading-tight">Rumah Aman (Safe House)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needLegal}
                        onChange={(e) => setNeedLegal(e.target.checked)}
                        className="rounded text-teal-800 focus:ring-teal-700"
                      />
                      <span className="leading-tight">Pendampingan Polisi</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needCounseling}
                        onChange={(e) => setNeedCounseling(e.target.checked)}
                        className="rounded text-teal-800 focus:ring-teal-700"
                      />
                      <span className="leading-tight">Konseling Psikologis</span>
                    </label>
                  </div>
                </div>

                {/* Upload Foto / Bukti */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Lampiran Foto Bukti / Luka (Opsional):
                  </label>
                  <div className="border border-dashed border-stone-300 rounded-xl p-3 flex items-center justify-between bg-stone-50">
                    <div className="flex items-center gap-2 text-xs text-stone-600 truncate">
                      <Camera className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="truncate">{evidenceName || 'Ambil foto dari kamera / galeri HP'}</span>
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

                {/* Tombol Navigasi Akhir */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    className="w-2/3 py-3 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kirim Pengaduan Lengkap</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------- LANGKAH 4: BUKTI LAPOR SUKSES ---------- */}
            {formStep === 4 && submittedTicket && (
              <div className="p-5 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Pengaduan Anda Berhasil Terkirim!
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Data lengkap korban, pelaku, dan pelapor telah tercatat di UPTD PPA Dinas PMDP3A Kabupaten Nagekeo.
                  </p>
                </div>

                {/* Tiket Box */}
                <div className="bg-stone-50 border-2 border-dashed border-teal-800 rounded-2xl p-4 text-left space-y-2.5">
                  <div className="text-[11px] font-bold text-teal-900 border-b border-stone-200 pb-1.5 flex items-center justify-between">
                    <span>BUKTI LAPOR PENGADUAN</span>
                    <span className="font-mono text-stone-500 font-normal">{new Date(submittedTicket.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  <div>
                    <span className="text-[11px] text-stone-500 block">Nomor Tiket Pengaduan:</span>
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

                  <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-stone-200">
                    <div><strong>Korban:</strong> {submittedTicket.victimName} ({submittedTicket.victimGender === 'perempuan' ? 'Perempuan' : 'Laki-laki'}, {submittedTicket.victimAge} th)</div>
                    <div><strong>Pelapor:</strong> {submittedTicket.reporterName} ({submittedTicket.reporterRelationship}) · HP: {submittedTicket.reporterContact}</div>
                    <div><strong>Lokasi:</strong> Desa {submittedTicket.desaKelurahan}, Kec. {submittedTicket.kecamatan}</div>
                  </div>

                  {getSavedSpreadsheetInfo() && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">Terhubung ke Google Sheets: {getSavedSpreadsheetInfo()?.title}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 text-xs">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Nomor Tiket: ${submittedTicket.ticketCode} | PIN: ${submittedTicket.secretPin} (SI-PELKA Nagekeo)`);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 3000);
                      }}
                      className="w-full py-2.5 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg font-semibold text-teal-900 flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Nomor Tiket & PIN Berhasil Disalin!' : 'Salin Nomor Tiket & PIN'}</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Direct Option */}
                <a
                  href={`https://wa.me/6282266355313?text=Halo%20UPTD%20PPA%20Dinas%20PMDP3A%20Kabupaten%20Nagekeo,%20saya%20telah%20mengirim%20pengaduan%20dengan%20Kode%20Tiket:%20${submittedTicket.ticketCode}%20atas%20nama%20korban%20${encodeURIComponent(submittedTicket.victimName)}.%20Mohon%20bantuan%20segera.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[46px] touch-manipulation"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Konfirmasi Cepat ke WhatsApp UPTD PPA</span>
                </a>

                <div className="pt-1">
                  <button
                    onClick={handleResetForm}
                    className="text-xs text-stone-500 hover:text-stone-800 underline py-2 cursor-pointer"
                  >
                    Buat Pengaduan Kasus Baru Lainnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: CEK STATUS ADUAN ================= */}
        {activeTab === 'lacak' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Lacak Status Pengaduan Anda</h2>
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
              Contoh Kasus Aktif: <button type="button" onClick={() => { setSearchTicket('PPA-NGK-2026-1042'); setSearchPin('4921'); }} className="text-teal-800 font-bold underline">PPA-NGK-2026-1042 (PIN: 4921)</button>
            </div>

            {/* Result Display */}
            {foundReport && (
              <div className="pt-3 border-t border-stone-200 space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-200/60 pb-1.5">
                    <span className="font-mono font-bold text-xs text-teal-950">{foundReport.ticketCode}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-800 text-white">
                      Status: {foundReport.status}
                    </span>
                  </div>

                  <div className="text-xs text-stone-800 space-y-1">
                    <div><strong>Data Korban:</strong> {foundReport.victimName} ({foundReport.victimGender === 'perempuan' ? 'P' : 'L'}, {foundReport.victimAge} th)</div>
                    <div><strong>Alamat Korban:</strong> {foundReport.victimAddress}</div>
                    <div><strong>Waktu Kejadian:</strong> {foundReport.incidentDate} ({foundReport.incidentTime})</div>
                    <div><strong>Tempat Kejadian:</strong> {foundReport.incidentPlace}</div>
                    <div><strong>Terduga Pelaku:</strong> {foundReport.perpetratorName} ({foundReport.perpetratorRelationship})</div>
                    <div><strong>Pelapor Terdaftar:</strong> {foundReport.reporterName} ({foundReport.reporterRelationship}) · HP: {foundReport.reporterContact}</div>
                  </div>
                </div>

                {/* Catatan Petugas */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-800" />
                    <span>Catatan Petugas UPTD PPA Dinas PMDP3A:</span>
                  </div>
                  {foundReport.officerNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span className="font-bold text-teal-900">{note.officerName}</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-stone-800">{note.summary}</p>
                      <p className="text-stone-600 text-[11px] bg-white p-2 rounded border border-stone-100">
                        <strong>Rencana Tindakan:</strong> {note.actionPlan}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pesan Rahasia 2 Arah */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-teal-800" />
                    <span>Kirim Pesan Rahasia ke Petugas:</span>
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
                      placeholder="Tulis pesan ke petugas UPTD PPA..."
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

      {/* Bottom Footer with Helpline & Official Access */}
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

            {isDinasOfficer && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[38px] shadow-sm"
                title="Portal Manajemen Kasus UPTD PPA Nagekeo"
              >
                <Shield className="w-4 h-4 text-emerald-300" />
                <span>Petugas Dinas</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto text-center text-[10px] text-stone-500 pt-2 border-t border-stone-800">
          Dilindungi UU Tindak Pidana Kekerasan Seksual (UU No. 12 Th 2022) & UU Perlindungan Anak
        </div>
      </footer>

      {/* Emergency Hotline Modal */}
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

      {/* Admin Portal Modal */}
      {isAdminOpen && (
        <AdminPortal
          reports={reports}
          onOfficerLoginChange={(email) => {
            if (email === OFFICIAL_DINAS_EMAIL) {
              setCurrentOfficerEmail(email);
              try { localStorage.setItem('sipelka_officer_email', email); } catch {}
            } else {
              setCurrentOfficerEmail(null);
              try { localStorage.removeItem('sipelka_officer_email'); } catch {}
            }
          }}
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
