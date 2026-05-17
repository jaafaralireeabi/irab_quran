import { AlertCircle, Loader2, MousePointerClick } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SURAHS } from '../data/surahs.js';

const QURAN_TEXT_API = 'https://api.alquran.cloud/v1/ayah';

function splitAyahIntoWords(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export default function QuranReader({ selectedSurah, selectedAyah, onWordClick }) {
  const [ayahText, setAyahText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const surah = SURAHS.find((item) => item.id === selectedSurah) ?? SURAHS[0];
  const words = useMemo(() => splitAyahIntoWords(ayahText), [ayahText]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAyah() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${QURAN_TEXT_API}/${selectedSurah}:${selectedAyah}/quran-uthmani`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('تعذر تحميل نص الآية.');
        }

        const payload = await response.json();
        setAyahText(payload?.data?.text ?? '');
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'حدث خطأ غير متوقع أثناء تحميل الآية.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAyah();

    return () => controller.abort();
  }, [selectedSurah, selectedAyah]);

  return (
    <main className="min-h-[520px] flex-1 rounded-lg border border-white/80 bg-quran-paper p-5 shadow-soft dark:border-white/10 dark:bg-slate-900 md:p-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-quran-mint pb-5 dark:border-slate-700">
        <div>
          <p className="text-sm font-bold text-quran-gold">إعراب القرآن الكريم</p>
          <h1 className="mt-1 text-2xl font-extrabold text-quran-ink dark:text-white md:text-3xl">
            سورة {surah.name}، الآية {selectedAyah}
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-quran-mint px-3 py-2 text-sm font-bold text-quran-green dark:bg-emerald-950 dark:text-emerald-200">
          <MousePointerClick size={18} />
          اضغط على أي كلمة
        </div>
      </div>

      {loading && (
        <div className="grid min-h-[320px] place-items-center text-quran-green dark:text-emerald-300">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 animate-spin" size={34} />
            <p className="font-bold">جاري تحميل الآية...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="mx-auto mb-3" size={32} />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <article className="mx-auto max-w-4xl text-center">
          <div className="font-arabic text-[2.1rem] leading-[2.35] text-quran-ink dark:text-slate-50 md:text-[3rem] md:leading-[2.15]">
            {words.map((word, index) => (
              <button
                key={`${word}-${index}`}
                type="button"
                onClick={() =>
                  onWordClick({
                    text: word,
                    wordId: index + 1,
                    surahId: selectedSurah,
                    ayahId: selectedAyah,
                  })
                }
                className="quran-word mx-1 rounded-lg px-2 py-1 transition hover:bg-quran-mint hover:text-quran-green focus:bg-quran-mint focus:text-quran-green focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:hover:bg-emerald-950 dark:hover:text-emerald-200 dark:focus:bg-emerald-950 dark:focus:text-emerald-200 dark:focus:ring-emerald-950"
              >
                {word}
              </button>
            ))}
          </div>
        </article>
      )}
    </main>
  );
}
