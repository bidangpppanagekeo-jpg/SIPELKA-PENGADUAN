import React from 'react';
import { Sun, CloudSun, Utensils, Unlock, MapPin, Search } from 'lucide-react';

interface DisguiseViewProps {
  onDeactivate: () => void;
}

export const DisguiseView: React.FC<DisguiseViewProps> = ({ onDeactivate }) => {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans p-4 md:p-8">
      {/* Harmless Header */}
      <header className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-tight">Warta & Resep Kuliner Nagekeo</h1>
            <p className="text-xs text-stone-500">Pariwisata & Ragam Pangan Tradisional Flores NTT</p>
          </div>
        </div>

        {/* Weather snapshot for Mbay Nagekeo */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg text-xs text-amber-900">
          <CloudSun className="w-4 h-4 text-amber-600" />
          <span>Mbay, Nagekeo: 31°C · Cerah Berawan</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Search bar mockup */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            readOnly
            value="Cari resep kuliner khas Flores (Jagung Bose, Moke, Ikan Marapokot)..."
            className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-stone-600 cursor-default focus:outline-none"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Boawae, Nagekeo</span>
              <span>15 Menit</span>
            </div>
            <h3 className="font-bold text-stone-900">Jagung Bose Khas Flores</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Makanan pokok berbahan dasar jagung putih yang dimasak perlahan bersama santan, kacang merah, dan garam dapur. Sangat gurih dinikmati hangat bersama sayur daun ubi.
            </p>
            <div className="text-xs text-amber-700 font-medium">Bahan: Jagung pipil, santan kelapa, kacang merah, garam.</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Pelabuhan Marapokot</span>
              <span>25 Menit</span>
            </div>
            <h3 className="font-bold text-stone-900">Ikan Kuah Asam Marapokot</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Ikan tongkol segar dari pesisir Laut Flores dibumbui kunyit bakar, belimbing wuluh, daun kemangi segar, dan irisan serai wangi khas Mbay.
            </p>
            <div className="text-xs text-amber-700 font-medium">Bahan: Ikan segar marapokot, asam jawa, kunyit, daun jeruk.</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Mauponggo</span>
              <span>10 Menit</span>
            </div>
            <h3 className="font-bold text-stone-900">Sambal Lu'at Jeruk Nipis</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Sambal fermentasi khas NTT dengan daun sasalada, cabai rawit pedas, dan perasan jeruk nipis segar yang menambah nafsu makan di iklim tropis.
            </p>
            <div className="text-xs text-amber-700 font-medium">Bahan: Cabai rawit, perasan jeruk nipis, daun kemangi, terasi.</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="w-6 h-6 text-amber-500" />
            <div>
              <h4 className="text-sm font-semibold text-stone-900">Kalender Musim Tanam Padi Sawah Irigasi Mbay</h4>
              <p className="text-xs text-stone-500">Sistem pengairan teknis Bendungan Sutami untuk ketahanan pangan Nagekeo.</p>
            </div>
          </div>
          <span className="text-xs text-stone-400">Pembaruan 2026</span>
        </div>
      </main>

      {/* Inconspicuous Unlock Control at bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onDeactivate}
          title="Kembali ke Aplikasi SAPA Nagekeo"
          className="flex items-center gap-2 bg-stone-800/80 hover:bg-stone-900 text-stone-300 hover:text-white px-3 py-2 rounded-lg text-xs shadow-md transition-all cursor-pointer backdrop-blur"
        >
          <Unlock className="w-3.5 h-3.5 text-teal-400" />
          <span>Buka Aplikasi Asli</span>
        </button>
      </div>
    </div>
  );
};
