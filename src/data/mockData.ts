import { ReportItem, NagekeoKecamatan } from '../types';

export const NAGEKEO_KECAMATAN_DATA: Record<NagekeoKecamatan, string[]> = {
  'Aesesa': ['Danga', 'Mbay I', 'Mbay II', 'Lape', 'Aeramo', 'Waekokak', 'Marapokot', 'Nangadhero', 'Olaia', 'Tendatoto', 'Towak'],
  'Aesesa Selatan': ['Jawakisa', 'Renduteno', 'Rendu Tutubhada', 'Rendu Butowe', 'Rendumawo', 'Wajomara', 'Tadangalu'],
  'Boawae': ['Nangaroro', 'Nataute', 'Roga', 'Regi', 'Gero', 'Kelimado', 'Olegedu', 'Raja', 'Raja Selatan', 'Raja Timur', 'Ratongambo', 'Wea Au'],
  'Mauponggo': ['Mauponggo', 'Keli', 'Woloede', 'Lodaolo', 'Ua', 'Sawu', 'Aelogo', 'Belo', 'Salalejo', 'Lokalaba'],
  'Nangaroro': ['Nangaroro', 'Banggastoba', 'Degasange', 'Tonggo', 'Bidoa', 'Podenura', 'Utetoto', 'Woewutu'],
  'Keo Tengah': ['Witurombaua', 'Mbaenuamuri', 'Udiworowatu', 'Pautola', 'Keliwongo', 'Kotowuji Barat', 'Kotowuji Timur', 'Lewangera'],
  'Wolowae': ['Tendakinde', 'Totomala', 'Anatogu', 'Natatoto', 'Keli']
};

export const EMERGENCY_CONTACTS = [
  {
    id: 'uptd_ppa',
    name: 'UPTD PPA Dinas PMDP3A Kabupaten Nagekeo',
    role: 'Unit Layanan Cepat Penanganan Perempuan & Anak',
    phone: '0822-6635-5313',
    whatsapp: '6282266355313',
    address: 'Kompleks Civic Center, Jl. Soekarno-Hatta, Mbay, Kabupaten Nagekeo, NTT',
    available: '24 Jam Siaga Kasus',
    badge: 'Penanganan Utama',
    isPrimary: true
  },
  {
    id: 'polres_nagekeo',
    name: 'Unit PPA Sat Reskrim Polres Nagekeo',
    role: 'Penyelidikan & Perlindungan Hukum Kepolisian',
    phone: '0821-4567-9110',
    whatsapp: '6282145679110',
    address: 'Jl. Trans Flores, Kel. Aeramo, Kec. Aesesa, Kab. Nagekeo, NTT',
    available: '24 Jam Sentra Pelayanan Kepolisian',
    badge: 'Penegakan Hukum'
  },
  {
    id: 'rsud_aeramo',
    name: 'IGD & Layanan Visum RSUD Aeramo',
    role: 'Pemeriksaan Medis, Visum et Repertum & Pemulihan Fisik',
    phone: '0386-21500',
    whatsapp: '6281337001500',
    address: 'Jl. Trans Flores, Aeramo, Mbay, Kec. Aesesa, Kab. Nagekeo, NTT',
    available: '24 Jam UGD & Ambulans',
    badge: 'Medis & Visum'
  },
  {
    id: 'sapa_nasional',
    name: 'Hotline SAPA 129 KemenPPPA',
    role: 'Layanan Pengaduan Nasional Bebas Pulsa',
    phone: '129',
    whatsapp: '628111129129',
    address: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak RI',
    available: '24 Jam Setiap Hari',
    badge: 'Hotline Bebas Pulsa'
  }
];

