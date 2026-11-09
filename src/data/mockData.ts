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
    phone: '0812-3987-1290',
    whatsapp: '6281239871290',
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
    reporterType: 'keluarga_kerabat',
    confidentiality: 'rahasia',
    reporterName: 'M. Rosalina (Kakak Kandung)',
    reporterContact: '0813-5321-xxxx',
    victimName: 'Ibu M.T. (Inisial)',
    victimAgeGroup: 'dewasa_18_59',
    victimGender: 'perempuan',
    kecamatan: 'Aesesa',
    desaKelurahan: 'Danga',
    incidentLocationDetail: 'Kediaman keluarga dekat Pasar Danga Mbay',
    incidentDate: '2026-11-05',
    incidentDescription: 'Korban mengalami kekerasan fisik berulang oleh pasangan dengan ancaman senjata tajam. Korban mengungsi sementara ke rumah orang tua, mengalami memar di bahu dan pelipis kiri. Memerlukan perlindungan mendesak dan visum et repertum di RSUD Aeramo.',
    perpetratorRelationship: 'suami_istri',
    perpetratorNameMasked: 'Sdr. Y.B.',
    servicesNeeded: {
      medisVisum: true,
      bantuanHukum: true,
      konselingPsikologis: true,
      rumahAman: true,
      mediasiKeluarga: false,
      bantuanSosialDarurat: false
    },
    attachments: [
      {
        id: 'att_1',
        name: 'Dokumentasi_Luka_Bahu.jpg',
        type: 'foto',
        url: '/src/assets/images/nagekeo_safe_center_1794205236918.jpg',
        size: '1.4 MB'
      }
    ],
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
    reporterType: 'tokoh_masyarakat_guru',
    confidentiality: 'rahasia',
    reporterName: 'Bapak Thomas N. (Guru Konseling)',
    reporterContact: '0822-3810-xxxx',
    victimName: 'Anak A.M. (15 Tahun)',
    victimAgeGroup: 'remaja_12_17',
    victimGender: 'perempuan',
    kecamatan: 'Boawae',
    desaKelurahan: 'Raja',
    incidentLocationDetail: 'Wilayah Desa Raja, Kecamatan Boawae',
    incidentDate: '2026-11-06',
    incidentDescription: 'Siswi kelas IX SMP direncanakan dinikahkan secara adat oleh keluarga besar karena alasan ekonomi dan perantauan orang tua. Siswi menangis di sekolah dan memohon pertolongan agar dapat melanjutkan sekolah.',
    perpetratorRelationship: 'orang_tua_wali',
    perpetratorNameMasked: 'Pihak Keluarga Tertentu',
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
    reporterType: 'korban',
    confidentiality: 'anonim',
    reporterName: 'Penyintas (Nama Dirahasiakan)',
    victimName: 'Penyintas Anak (16 Tahun)',
    victimAgeGroup: 'remaja_12_17',
    victimGender: 'perempuan',
    kecamatan: 'Mauponggo',
    desaKelurahan: 'Keli',
    incidentLocationDetail: 'Jalan setapak perkebunan cengkeh Desa Keli',
    incidentDate: '2026-11-07',
    incidentDescription: 'Korban mengalami pelecehan dan kekerasan seksual saat pulang dari kegiatan les sore hari oleh oknum pemuda sekitar desa. Korban ketakutan dan mengurung diri di kamar, menolak makan.',
    perpetratorRelationship: 'tetangga_kenalan',
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
  },
  {
    id: 'rep_004',
    ticketCode: 'PPA-NGK-2026-4412',
    secretPin: '8821',
    createdAt: '2026-11-05T16:00:00Z',
    updatedAt: '2026-11-07T17:30:00Z',
    urgency: 'standar',
    category: 'penelantaran_anak',
    status: 'selesai',
    reporterType: 'saksi_warga',
    confidentiality: 'terbuka',
    reporterName: 'Ibu Elisabeth B. (Kader Posyandu)',
    reporterContact: '0812-3920-xxxx',
    victimName: 'Dua Balita Bersaudara (2 & 4 Th)',
    victimAgeGroup: 'anak_dibawah_12',
    victimGender: 'laki-laki_anak',
    kecamatan: 'Nangaroro',
    desaKelurahan: 'Tonggo',
    incidentLocationDetail: 'Dusun II, Desa Tonggo, Kecamatan Nangaroro',
    incidentDate: '2026-10-28',
    incidentDescription: 'Orang tua meninggalkan balita tanpa persediaan makanan yang cukup selama berhari-hari. Warga sekitar bergantian memberi makan namun butuh penanganan dinas untuk bantuan nutrisi dan mediasi tanggung jawab pengasuhan.',
    perpetratorRelationship: 'orang_tua_wali',
    servicesNeeded: {
      medisVisum: false,
      bantuanHukum: false,
      konselingPsikologis: true,
      rumahAman: false,
      mediasiKeluarga: true,
      bantuanSosialDarurat: true
    },
    attachments: [],
    officerNotes: [
      {
        id: 'note_4',
        officerName: 'Fransiskus Xaverius, S.IP',
        date: '2026-11-07 15:00 WITA',
        summary: 'Pekerja Sosial Dinas PMDP3A Nagekeo telah melakukan asesmen komprehensif. Nenek dari pihak ibu bersedia menjadi wali asuh yang sah. Bantuan Permakanan dan PKH telah disalurkan.',
        actionPlan: 'Pemantauan berkala bulanan oleh Kader D-SAPA (Desa Sahabat Perempuan dan Anak) Nangaroro.',
        assignedUnit: 'Seksi Rehabilitasi Sosial & UPTD PPA'
      }
    ],
    messages: [],
    assignedOfficer: 'Fransiskus Xaverius, S.IP'
  }
];
