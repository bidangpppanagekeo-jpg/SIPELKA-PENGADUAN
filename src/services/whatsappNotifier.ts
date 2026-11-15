import { ReportItem } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';
import {
  getSavedAppsScriptUrl,
  isValidAppsScriptWebAppUrl,
  sendReportToAppsScript
} from './appsScript';

export const OFFICER_WHATSAPP_NUMBER = '6282266355313';
export const OFFICER_WHATSAPP_DISPLAY = '0822-6635-5313';

/**
 * Checks whether at least one automated server-side WhatsApp relay endpoint is configured.
 */
export const hasConfiguredWhatsAppRelay = (): boolean => {
  const webhookUrl = (import.meta.env.VITE_WA_WEBHOOK_URL || '').trim();
  const appsScriptUrl = getSavedAppsScriptUrl();
  return Boolean(webhookUrl) || isValidAppsScriptWebAppUrl(appsScriptUrl);
};

/**
 * Formats a concise, structured WhatsApp alert message for UPTD PPA Nagekeo officers.
 */
export const buildOfficerWhatsAppMessage = (report: ReportItem): string => {
  const categoryLabel = CATEGORY_LABELS[report.category]?.label || report.category;
  const services: string[] = [];
  if (report.servicesNeeded?.medisVisum) services.push('Visum/Medis');
  if (report.servicesNeeded?.rumahAman) services.push('Rumah Aman');
  if (report.servicesNeeded?.bantuanHukum) services.push('Pendampingan Hukum/Polisi');
  if (report.servicesNeeded?.konselingPsikologis) services.push('Konseling Psikologis');
  if (report.servicesNeeded?.mediasiKeluarga) services.push('Mediasi Keluarga');
  if (report.servicesNeeded?.bantuanSosialDarurat) services.push('Bantuan Sosial Darurat');

  const shortStory =
    report.incidentDescription.length > 350
      ? `${report.incidentDescription.slice(0, 350)}...`
      : report.incidentDescription;

  return [
    '*[SI-PELKA NAGEKEO] PENGADUAN BARU MASUK*',
    `No. Tiket: *${report.ticketCode}*`,
    `Prioritas: *${report.urgency.toUpperCase()}*`,
    `Kategori: ${categoryLabel}`,
    '',
    '*Data Korban & Lokasi:*',
    `- Nama Korban: ${report.victimName} (${report.victimGender}, ${report.victimAge} th)`,
    `- Lokasi: Desa ${report.desaKelurahan}, Kec. ${report.kecamatan}`,
    `- Alamat: ${report.victimAddress}`,
    '',
    '*Data Pelapor:*',
    `- Nama: ${report.reporterName} (${report.reporterRelationship})`,
    `- No. HP/WA: ${report.reporterContact}`,
    `- Layanan Dibutuhkan: ${services.length > 0 ? services.join(', ') : '-'}`,
    '',
    '*Kronologi Singkat:*',
    shortStory,
    '',
    'Mohon segera ditindaklanjuti melalui Dasbor Manajemen Kasus UPTD PPA Dinas PMDP3A Kab. Nagekeo.'
  ].join('\n');
};

/**
 * Automatically dispatches the new report alert to the configured WhatsApp relay/webhook
 * in the background immediately after the complaint is saved.
 */
export const dispatchAutoWhatsAppNotification = async (
  report: ReportItem
): Promise<{ dispatched: boolean; configured: boolean; channel: 'webhook' | 'apps_script' | 'none' }> => {
  const message = buildOfficerWhatsAppMessage(report);
  const webhookUrl = (import.meta.env.VITE_WA_WEBHOOK_URL || '').trim();
  const appsScriptValid = isValidAppsScriptWebAppUrl(getSavedAppsScriptUrl());

  if (!webhookUrl && !appsScriptValid) {
    return { dispatched: false, configured: false, channel: 'none' };
  }

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: OFFICER_WHATSAPP_NUMBER,
          phone: OFFICER_WHATSAPP_NUMBER,
          message,
          ticketCode: report.ticketCode,
          urgency: report.urgency,
          report
        })
      });
      if (appsScriptValid) {
        await sendReportToAppsScript(report, undefined, {
          targetNumber: OFFICER_WHATSAPP_NUMBER,
          message
        });
      }
      return { dispatched: res.ok, configured: true, channel: 'webhook' };
    } catch (err) {
      console.warn('WA webhook dispatch notice, falling back to Apps Script relay:', err);
    }
  }

  if (appsScriptValid) {
    const res = await sendReportToAppsScript(report, undefined, {
      targetNumber: OFFICER_WHATSAPP_NUMBER,
      message
    });
    return {
      dispatched: res.success,
      configured: true,
      channel: 'apps_script'
    };
  }

  return { dispatched: false, configured: true, channel: 'none' };
};
