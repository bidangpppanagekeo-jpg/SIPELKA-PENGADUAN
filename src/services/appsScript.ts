import { ReportItem, ReportCategory } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';
import { reportItemToRow } from './googleSheets';

export const DEFAULT_APPS_SCRIPT_PROJECT_ID = '1bkzLtf_KGyGHAd2_s98LpnWXzzKxU27eqo6m5A3Um_0Adxae3fT1btKc';
export const DEFAULT_APPS_SCRIPT_WEBAPP_URL = `https://script.google.com/macros/s/${DEFAULT_APPS_SCRIPT_PROJECT_ID}/exec`;
export const APPS_SCRIPT_STORAGE_KEY = 'sipelka_nagekeo_apps_script_url';

export const isValidAppsScriptWebAppUrl = (url?: string | null): boolean => {
  const clean = (url || '').trim();
  return Boolean(
    clean &&
    clean.startsWith('https://script.google.com/macros/s/') &&
    clean.endsWith('/exec') &&
    !clean.includes(DEFAULT_APPS_SCRIPT_PROJECT_ID)
  );
};

/**
 * Get configured Google Apps Script Web App URL (env var first for all public devices, then localStorage)
 */
export const getSavedAppsScriptUrl = (): string => {
  const envUrl = (import.meta.env.VITE_APPS_SCRIPT_WEBAPP_URL || '').trim();
  if (isValidAppsScriptWebAppUrl(envUrl)) {
    return envUrl;
  }
  try {
    const saved = localStorage.getItem(APPS_SCRIPT_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    console.error('Failed to read Apps Script URL from storage', e);
  }
  return DEFAULT_APPS_SCRIPT_WEBAPP_URL;
};

/**
 * Save Google Apps Script Web App URL
 */
export const saveAppsScriptUrl = (url: string): void => {
  try {
    localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, url.trim());
  } catch (e) {
    console.error('Failed to save Apps Script URL to storage', e);
  }
};

/**
 * Send a single complaint item to Google Apps Script endpoint
 */
export const sendReportToAppsScript = async (
  report: ReportItem,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> => {
  const targetUrl = (webAppUrl || getSavedAppsScriptUrl()).trim();
  if (!isValidAppsScriptWebAppUrl(targetUrl)) {
    return {
      success: false,
      message: 'Web App URL (/exec) Google Apps Script belum dipasang.'
    };
  }
  try {
    const payload = {
      action: 'ADD_COMPLAINT',
      source: 'SI-PELKA Nagekeo App',
      timestamp: new Date().toISOString(),
      report: reportItemToRow(report),
      data: report
    };

    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Data pengaduan Tiket ${report.ticketCode} berhasil terkirim ke Google Apps Script!`
    };
  } catch (error: any) {
    console.error('Apps Script dispatch error:', error);
    return {
      success: false,
      message: error.message || 'Gagal mengirim data pengaduan ke Google Apps Script.'
    };
  }
};

/**
 * Bulk sync all complaints to Google Apps Script endpoint
 */
export const syncAllToAppsScript = async (
  reports: ReportItem[],
  webAppUrl?: string
): Promise<{ success: boolean; count: number; message: string }> => {
  const targetUrl = webAppUrl || getSavedAppsScriptUrl();
  try {
    const payload = {
      action: 'SYNC_ALL_COMPLAINTS',
      source: 'SI-PELKA Nagekeo App',
      timestamp: new Date().toISOString(),
      count: reports.length,
      reports: reports.map((r) => ({
        row: reportItemToRow(r),
        detail: r
      }))
    };

    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      count: reports.length,
      message: `Berhasil menyinkronkan ${reports.length} data pengaduan ke Google Apps Script!`
    };
  } catch (error: any) {
    console.error('Apps Script bulk sync error:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Gagal menyinkronkan data ke Google Apps Script.'
    };
  }
};

/**
 * Delete a complaint item from Google Apps Script spreadsheet
 */
export const deleteFromAppsScript = async (
  ticketCode: string,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> => {
  const targetUrl = webAppUrl || getSavedAppsScriptUrl();
  try {
    const payload = {
      action: 'DELETE_COMPLAINT',
      source: 'SI-PELKA Nagekeo App',
      timestamp: new Date().toISOString(),
      ticketCode: ticketCode
    };

    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Kasus ${ticketCode} telah dikirim permintaan penghapusan ke Google Sheet.`
    };
  } catch (error: any) {
    console.error('Apps Script delete error:', error);
    return {
      success: false,
      message: error.message || 'Gagal menghapus kasus di Google Apps Script.'
    };
  }
};

