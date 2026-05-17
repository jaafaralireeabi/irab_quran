import { BookOpen, Hash } from 'lucide-react';
import { SURAHS } from '../data/surahs.js';

function buildAyahOptions(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

export default function SurahSelector({
  selectedSurah,
  selectedAyah,
  onSurahChange,
  onAyahChange,
}) {
  const currentSurah = SURAHS.find((surah) => surah.id === selectedSurah) ?? SURAHS[0];
  const ayahOptions = buildAyahOptions(currentSurah.ayahs);

  return (
    <aside className="w-full rounded-lg border border-quran-mint/80 bg-white/85 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-900/80 lg:sticky lg:top-6 lg:w-80">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-quran-mint text-quran-green dark:bg-emerald-900/60 dark:text-emerald-100">
          <BookOpen size={22} />
        </span>
        <div>
          <p className="text-sm font-medium text-quran-gold">التصفح</p>
          <h2 className="text-xl font-bold text-quran-ink dark:text-white">اختر السورة والآية</h2>
        </div>
      </div>

      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="surah">
        السورة
      </label>
      <select
        id="surah"
        value={selectedSurah}
        onChange={(event) => onSurahChange(Number(event.target.value))}
        className="mb-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-right text-slate-900 outline-none transition focus:border-quran-green focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950"
      >
        {SURAHS.map((surah) => (
          <option key={surah.id} value={surah.id}>
            {surah.id}. سورة {surah.name}
          </option>
        ))}
      </select>

      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="ayah">
        الآية
      </label>
      <div className="relative">
        <Hash className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-quran-gold" size={18} />
        <select
          id="ayah"
          value={selectedAyah}
          onChange={(event) => onAyahChange(Number(event.target.value))}
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-11 text-right text-slate-900 outline-none transition focus:border-quran-green focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950"
        >
          {ayahOptions.map((ayah) => (
            <option key={ayah} value={ayah}>
              الآية {ayah}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 rounded-lg bg-quran-cream p-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <strong className="text-quran-green dark:text-emerald-300">سورة {currentSurah.name}</strong>
        <span className="mx-2 text-quran-gold">•</span>
        {currentSurah.ayahs} آية
      </div>
    </aside>
  );
}
