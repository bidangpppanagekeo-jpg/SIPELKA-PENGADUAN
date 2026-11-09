import { ReportItem } from '../types';
import { reportItemToRow } from './googleSheets';

export const DEFAULT_APPS_SCRIPT_PROJECT_ID = '1bkzLtf_KGyGHAd2_s98LpnWXzzKxU27eqo6m5A3Um_0Adxae3fT1btKc';
export const DEFAULT_APPS_SCRIPT_WEBAPP_URL = `https://script.google.com/macros/s/${DEFAULT_APPS_SCRIPT_PROJECT_ID}/exec`;
export const APPS_SCRIPT_STORAGE_KEY = 'sipelka_nagekeo_apps_script_url';

/**
 * Get configured Google Apps Script Web App URL
 */
export const getSavedAppsScriptUrl = (): string => {
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
  const targetUrl = webAppUrl || getSavedAppsScriptUrl();
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
 * Ready-to-copy Apps Script Code snippet for user's Google Apps Script editor
 */
export const APPS_SCRIPT_TEMPLATE_CODE = `// =========================================================================
// KODE GOOGLE APPS SCRIPT SI-PELKA NAGEKEO (DINAS PMDP3A KAB. NAGEKEO)
// Proyek: 1bkzLtf_KGyGHAd2_s98LpnWXzzKxU27eqo6m5A3Um_0Adxae3fT1btKc
// =========================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create("SI-PELKA Nagekeo - Rekapitulasi Pengaduan UPTD PPA");
    }
    
    var sheet = ss.getSheetByName("Data Pengaduan Masuk");
    if (!sheet) {
      sheet = ss.insertSheet("Data Pengaduan Masuk");
    }
    
    // Format Header jika sheet masih baru
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

    if (data.action === "ADD_COMPLAINT" && data.report) {
      sheet.appendRow(data.report);
    } else if (data.action === "SYNC_ALL_COMPLAINTS" && data.reports) {
      data.reports.forEach(function(item) {
        if (item.row) sheet.appendRow(item.row);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data pengaduan berhasil disimpan di Google Sheet!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script Web App SI-PELKA Nagekeo Aktif!");
}
`;
