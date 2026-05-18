import { Loader2, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { SURAHS } from '../data/surahs.js';

const QURAN_TEXT_API = 'https://api.alquran.cloud/v1/quran/quran-uthmani';
let quranCache = null;

function normalizeText(text) {
  return text
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u064A\s\d]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getSurahName(surahId) {
  return SURAHS.find((surah) => surah.id === surahId)?.name ?? '';
}

async function fetchQuranText() {
  if (quranCache) return quranCache;

  const response = await fetch(QURAN_TEXT_API);
  if (!response.ok) {
    throw new Error('تعذر تحميل نص القرآن للبحث.');
  }

  const payload = await response.json();
  quranCache = payload.data.surahs.flatMap((surah) =>
    surah.ayahs.map((ayah) => ({
      surahId: surah.number,
      surahName: getSurahName(surah.number) || surah.name,
      ayahId: ayah.numberInSurah,
      text: ayah.text,
      normalizedText: normalizeText(ayah.text),
    })),
  );

  return quranCache;
}

export default function SearchBar({ onSelectAyah }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const latestQueryRef = useRef('');
  const searchRequestRef = useRef(0);

  async function handleSearch(searchValue = query) {
    const searchTerm = normalizeText(searchValue);
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    setSearched(true);
    setError('');

    if (!searchTerm) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const quranText = await fetchQuranText();
      const matches = quranText
        .filter((ayah) => ayah.normalizedText.includes(searchTerm))
        .slice(0, 20);

      const isLatestSearch = requestId === searchRequestRef.current;
      const isQueryUnchanged = normalizeText(latestQueryRef.current) === searchTerm;
      if (!isLatestSearch || !isQueryUnchanged) return;

      setResults(matches);
    } catch (searchError) {
      if (requestId !== searchRequestRef.current) return;

      setResults([]);
      setError(searchError.message || 'حدث خطأ أثناء البحث.');
    } finally {
      if (requestId === searchRequestRef.current) {
        setLoading(false);
      }
    }
  }

  function handleQueryChange(event) {
    const nextQuery = event.target.value;
    latestQueryRef.current = nextQuery;
    setQuery(nextQuery);
    setSearched(false);
    setError('');
    if (nextQuery.trim() === '') {
      searchRequestRef.current += 1;
      setResults([]);
      setLoading(false);
      return;
    }

    handleSearch(nextQuery);
  }

  function handleSelect(result) {
    onSelectAyah?.({
      surahId: result.surahId,
      ayahId: result.ayahId,
    });
    latestQueryRef.current = '';
    searchRequestRef.current += 1;
    setResults([]);
    setQuery('');
    setSearched(false);
    setLoading(false);
  }

  return (
    <div className="relative mb-4">
      <div className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/80 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <Search
          size={21}
          className="shrink-0 text-quran-ink/80 dark:text-slate-100/80"
        />
        <input
          type="search"
          placeholder="ابحث عن كلمة في القرآن..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          className="min-w-0 flex-1 bg-transparent text-right text-quran-ink placeholder:text-quran-ink/70 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-100/70"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="grid min-h-10 min-w-16 place-items-center rounded-lg bg-quran-green px-4 py-2 font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-70 dark:bg-quran-gold dark:text-slate-950 dark:focus:ring-yellow-900"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'بحث'}
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="absolute right-0 z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-quran-mint bg-white shadow-soft dark:border-slate-700 dark:bg-slate-950">
          {results.map((result) => (
            <button
              key={`${result.surahId}-${result.ayahId}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full border-b border-quran-mint/70 px-4 py-3 text-right transition last:border-b-0 hover:bg-quran-mint focus:bg-quran-mint focus:outline-none dark:border-slate-800 dark:hover:bg-emerald-950 dark:focus:bg-emerald-950"
            >
              <span className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
                <span className="text-quran-green dark:text-emerald-300">
                  سورة {result.surahName}
                </span>
                <span className="text-quran-gold">
                  الآية {result.ayahId}
                </span>
              </span>
              <span className="line-clamp-2 font-arabic text-lg leading-8 text-quran-ink dark:text-white">
                {result.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {searched && !loading && !error && query.trim() && results.length === 0 && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/40 dark:text-red-200">
          لم يتم العثور على آية تحتوي على هذه الكلمة.
        </p>
      )}
    </div>
  );
}
