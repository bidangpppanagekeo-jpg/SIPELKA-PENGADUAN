import { ReportItem, CaseStatus, UrgencyLevel, NagekeoKecamatan } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';

export const SHEETS_STORAGE_KEY = 'sipelka_nagekeo_active_spreadsheet';

export interface ActiveSpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  lastSyncedAt?: string;
  syncedRowCount?: number;
}

export const REPORT_SHEET_HEADERS = [
  'No. Tiket',
  'Tanggal Lapor',
  'Tingkat Kegawatan',
  'Kategori Kasus',
  'Status Penanganan',
  'Nama Korban',
  'Jenis Kelamin Korban',
  'Usia Korban',
  'Alamat Lengkap Korban',
  'Kecamatan',
  'Desa / Kelurahan',
  'Waktu Kejadian',
  'Tempat Kejadian',
  'Uraian Kasus / Kronologi',
  'Pelaku Dikenal',
  'Nama Terduga Pelaku',
  'Usia Pelaku',
  'Hubungan Pelaku',
  'Alamat Pelaku',
  'Nama Pelapor',
  'Hubungan Pelapor',
  'No. Kontak / WA Pelapor',
  'Kerahasiaan Identitas',
  'Kebutuhan Layanan',
  'Catatan Penanganan UPTD'
];

/**
 * Convert a ReportItem into a spreadsheet row array
 */