export const CATEGORY_LABELS: Record<string, { label: string; desc: string; icon: string; legalRef: string }> = {
  kdrt_fisik: {
    label: 'Kekerasan Fisik / KDRT',
    desc: 'Pemukulan, penganiayaan, melukai, atau tindakan fisik lain yang membahayakan tubuh.',
    icon: 'ShieldAlert',
    legalRef: 'UU No. 23 Th 2004 ttg Penghapusan KDRT'
  },
  kekerasan_seksual: {
    label: 'Kekerasan & Pelecehan Seksual',
    desc: 'Pelecehan fisik/non-fisik, pencabulan, perkosaan, pemaksaan seksual terhadap perempuan atau anak.',
    icon: 'AlertTriangle',
    legalRef: 'UU No. 12 Th 2022 ttg Tindak Pidana Kekerasan Seksual (TPKS)'
  },
  psikis_intimidasi: {
    label: 'Kekerasan Psikis & Teror',
    desc: 'Ancaman kekerasan, penghinaan martabat, teror terus-menerus yang menimbulkan trauma atau rasa takut parah.',
    icon: 'HeartHandshake',
    legalRef: 'Pasal 7 UU No. 23 Th 2004'
  },
  penelantaran_anak: {
    label: 'Penelantaran Anak & Keluarga',
    desc: 'Tidak memberi nafkah hidup, perawatan medis, atau pendidikan dasar pada anak/keluarga yang wajib dinafkahi.',
    icon: 'UserX',
    legalRef: 'Pasal 9 UU No. 23 Th 2004 & UU Perlindungan Anak'
  },
  perkawinan_anak: {
    label: 'Pencegahan Perkawinan Anak',
    desc: 'Pemaksaan perkawinan pada anak di bawah usia 19 tahun demi tradisi atau desakan ekonomi.',
    icon: 'Users',
    legalRef: 'UU No. 16 Th 2019 Perubahan UU Perkawinan'
  },
  tppo_human_trafficking: {
    label: 'Perdagangan Orang (TPPO)',
    desc: 'Perekrutan, pengiriman tenaga kerja ilegal tanpa izin, eksploitasi migran atau pekerja migran anak/perempuan.',
    icon: 'Briefcase',
    legalRef: 'UU No. 21 Th 2007 ttg Pemberantasan TPPO'
  },
  kbgo_cyberbullying: {
    label: 'Kekerasan Berbasis Gender Online',
    desc: 'Penyebaran foto/video pribadi tanpa izin, ancaman pemerasan konten intim, atau perundungan siber.',
    icon: 'Smartphone',
    legalRef: 'UU TPKS & UU ITE'
  },
  eksploitasi_anak: {
    label: 'Eksploitasi & Pekerja Anak',
    desc: 'Mempekerjakan anak pada pekerjaan berbahaya, mengemis, atau pemanfaatan ekonomi tidak wajar.',
    icon: 'Baby',
    legalRef: 'UU No. 35 Th 2014 ttg Perlindungan Anak'
  }
};

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep_001',
    ticketCode: 'PPA-NGK-2026-1042',
    secretPin: '4921',
    createdAt: '2026-11-06T09:30:00Z',
    updatedAt: '2026-11-08T14:15:00Z',
    urgency: 'darurat',
    category: 'kdrt_fisik',
    status: 'pendampingan',
    confidentiality: 'rahasia',

    // Data Korban
    victimName: 'Ibu Maria T. (Inisial M.T.)',
    victimGender: 'perempuan',
    victimAge: '32',
    victimAddress: 'Dusun II dekat Pasar Danga, Kelurahan Danga, Kec. Aesesa',
    kecamatan: 'Aesesa',
    desaKelurahan: 'Danga',
    incidentDate: '2026-11-05',
    incidentTime: '21:30 WITA',
    incidentPlace: 'Rumah Tinggal Keluarga',
    incidentDescription: 'Korban mengalami kekerasan fisik pemukulan berulang oleh pasangan dengan ancaman senjata tajam. Korban mengungsi sementara ke rumah kerabat, mengalami memar di bahu dan pelipis kiri. Memerlukan perlindungan mendesak dan visum et repertum di RSUD Aeramo.',

    // Data Pelaku
    perpetratorKnown: true,
    perpetratorName: 'Y. B. (Nama Inisial)',
    perpetratorAge: '36',
    perpetratorAddress: 'Kelurahan Danga, Kec. Aesesa, Kab. Nagekeo',
    perpetratorRelationship: 'Suami / Pasangan',

    // Data Pelapor
    reporterName: 'M. Rosalina',
    reporterRelationship: 'Kakak Kandung Korban',
    reporterContact: '0813-5321-9981',

    servicesNeeded: {
      medisVisum: true,
      bantuanHukum: true,
      konselingPsikologis: true,
      rumahAman: true,
      mediasiKeluarga: false,
      bantuanSosialDarurat: false
    },
    attachments: [],
    officerNotes: [
      {
        id: 'note_1',
        officerName: 'Maria Yasinta, S.Sos (Konselor Dinas PMDP3A)',
        date: '2026-11-06 11:00 WITA',
        summary: 'Tim Reaksi Cepat UPTD PPA berkoordinasi dengan Bhabinkamtibmas Kelurahan Danga dan mendampingi korban ke RSUD Aeramo untuk visum et repertum.',
        actionPlan: 'Penempatan sementara di Safe House Kabupaten Nagekeo, penjadwalan konseling trauma healing serta permohonan Surat Tanda Penerimaan Laporan (STPL) di Unit PPA Satreskrim Polres Nagekeo.',
        assignedUnit: 'UPTD PPA & Polres Nagekeo'
      }
    ],
    messages: [
      {
        id: 'msg_1',
        sender: 'pelapor',
        senderName: 'Pelapor (Keluarga)',
        text: 'Selamat pagi Ibu Petugas, kondisi adik saya sekarang sudah lebih tenang setelah kemarin dijemput tim UPTD PPA. Terima kasih banyak atas respon cepatnya.',
        timestamp: '2026-11-07 08:20 WITA'
      },
      {
        id: 'msg_2',
        sender: 'petugas',
        senderName: 'Petugas UPTD PPA Nagekeo',
        text: 'Puji Tuhan. Hari ini tim psikolog klinis Dinas PMDP3A akan mendampingi sesi pemulihan awal di Rumah Aman. Segala kebutuhan perlindungan hukum ke Polres juga sudah kami siapkan.',
        timestamp: '2026-11-07 09:10 WITA'
      }
    ],
    assignedOfficer: 'Maria Yasinta, S.Sos'
  },
  {
    id: 'rep_002',
    ticketCode: 'PPA-NGK-2026-2187',
    secretPin: '3150',
    createdAt: '2026-11-07T14:40:00Z',
    updatedAt: '2026-11-08T10:00:00Z',
    urgency: 'mendesak',
    category: 'perkawinan_anak',
    status: 'penjangkauan',
    confidentiality: 'rahasia',

    // Data Korban
    victimName: 'Anak A.M.',
    victimGender: 'perempuan',
    victimAge: '15',
    victimAddress: 'RT 04 Dusun Raja, Desa Raja, Kec. Boawae',
    kecamatan: 'Boawae',
    desaKelurahan: 'Raja',
    incidentDate: '2026-11-06',
    incidentTime: '10:00 WITA',
    incidentPlace: 'Lingkungan Tempat Tinggal',
    incidentDescription: 'Siswi kelas IX SMP direncanakan dinikahkan secara adat oleh keluarga besar karena alasan ekonomi dan perantauan orang tua. Siswi menangis di sekolah dan memohon pertolongan agar dapat melanjutkan sekolah.',

    // Data Pelaku
    perpetratorKnown: true,
    perpetratorName: 'Pihak Keluarga Tertentu',
    perpetratorAge: '48',
    perpetratorAddress: 'Desa Raja, Kec. Boawae',
    perpetratorRelationship: 'Orang Tua / Wali Keluarga',

    // Data Pelapor
    reporterName: 'Bapak Thomas N.',
    reporterRelationship: 'Guru Konseling Sekolah',
    reporterContact: '0822-3810-7712',

    servicesNeeded: {
      medisVisum: false,
      bantuanHukum: true,
      konselingPsikologis: true,
      rumahAman: false,
      mediasiKeluarga: true,
      bantuanSosialDarurat: true
    },
    attachments: [],
    officerNotes: [
      {
        id: 'note_2',
        officerName: 'Yohanes B. Dapa, SH (Advokasi Anak)',
        date: '2026-11-08 09:30 WITA',
        summary: 'Koordinasi dengan Pemerintah Kecamatan Boawae, Kepala Desa Raja, serta tokoh adat setempat untuk mediasi restoratif perlindungan hak pendidikan anak sesuai UU No. 16/2019.',
        actionPlan: 'Kunjungan penjangkauan home visit bersama tim terpadu P3A Nagekeo ke keluarga pada tanggal 10 November 2026.',
        assignedUnit: 'Bidang Perlindungan Anak Dinas PMDP3A Nagekeo'
      }
    ],
    messages: [
      {
        id: 'msg_3',
        sender: 'petugas',
        senderName: 'Petugas Advokasi Dinas PMDP3A',
        text: 'Salam hormat Bapak Guru. Laporan sudah kami registrasi dan Kepala Bidang PPPA telah menjadwalkan mediasi persuasif bersama Camat Boawae agar hak sekolah anak tetap terlindungi.',
        timestamp: '2026-11-08 10:00 WITA'
      }
    ],
    assignedOfficer: 'Yohanes B. Dapa, SH'
  },
  {
    id: 'rep_003',
    ticketCode: 'PPA-NGK-2026-3390',
    secretPin: '6742',
    createdAt: '2026-11-08T11:20:00Z',
    updatedAt: '2026-11-08T12:00:00Z',
    urgency: 'darurat',
    category: 'kekerasan_seksual',
    status: 'verifikasi',
    confidentiality: 'anonim',

    // Data Korban
    victimName: 'Penyintas Anak (Inisial K.N.)',
    victimGender: 'perempuan',
    victimAge: '16',
    victimAddress: 'Desa Keli, Kec. Mauponggo, Kab. Nagekeo',
    kecamatan: 'Mauponggo',
    desaKelurahan: 'Keli',
    incidentDate: '2026-11-07',
    incidentTime: '17:45 WITA',
    incidentPlace: 'Jalan Setapak Perkebunan Cengkeh',
    incidentDescription: 'Korban mengalami pelecehan dan kekerasan seksual saat pulang dari kegiatan les sore hari oleh oknum pemuda sekitar desa. Korban ketakutan dan mengurung diri di kamar, menolak makan.',

    // Data Pelaku
    perpetratorKnown: true,
    perpetratorName: 'Pemuda Warga Sekitar Desa',
    perpetratorAge: '22',
    perpetratorAddress: 'Desa Keli, Mauponggo',
    perpetratorRelationship: 'Tetangga / Kenalan',

    // Data Pelapor
    reporterName: 'Penyintas (Nama Dirahasiakan)',
    reporterRelationship: 'Korban Sendiri',
    reporterContact: '0812-4410-xxxx',

    servicesNeeded: {
      medisVisum: true,
      bantuanHukum: true,
      konselingPsikologis: true,
      rumahAman: true,
      mediasiKeluarga: false,
      bantuanSosialDarurat: false
    },
    attachments: [],
    officerNotes: [
      {
        id: 'note_3',
        officerName: 'Siti Rahmawati, S.Tr.Sos',
        date: '2026-11-08 11:45 WITA',
        summary: 'Verifikasi laporan anonim mendesak. Kontak via chat rahasia sistem sedang diupayakan untuk menjamin keamanan korban sebelum pengiriman pendamping UPTD PPA ke Mauponggo.',
        actionPlan: 'Penetapan status prioritas DARURAT, pendampingan visum psikologis dan koordinasi dengan Polsek Mauponggo.',
        assignedUnit: 'Tim Reaksi Cepat UPTD PPA Nagekeo'
      }
    ],
    messages: [
      {
        id: 'msg_4',
        sender: 'pelapor',
        senderName: 'Korban (Anonim)',
        text: 'Tolong saya sangat takut kalau orang di desa tahu. Bisakah petugas datang tanpa seragam dinas?',
        timestamp: '2026-11-08 11:25 WITA'
      },
      {
        id: 'msg_5',
        sender: 'petugas',
        senderName: 'Konselor UPTD PPA Nagekeo',
        text: 'Jangan khawatir adikku, kerahasiaanmu adalah komitmen mutlak kami. Petugas konselor kami akan datang dengan pakaian sipil biasa menggunakan mobil operasional non-logo. Kamu aman bersama kami.',
        timestamp: '2026-11-08 11:32 WITA'
      }
    ],
    assignedOfficer: 'Siti Rahmawati, S.Tr.Sos'
  }
];