const mapCategoryLabelToKey = (rawCategory: string): ReportCategory => {
  const normalized = (rawCategory || '').trim().toLowerCase();
  for (const [key, meta] of Object.entries(CATEGORY_LABELS)) {
    if (key === normalized || meta.label.toLowerCase() === normalized) {
      return key as ReportCategory;
    }
  }
  if (normalized.includes('seksual')) return 'kekerasan_seksual';
  if (normalized.includes('psikis') || normalized.includes('teror')) return 'psikis_intimidasi';
  if (normalized.includes('penelantaran')) return 'penelantaran_anak';
  if (normalized.includes('perkawinan')) return 'perkawinan_anak';
  if (normalized.includes('perdagangan') || normalized.includes('tppo')) return 'tppo_human_trafficking';
  if (normalized.includes('siber') || normalized.includes('cyber') || normalized.includes('kbgo')) return 'kbgo_cyberbullying';
  if (normalized.includes('eksploitasi')) return 'eksploitasi_anak';
  return 'kdrt_fisik';
};

const parseSheetDateToIso = (rawDate: any): string => {
  if (!rawDate) return new Date().toISOString();
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) return rawDate.toISOString();
  const parsed = Date.parse(String(rawDate));
  if (!isNaN(parsed)) return new Date(parsed).toISOString();
  return new Date().toISOString();
};

/**
 * Fetch complaints from Google Apps Script Web App (2-Way Pull)
 */
