import { ReportItem } from '../types';

export interface ChatbotSimulationResult {
  replyText: string;
  intent: 'menu' | 'form_guide' | 'emergency' | 'services' | 'office' | 'status' | 'lapor_direct' | 'fallback';
  isComplaintCreated: boolean;
  generatedTicketCode?: string;
  officerAlertPreview?: string;
}

const STATUS_LABEL_MAP: Record<string, string> = {
  masuk: 'Masuk (Menunggu Verifikasi Petugas)',
  verifikasi: 'Terverifikasi oleh Petugas UPTD PPA',
  penjangkauan: 'Tahap Penjangkauan / Asesmen Lapangan',
  pendampingan: 'Sedang Dalam Pendampingan Aktif',
  selesai: 'Penanganan Selesai'
};

export function simulateWhatsAppChatbotReply(
  rawMessage: string,
  senderName: string = 'Warga',
  knownReports: ReportItem[] = []
): ChatbotSimulationResult {
  const msg = rawMessage.trim();
  const upper = msg.toUpperCase();
  const safeName = senderName.trim() || 'Warga';

  // 1. Cek format LAPOR#NamaKorban#KecamatanDesa#Kronologi
  if (upper.startsWith('LAPOR#')) {
    const parts = msg.split('#').map((p) => p.trim());
    const victimName = parts[1] || '';
    const location = parts[2] || '';
    const chronology = parts.slice(3).join(' ').trim();

    if (!victimName || !location || !chronology) {
      return {
        intent: 'lapor_direct',
        isComplaintCreated: false,
        replyText:
          `Format *LAPOR#* belum lengkap.\n\n` +
          `Gunakan format berikut (pisahkan dengan tanda *#*):\n` +
          `*LAPOR#Nama Korban#Kecamatan/Desa#Kronologi Singkat*\n\n` +
          `Contoh:\n` +
          `LAPOR#Mawar (15 th)#Desa Danga, Kec. Aesesa#Mengalami kekerasan fisik di rumah sejak kemarin malam.`
      };
    }

    const year = new Date().getFullYear();
    const random6 = String(Math.floor(100000 + Math.random() * 900000));
    const ticketCode = `PPA-NGK-${year}-${random6}`;

    const officerAlertPreview =
      `*PENGADUAN MASUK VIA CHATBOT WA*\n` +
      `Tiket: ${ticketCode}\n` +
      `Pelapor WA: ${safeName}\n` +
      `Korban: ${victimName}\n` +
      `Lokasi: ${location}\n` +
      `Kronologi: ${chronology}\n\n` +
      `Data otomatis tercatat di Spreadsheet & siap ditarik ke Dasbor UPTD PPA.`;

    return {
      intent: 'lapor_direct',
      isComplaintCreated: true,
      generatedTicketCode: ticketCode,
      officerAlertPreview,
      replyText:
        `Terima kasih, laporan Anda telah *TERCATAT RESMI* di sistem SI-PELKA UPTD PPA Kab. Nagekeo.\n\n` +
        `No. Tiket: *${ticketCode}*\n` +
        `Lokasi: ${location}\n\n` +
        `Petugas piket UPTD PPA (0822-6635-5313) telah menerima notifikasi otomatis dan akan segera menindaklanjuti.\n\n` +
        `Ketik *STATUS ${ticketCode}* kapan saja untuk memantau progres penanganan, atau ketik *2* jika membutuhkan pertolongan darurat segera.`
    };
  }

  // 2. Cek STATUS <KodeTiket>
  if (upper.startsWith('STATUS')) {
    const ticketMatch = upper.match(/PPA-NGK-\d{4}-\d{4,8}/i);
    if (!ticketMatch) {
      return {
        intent: 'status',
        isComplaintCreated: false,
        replyText:
          `Untuk mengecek perkembangan laporan, kirimkan kode tiket Anda dengan format:\n` +
          `*STATUS PPA-NGK-2026-123456*\n\n` +
          `Atau ketik *MENU* untuk kembali ke daftar layanan.`
      };
    }

    const ticketCode = ticketMatch[0].toUpperCase();
    const found = knownReports.find((r) => r.ticketCode.toUpperCase() === ticketCode);

    if (found) {
      const statusText = STATUS_LABEL_MAP[found.status] || found.status;
      return {
        intent: 'status',
        isComplaintCreated: false,
        replyText:
          `*INFO STATUS PENGADUAN*\n` +
          `No. Tiket: *${found.ticketCode}*\n` +
          `Status Terkini: *${statusText}*\n\n` +
          `Demi kerahasiaan korban, detail identitas tidak ditampilkan di chat otomatis. Hubungi petugas piket 0822-6635-5313 bila perlu konsultasi lanjutan.`
      };
    }

    return {
      intent: 'status',
      isComplaintCreated: false,
      replyText:
        `Kode tiket *${ticketCode}* belum ditemukan di daftar kasus aktif saat ini.\n` +
        `Pastikan penulisan kode tiket sudah benar (contoh: *STATUS PPA-NGK-2026-896338*) atau ketik *MENU* untuk bantuan lainnya.`
    };
  }

  // 3. Menu Angka & Kata Kunci
  if (msg === '1' || upper === 'LAPOR' || upper === 'FORM' || upper === 'FORMULIR') {
    return {
      intent: 'form_guide',
      isComplaintCreated: false,
      replyText:
        `*CARA MELAPOR KE UPTD PPA NAGEKEO*\n\n` +
        `1) *Lapor Langsung via WhatsApp ini:*\n` +
        `Kirim pesan dengan format:\n` +
        `*LAPOR#Nama Korban#Desa/Kecamatan#Kronologi Kejadian*\n\n` +
        `2) *Lapor Rahasia via Formulir Web SI-PELKA:*\n` +
        `Isi formulir lengkap (termasuk opsi Anonim & kebutuhan Rumah Aman/Visum) melalui portal resmi SI-PELKA Nagekeo.\n\n` +
        `Semua laporan masuk dijamin kerahasiaannya & bebas biaya. Ketik *MENU* untuk kembali.`
    };
  }

  if (msg === '2' || upper.includes('DARURAT') || upper.includes('TOLONG') || upper.includes('BAHAYA')) {
    return {
      intent: 'emergency',
      isComplaintCreated: false,
      replyText:
        `*KONTAK DARURAT 24 JAM — KAB. NAGEKEO*\n\n` +
        `Jika Anda atau korban berada dalam ancaman bahaya saat ini:\n` +
        `• Segera menjauh ke tempat aman (tetangga/kantor desa/polsek terdekat).\n` +
        `• Hubungi *Hotline UPTD PPA*: *0822-6635-5313* (Telepon / WA)\n` +
        `• *Polres Nagekeo / Unit PPA*: *110*\n` +
        `• *IGD RSUD Aeramo*: untuk pertolongan medis & visum segera.\n\n` +
        `Anda juga bisa langsung mengetik:\n` +
        `*LAPOR#Nama Korban#Lokasi Sekarang#Kondisi Darurat*`
    };
  }

  if (msg === '3' || upper.includes('LAYANAN') || upper.includes('GRATIS') || upper.includes('BANTUAN')) {
    return {
      intent: 'services',
      isComplaintCreated: false,
      replyText:
        `*LAYANAN GRATIS UPTD PPA DINAS PMDP3A NAGEKEO*\n\n` +
        `Seluruh layanan pendampingan *TIDAK DIPUNGUT BIAYA (GRATIS)*:\n` +
        `1. Pengaduan & Penjangkauan Kasus Cepat\n` +
        `2. Pendampingan Medis & Fasilitasi Visum et Repertum\n` +
        `3. Konseling Psikologis & Pemulihan Trauma\n` +
        `4. Pendampingan / Advokasi Hukum (Kepolisian & Pengadilan)\n` +
        `5. Rumah Aman (Safe House) bagi korban terancam\n\n` +
        `Ketik *1* untuk cara melapor atau *MENU* untuk kembali.`
    };
  }

  if (msg === '4' || upper.includes('ALAMAT') || upper.includes('KANTOR') || upper.includes('LOKASI')) {
    return {
      intent: 'office',
      isComplaintCreated: false,
      replyText:
        `*ALAMAT KANTOR UPTD PPA KABUPATEN NAGEKEO*\n\n` +
        `Dinas PMDP3A / UPTD Perlindungan Perempuan dan Anak\n` +
        `Jl. Soekarno-Hatta, Kompleks Civic Center, Mbay\n` +
        `Kabupaten Nagekeo, Nusa Tenggara Timur\n\n` +
        `• Jam Layanan Kantor: Senin–Jumat, 08.00–16.00 WITA\n` +
        `• Hotline Pengaduan 24 Jam: *0822-6635-5313*\n` +
        `• Email Resmi: bidangpppanagekeo@gmail.com\n\n` +
        `Ketik *MENU* untuk kembali ke menu utama.`
    };
  }

  // 4. Salam & Menu Utama
  const greetings = ['MENU', 'HALO', 'HAI', 'HI', 'HELLO', 'MULAI', 'START', 'INFO', 'P', 'ASSALAMUALAIKUM', 'SELAMAT'];
  const isGreeting = greetings.some((g) => upper === g || upper.startsWith(`${g} `));

  return {
    intent: isGreeting ? 'menu' : 'fallback',
    isComplaintCreated: false,
    replyText:
      `Halo *${safeName}*, selamat datang di *Layanan Otomatis SI-PELKA UPTD PPA Kabupaten Nagekeo* (Dinas PMDP3A).\n\n` +
      `Silakan balas dengan *ANGKA* atau *PERINTAH* berikut:\n` +
      `• *1* — Cara Lapor Pengaduan Kekerasan\n` +
      `• *2* — Bantuan & Kontak Darurat 24 Jam\n` +
      `• *3* — Daftar Layanan Gratis UPTD PPA\n` +
      `• *4* — Alamat Kantor & Jam Operasional\n` +
      `• *STATUS <KodeTiket>* — Cek status pengaduan\n` +
      `• *LAPOR#NamaKorban#Lokasi#Kronologi* — Lapor langsung via WA\n\n` +
      `_Identitas pelapor & korban dilindungi penuh sesuai ketentuan kerahasiaan UPTD PPA._`
  };
}
