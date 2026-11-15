import { ReportItem } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';
import { sendReportToAppsScript } from './appsScript';

export const OFFICER_WHATSAPP_NUMBER = '6282266355313';
export const OFFICER_WHATSAPP_DISPLAY = '0822-6635-5313';

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
    `*Kronologi Singkat:*`,
    shortStory,
    '',
    'Mohon segera ditindaklanjuti melalui Dasbor Manajemen Kasus UPTD PPA Dinas PMDP3A Kab. Nagekeo.'
  ].join('\n');
};

/**
 * Automatically dispatches the new report alert to the officer WhatsApp relay/webhook
 * in the background immediately after the complaint is saved—without requiring any citizen click.
 */
export const dispatchAutoWhatsAppNotification = async (
  report: ReportItem
): Promise<{ dispatched: boolean; channel: 'webhook' | 'apps_script' }> => {
  const message = buildOfficerWhatsAppMessage(report);
  const webhookUrl = (import.meta.env.VITE_WA_WEBHOOK_URL || '').trim();

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
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
      await sendReportToAppsScript(report, undefined, {
        targetNumber: OFFICER_WHATSAPP_NUMBER,
        message
      });
      return { dispatched: true, channel: 'webhook' };
    } catch (err) {
      console.warn('WA webhook dispatch notice, falling back to Apps Script relay:', err);
    }
  }

  const res = await sendReportToAppsScript(report, undefined, {
    targetNumber: OFFICER_WHATSAPP_NUMBER,
    message
  });

  return {
    dispatched: res.success,
    channel: 'apps_script'
  };
};
