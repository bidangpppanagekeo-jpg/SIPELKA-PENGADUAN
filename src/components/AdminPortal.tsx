import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Shield, CheckCircle2, AlertTriangle, Search, Filter, 
  Download, Printer, FileText, Send, User, MapPin, Calendar, 
  MessageSquare, ChevronRight, ChevronDown, Menu, X, Clock, Eye, ExternalLink, RefreshCw,
  Table2, Check, AlertCircle, LogOut, Copy, LayoutDashboard, Users, CheckSquare, PhoneCall, Trash2,
  Activity, ArrowLeft
} from 'lucide-react';
import { ReportItem, CaseStatus, UrgencyLevel, NagekeoKecamatan } from '../types';
import { CATEGORY_LABELS, INITIAL_REPORTS } from '../data/mockData';
import { 
  initAuth, 
  signInWithGoogle, 
  signOutFromGoogle,
  GoogleAuthUser 
} from '../services/googleAuth';
import { 
  createComplaintSpreadsheet, 
  syncAllComplaintsToSpreadsheet, 
  fetchComplaintsFromSpreadsheet,
  getSavedSpreadsheetInfo, 
  clearSavedSpreadsheetInfo,
  ActiveSpreadsheetInfo 
} from '../services/googleSheets';
import { 
  getSavedAppsScriptUrl, 
  saveAppsScriptUrl, 
  syncAllToAppsScript, 
  fetchComplaintsFromAppsScript,
  deleteFromAppsScript,
  APPS_SCRIPT_TEMPLATE_CODE,
  DEFAULT_APPS_SCRIPT_PROJECT_ID 
} from '../services/appsScript';

interface AdminPortalProps {
  reports: ReportItem[];
  onUpdateStatus: (ticketCode: string, newStatus: CaseStatus) => void;
  onAddOfficerNote: (ticketCode: string, summary: string, actionPlan: string, assignedUnit: string) => void;
  onOfficerSendMessage: (ticketCode: string, messageText: string) => void;
  onDeleteReport?: (ticketCode: string) => void;
  onClose: () => void;
  onOfficerLoginChange?: (email: string | null) => void;
  onReportsSynced?: (newReports: ReportItem[]) => void;
}

