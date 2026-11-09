export type UrgencyLevel = 'darurat' | 'mendesak' | 'standar';

export type ReportCategory =
  | 'kdrt_fisik'
  | 'kekerasan_seksual'
  | 'psikis_intimidasi'
  | 'penelantaran_anak'
  | 'perkawinan_anak'
  | 'tppo_human_trafficking'
  | 'kbgo_cyberbullying'
  | 'eksploitasi_anak';

export type CaseStatus =
  | 'masuk'
  | 'verifikasi'
  | 'penjangkauan'
  | 'pendampingan'
  | 'selesai';

export type ConfidentialityLevel = 'anonim' | 'rahasia' | 'terbuka';

export type NagekeoKecamatan =
  | 'Aesesa'
  | 'Aesesa Selatan'
  | 'Boawae'
  | 'Mauponggo'
  | 'Nangaroro'
  | 'Keo Tengah'
  | 'Wolowae';

export interface ServiceNeeded {
  medisVisum: boolean;
  bantuanHukum: boolean;
  konselingPsikologis: boolean;
  rumahAman: boolean;
  mediasiKeluarga: boolean;
  bantuanSosialDarurat: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'pelapor' | 'petugas';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  type: 'foto' | 'dokumen' | 'audio';
  url: string;
  size?: string;
}

export interface AssessmentNote {
  id: string;
  officerName: string;
  date: string;
  summary: string;
  actionPlan: string;
  assignedUnit: string;
}

export interface ReportItem {
  id: string;
  ticketCode: string; // e.g. PPA-NGK-2026-7841
  secretPin: string; // e.g. 8412
  createdAt: string;
  updatedAt: string;
  urgency: UrgencyLevel;
  category: ReportCategory;
  status: CaseStatus;
  confidentiality: ConfidentialityLevel;

  // 1. DATA KORBAN
  victimName: string;
  victimGender: 'perempuan' | 'laki-laki';
  victimAge: string;
  victimAddress: string;
  kecamatan: NagekeoKecamatan;
  desaKelurahan: string;
  incidentDate: string;
  incidentTime: string;
  incidentPlace: string;
  incidentDescription: string;

  // 2. DATA PELAKU (jika diketahui)
  perpetratorKnown: boolean;
  perpetratorName: string;
  perpetratorAge: string;
  perpetratorAddress: string;
  perpetratorRelationship: string;

  // 3. DATA PELAPOR
  reporterName: string;
  reporterRelationship: string; // Korban sendiri, Orang tua/Wali, Tetangga, Guru, dll.
  reporterContact: string; // Nomor kontak/WhatsApp agar mudah dihubungi

  // Layanan yang dibutuhkan
  servicesNeeded: ServiceNeeded;

  // Lampiran & Bukti
  attachments: CaseAttachment[];

  // Riwayat Catatan Petugas & Pesan Aman
  officerNotes: AssessmentNote[];
  messages: ChatMessage[];

  // Petugas Penanggung Jawab
  assignedOfficer?: string;
}