export const reportItemToRow = (report: ReportItem): (string | number)[] => {
  const neededServices = Object.entries(report.servicesNeeded)
    .filter(([_, v]) => v)
    .map(([k]) => {
      switch (k) {
        case 'medisVisum': return 'Visum RSUD Aeramo';
        case 'rumahAman': return 'Rumah Aman (Safe House)';
        case 'bantuanHukum': return 'Advokasi Polres Nagekeo';
        case 'konselingPsikologis': return 'Konseling / Trauma Healing';
        case 'mediasiKeluarga': return 'Mediasi Keluarga';
        case 'bantuanSosialDarurat': return 'Bansos Perlindungan PMDP3A';
        default: return k;
      }
    })
    .join('; ');

  const latestOfficerNote = report.officerNotes && report.officerNotes.length > 0
    ? report.officerNotes[report.officerNotes.length - 1].summary
    : 'Menunggu telaah petugas UPTD PPA';

  return [
    report.ticketCode,
    new Date(report.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    report.urgency.toUpperCase(),
    CATEGORY_LABELS[report.category]?.label || report.category,
    report.status.toUpperCase(),
    report.victimName,
    report.victimGender === 'perempuan' ? 'Perempuan' : 'Laki-Laki (Anak)',
    report.victimAge,
    report.victimAddress,
    report.kecamatan,
    report.desaKelurahan,
    `${report.incidentDate} (${report.incidentTime || '-'})`,
    report.incidentPlace || '-',
    report.incidentDescription,
    report.perpetratorKnown ? 'Ya, Dikenal' : 'Tidak Dikenal',
    report.perpetratorName || '-',
    report.perpetratorAge || '-',
    report.perpetratorRelationship || '-',
    report.perpetratorAddress || '-',
    report.reporterName,
    report.reporterRelationship,
    report.reporterContact || '-',
    report.confidentiality.toUpperCase(),
    neededServices || '-',
    latestOfficerNote
  ];
};

/**
 * Retrieve saved spreadsheet info from localStorage
 */
export const getSavedSpreadsheetInfo = (): ActiveSpreadsheetInfo | null => {
  try {
    const raw = localStorage.getItem(SHEETS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved spreadsheet info', e);
  }
  return null;
};

/**
 * Save active spreadsheet info to localStorage
 */
export const saveSpreadsheetInfo = (info: ActiveSpreadsheetInfo): void => {
  try {
    localStorage.setItem(SHEETS_STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save spreadsheet info', e);
  }
};

/**
 * Create a new Google Spreadsheet for SI-PELKA Nagekeo complaints
 */
export const createComplaintSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<ActiveSpreadsheetInfo> => {
  const title = customTitle || `SI-PELKA Nagekeo - Rekapitulasi Pengaduan UPTD PPA (${new Date().getFullYear()})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: title },
      sheets: [
        {
          properties: {
            title: 'Data Pengaduan Masuk',
            gridProperties: { frozenRowCount: 1 }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Gagal membuat Google Spreadsheet baru');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Pengaduan Masuk'!A1:Y1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [REPORT_SHEET_HEADERS] })
  });

  const info: ActiveSpreadsheetInfo = {
    id: spreadsheetId,
    title: title,
    url: sheetUrl,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    syncedRowCount: 0
  };

  saveSpreadsheetInfo(info);
  return info;
};

/**
 * Append a single complaint record to the active Google Spreadsheet
 */
export const appendComplaintToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  report: ReportItem
): Promise<boolean> => {
  const rowValues = reportItemToRow(report);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Pengaduan Masuk'!A:Y:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [rowValues] })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Failed to append row to Google Sheets:', err);
    return false;
  }

  const current = getSavedSpreadsheetInfo();
  if (current && current.id === spreadsheetId) {
    saveSpreadsheetInfo({
      ...current,
      lastSyncedAt: new Date().toISOString(),
      syncedRowCount: (current.syncedRowCount || 0) + 1
    });
  }

  return true;
};

/**
 * Bulk sync all reports into Google Sheets
 */
export const syncAllComplaintsToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  reports: ReportItem[]
): Promise<{ count: number; url: string }> => {
  const allRows = [
    REPORT_SHEET_HEADERS,
    ...reports.map((r) => reportItemToRow(r))
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Pengaduan Masuk'!A1:Y${allRows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: allRows })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data ke Google Sheets');
  }

  const current = getSavedSpreadsheetInfo();
  const info: ActiveSpreadsheetInfo = {
    id: spreadsheetId,
    title: current?.title || 'Data Pengaduan SI-PELKA Nagekeo',
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    createdAt: current?.createdAt || new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    syncedRowCount: reports.length
  };

  saveSpreadsheetInfo(info);
  return { count: reports.length, url: info.url };
};

/**
 * Fetch 2-Way: Pull complaints from Google Sheets and convert back to ReportItem[]
 */
export const fetchComplaintsFromSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<ReportItem[]> => {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Pengaduan Masuk'!A1:Z500`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      throw new Error('Gagal membaca data dari Google Sheets');
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];
    if (rows.length <= 1) return [];

    const header = rows[0];
    const dataRows = rows.slice(1);

    const fetchedReports: ReportItem[] = dataRows.map((row, index) => {
      const ticketCode = row[0] || `PPA-NGK-2026-${1000 + index}`;
      const dateStr = row[1] || new Date().toISOString();
      const urgencyStr = (row[2] || 'mendesak').toLowerCase() as UrgencyLevel;
      const categoryStr = row[3] || 'Kekerasan Fisik / KDRT';
      const statusStr = (row[4] || 'masuk').toLowerCase() as CaseStatus;
      const victimName = row[5] || 'Korban';
      const victimGender = (row[6]?.toLowerCase().includes('perempuan') ? 'perempuan' : 'laki-laki') as 'perempuan' | 'laki-laki';
      const victimAge = row[7] || '25';
      const victimAddress = row[8] || 'Nagekeo';
      const kecamatan = (row[9] || 'Aesesa') as NagekeoKecamatan;
      const desaKelurahan = row[10] || 'Danga';
      const incidentTimePlace = row[11] || '';
      const incidentPlace = row[12] || 'Rumah';
      const incidentDescription = row[13] || row[3] || 'Laporan pengaduan kasus.';
      const perpetratorKnown = row[14]?.toLowerCase().includes('ya') || true;
      const perpetratorName = row[15] || 'Terduga Pelaku';
      const perpetratorAge = row[16] || '-';
      const perpetratorRelationship = row[17] || 'Suami / Pasangan';
      const perpetratorAddress = row[18] || '-';
      const reporterName = row[19] || 'Pelapor';
      const reporterRelationship = row[20] || 'Korban Sendiri';
      const reporterContact = row[21] || '-';
      const confidentiality = (row[22]?.toLowerCase() === 'anonim' ? 'anonim' : 'rahasia');
      const servicesStr = row[23] || '';
      const officerNoteStr = row[24] || 'Telaah UPTD PPA';

      return {
        id: `fetched_${index}_${Date.now()}`,
        ticketCode,
        secretPin: '111217',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        urgency: ['darurat', 'mendesak', 'standar'].includes(urgencyStr) ? urgencyStr : 'mendesak',
        category: 'kdrt_fisik',
        status: ['masuk', 'verifikasi', 'penjangkauan', 'pendampingan', 'selesai'].includes(statusStr) ? statusStr : 'masuk',
        confidentiality,
        victimName,
        victimGender,
        victimAge,
        victimAddress,
        kecamatan,
        desaKelurahan,
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: incidentTimePlace,
        incidentPlace,
        incidentDescription,
        perpetratorKnown,
        perpetratorName,
        perpetratorAge,
        perpetratorAddress,
        perpetratorRelationship,
        reporterName,
        reporterRelationship,
        reporterContact,
        servicesNeeded: {
          medisVisum: servicesStr.includes('Visum'),
          rumahAman: servicesStr.includes('Rumah Aman'),
          bantuanHukum: servicesStr.includes('Advokasi') || servicesStr.includes('Polres'),
          konselingPsikologis: servicesStr.includes('Konseling') || servicesStr.includes('Trauma'),
          mediasiKeluarga: servicesStr.includes('Mediasi'),
          bantuanSosialDarurat: servicesStr.includes('Bansos')
        },
        attachments: [],
        officerNotes: [
          {
            id: `note_${index}`,
            officerName: 'Tim UPTD PPA Dinas PMDP3A',
            date: dateStr,
            summary: officerNoteStr,
            actionPlan: 'Penanganan terpadu kasus.',
            assignedUnit: 'UPTD PPA Kabupaten Nagekeo'
          }
        ],
        messages: []
      };
    });

    return fetchedReports;
  } catch (err) {
    console.error('Failed to fetch complaints from Google Sheets:', err);
    throw err;
  }
};
