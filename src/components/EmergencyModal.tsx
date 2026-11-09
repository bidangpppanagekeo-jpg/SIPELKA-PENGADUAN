import React from 'react';
import { X, PhoneCall, MessageCircle, MapPin, Clock, ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/mockData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-rose-200 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        {/* Header with Mobile Drag Handle */}
        <div className="bg-rose-900 text-white px-5 sm:px-6 pt-3 sm:pt-4 pb-3.5 sm:pb-4 flex flex-col shrink-0">
          <div className="w-10 h-1 bg-rose-700 rounded-full mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-800 flex items-center justify-center text-rose-200 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold leading-tight">Hotline Darurat 24 Jam Nagekeo</h2>
                <p className="text-[11px] sm:text-xs text-rose-200">Bantuan Segera Penanganan Perempuan & Anak</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-rose-200 hover:text-white p-2 rounded-lg hover:bg-rose-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Tutup Hotline"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Emergency Alert Note */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <span className="font-bold block">Jika Anda atau Anak Anda Sedang Dalam Bahaya Nyata:</span>
              <p className="leading-relaxed">
                Segera hubungi nomor darurat di bawah ini atau datangi Polsek/Puskesmas terdekat di wilayah kecamatan Anda. Anda berhak mendapatkan perlindungan pengamanan segera dan tempat tinggal aman (Safe House).
              </p>
            </div>
          </div>

          {/* Contact Cards List */}
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 rounded-xl border text-xs transition-all ${
                  contact.isPrimary
                    ? 'border-teal-700 bg-teal-50/50 shadow-xs ring-1 ring-teal-700'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{contact.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {contact.badge}
                      </span>
                    </div>
                    <p className="text-stone-600 mt-0.5">{contact.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{contact.available}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-stone-500 mb-3 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400 mt-0.5" />
                  <span>{contact.address}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                    className="flex-1 min-w-[140px] px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Telepon ({contact.phone})</span>
                  </a>

                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=Halo%20saya%20membutuhkan%20bantuan%20layanan%20pengaduan%20perempuan%20dan%20anak%20Kabupaten%20Nagekeo`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Siaga</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Safety Tips */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Panduan Keselamatan Saat Krisis:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 leading-relaxed">
              <li>Cari tempat berlindung sementara (rumah tetangga, keluarga yang dipercaya, atau balai desa).</li>
              <li>Jangan menghapus riwayat pesan ancaman, foto luka, atau rekaman suara sebagai barang bukti hukum.</li>
              <li>Jika mengalami luka fisik, segera kunjungi UGD RSUD Aeramo untuk mendapatkan penanganan medis dan penerbitan berkas visum.</li>
              <li>Gunakan tombol <strong>"Keluar Cepat"</strong> di kanan atas jika situasi mendadak berbahaya.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