export const fetchComplaintsFromAppsScript = async (
  webAppUrl?: string
): Promise<ReportItem[] | null> => {
  const targetUrl = (webAppUrl || getSavedAppsScriptUrl()).trim();
  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return null;
  }
  try {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${targetUrl}${separator}action=GET_ALL&t=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const text = await res.text();
    if (!text.trim().startsWith('{')) {
      return null;
    }
    const data = JSON.parse(text);
    if (data && data.rows && Array.isArray(data.rows)) {
      return data.rows
        .filter((row: any[]) => Array.isArray(row) && row[0])
        .map((row: any[], index: number) => {
          const ticketCode = String(row[0] || `PPA-NGK-2026-${1000 + index}`).trim();
          const dateStr = row[1] ? String(row[1]) : new Date().toLocaleDateString('id-ID');
          const isoCreated = parseSheetDateToIso(row[1]);
          const urgencyStr = (row[2] || 'mendesak').toString().toLowerCase();
          const category = mapCategoryLabelToKey(String(row[3] || ''));
          const statusStr = (row[4] || 'masuk').toString().toLowerCase();
          const victimName = String(row[5] || 'Korban');
          const victimGender = (row[6]?.toString().toLowerCase().includes('perempuan') ? 'perempuan' : 'laki-laki') as 'perempuan' | 'laki-laki';
          const victimAge = row[7]?.toString() || 'Dewasa';
          const victimAddress = String(row[8] || 'Nagekeo');
          const kecamatan = (row[9] || 'Aesesa') as any;
          const desaKelurahan = String(row[10] || 'Danga');
          const incidentTimePlace = String(row[11] || '');
          const incidentPlace = String(row[12] || 'Rumah');
          const incidentDescription = String(row[13] || row[3] || 'Laporan pengaduan kasus.');
          const perpetratorKnown = row[14]?.toString().toLowerCase().includes('ya') ?? true;
          const perpetratorName = String(row[15] || 'Terduga Pelaku');
          const perpetratorAge = row[16]?.toString() || '-';
          const perpetratorRelationship = String(row[17] || 'Suami / Pasangan');
          const perpetratorAddress = String(row[18] || '-');
          const reporterName = String(row[19] || 'Pelapor');
          const reporterRelationship = String(row[20] || 'Korban Sendiri');
          const reporterContact = row[21]?.toString() || '-';
          const confidentiality = row[22]?.toString().toLowerCase() === 'anonim' ? 'anonim' : 'rahasia';
          const servicesStr = (row[23] || '').toString();
          const officerNoteStr = String(row[24] || 'Telaah UPTD PPA');

          return {
            id: `as_${ticketCode}`,
            ticketCode,
            secretPin: '',
            createdAt: isoCreated,
            updatedAt: isoCreated,
            urgency: (['darurat', 'mendesak', 'standar'].includes(urgencyStr) ? urgencyStr : 'mendesak') as any,
            category,
            status: (['masuk', 'verifikasi', 'dilanjutkan', 'penjangkauan', 'pendampingan', 'selesai'].includes(statusStr) ? statusStr : 'masuk') as any,
            confidentiality,
            victimName,
            victimGender,
            victimAge,
            victimAddress,
            kecamatan,
            desaKelurahan,
            incidentDate: isoCreated.split('T')[0],
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
                id: `note_as_${ticketCode}`,
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
    }
    return null;
  } catch (e) {
    console.warn('Gagal membaca data dari Google Apps Script Web App:', e);
    return null;
  }
};

/**
 * Ready-to-copy Apps Script Code snippet for user's Google Apps Script editor
 */
export const APPS_SCRIPT_TEMPLATE_CODE = `// =========================================================================
// KODE GOOGLE APPS SCRIPT SI-PELKA NAGEKEO (DINAS PMDP3A KAB. NAGEKEO)
// Proyek: 1bkzLtf_KGyGHAd2_s98LpnWXzzKxU27eqo6m5A3Um_0Adxae3fT1btKc
// Mendukung Sinkronisasi & Penghapusan 2-Arah (Dasbor <-> Spreadsheet)
// =========================================================================

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create("SI-PELKA Nagekeo - Rekapitulasi Pengaduan UPTD PPA");
  }
  var sheet = ss.getSheetByName("Data Pengaduan Masuk");
  if (!sheet) {
    sheet = ss.insertSheet("Data Pengaduan Masuk");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "No. Tiket", "Tanggal Lapor", "Tingkat Kegawatan", "Kategori Kasus", "Status Penanganan",
      "Nama Korban", "Jenis Kelamin Korban", "Usia Korban", "Alamat Lengkap Korban",
      "Kecamatan", "Desa / Kelurahan", "Waktu Kejadian", "Tempat Kejadian", "Uraian Kasus / Kronologi",
      "Pelaku Dikenal", "Nama Terduga Pelaku", "Usia Pelaku", "Hubungan Pelaku", "Alamat Pelaku",
      "Nama Pelapor", "Hubungan Pelapor", "No. Kontak / WA Pelapor", "Kerahasiaan Identitas",
      "Kebutuhan Layanan", "Catatan Penanganan UPTD"
    ]);
    sheet.getRange(1, 1, 1, 25).setFontWeight("bold").setBackground("#115e59").setFontColor("#ffffff");
  }
  return sheet;
}

// 1. GET: Menarik daftar data kasus untuk Dasbor Aplikasi (Sinkronisasi 2-Arah)
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: 0, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var values = sheet.getRange(2, 1, lastRow - 1, 25).getValues();
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: values.length, rows: values }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. POST: Menyimpan, memperbarui, atau menghapus data pengaduan kasus di Spreadsheet
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();

    // A. Tambah aduan baru dari formulir warga
    if (data.action === "ADD_COMPLAINT" && data.report) {
      sheet.appendRow(data.report);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Aduan berhasil dicatat di Spreadsheet!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // B. Hapus kasus dari Spreadsheet ketika dihapus di Dasbor
    if (data.action === "DELETE_COMPLAINT" && data.ticketCode) {
      var lastRow = sheet.getLastRow();
      var deleted = false;
      if (lastRow > 1) {
        var codes = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = codes.length - 1; i >= 0; i--) {
          if (codes[i][0] && codes[i][0].toString().trim() === data.ticketCode.toString().trim()) {
            sheet.deleteRow(i + 2);
            deleted = true;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: deleted, message: "Kasus berhasil dihapus dari Spreadsheet!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // C. Sinkronisasi penuh seluruh data (Bulk Sync)
    if (data.action === "SYNC_ALL_COMPLAINTS" && data.reports) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 25).clearContent();
      }
      data.reports.forEach(function(item) {
        if (item.row) sheet.appendRow(item.row);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Semua pengaduan berhasil disinkronkan ke Spreadsheet!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "Action tidak dikenali." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
