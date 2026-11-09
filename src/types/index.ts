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

export type ReporterType =
  | 'korban'
  | 'keluarga_kerabat'
  | 'saksi_warga'
  | 'tokoh_masyarakat_guru';

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
  reporterType: ReporterType;
  confidentiality: ConfidentialityLevel;
  
  // Identitas Pelapor / Korban
  reporterName: string;
  reporterContact?: string;
  victimName: string;
  victimAgeGroup: 'anak_dibawah_12' | 'remaja_12_17' | 'dewasa_18_59' | 'lansia_60_keatas';
  victimGender: 'perempuan' | 'laki-laki_anak';
  
  // Lokasi & Kejadian di Nagekeo
  kecamatan: NagekeoKecamatan;
  desaKelurahan: string;
  incidentLocationDetail: string;
  incidentDate: string;
  incidentDescription: string;
  
  // Pelaku
  perpetratorRelationship: 'suami_istri' | 'orang_tua_wali' | 'kerabat_keluarga' | 'tetangga_kenalan' | 'orang_tak_dikenal' | 'majikan_atasan';
  perpetratorNameMasked?: string;
  
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