const ALLOWED_OFFICER_EMAIL = 'bidangpppanagekeo@gmail.com';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  reports,
  onUpdateStatus,
  onAddOfficerNote,
  onOfficerSendMessage,
  onDeleteReport,
  onClose,
  onOfficerLoginChange,
  onReportsSynced
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [officerEmail, setOfficerEmail] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Sidebar navigation state: 'masuk' (Data Masuk) | 'verifikasi' (Pengaduan Terverifikasi)
  const [sidebarTab, setSidebarTab] = useState<'masuk' | 'verifikasi'>('masuk');

  // Menu Utama Dropdown State (Di klik baru muncul agar layar tidak terkesan penuh)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(false);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    if (isMainMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMainMenuOpen]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterUrgency, setFilterUrgency] = useState<string>('semua');

  // Selected case for detailed full-width review (null = list view)
  const [selectedCase, setSelectedCase] = useState<ReportItem | null>(null);
  const [verificationSuccessNotice, setVerificationSuccessNotice] = useState<string>('');

  const handleVerifyCase = (ticketCode: string) => {
    onUpdateStatus(ticketCode, 'verifikasi');
    if (selectedCase && selectedCase.ticketCode === ticketCode) {
      setSelectedCase({ ...selectedCase, status: 'verifikasi' });
    }
    setVerificationSuccessNotice(`Kasus ${ticketCode} berhasil diverifikasi dan masuk ke menu "Pengaduan Terverifikasi".`);
    setTimeout(() => setVerificationSuccessNotice(''), 6000);
  };
  
  // Note formulation
  const [newNoteSummary, setNewNoteSummary] = useState<string>('');
  const [newNoteAction, setNewNoteAction] = useState<string>('');
  const [assignedUnitInput, setAssignedUnitInput] = useState<string>('Tim Reaksi Cepat UPTD PPA Nagekeo');
  
  // Officer chat input
  const [officerReplyText, setOfficerReplyText] = useState<string>('');

  // Print view state for official BAP sheet
  const [isPrintingBAP, setIsPrintingBAP] = useState<boolean>(false);

  // Google Sheets Workspace State
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSpreadsheetInfo | null>(() => getSavedSpreadsheetInfo());
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [syncError, setSyncError] = useState<string>('');
  
  // Case Deletion State & Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);

  const handleConfirmDeleteCase = async () => {
    if (!selectedCase) return;
    const deletedTicketCode = selectedCase.ticketCode;
    setShowDeleteConfirmModal(false);

    onDeleteReport?.(deletedTicketCode);

    const remaining = reports.filter((r) => r.ticketCode !== deletedTicketCode);
    setSelectedCase(null);

    // 1. If connected via Google Sheets OAuth, sync deletion directly
    if (googleToken && activeSheet?.id) {
      try {
        setIsSyncingSheet(true);
        await syncAllComplaintsToSpreadsheet(googleToken, activeSheet.id, remaining);
        setSyncStatusMsg(`Kasus ${deletedTicketCode} berhasil dihapus dan disinkronkan ke Google Sheets.`);
      } catch (err: any) {
        setSyncError(err.message || 'Gagal menghapus data di Google Sheets.');
      } finally {
        setIsSyncingSheet(false);
      }
    }

    // 2. Also send delete request to Google Apps Script Web App
    if (appsScriptUrl) {
      try {
        await deleteFromAppsScript(deletedTicketCode, appsScriptUrl);
        setAppsScriptMsg(`Kasus ${deletedTicketCode} terhapus dari Spreadsheet via Apps Script.`);
      } catch (err) {
        console.warn('Apps Script delete notice:', err);
      }
    }
  };

  // Google Apps Script Integration State
  const [appsScriptUrl, setAppsScriptUrlState] = useState<string>(() => getSavedAppsScriptUrl());
  const [isSyncingAppsScript, setIsSyncingAppsScript] = useState<boolean>(false);
  const [appsScriptMsg, setAppsScriptMsg] = useState<string>('');
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const handleSyncAppsScript = async () => {
    setIsSyncingAppsScript(true);
    setAppsScriptMsg('');
    try {
      const res = await syncAllToAppsScript(reports, appsScriptUrl);
      setAppsScriptMsg(res.message);
    } catch (e: any) {
      setAppsScriptMsg(e.message || 'Gagal menyinkronkan data ke Google Apps Script.');
    } finally {
      setIsSyncingAppsScript(false);
    }
  };

  const handlePullFromAppsScript = async () => {
    setIsSyncingAppsScript(true);
    setAppsScriptMsg('');
    try {
      const remote = await fetchComplaintsFromAppsScript(appsScriptUrl);
      if (remote && remote.length > 0) {
        onReportsSynced?.(remote);
        setSelectedCase(remote[0] || null);
        setAppsScriptMsg(`Sukses! ${remote.length} data pengaduan berhasil ditarik dari Google Sheets.`);
      } else {
        setAppsScriptMsg('Spreadsheet masih kosong atau belum ada pengaduan tercatat.');
      }
    } catch (e: any) {
      setAppsScriptMsg(e.message || 'Gagal menarik data dari Google Apps Script.');
    } finally {
      setIsSyncingAppsScript(false);
    }
  };

  const handleRestoreSampleReports = () => {
    onReportsSynced?.(INITIAL_REPORTS);
    setSelectedCase(INITIAL_REPORTS[0] || null);
  };

  const handleSaveAppsScriptUrl = (url: string) => {
    setAppsScriptUrlState(url);
    saveAppsScriptUrl(url);
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

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
    clearSavedSpreadsheetInfo();
    setActiveSheet(null);
    setGoogleUser(null);
    setGoogleToken(null);
    onOfficerLoginChange?.(null);
    setSyncStatusMsg('Akun Google berhasil diputuskan dan konfigurasi Sheet dibersihkan.');
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

  // Perform 2-way sync to Google Sheets
  const handlePerformSync = async () => {
    if (!googleToken) {
      await handleConnectGoogle();
      return;
    }

    setIsSyncingSheet(true);
    setSyncError('');
    setSyncStatusMsg('');
    try {
      const targetSheetId = activeSheet?.id || (await createComplaintSpreadsheet(googleToken)).id;
      // 1. Push local reports to Google Sheets
      const res = await syncAllComplaintsToSpreadsheet(googleToken, targetSheetId, reports);
      // 2. Pull remote reports from Google Sheets (2-way sync)
      const remoteReports = await fetchComplaintsFromSpreadsheet(googleToken, targetSheetId);
      if (remoteReports && remoteReports.length > 0) {
        onReportsSynced?.(remoteReports);
      }
      setActiveSheet(getSavedSpreadsheetInfo());
      setSyncStatusMsg(`Sukses 2-Arah! ${res.count} data dikirim & ${remoteReports.length} data diperbarui dari Google Sheets.`);
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

  // Filtered reports based on sidebarTab and search/dropdown filters
  const filteredReports = reports.filter((item) => {
    const matchesSearch = 
      item.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desaKelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.incidentDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKecamatan = filterKecamatan === 'semua' || item.kecamatan === filterKecamatan;
    const matchesUrgency = filterUrgency === 'semua' || item.urgency === filterUrgency;

    let matchesSidebar = true;
    if (sidebarTab === 'masuk') matchesSidebar = item.status === 'masuk';
    else if (sidebarTab === 'verifikasi') matchesSidebar = item.status !== 'masuk';

    const matchesStatusDropdown = filterStatus === 'semua' || item.status === filterStatus;

    return matchesSearch && matchesKecamatan && matchesUrgency && matchesSidebar && matchesStatusDropdown;
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

    const updated = reports.find(r => r.ticketCode === selectedCase.ticketCode);
    if (updated) setSelectedCase(updated);
  };

  // Submit reply handler
  const handleOfficerReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerReplyText.trim() || !selectedCase) return;

    onOfficerSendMessage(selectedCase.ticketCode, officerReplyText.trim());
    setOfficerReplyText('');

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

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Akses Khusus Admin Dinas PMDP3A</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Tombol & Portal ini <strong>HANYA TERBUKA</strong> untuk akun email dinas resmi terdaftar. Email lain tidak aktif.
            </p>
          </div>

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
      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer border border-stone-700"
              title="Unduh Data Kasus ke Format Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Layout with Sidebar + Content */}
        <div className="grid lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-stone-200 bg-stone-50">
          
          {/* SIDEBAR NAVIGATION (3 cols) */}
          <div className="lg:col-span-3 bg-stone-900 text-stone-300 p-4 overflow-y-auto space-y-4 shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-2 px-2">
                  Menu Rekapan
                </span>
                <nav className="space-y-1.5 text-xs font-medium">
                  {/* 1. Data Masuk (data yang baru di input oleh warga) */}
                  <button
                    onClick={() => {
                      setSidebarTab('masuk');
                      setSelectedCase(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      sidebarTab === 'masuk' ? 'bg-teal-800 text-white font-bold shadow-sm ring-1 ring-teal-400' : 'hover:bg-stone-800 text-stone-300'
                    }`}
                    title="Data pengaduan yang baru diinput oleh warga"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-300" />
                      <span>Data Masuk</span>
                    </div>
                    <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {reports.filter(r => r.status === 'masuk').length}
                    </span>
                  </button>

                  {/* 2. Pengaduan Terverifikasi */}
                  <button
                    onClick={() => {
                      setSidebarTab('verifikasi');
                      setSelectedCase(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      sidebarTab === 'verifikasi' ? 'bg-teal-800 text-white font-bold shadow-sm ring-1 ring-teal-400' : 'hover:bg-stone-800 text-stone-300'
                    }`}
                    title="Pengaduan yang telah diverifikasi"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-300" />
                      <span>Pengaduan Terverifikasi</span>
                    </div>
                    <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {reports.filter(r => r.status !== 'masuk').length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Menu Utama Tombol di Sidebar */}
              <div className="pt-3 border-t border-stone-800 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block px-2">
                  Menu Utama
                </span>
                <button
                  type="button"
                  onClick={() => setIsMainMenuOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-teal-300 hover:text-white text-xs font-semibold cursor-pointer border border-teal-900/50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-teal-400" />
                    <span>Integrasi Google Sheets</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 px-1">
              UPTD PPA Kabupaten Nagekeo © {new Date().getFullYear()}
            </div>
          </div>

          {/* MAIN CONTENT AREA (9 cols: Filters + Single Screen Content) */}
          <div className="lg:col-span-9 flex flex-col overflow-hidden bg-white">
            
            {/* Filter Toolbar */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Tiket, Desa, atau Korban..."
                    className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg focus:border-teal-700 focus:outline-none bg-white text-xs"
                  />
                </div>

                <select
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  className="border border-stone-300 rounded-lg px-2 py-1.5 bg-white text-xs"
                >
                  <option value="semua">Semua Kecamatan</option>
                  <option value="Aesesa">Kec. Aesesa</option>
                  <option value="Aesesa Selatan">Kec. Aesesa Selatan</option>
                  <option value="Boawae">Kec. Boawae</option>
                  <option value="Mauponggo">Kec. Mauponggo</option>
                  <option value="Nangaroro">Kec. Nangaroro</option>
                  <option value="Keo Tengah">Kec. Keo Tengah</option>
                  <option value="Wolowae">Kec. Wolowae</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-medium"
                >
                  <option value="semua">Semua Status</option>
                  <option value="masuk">Data Masuk</option>
                  <option value="verifikasi">Terverifikasi</option>
                </select>
              </div>

              <span className="text-stone-500 font-mono text-[11px]">
                Menampilkan {filteredReports.length} kasus ({sidebarTab === 'masuk' ? 'Data Masuk' : 'Pengaduan Terverifikasi'})
              </span>
            </div>

            {/* Single Screen Display: When selectedCase is null, show ONLY the list. When clicked, show ONLY the details */}
            {selectedCase ? (
              /* RINCIAN KASUS (Single Screen Detail View) */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs bg-white">
                {/* Top Navigation & Verification Action Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCase(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl transition-colors cursor-pointer border border-stone-300"
                      title="Kembali ke Daftar Kasus"
                    >
                      <ArrowLeft className="w-4 h-4 text-stone-600" />
                      <span>Kembali ke Daftar Kasus</span>
                    </button>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Nomor Berkas:</span>
                      <h3 className="text-base font-bold font-mono text-stone-900 leading-tight">
                        {selectedCase.ticketCode}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tombol Verifikasi Pengaduan & Otomatis Tindak Lanjuti */}
                    {selectedCase.status !== 'dilanjutkan' ? (
                      <div className="flex items-center gap-2">
                        {selectedCase.status === 'masuk' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStatus(selectedCase.ticketCode, 'verifikasi');
                              setSelectedCase({ ...selectedCase, status: 'verifikasi' });
                              setVerificationSuccessNotice(`Kasus ${selectedCase.ticketCode} ditandai untuk Verifikasi Pengaduan.`);
                              setTimeout(() => setVerificationSuccessNotice(''), 5000);
                            }}
                            className="px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl cursor-pointer transition-colors"
                            title="Tandai kasus untuk proses verifikasi berkas"
                          >
                            Tandai Perlu Verifikasi
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleVerifyCase(selectedCase.ticketCode)}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                          title="Verifikasi kasus ini dan otomatis lanjutkan untuk ditindaklanjuti"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Verifikasi & Tindak Lanjuti</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Kasus Lolos Verifikasi · Dalam Tindak Lanjut</span>
                      </div>
                    )}

                    <button
                      onClick={() => setIsPrintingBAP(true)}
                      className="px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak BAP</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Hapus Kasus dari Dashboard & Google Sheets"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus Kasus</span>
                    </button>
                  </div>
                </div>

                {/* Success Notification Banner */}
                {verificationSuccessNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-semibold text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{verificationSuccessNotice}</span>
                  </div>
                )}

                {/* Status & Priority Badge Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                      selectedCase.urgency === 'darurat' ? 'bg-rose-100 text-rose-800 border border-rose-200' : selectedCase.urgency === 'mendesak' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}>
                      Prioritas: {selectedCase.urgency}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-200 text-stone-800 capitalize">
                      Status: {selectedCase.status === 'dilanjutkan' ? 'Kasus yang Dilanjutkan' : selectedCase.status === 'verifikasi' ? 'Verifikasi Pengaduan' : 'Data Masuk'}
                    </span>
                    <span className="text-stone-700 font-semibold text-xs px-2 py-1 bg-white border border-stone-200 rounded-lg">
                      Kategori: {CATEGORY_LABELS[selectedCase.category]?.label || selectedCase.category}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Tanggal Pengaduan: {new Date(selectedCase.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* 2-Column Info: Identitas Korban & Pelapor */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs pb-1 border-b border-stone-200">
                      <User className="w-4 h-4 text-teal-700" />
                      <span>Identitas Korban</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-stone-400 text-[11px]">Nama Korban:</span> <strong className="text-stone-900">{selectedCase.victimName}</strong></div>
                      <div><span className="text-stone-400 text-[11px]">Jenis Kelamin / Usia:</span> <span className="text-stone-700 font-medium capitalize">{selectedCase.victimGender} · {selectedCase.victimAge} Tahun</span></div>
                      <div><span className="text-stone-400 text-[11px]">Alamat Domisili:</span> <span className="text-stone-800">{selectedCase.victimAddress}</span></div>
                      <div className="flex items-center gap-1 text-stone-600 text-[11px] pt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Desa/Kel: {selectedCase.desaKelurahan}, Kec. {selectedCase.kecamatan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs pb-1 border-b border-stone-200">
                      <PhoneCall className="w-4 h-4 text-teal-700" />
                      <span>Identitas Pelapor & Kontak</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-stone-400 text-[11px]">Nama Pelapor:</span> <strong className="text-stone-900">{selectedCase.reporterName}</strong></div>
                      <div><span className="text-stone-400 text-[11px]">Hubungan dg Korban:</span> <span className="text-stone-700 font-medium">{selectedCase.reporterRelationship}</span></div>
                      <div className="pt-1">
                        <span className="text-stone-400 text-[11px] block">Kontak / Nomor Telepon:</span>
                        <span className="text-teal-900 font-bold font-mono text-sm bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 inline-block mt-0.5">
                          {selectedCase.reporterContact || 'Tidak dicantumkan'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layanan yang Dibutuhkan */}
                {selectedCase.servicesNeeded && Object.values(selectedCase.servicesNeeded).some(Boolean) && (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-900 block text-xs">Layanan Terpadu yang Dibutuhkan Korban:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCase.servicesNeeded.medisVisum && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Layanan Medis / Visum</span>
                      )}
                      {selectedCase.servicesNeeded.bantuanHukum && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Bantuan Advokasi Hukum</span>
                      )}
                      {selectedCase.servicesNeeded.konselingPsikologis && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Konseling Psikologis</span>
                      )}
                      {selectedCase.servicesNeeded.rumahAman && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Perlindungan Rumah Aman</span>
                      )}
                      {selectedCase.servicesNeeded.mediasiKeluarga && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Mediasi Keluarga</span>
                      )}
                      {selectedCase.servicesNeeded.bantuanSosialDarurat && (
                        <span className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] font-medium text-stone-700">✓ Bantuan Sosial Darurat</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Uraian Kronologi Kejadian */}
                <div className="space-y-1.5">
                  <span className="font-bold text-stone-900 block text-xs">Uraian Kronologi Kejadian:</span>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl leading-relaxed text-stone-800 text-xs whitespace-pre-wrap">
                    {selectedCase.incidentDescription}
                  </div>
                </div>

                {/* Lembar Catatan Penanganan UPTD PPA */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 block text-xs">Lembar Catatan Penanganan UPTD PPA</span>
                    <span className="text-[11px] text-stone-500 font-mono">{selectedCase.officerNotes.length} catatan tercatat</span>
                  </div>

                  <div className="space-y-2">
                    {selectedCase.officerNotes.map((note) => (
                      <div key={note.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span className="font-bold text-teal-900">{note.officerName} ({note.assignedUnit})</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        <p className="text-stone-800"><strong>Asesmen:</strong> {note.summary}</p>
                        <p className="text-stone-600"><strong>Tindakan:</strong> {note.actionPlan}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddNote} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                    <span className="font-semibold text-stone-800 block text-xs">Tambah Catatan Petugas Baru</span>
                    <input
                      type="text"
                      value={newNoteSummary}
                      onChange={(e) => setNewNoteSummary(e.target.value)}
                      placeholder="Ringkasan hasil kunjungan lapangan atau asesmen kasus..."
                      className="w-full text-xs border border-stone-300 rounded-lg p-2.5 bg-white focus:outline-none focus:border-teal-700"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg cursor-pointer shadow-xs transition-colors"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* DAFTAR KASUS (Single Screen List View - Full Width) */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-3">
                {filteredReports.length > 0 ? (
                  <div className="grid gap-3">
                    {filteredReports.map((item) => {
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCase(item)}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-stone-900 group-hover:text-teal-800 transition-colors">
                                {item.ticketCode}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.urgency === 'darurat' ? 'bg-rose-100 text-rose-800' : item.urgency === 'mendesak' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                              }`}>
                                {item.urgency}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 capitalize">
                                {item.status === 'dilanjutkan' ? 'Kasus Dilanjutkan' : item.status === 'verifikasi' ? 'Verifikasi' : 'Data Masuk'}
                              </span>
                            </div>

                            <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1 max-w-2xl">
                              <h4 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-teal-900 transition-colors">
                                {CATEGORY_LABELS[item.category]?.label || item.category}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                                <div>
                                  <span className="text-stone-400 text-[11px]">Korban:</span> <strong className="text-stone-800">{item.victimName}</strong> ({item.victimGender}, {item.victimAge} th)
                                </div>
                                <div>
                                  <span className="text-stone-400 text-[11px]">Pelapor:</span> <span className="text-stone-700">{item.reporterName} ({item.reporterRelationship})</span>
                                </div>
                              </div>
                              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed pt-1">
                                "{item.incidentDescription}"
                              </p>
                            </div>

                            <div className="flex flex-col items-end justify-between shrink-0 self-stretch sm:self-auto gap-2">
                              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                                <span>Desa {item.desaKelurahan}, Kec. {item.kecamatan}</span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCase(item);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 group-hover:bg-teal-700 text-teal-800 group-hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-teal-200 group-hover:border-teal-700 shadow-2xs"
                              >
                                <span>Buka Rincian Kasus</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-stone-500 space-y-3 bg-white rounded-2xl border border-stone-200">
                    <p className="text-stone-600 font-medium">Tidak ada data pengaduan yang cocok pada kategori ini.</p>
                    {reports.length === 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleRestoreSampleReports}
                          className="px-3.5 py-2 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-900 cursor-pointer shadow-xs transition-colors"
                        >
                          Muat Ulang Data Awal Kasus
                        </button>
                        <button
                          type="button"
                          onClick={handlePullFromAppsScript}
                          className="px-3.5 py-2 bg-stone-100 text-stone-700 rounded-lg font-semibold hover:bg-stone-200 cursor-pointer border border-stone-300 transition-colors"
                        >
                          Tarik Data dari Google Sheets
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BAP Print Modal */}
      {isPrintingBAP && selectedCase && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-stone-900 space-y-6">
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
              <p className="text-[11px] font-mono text-stone-600">Nomor: BAP-PPA/NGK/{new Date().getFullYear()}/{selectedCase.ticketCode}</p>
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
                      <div className="font-bold">{selectedCase.victimName} ({selectedCase.victimGender}, {selectedCase.victimAge} th)</div>
                      <div className="text-stone-600">Alamat: {selectedCase.victimAddress}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-stone-50">Status Alur Penanganan:</td>
                    <td className="p-2 uppercase font-bold text-teal-900">{selectedCase.status}</td>
                  </tr>
                </tbody>
              </table>
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

      {/* Modal Menu Utama (Kirim Data, Tarik Data, Kode GS - Muncul saat tombol Menu Utama diklik) */}
      {isMainMenuOpen && (
        <div className="fixed inset-0 z-70 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div 
            ref={mainMenuRef}
            className="bg-stone-900 text-stone-100 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-700 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center shrink-0">
                  <Table2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Menu Utama Google Sheets</h3>
                  <p className="text-[11px] text-stone-400">Sinkronisasi & Kelola Data Pengaduan Dinas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMainMenuOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Ringkas Apps Script */}
            <div className="text-[11px] bg-stone-950 p-2.5 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 font-medium">Status Webhook Google Sheets</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Siap Sinkron
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono truncate">
                ID Proyek: {DEFAULT_APPS_SCRIPT_PROJECT_ID.slice(0, 18)}...
              </p>
            </div>

            {/* Tombol Aksi: Kirim Data, Tarik Data, Kode GS */}
            <div className="space-y-2 text-xs font-medium">
              <button
                type="button"
                onClick={async () => {
                  await handleSyncAppsScript();
                }}
                disabled={isSyncingAppsScript}
                className="w-full py-2.5 px-3 bg-teal-800 hover:bg-teal-700 active:bg-teal-900 text-white font-semibold rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-xs"
                title="Kirim seluruh data pengaduan saat ini ke Google Sheets"
              >
                <div className="flex items-center gap-2">
                  <Send className={`w-3.5 h-3.5 text-teal-200 ${isSyncingAppsScript ? 'animate-pulse' : ''}`} />
                  <span>{isSyncingAppsScript ? 'Mengirim Data...' : 'Kirim Data ke Sheets'}</span>
                </div>
                <RefreshCw className={`w-3.5 h-3.5 text-teal-300 ${isSyncingAppsScript ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handlePullFromAppsScript();
                }}
                disabled={isSyncingAppsScript}
                className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 active:bg-stone-800 text-teal-200 font-semibold rounded-xl border border-stone-700 flex items-center justify-between cursor-pointer transition-colors"
                title="Tarik data pengaduan terkini dari Google Sheets ke Dasbor"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-teal-300" />
                  <span>Tarik Data Sheets</span>
                </div>
                <span className="text-[10px] text-stone-400">Dari Sheets</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMainMenuOpen(false);
                  setShowAppsScriptModal(true);
                }}
                className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl border border-stone-700 flex items-center justify-between cursor-pointer transition-colors"
                title="Lihat Kode Google Apps Script & Atur URL Web App"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kode GS & Web App URL</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>

            {appsScriptMsg && (
              <div className="p-2.5 bg-stone-950 rounded-xl border border-teal-900/60 text-[11px] text-teal-300 font-medium">
                {appsScriptMsg}
              </div>
            )}

            {activeSheet?.url && (
              <a
                href={activeSheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] text-teal-300 hover:text-teal-200 underline pt-1 font-medium"
              >
                Buka Dokumen Spreadsheet Dinas ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Google Apps Script Modal */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-70 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                  <Table2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Integrasi Google Apps Script Web App (2-Arah)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Bekerja tanpa kendala OAuth atau Origin Mismatch di Cloudflare & Domain Kustom
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* URL Web App Settings */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <label className="block font-bold text-stone-800">
                Web App Exec URL (Webhook Google):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={appsScriptUrl}
                  onChange={(e) => handleSaveAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 border border-stone-300 rounded-lg p-2.5 bg-white font-mono text-[11px] focus:outline-none focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSaveAppsScriptUrl(appsScriptUrl);
                    setAppsScriptMsg('URL Web App berhasil disimpan!');
                  }}
                  className="px-3.5 py-2 bg-teal-800 text-white font-semibold rounded-lg hover:bg-teal-900 cursor-pointer shadow-xs shrink-0"
                >
                  Simpan URL
                </button>
              </div>
              <p className="text-[10px] text-stone-500">
                URL ini dihasilkan dari tombol <strong>Deploy &gt; New deployment &gt; Web app</strong> di Google Apps Script Anda.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <div className="text-teal-950 font-medium">
                Uji Sinkronisasi Sekarang:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncAppsScript}
                  disabled={isSyncingAppsScript}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAppsScript ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAppsScript ? 'Mengirim...' : 'Kirim Data ke Sheets'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePullFromAppsScript}
                  disabled={isSyncingAppsScript}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-teal-900 font-semibold rounded-lg border border-teal-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tarik Data dari Sheets</span>
                </button>
              </div>
            </div>

            {appsScriptMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                {appsScriptMsg}
              </div>
            )}

            {/* Step by step guide */}
            <div className="space-y-2 border-t border-stone-200 pt-3">
              <div className="font-bold text-stone-900 text-xs">
                Panduan Pemasangan Kode di Google Spreadsheet (Sekali Pasang):
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                <li>Buka Spreadsheet rekapan pengaduan Anda di Google Drive.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Hapus kode bawaan kosong, lalu tempel (Paste) seluruh kode di bawah ini.</li>
                <li>Klik tombol <strong>Deploy</strong> (kanan atas) &gt; <strong>New deployment</strong>.</li>
                <li>Pilih jenis <strong>Web app</strong>, ubah <em>Who has access</em> menjadi <strong>Anyone (Siapa saja)</strong>, lalu klik <strong>Deploy</strong>.</li>
                <li>Salin <strong>Web app URL</strong> yang muncul dan tempelkan ke kolom URL di atas.</li>
              </ol>
            </div>

            {/* Code Box with Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">Kode Google Apps Script:</span>
                <button
                  type="button"
                  onClick={handleCopyScriptCode}
                  className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Kode Berhasil Disalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-teal-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48 leading-relaxed">
                {APPS_SCRIPT_TEMPLATE_CODE}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedCase && (
        <div className="fixed inset-0 z-70 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <h3>Konfirmasi Hapus Data Pengaduan</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus pengaduan berkas <strong className="font-mono text-stone-900">{selectedCase.ticketCode}</strong> (Korban: {selectedCase.victimName})?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-1">
              <span className="font-bold block">Sinkronisasi 2-Arah Google Sheets:</span>
              <span>Penghapusan data ini akan langsung menghapus baris kasus dari dashboard dan menyinkronkannya ke Google Sheets jika terhubung.</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteCase}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kasus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
