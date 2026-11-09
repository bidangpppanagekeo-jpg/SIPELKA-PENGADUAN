import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, CheckCircle2, AlertTriangle, Search, Filter, 
  Download, Printer, FileText, Send, User, MapPin, Calendar, 
  MessageSquare, ChevronRight, X, Clock, Eye, ExternalLink, RefreshCw,
  Table2, Check, AlertCircle, LogOut
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ReportItem, CaseStatus, UrgencyLevel, NagekeoKecamatan } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';
import { 
  initAuth, 
  signInWithGoogle, 
  signOutFromGoogle 
} from '../services/googleAuth';
import { 
  createComplaintSpreadsheet, 
  syncAllComplaintsToSpreadsheet, 
  getSavedSpreadsheetInfo, 
  ActiveSpreadsheetInfo 
} from '../services/googleSheets';

interface AdminPortalProps {
  reports: ReportItem[];
  onUpdateStatus: (ticketCode: string, newStatus: CaseStatus) => void;
  onAddOfficerNote: (ticketCode: string, summary: string, actionPlan: string, assignedUnit: string) => void;
  onOfficerSendMessage: (ticketCode: string, messageText: string) => void;
  onClose: () => void;
  onOfficerLoginChange?: (email: string | null) => void;
}

const ALLOWED_OFFICER_EMAIL = 'bidangpppanagekeo@gmail.com';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  reports,
  onUpdateStatus,
  onAddOfficerNote,
  onOfficerSendMessage,
  onClose,
  onOfficerLoginChange
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [officerEmail, setOfficerEmail] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterUrgency, setFilterUrgency] = useState<string>('semua');

  // Selected case for detailed review
  const [selectedCase, setSelectedCase] = useState<ReportItem | null>(reports[0] || null);
  
  // Note formulation
  const [newNoteSummary, setNewNoteSummary] = useState<string>('');
  const [newNoteAction, setNewNoteAction] = useState<string>('');
  const [assignedUnitInput, setAssignedUnitInput] = useState<string>('Tim Reaksi Cepat UPTD PPA Nagekeo');
  
  // Officer chat input
  const [officerReplyText, setOfficerReplyText] = useState<string>('');

  // Print view state for official BAP sheet
  const [isPrintingBAP, setIsPrintingBAP] = useState<boolean>(false);

  // Google Sheets Workspace State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSpreadsheetInfo | null>(() => getSavedSpreadsheetInfo());
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [syncError, setSyncError] = useState<string>('');
  
  // Mandatory Confirmation Modal before updating/modifying Google Sheets data
  const [showSyncConfirmModal, setShowSyncConfirmModal] = useState<boolean>(false);

  // Listen to Google Auth state & enforce bidangpppanagekeo@gmail.com
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        const email = user.email?.trim().toLowerCase();
        if (email === ALLOWED_OFFICER_EMAIL) {
          setGoogleUser(user);
          setGoogleToken(token);
          setIsAuthenticated(true);
          onOfficerLoginChange?.(ALLOWED_OFFICER_EMAIL);
        } else {
          setGoogleUser(null);
          setGoogleToken(null);
          onOfficerLoginChange?.(null);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        onOfficerLoginChange?.(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onOfficerLoginChange]);

  // Google Sign In handler strictly for bidangpppanagekeo@gmail.com
  const handleConnectGoogle = async () => {
    setIsSigningInGoogle(true);
    setSyncError('');
    setSyncStatusMsg('');
    try {
      const res = await signInWithGoogle();
      if (res) {
        const userEmail = res.user.email?.trim().toLowerCase() || '';
        if (userEmail !== ALLOWED_OFFICER_EMAIL) {
          await signOutFromGoogle();
          setGoogleUser(null);
          setGoogleToken(null);
          setIsAuthenticated(false);
          onOfficerLoginChange?.(null);
          setLoginError('Akses Ditolak: Fitur Petugas Dinas & Google Sheets HANYA terbuka untuk akun email dinas resmi terdaftar.');
          setSyncError('Akses Ditolak: Hanya akun email dinas resmi terdaftar yang dapat mengelola Google Sheets.');
          return;
        }

        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setIsAuthenticated(true);
        setLoginError('');
        onOfficerLoginChange?.(ALLOWED_OFFICER_EMAIL);

        const currentSheet = getSavedSpreadsheetInfo();
        if (!currentSheet) {
          const newSheet = await createComplaintSpreadsheet(res.accessToken);
          setActiveSheet(newSheet);
          await syncAllComplaintsToSpreadsheet(res.accessToken, newSheet.id, reports);
          setSyncStatusMsg(`Berhasil terhubung ke Google Sheets! Dokumen "${newSheet.title}" otomatis dibuat dan disinkronkan.`);
        } else {
          setActiveSheet(currentSheet);
          await syncAllComplaintsToSpreadsheet(res.accessToken, currentSheet.id, reports);
          setSyncStatusMsg(`Terhubung dengan Google Sheets. ${reports.length} data pengaduan kasus disinkronkan.`);
        }
      }
    } catch (e: any) {
      console.error(e);
      setSyncError(e.message || 'Gagal masuk dengan Akun Google.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  // Google Sign Out handler
  const handleDisconnectGoogle = async () => {
    await signOutFromGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    onOfficerLoginChange?.(null);
    setSyncStatusMsg('Akun Google berhasil diputuskan.');
  };

  // Create brand new Google Sheet
  const handleCreateNewSheet = async () => {
    if (!googleToken) {
      await handleConnectGoogle();
      return;
    }
    setIsSyncingSheet(true);
    setSyncError('');
    setSyncStatusMsg('');
    try {
      const newSheet = await createComplaintSpreadsheet(googleToken);
      setActiveSheet(newSheet);
      const syncRes = await syncAllComplaintsToSpreadsheet(googleToken, newSheet.id, reports);
      setSyncStatusMsg(`Spreadsheet baru berhasil dibuat dan ${syncRes.count} data pengaduan telah disinkronkan.`);
    } catch (e: any) {
      setSyncError(e.message || 'Gagal membuat Google Spreadsheet baru.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Perform confirmed sync to Google Sheets
  const handlePerformSync = async () => {
    setShowSyncConfirmModal(false);
    if (!googleToken) {
      await handleConnectGoogle();
      return;
    }

    setIsSyncingSheet(true);
    setSyncError('');
    setSyncStatusMsg('');
    try {
      const targetSheetId = activeSheet?.id || (await createComplaintSpreadsheet(googleToken)).id;
      const res = await syncAllComplaintsToSpreadsheet(googleToken, targetSheetId, reports);
      setActiveSheet(getSavedSpreadsheetInfo());
      setSyncStatusMsg(`Sukses! ${res.count} data pengaduan kasus berhasil disinkronkan ke Google Sheets.`);
    } catch (e: any) {
      setSyncError(e.message || 'Gagal menyinkronkan data ke Google Sheets.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Authentication handler strictly validating bidangpppanagekeo@gmail.com
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = officerEmail.trim().toLowerCase();
    
    if (cleanEmail !== ALLOWED_OFFICER_EMAIL) {
      setLoginError('Akses Ditolak: Fitur Petugas Dinas HANYA terbuka untuk email dinas resmi yang terdaftar.');
      setIsAuthenticated(false);
      onOfficerLoginChange?.(null);
      return;
    }

    if (pinCode === '111217' || pinCode === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
      onOfficerLoginChange?.(ALLOWED_OFFICER_EMAIL);
    } else {
      setLoginError('Kode PIN Petugas tidak sah. Silakan periksa kembali PIN Anda.');
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((item) => {
    const matchesSearch = 
      item.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desaKelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.incidentDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKecamatan = filterKecamatan === 'semua' || item.kecamatan === filterKecamatan;
    const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
    const matchesUrgency = filterUrgency === 'semua' || item.urgency === filterUrgency;

    return matchesSearch && matchesKecamatan && matchesStatus && matchesUrgency;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Kode Tiket', 'Tanggal', 'Waktu', 'Kegawatan', 'Kategori', 'Status', 
      'Kecamatan', 'Desa', 'Nama Korban', 'JK Korban', 'Usia Korban', 'Alamat Korban', 'Tempat Kejadian',
      'Pelaku Diketahui', 'Nama Pelaku', 'Usia Pelaku', 'Hubungan Pelaku', 'Alamat Pelaku',
      'Nama Pelapor', 'Hubungan Pelapor', 'Kontak Pelapor', 'Layanan Dibutuhkan'
    ];
    const rows = filteredReports.map((r) => [
      r.ticketCode,
      r.incidentDate,
      r.incidentTime,
      r.urgency,
      CATEGORY_LABELS[r.category]?.label || r.category,
      r.status,
      r.kecamatan,
      r.desaKelurahan,
      r.victimName,
      r.victimGender,
      r.victimAge,
      r.victimAddress,
      r.incidentPlace,
      r.perpetratorKnown ? 'Ya' : 'Tidak',
      r.perpetratorName || '-',
      r.perpetratorAge || '-',
      r.perpetratorRelationship || '-',
      r.perpetratorAddress || '-',
      r.reporterName,
      r.reporterRelationship,
      r.reporterContact,
      Object.entries(r.servicesNeeded).filter(([_, v]) => v).map(([k]) => k).join('; ')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekapitulasi_Kasus_PPA_Nagekeo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit note handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteSummary.trim() || !selectedCase) return;

    onAddOfficerNote(selectedCase.ticketCode, newNoteSummary.trim(), newNoteAction.trim() || 'Monitoring perkembangan berkala', assignedUnitInput);
    setNewNoteSummary('');
    setNewNoteAction('');

    // Re-sync
    const updated = reports.find(r => r.ticketCode === selectedCase.ticketCode);
    if (updated) setSelectedCase(updated);
  };

  // Submit reply handler
  const handleOfficerReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerReplyText.trim() || !selectedCase) return;

    onOfficerSendMessage(selectedCase.ticketCode, officerReplyText.trim());
    setOfficerReplyText('');

    // Re-sync
    const updated = reports.find(r => r.ticketCode === selectedCase.ticketCode);
    if (updated) setSelectedCase(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-5 sm:p-6 text-stone-900 space-y-5">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto sm:hidden" />
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">Portal Petugas Dinas PMDP3A</h3>
                <p className="text-[11px] text-stone-500">Kabupaten Nagekeo, Nusa Tenggara Timur</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email restriction badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Akses Khusus Admin Dinas PMDP3A</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Tombol & Portal ini <strong>HANYA TERBUKA</strong> untuk akun email dinas resmi terdaftar. Email lain tidak aktif.
            </p>
          </div>

          {/* Google Direct Sign-In Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={isSigningInGoogle}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 shadow-xs flex items-center justify-center gap-2.5 cursor-pointer min-h-[46px] transition-all touch-manipulation"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningInGoogle ? 'Menghubungkan Google...' : 'Masuk dengan Akun Google Dinas'}</span>
            </button>
            <p className="text-[10px] text-center text-stone-500">
              Otomatis menyinkronkan data pengaduan dengan Google Sheets
            </p>
          </div>

          <div className="relative flex items-center my-2">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-stone-400 font-medium">atau masuk dengan PIN</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Dinas Petugas</label>
              <input
                type="email"
                value={officerEmail}
                onChange={(e) => setOfficerEmail(e.target.value)}
                placeholder="Masukkan email dinas resmi"
                className="w-full text-base sm:text-xs border border-stone-300 rounded-xl sm:rounded-lg p-3 sm:p-2.5 focus:border-teal-700 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kode PIN Petugas</label>
              <input
                type="password"
                inputMode="numeric"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Masukkan Kode PIN Petugas"
                className="w-full text-base sm:text-xs border border-stone-300 rounded-xl sm:rounded-lg p-3 sm:p-2.5 focus:border-teal-700 focus:outline-none font-mono min-h-[44px]"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 sm:py-2.5 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-semibold rounded-xl sm:rounded-lg shadow-sm transition-colors cursor-pointer min-h-[48px] touch-manipulation"
            >
              Masuk Portal Manajemen Kasus
            </button>
          </form>

          <div className="text-[11px] text-stone-500 text-center bg-stone-50 p-3 rounded-xl border border-stone-200">
            Akses resmi diperuntukkan bagi Bidang PPPA Dinas PMDP3A Kab. Nagekeo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Header of Admin Console */}
        <div className="bg-stone-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-tight">
                  Dasbor Manajemen Kasus UPTD PPA Nagekeo
                </h2>
                <span className="text-[10px] bg-teal-900 text-teal-300 px-2 py-0.5 rounded border border-teal-700">
                  Resmi Kab. Nagekeo
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Petugas Aktif: Tim UPTD PPA Dinas PMDP3A · Mbay, Flores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Unduh Data Kasus ke Format Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Strip (Clean Tabular Numbers, No Pill Clutter) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-stone-200 bg-stone-50 divide-x divide-stone-200 shrink-0">
          <div className="p-3.5 sm:px-5">
            <span className="text-xs text-stone-500 block">Total Pengaduan Masuk</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">{reports.length}</span>
          </div>

          <div className="p-3.5 sm:px-5">
            <span className="text-xs text-rose-700 block font-medium">Kasus Kategori Darurat</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              {reports.filter((r) => r.urgency === 'darurat').length}
            </span>
          </div>

          <div className="p-3.5 sm:px-5">
            <span className="text-xs text-amber-700 block font-medium">Dalam Penjangkauan / Sidang</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-800">
              {reports.filter((r) => r.status === 'penjangkauan' || r.status === 'pendampingan').length}
            </span>
          </div>

          <div className="p-3.5 sm:px-5">
            <span className="text-xs text-emerald-700 block font-medium">Kasus Tertangani / Pulih</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
              {reports.filter((r) => r.status === 'selesai').length}
            </span>
          </div>
        </div>

        {/* Google Sheets Integration Strip */}
        <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Table2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-emerald-950">
                  Google Sheets Sinkronisasi Pengaduan
                </span>
                {googleUser ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    Terhubung: {googleUser.email}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    Belum Terhubung
                  </span>
                )}
              </div>

              {activeSheet ? (
                <div className="text-[11px] text-emerald-900 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-medium truncate max-w-xs">{activeSheet.title}</span>
                  <span>·</span>
                  <a
                    href={activeSheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                  >
                    <span>Buka di Google Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {activeSheet.lastSyncedAt && (
                    <>
                      <span>·</span>
                      <span className="text-stone-500 text-[10px]">
                        Terakhir disinkronkan: {new Date(activeSheet.lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA ({activeSheet.syncedRowCount || 0} baris)
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Hubungkan dengan Akun Google untuk menyinkronkan data pengaduan kasus ke spreadsheet secara berkala.
                </p>
              )}

              {syncStatusMsg && (
                <p className="text-[11px] text-emerald-700 font-medium mt-1">{syncStatusMsg}</p>
              )}
              {syncError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{syncError}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!googleUser ? (
              <button
                onClick={handleConnectGoogle}
                disabled={isSigningInGoogle}
                className="px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-lg border border-stone-300 shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningInGoogle ? 'Menghubungkan...' : 'Hubungkan Google Sheets'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowSyncConfirmModal(true)}
                  disabled={isSyncingSheet}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheet ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                </button>

                <button
                  onClick={handleCreateNewSheet}
                  disabled={isSyncingSheet}
                  title="Buat file Google Spreadsheet baru"
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-medium text-xs rounded-lg border border-emerald-300 cursor-pointer"
                >
                  + Sheet Baru
                </button>

                <button
                  onClick={handleDisconnectGoogle}
                  title="Putuskan Akun Google"
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Tiket, Desa, atau Kata Kunci..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:border-teal-700 focus:outline-none bg-stone-50/50"
              />
            </div>

            {/* Filter Kecamatan */}
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="semua">Semua Kecamatan (7 Kec)</option>
              <option value="Aesesa">Kec. Aesesa</option>
              <option value="Aesesa Selatan">Kec. Aesesa Selatan</option>
              <option value="Boawae">Kec. Boawae</option>
              <option value="Mauponggo">Kec. Mauponggo</option>
              <option value="Nangaroro">Kec. Nangaroro</option>
              <option value="Keo Tengah">Kec. Keo Tengah</option>
              <option value="Wolowae">Kec. Wolowae</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="masuk">Masuk</option>
              <option value="verifikasi">Verifikasi</option>
              <option value="penjangkauan">Penjangkauan</option>
              <option value="pendampingan">Pendampingan</option>
              <option value="selesai">Selesai</option>
            </select>

            {/* Filter Urgensi */}
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="semua">Semua Tingkat Kegawatan</option>
              <option value="darurat">🚨 Darurat</option>
              <option value="mendesak">⚠️ Mendesak</option>
              <option value="standar">📋 Standar</option>
            </select>
          </div>

          <span className="text-xs text-stone-500 font-mono">
            Menampilkan {filteredReports.length} kasus
          </span>
        </div>

        {/* Master-Detail Split Layout */}
        <div className="grid lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Left Column: Case List (5 cols) */}
          <div className="lg:col-span-5 overflow-y-auto divide-y divide-stone-100 max-h-[500px] lg:max-h-none">
            {filteredReports.length > 0 ? (
              filteredReports.map((item) => {
                const isSelected = selectedCase?.ticketCode === item.ticketCode;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCase(item)}
                    className={`p-4 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-teal-50/80 border-l-4 border-l-teal-800'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-stone-900">{item.ticketCode}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.urgency === 'darurat' ? 'bg-rose-100 text-rose-800' : item.urgency === 'mendesak' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.urgency}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 capitalize">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="font-semibold text-stone-800 mb-1">
                      {CATEGORY_LABELS[item.category]?.label || item.category}
                    </div>

                    <div className="text-[11px] text-stone-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        Desa {item.desaKelurahan}, Kec. {item.kecamatan}
                      </span>
                      <span className="font-mono text-stone-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 mt-1.5 italic">
                      "{item.incidentDescription}"
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-500">
                Tidak ada data kasus yang cocok dengan filter yang dipilih.
              </div>
            )}
          </div>

          {/* Right Column: Case Deep Dive & Actions (7 cols) */}
          <div className="lg:col-span-7 overflow-y-auto p-5 space-y-6">
            {selectedCase ? (
              <>
                {/* Case Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Nomor Berkas:</span>
                    <h3 className="text-base font-bold font-mono text-stone-900">
                      {selectedCase.ticketCode}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Changer */}
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
                      <span className="text-[11px] font-medium text-stone-600 px-2">Ubah Status:</span>
                      {(['masuk', 'verifikasi', 'penjangkauan', 'pendampingan', 'selesai'] as CaseStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            onUpdateStatus(selectedCase.ticketCode, st);
                            setSelectedCase({ ...selectedCase, status: st });
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded capitalize transition-all cursor-pointer ${
                            selectedCase.status === st
                              ? 'bg-teal-800 text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Print BAP */}
                    <button
                      onClick={() => setIsPrintingBAP(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Cetak Berita Acara Penerimaan Pengaduan Resmi"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak BAP</span>
                    </button>
                  </div>
                </div>

                {/* Case Identity Grid */}
                <div className="grid sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Identitas Korban:</span>
                    <span className="font-bold text-stone-900 block">{selectedCase.victimName}</span>
                    <span className="text-stone-500 text-[11px]">
                      {selectedCase.victimGender === 'perempuan' ? 'Perempuan' : 'Laki-Laki (Anak)'} · Usia: {selectedCase.victimAge} th
                    </span>
                    <span className="text-stone-600 block text-[11px] mt-0.5">
                      Alamat: {selectedCase.victimAddress}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[11px]">Data Pelapor & Kontak:</span>
                    <span className="font-bold text-stone-900 block">{selectedCase.reporterName}</span>
                    <span className="text-stone-500 text-[11px]">
                      Hubungan: {selectedCase.reporterRelationship} · Kerahasiaan: {selectedCase.confidentiality}
                    </span>
                    <span className="text-teal-800 font-semibold block text-[11px] mt-0.5">
                      Kontak: {selectedCase.reporterContact || 'Tidak dicantumkan'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[11px]">Waktu & Tempat Kejadian:</span>
                    <span className="font-semibold text-stone-800 block">
                      Desa {selectedCase.desaKelurahan}, Kec. {selectedCase.kecamatan}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      Waktu: {selectedCase.incidentDate} ({selectedCase.incidentTime || 'Tidak spesifik'}) · Tempat: {selectedCase.incidentPlace || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[11px]">Data Terduga Pelaku:</span>
                    {selectedCase.perpetratorKnown ? (
                      <>
                        <span className="font-semibold text-stone-800 block">
                          {selectedCase.perpetratorName} {selectedCase.perpetratorAge ? `(${selectedCase.perpetratorAge} th)` : ''}
                        </span>
                        <span className="text-stone-500 text-[11px] block">
                          Hubungan: {selectedCase.perpetratorRelationship || 'Tidak disebutkan'}
                        </span>
                        <span className="text-stone-500 text-[11px] block">
                          Alamat: {selectedCase.perpetratorAddress || 'Tidak diketahui'}
                        </span>
                      </>
                    ) : (
                      <span className="text-stone-500 italic text-[11px]">Identitas pelaku tidak diketahui / anonim</span>
                    )}
                  </div>
                </div>

                {/* Kronologi Detail */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-800" />
                    Uraian Kronologi Kejadian:
                  </span>
                  <div className="p-3.5 bg-white border border-stone-200 rounded-xl leading-relaxed text-stone-700">
                    {selectedCase.incidentDescription}
                  </div>
                </div>

                {/* Kebutuhan Layanan Terintegrasi */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-stone-900">Disposisi Layanan Rujukan:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.medisVisum ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Visum RSUD Aeramo
                    </div>
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.rumahAman ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Safe House UPTD PPA
                    </div>
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.bantuanHukum ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Advokasi Polres Nagekeo
                    </div>
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.konselingPsikologis ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Trauma Healing
                    </div>
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.mediasiKeluarga ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Mediasi Terpadu
                    </div>
                    <div className={`p-2 rounded border ${selectedCase.servicesNeeded.bantuanSosialDarurat ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-200 text-stone-400'}`}>
                      ✓ Bansos Perlindungan Dinas PMDP3A
                    </div>
                  </div>
                </div>

                {/* Riwayat Catatan Asesmen Petugas & Tambah Catatan */}
                <div className="space-y-3 pt-2 border-t border-stone-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Lembar Catatan Penanganan Lapangan</span>
                    <span className="text-[11px] text-stone-400">UPTD PPA Dinas PMDP3A Nagekeo</span>
                  </div>

                  <div className="space-y-2">
                    {selectedCase.officerNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span className="font-bold text-teal-900">{note.officerName}</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        <p className="text-stone-800"><strong>Asesmen:</strong> {note.summary}</p>
                        <p className="text-stone-600"><strong>Tindakan:</strong> {note.actionPlan}</p>
                        <span className="text-[10px] text-stone-400">Unit: {note.assignedUnit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Form Tambah Catatan Baru */}
                  <form onSubmit={handleAddNote} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                    <span className="font-semibold text-stone-800 block text-xs">Tambah Catatan Asesmen / Berita Acara Baru</span>
                    <input
                      type="text"
                      value={newNoteSummary}
                      onChange={(e) => setNewNoteSummary(e.target.value)}
                      placeholder="Ringkasan hasil kunjungan lapangan / pemeriksaan..."
                      className="w-full text-xs border border-stone-300 rounded p-2 focus:outline-none focus:border-teal-700 bg-white"
                      required
                    />
                    <input
                      type="text"
                      value={newNoteAction}
                      onChange={(e) => setNewNoteAction(e.target.value)}
                      placeholder="Rencana tindak lanjut (misal: jadwal visum, mediasi desa, pelimpahan berkas)..."
                      className="w-full text-xs border border-stone-300 rounded p-2 focus:outline-none focus:border-teal-700 bg-white"
                    />
                    <div className="flex justify-between items-center pt-1">
                      <input
                        type="text"
                        value={assignedUnitInput}
                        onChange={(e) => setAssignedUnitInput(e.target.value)}
                        placeholder="Unit Pelaksana"
                        className="text-[11px] border border-stone-300 rounded px-2 py-1 bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded cursor-pointer"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </form>
                </div>

                {/* Percakapan Aman dengan Korban/Pelapor */}
                <div className="space-y-3 pt-2 border-t border-stone-200 text-xs">
                  <span className="font-bold text-stone-900">Saluran Percakapan Aman dengan Pelapor:</span>
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 max-h-48 overflow-y-auto space-y-2">
                    {selectedCase.messages && selectedCase.messages.length > 0 ? (
                      selectedCase.messages.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.sender === 'petugas' ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-stone-400 mb-0.5">{m.senderName} ({m.timestamp})</span>
                          <div className={`p-2.5 rounded-lg text-xs max-w-[85%] ${
                            m.sender === 'petugas' ? 'bg-teal-800 text-white' : 'bg-white border border-stone-200 text-stone-800'
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-stone-400 italic block py-2 text-center">Belum ada pesan masuk dari pelapor.</span>
                    )}
                  </div>

                  <form onSubmit={handleOfficerReply} className="flex gap-2">
                    <input
                      type="text"
                      value={officerReplyText}
                      onChange={(e) => setOfficerReplyText(e.target.value)}
                      placeholder="Tulis balasan konselor resmi kepada pelapor..."
                      className="flex-1 text-xs border border-stone-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Balas</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-stone-400">
                Pilih salah satu nomor berkas kasus pada daftar di sebelah kiri untuk melihat detail dan melakukan tindakan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Berita Acara Penerimaan Pengaduan (BAP Resmi Siap Cetak) */}
      {isPrintingBAP && selectedCase && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-stone-900 space-y-6 print:m-0 print:p-0">
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-2 border-stone-900 pb-4 space-y-1">
              <h2 className="text-sm font-bold tracking-wider uppercase">PEMERINTAH KABUPATEN NAGEKEO</h2>
              <h1 className="text-sm sm:text-base font-extrabold tracking-wide uppercase">DINAS PEMBERDAYAAN MASYARAKAT DAN DESA, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK (DINAS PMDP3A)</h1>
              <h3 className="text-xs font-semibold uppercase">UPTD PERLINDUNGAN PEREMPUAN DAN ANAK (UPTD PPA)</h3>
              <p className="text-[10px] text-stone-600">
                Jl. Soekarno-Hatta, Kompleks Civic Center, Mbay, Nusa Tenggara Timur · Telp: 0822-6635-5313
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold underline uppercase">BERITA ACARA PENERIMAAN PENGADUAN</h4>
              <p className="text-[11px] font-mono text-stone-600">Nomor: BAP-PPA/NGK/{new Date().getFullYear()}/{selectedCase.ticketCode.replace(/[^0-9]/g, '')}</p>
            </div>

            <div className="text-xs space-y-3 leading-relaxed">
              <p>
                Pada hari ini, tanggal <strong>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>, telah diterima laporan pengaduan tindak kekerasan terhadap perempuan / anak dengan rincian sebagai berikut:
              </p>

              <table className="w-full text-xs border border-stone-300 divide-y divide-stone-200">
                <tbody>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50 w-1/3">Nomor Registrasi:</td>
                    <td className="p-2 font-mono font-bold">{selectedCase.ticketCode}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Tingkat Kegawatan:</td>
                    <td className="p-2 uppercase font-bold text-rose-800">{selectedCase.urgency}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Kategori Kasus:</td>
                    <td className="p-2">{CATEGORY_LABELS[selectedCase.category]?.label}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Data Korban:</td>
                    <td className="p-2">
                      <div className="font-bold">{selectedCase.victimName} ({selectedCase.victimGender === 'perempuan' ? 'Perempuan' : 'Laki-Laki'}, {selectedCase.victimAge} th)</div>
                      <div className="text-stone-600">Alamat: {selectedCase.victimAddress}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Waktu & Tempat Kejadian:</td>
                    <td className="p-2">
                      {selectedCase.incidentDate} ({selectedCase.incidentTime || '-'}) · Tempat: {selectedCase.incidentPlace || '-'} (Desa {selectedCase.desaKelurahan}, Kec. {selectedCase.kecamatan})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Data Terduga Pelaku:</td>
                    <td className="p-2">
                      {selectedCase.perpetratorKnown ? (
                        <div>
                          <strong>{selectedCase.perpetratorName}</strong> {selectedCase.perpetratorAge ? `(${selectedCase.perpetratorAge} th)` : ''}
                          <div>Hubungan dgn Korban: {selectedCase.perpetratorRelationship || '-'}</div>
                          <div>Alamat Pelaku: {selectedCase.perpetratorAddress || '-'}</div>
                        </div>
                      ) : (
                        <span className="italic text-stone-500">Pelaku tidak diketahui saat laporan diajukan</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Data Pelapor:</td>
                    <td className="p-2">
                      <strong>{selectedCase.reporterName}</strong> (Hubungan: {selectedCase.reporterRelationship})
                      <div>Kontak / WA: {selectedCase.reporterContact || 'Dirahasiakan'}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Status Alur Penanganan:</td>
                    <td className="p-2 uppercase font-bold text-teal-900">{selectedCase.status}</td>
                  </tr>
                </tbody>
              </table>

              <div>
                <span className="font-semibold block mb-1">Kronologi Pokok Perkara:</span>
                <p className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-700 italic">
                  "{selectedCase.incidentDescription}"
                </p>
              </div>

              <div>
                <span className="font-semibold block mb-1">Rekomendasi Tindakan Segera:</span>
                <p className="text-stone-700">
                  Koordinasi penanganan terpadu dengan Unit PPA Sat Reskrim Polres Nagekeo, Visum Medis RSUD Aeramo, dan pengamanan korban di Rumah Aman UPTD PPA Kabupaten Nagekeo.
                </p>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="grid grid-cols-2 text-center text-xs pt-6">
              <div>
                <p className="text-[11px] text-stone-500">Pelapor / Pendamping,</p>
                <div className="h-16" />
                <p className="font-bold underline">{selectedCase.reporterName}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500">Mbay, Petugas Pemeriksa UPTD PPA,</p>
                <div className="h-16" />
                <p className="font-bold underline">{selectedCase.assignedOfficer || 'Maria Yasinta, S.Sos'}</p>
                <p className="text-[10px] text-stone-500">NIP. 19850612 201001 2 008</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => setIsPrintingBAP(false)}
                className="px-4 py-2 text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Mutasi / Sinkronisasi Google Sheets (Mandatory Workspace Confirmation) */}
      {showSyncConfirmModal && (
        <div className="fixed inset-0 z-70 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Table2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="leading-tight">Konfirmasi Sinkronisasi Google Sheets</h3>
                <p className="text-[11px] text-stone-500 font-normal">UPTD PPA Dinas PMDP3A Nagekeo</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Apakah Anda yakin ingin menyinkronkan <strong>{reports.length} data pengaduan kasus</strong> saat ini ke spreadsheet Google Sheets berikut?
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-stone-900 block truncate">
                {activeSheet?.title || 'SI-PELKA Nagekeo - Rekapitulasi Pengaduan UPTD PPA'}
              </span>
              <span className="text-[11px] text-stone-500 block">
                Akun: <strong className="text-stone-800">{googleUser?.email}</strong>
              </span>
              {activeSheet && (
                <span className="text-[10px] text-stone-400 font-mono block truncate">
                  ID: {activeSheet.id}
                </span>
              )}
            </div>

            <p className="text-[11px] text-stone-500">
              Operasi ini akan memperbarui dan menyelaraskan baris data pada lembar kerja <em>'Data Pengaduan Masuk'</em> dengan izin Anda.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowSyncConfirmModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handlePerformSync}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ya, Sinkronkan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
