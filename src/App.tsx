import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { DistrictSection } from './components/DistrictSection';
import { EducationSection } from './components/EducationSection';
import { ReportFormModal } from './components/ReportFormModal';
import { CaseTracker } from './components/CaseTracker';
import { EmergencyModal } from './components/EmergencyModal';
import { AdminPortal } from './components/AdminPortal';
import { InteractiveAssessmentModal } from './components/InteractiveAssessmentModal';
import { DisguiseView } from './components/DisguiseView';
import { Footer } from './components/Footer';
import { INITIAL_REPORTS } from './data/mockData';
import { ReportItem, CaseStatus, ReportCategory, NagekeoKecamatan } from './types';
import { ShieldCheck, HeartHandshake, PhoneCall, AlertTriangle, ArrowRight, EyeOff } from 'lucide-react';

export default function App() {
  // Load reports from localStorage or fallback to initial data
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('sipelka_nagekeo_reports') || localStorage.getItem('sapa_nagekeo_reports');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    return INITIAL_REPORTS;
  });

  // Save reports on change
  useEffect(() => {
    try {
      localStorage.setItem('sipelka_nagekeo_reports', JSON.stringify(reports));
    } catch (e) {
      console.error('Error writing localStorage', e);
    }
  }, [reports]);

  // View & Modal States
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isDisguised, setIsDisguised] = useState<boolean>(false);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);

  // Pre-fill state for quick reporting from cards
  const [initialCategory, setInitialCategory] = useState<ReportCategory | undefined>(undefined);
  const [initialDistrict, setInitialDistrict] = useState<NagekeoKecamatan | undefined>(undefined);

  // Keyboard shortcut listener: Pressing 'Escape' quickly toggles Disguise Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isReportModalOpen && !isTrackerModalOpen && !isEmergencyModalOpen) {
        setIsDisguised((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportModalOpen, isTrackerModalOpen, isEmergencyModalOpen]);

  // Handlers
  const handleAddNewReport = (newReport: ReportItem) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleUpdateStatus = (ticketCode: string, newStatus: CaseStatus) => {
    setReports((prev) =>
      prev.map((item) =>
        item.ticketCode === ticketCode
          ? {
              ...item,
              status: newStatus,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  const handleAddOfficerNote = (
    ticketCode: string,
    summary: string,
    actionPlan: string,
    assignedUnit: string
  ) => {
    setReports((prev) =>
      prev.map((item) =>
        item.ticketCode === ticketCode
          ? {
              ...item,
              officerNotes: [
                ...item.officerNotes,
                {
                  id: `note_${Date.now()}`,
                  officerName: 'Maria Yasinta, S.Sos (Konselor Dinsos P3A)',
                  date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WITA',
                  summary,
                  actionPlan,
                  assignedUnit
                }
              ],
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  const handleSendMessage = (ticketCode: string, messageText: string) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.ticketCode === ticketCode) {
          const newMsg = {
            id: `msg_${Date.now()}`,
            sender: 'pelapor' as const,
            senderName: item.confidentiality === 'anonim' ? 'Pelapor (Anonim)' : 'Pelapor',
            text: messageText,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA'
          };
          return {
            ...item,
            messages: [...item.messages, newMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
  };

  const handleOfficerSendMessage = (ticketCode: string, messageText: string) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.ticketCode === ticketCode) {
          const newMsg = {
            id: `msg_${Date.now()}`,
            sender: 'petugas' as const,
            senderName: 'Konselor UPTD PPA Nagekeo',
            text: messageText,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA'
          };
          return {
            ...item,
            messages: [...item.messages, newMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
  };

  const handleSelectCategory = (catKey: string) => {
    setInitialCategory(catKey as ReportCategory);
    setIsReportModalOpen(true);
  };

  const handleReportInDistrict = (district: NagekeoKecamatan) => {
    setInitialDistrict(district);
    setIsReportModalOpen(true);
  };

  // If disguise mode is active, render the innocuous camouflage screen
  if (isDisguised) {
    return <DisguiseView onDeactivate={() => setIsDisguised(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-teal-700 selection:text-white">
      {/* Navbar with 3-Zone Top Bar Contract & Quick Exit */}
      <Navbar
        onOpenReport={() => {
          setInitialCategory(undefined);
          setInitialDistrict(undefined);
          setIsReportModalOpen(true);
        }}
        onOpenTracker={() => setIsTrackerModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenEducation={() => {
          const elem = document.getElementById('edukasi');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onToggleDisguise={() => setIsDisguised(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with authentic NTT photo and empathetic reassurance */}
        <HeroSection
          onOpenReport={() => {
            setInitialCategory(undefined);
            setInitialDistrict(undefined);
            setIsReportModalOpen(true);
          }}
          onOpenTracker={() => setIsTrackerModalOpen(true)}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          onOpenEducation={() => {
            const elem = document.getElementById('edukasi');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenAssessment={() => setIsAssessmentModalOpen(true)}
        />

        {/* Safety Strip Reassurance */}
        <div className="bg-stone-900 text-stone-200 border-y border-stone-800 py-3.5 px-4 lg:px-8 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                <strong>Jaminan Kerahasiaan:</strong> Anda dapat melapor secara anonim tanpa mencantumkan nama dan nomor telepon. Seluruh data dilindungi UU Tindak Pidana Kekerasan Seksual (UU TPKS).
              </span>
            </div>
            <button
              onClick={() => setIsDisguised(true)}
              className="text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-2 shrink-0 font-medium"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Tekan Esc atau klik untuk Mode Samaran jika ada orang mendekat</span>
            </button>
          </div>
        </div>

        {/* Categories of Violence Handled */}
        <CategoriesSection onSelectCategory={handleSelectCategory} />

        {/* 7 Districts in Kabupaten Nagekeo */}
        <DistrictSection onReportInDistrict={handleReportInDistrict} />

        {/* Legal Rights, Step Process & Facilities */}
        <EducationSection
          onOpenReport={() => {
            setInitialCategory(undefined);
            setInitialDistrict(undefined);
            setIsReportModalOpen(true);
          }}
        />

        {/* Quick Crisis Banner before Footer */}
        <div className="bg-gradient-to-r from-teal-900 to-stone-900 text-white py-12 px-4 lg:px-8 border-t border-teal-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold">
                Melihat atau Mengalami Kekerasan di Sekitar Anda?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Kepedulian Anda dapat menyelamatkan masa depan seorang ibu dan anak di Kabupaten Nagekeo. Kami menjamin keselamatan dan kerahasiaan setiap pelapor.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setInitialCategory(undefined);
                  setInitialDistrict(undefined);
                  setIsReportModalOpen(true);
                }}
                className="px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Buat Laporan Sekarang
              </button>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-300" />
                <span>Panggilan Darurat</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer with pb-20 on mobile to not be occluded by bottom nav */}
      <div className="pb-20 md:pb-0">
        <Footer
          onOpenReport={() => {
            setInitialCategory(undefined);
            setInitialDistrict(undefined);
            setIsReportModalOpen(true);
          }}
          onOpenTracker={() => setIsTrackerModalOpen(true)}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
          onToggleDisguise={() => setIsDisguised(true)}
        />
      </div>

      {/* Fixed Mobile Bottom Navigation Bar for iOS & Android */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'beranda') {
            setIsAdminPortalOpen(false);
          }
        }}
        onOpenReport={() => {
          setInitialCategory(undefined);
          setInitialDistrict(undefined);
          setIsReportModalOpen(true);
        }}
        onOpenTracker={() => setIsTrackerModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Modals & Dialogs */}
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddNewReport}
      />

      <CaseTracker
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        reports={reports}
        onSendMessage={handleSendMessage}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <InteractiveAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {isAdminPortalOpen && (
        <AdminPortal
          reports={reports}
          onUpdateStatus={handleUpdateStatus}
          onAddOfficerNote={handleAddOfficerNote}
          onOfficerSendMessage={handleOfficerSendMessage}
          onClose={() => setIsAdminPortalOpen(false)}
        />
      )}
    </div>
  );
}
