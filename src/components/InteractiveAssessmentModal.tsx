import React, { useState } from 'react';
import { X, HelpCircle, AlertTriangle, ShieldCheck, PhoneCall, PlusCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface InteractiveAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenEmergency: () => void;
}

export const InteractiveAssessmentModal: React.FC<InteractiveAssessmentModalProps> = ({
  isOpen,
  onClose,
  onOpenReport,
  onOpenEmergency
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  if (!isOpen) return null;

  const questions = [
    {
      text: 'Apakah Anda atau anak Anda saat ini sedang diancam secara fisik, dikurung, atau berada dalam bahaya langsung?',
      desc: 'Pertanyaan ini menilai urgensi evakuasi keselamatan nyawa saat ini juga.'
    },
    {
      text: 'Apakah telah terjadi luka fisik (memar, pendarahan, nyeri tubuh) atau pemaksaan hubungan seksual?',
      desc: 'Pertanyaan ini menentukan kebutuhan pemeriksaan visum et repertum di RSUD Aeramo Mbay dalam batas waktu 72 jam.'
    },
    {
      text: 'Apakah Anda memiliki tempat bermalam yang aman saat ini di luar rumah pelaku?',
      desc: 'Jika tidak memiliki tempat tinggal aman, tim UPTD PPA Nagekeo dapat menyediakan fasilitas Rumah Aman (Safe House).'
    }
  ];

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentQuestion(questions.length); // Result screen
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers([]);
  };

  // Determine recommendation
  const isCritical = answers[0] === true || (answers[1] === true && answers[2] === false);
  const needsVisum = answers[1] === true;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Panduan Asesmen Awal Kebutuhan</h2>
              <p className="text-xs text-teal-200">1 Menit Bimbingan Langkah Perlindungan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {currentQuestion < questions.length ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
                <span className="font-mono text-teal-800 font-bold">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-2">
                <h3 className="font-bold text-stone-900 text-sm leading-snug">
                  {questions[currentQuestion].text}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {questions[currentQuestion].desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAnswer(true)}
                  className="py-3 px-4 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  YA
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(false)}
                  className="py-3 px-4 text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  TIDAK
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                isCritical ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
              }`}>
                {isCritical ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="font-bold text-base text-stone-900">
                  {isCritical ? 'Rekomendasi: Evakuasi Darurat Segera' : 'Rekomendasi: Lapor Pengaduan Resmi & Terlindungi'}
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                  {isCritical
                    ? 'Berdasarkan jawaban Anda, Anda atau anak Anda terancam bahaya fisik. Segera hubungi hotline darurat UPTD PPA atau datangi kantor polisi terdekat.'
                    : 'Situasi Anda memerlukan pendampingan asesmen dari konselor Dinsos P3A Nagekeo. Kami sarankan segera membuat pengaduan resmi secara rahasia.'}
                </p>
              </div>

              {needsVisum && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs text-amber-900">
                  <strong>Penting untuk Visum Medis:</strong> Segera lakukan pemeriksaan visum et repertum di IGD RSUD Aeramo Mbay sebelum bukti fisik/luka memudar.
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {isCritical ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEmergency();
                    }}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Hubungi Hotline Siaga 24 Jam (0812-3987-1290)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReport();
                    }}
                    className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Pengaduan Sekarang</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="text-stone-500 hover:text-stone-800 text-xs py-1 inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Asesmen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
