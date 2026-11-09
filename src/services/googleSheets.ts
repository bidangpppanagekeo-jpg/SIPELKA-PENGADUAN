import { ReportItem } from '../types';
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

  // 1. Create spreadsheet with initial sheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'Data Pengaduan Masuk',
            gridProperties: {
              frozenRowCount: 1
            }
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

  // 2. Add styled header row
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Pengaduan Masuk'!A1:Y1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [REPORT_SHEET_HEADERS]
    })
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
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Failed to append row to Google Sheets:', err);
    return false;
  }

  // Update last synced time
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
 * Bulk sync all reports into Google Sheets (overwriting or appending)
 */
export const syncAllComplaintsToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  reports: ReportItem[]
): Promise<{ count: number; url: string }> => {
  // Overwrite starting from row 1 with headers + all current reports
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
      body: JSON.stringify({
        values: allRows
      })
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
