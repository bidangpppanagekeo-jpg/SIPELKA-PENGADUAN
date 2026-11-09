import React, { useState } from 'react';
import { 
  X, Search, Shield, Clock, CheckCircle2, AlertCircle, Send, 
  MapPin, UserCheck, Lock, FileText, ArrowRight 
} from 'lucide-react';
import { ReportItem, CaseStatus } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';

interface CaseTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  onSendMessage: (ticketCode: string, messageText: string) => void;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
  isOpen,
  onClose,
  reports,
  onSendMessage
}) => {
  const [ticketInput, setTicketInput] = useState<string>('PPA-NGK-2026-1042');
  const [pinInput, setPinInput] = useState<string>('4921');
  const [searchedReport, setSearchedReport] = useState<ReportItem | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    const trimmedTicket = ticketInput.trim().toUpperCase();
    const trimmedPin = pinInput.trim();

    const found = reports.find(
      (r) => r.ticketCode.toUpperCase() === trimmedTicket && r.secretPin === trimmedPin
    );

    if (found) {
      setSearchedReport(found);
    } else {
      setSearchError('Kode Tiket atau PIN tidak cocok. Pastikan format sesuai (Contoh: PPA-NGK-2026-1042).');
      setSearchedReport(null);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !searchedReport) return;

    onSendMessage(searchedReport.ticketCode, chatMessage.trim());
    setChatMessage('');

    // Re-sync local view
    const updated = reports.find((r) => r.ticketCode === searchedReport.ticketCode);
    if (updated) {
      setSearchedReport({
        ...updated,
        messages: [
          ...updated.messages,
          {
            id: `msg_${Date.now()}`,
            sender: 'pelapor',
            senderName: searchedReport.confidentiality === 'anonim' ? 'Pelapor (Anonim)' : 'Pelapor',
            text: chatMessage.trim(),
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA'
          }
        ]
      });
    }
  };

  const getStatusStepIndex = (status: CaseStatus): number => {
    switch (status) {
      case 'masuk': return 1;
      case 'verifikasi': return 2;
      case 'penjangkauan': return 3;
      case 'pendampingan': return 4;
      case 'selesai': return 5;
      default: return 1;
    }
  };

  const statusList: { key: CaseStatus; label: string; desc: string }[] = [
    { key: 'masuk', label: 'Laporan Masuk', desc: 'Diterima sistem pusat' },
    { key: 'verifikasi', label: 'Verifikasi Awal', desc: 'Analisis oleh konselor' },
    { key: 'penjangkauan', label: 'Penjangkauan', desc: 'Tim gerak ke lokasi Nagekeo' },
    { key: 'pendampingan', label: 'Pendampingan', desc: 'Medis, hukum & safe house' },
    { key: 'selesai', label: 'Kasus Selesai', desc: 'Pemulihan & pemantauan' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        {/* Header with Mobile Sheet Drag Handle */}
        <div className="bg-teal-900 text-white px-5 sm:px-6 pt-3 sm:pt-4 pb-3.5 sm:pb-4 flex flex-col shrink-0">
          <div className="w-10 h-1 bg-teal-600/60 rounded-full mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold leading-tight">Lacak Kasus & Saluran Rahasia</h2>
                <p className="text-[11px] sm:text-xs text-teal-200">Periksa Progres Penanganan Kasus Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-teal-200 hover:text-white p-2 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Tutup Pelacak"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-stone-50 border border-stone-200 rounded-2xl sm:rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              <span>Masukkan Kode Tiket Pengaduan & PIN Rahasia</span>
            </div>

            <div className="grid sm:grid-cols-12 gap-2.5 sm:gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Contoh: PPA-NGK-2026-1042"
                  className="w-full text-base sm:text-xs font-mono font-medium border border-stone-300 rounded-xl sm:rounded-lg p-3 sm:p-2.5 focus:border-teal-700 focus:outline-none bg-white uppercase min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN 4 Digit"
                  maxLength={4}
                  className="w-full text-base sm:text-xs font-mono font-medium border border-stone-300 rounded-xl sm:rounded-lg p-3 sm:p-2.5 focus:border-teal-700 focus:outline-none bg-white tracking-widest text-center min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3 sm:py-2.5 px-4 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:bg-teal-950 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm min-h-[44px] touch-manipulation"
                >
                  <Search className="w-4 h-4" />
                  <span>Cek Status</span>
                </button>
              </div>
            </div>

            {searchError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{searchError}</span>
              </p>
            )}

            {/* Quick Demo Hint */}
            <div className="pt-1 text-[11px] text-stone-500">
              Uji Coba Lacak Kasus Aktif: <button type="button" onClick={() => { setTicketInput('PPA-NGK-2026-1042'); setPinInput('4921'); }} className="text-teal-800 underline font-medium">PPA-NGK-2026-1042 (PIN: 4921)</button> atau <button type="button" onClick={() => { setTicketInput('PPA-NGK-2026-3390'); setPinInput('6742'); }} className="text-teal-800 underline font-medium">PPA-NGK-2026-3390 (PIN: 6742)</button>
            </div>
          </form>

          {/* Result View */}
          {searchedReport && (
            <div className="space-y-6">
              {/* Status Header Banner */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Nomor Registrasi Kasus:</span>
                    <span className="text-lg font-mono font-bold text-teal-950">
                      {searchedReport.ticketCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 capitalize">
                      {searchedReport.urgency === 'darurat' ? '🚨 Kasus Darurat' : searchedReport.urgency === 'mendesak' ? '⚠️ Kasus Mendesak' : '📋 Kasus Standar'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 capitalize">
                      Status: {searchedReport.status}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-stone-700 mb-3">Alur Penanganan Kasus:</div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {statusList.map((st, idx) => {
                      const currentIdx = getStatusStepIndex(searchedReport.status);
                      const isCompleted = idx + 1 < currentIdx;
                      const isCurrent = idx + 1 === currentIdx;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-teal-800 text-white ring-2 ring-teal-600' : 'bg-stone-200 text-stone-500'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[11px] mt-1 font-medium leading-tight ${isCurrent ? 'text-teal-900 font-bold' : 'text-stone-600'}`}>
                            {st.label}
                          </span>
                          <span className="hidden sm:inline text-[9px] text-stone-400 mt-0.5">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Case Summary Details */}
                <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Bentuk Kekerasan:</span>
                    <span className="font-semibold text-stone-800">{CATEGORY_LABELS[searchedReport.category]?.label}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Wilayah Nagekeo:</span>
                    <span className="font-semibold text-stone-800">Desa {searchedReport.desaKelurahan}, Kec. {searchedReport.kecamatan}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Petugas Pendamping:</span>
                    <span className="font-semibold text-stone-800">{searchedReport.assignedOfficer || 'Tim UPTD PPA Nagekeo'}</span>
                  </div>
                </div>
              </div>

              {/* Catatan Tindakan Petugas */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <FileText className="w-4 h-4 text-teal-800" />
                  <span>Catatan Resmi Penanganan dari Tim UPTD PPA</span>
                </div>

                {searchedReport.officerNotes.length > 0 ? (
                  <div className="space-y-3">
                    {searchedReport.officerNotes.map((note) => (
                      <div key={note.id} className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-100 pb-1.5">
                          <span className="font-bold text-teal-900">{note.officerName}</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed font-normal">
                          <strong>Asesmen:</strong> {note.summary}
                        </p>
                        <p className="text-stone-600 text-[11px] bg-stone-50 p-2 rounded border border-stone-100">
                          <strong>Rencana Intervensi:</strong> {note.actionPlan}
                        </p>
                        <div className="text-[10px] text-teal-800 font-medium">
                          Unit Pelaksana: {note.assignedUnit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Belum ada catatan lapangan. Tim verifikator sedang menganalisis berkas pengaduan.
                  </p>
                )}
              </div>

              {/* Saluran Pesan Aman 2-Arah */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-800" />
                    <span className="text-xs font-bold text-stone-800">Saluran Percakapan Rahasia dengan Konselor</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Terenkripsi & Terlindungi
                  </span>
                </div>

                {/* Chat Stream */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 max-h-56 overflow-y-auto space-y-2.5">
                  {searchedReport.messages && searchedReport.messages.length > 0 ? (
                    searchedReport.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'pelapor' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-stone-400 mb-0.5">{msg.senderName} · {msg.timestamp}</div>
                        <div
                          className={`max-w-[85%] text-xs p-2.5 rounded-xl ${
                            msg.sender === 'pelapor'
                              ? 'bg-teal-800 text-white rounded-tr-none'
                              : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-stone-500">
                      Belum ada percakapan. Anda dapat mengirimkan pertanyaan atau kondisi terkini ke petugas melalui formulir di bawah.
                    </div>
                  )}
                </div>

                {/* Input Chat */}
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tulis pesan rahasia ke konselor..."
                    className="flex-1 text-base sm:text-xs border border-stone-300 rounded-xl sm:rounded-lg px-3.5 py-2.5 focus:border-teal-700 focus:outline-none bg-white min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:bg-teal-950 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 min-h-[44px] touch-manipulation"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden xs:inline">Kirim</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
