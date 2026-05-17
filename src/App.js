import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import IrabModal from './components/IrabModal.js';
import QuranReader from './components/QuranReader.js';
import SurahSelector from './components/SurahSelector.js';
import { SURAHS } from './data/surahs.js';

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  function handleSurahChange(surahId) {
    const surah = SURAHS.find((item) => item.id === surahId);
    setSelectedSurah(surahId);
    setSelectedAyah((currentAyah) => Math.min(currentAyah, surah?.ayahs ?? 1));
    setSelectedWord(null);
  }

  function handleAyahChange(ayahId) {
    setSelectedAyah(ayahId);
    setSelectedWord(null);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeee5_0,#f8f5ee_38%,#fffdf7_100%)] text-quran-ink transition-colors dark:bg-[radial-gradient(circle_at_top_right,#12372f_0,#101820_42%,#0b1117_100%)] dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:flex-row lg:gap-6 lg:py-8">
        <div className="lg:w-80">
          <div className="mb-4 flex items-center justify-between rounded-lg border border-white/80 bg-white/80 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
            <div>
              <p className="text-sm font-bold text-quran-gold">تطبيق تفاعلي</p>
              <p className="font-extrabold text-quran-green dark:text-emerald-300">إعراب القرآن الكريم</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className="grid h-11 w-11 place-items-center rounded-lg bg-quran-green text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:bg-quran-gold dark:text-slate-950 dark:focus:ring-yellow-900"
            >
              {darkMode ? <Sun size={21} /> : <Moon size={21} />}
            </button>
          </div>

          <SurahSelector
            selectedSurah={selectedSurah}
            selectedAyah={selectedAyah}
            onSurahChange={handleSurahChange}
            onAyahChange={handleAyahChange}
          />
        </div>

        <QuranReader
          selectedSurah={selectedSurah}
          selectedAyah={selectedAyah}
          onWordClick={setSelectedWord}
        />
      </div>

      <IrabModal word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
