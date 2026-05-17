import { AlertCircle, BookMarked, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const IRAB_API_BASE = 'https://dev.surahapp.com/api/v1/word/eerab-word';
const IRAB_SOURCE_ID = 2;

function pickFirstString(data, keys) {
  if (!data || typeof data !== 'object') return '';

  for (const key of keys) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return data[key];
    }
  }

  return '';
}

function normalizeIrabPayload(payload) {
  const item = Array.isArray(payload) ? payload[0] : payload?.data ?? payload;

  if (!item || typeof item !== 'object') {
    return {
      irab: typeof payload === 'string' ? payload : '',
      details: [],
    };
  }

  const irab = pickFirstString(item, [
    'eerab',
    'irab',
    'iirab',
    'arabicGrammar',
    'grammar',
    'text',
    'description',
    'value',
  ]);

  const details = Object.entries(item)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .map(([key, value]) => ({ key, value: String(value) }));

  return { irab, details };
}

export default function IrabModal({ word, onClose }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalized = useMemo(() => normalizeIrabPayload(payload), [payload]);

  useEffect(() => {
    if (!word) return undefined;

    const controller = new AbortController();

    async function fetchIrab() {
      setLoading(true);
      setError('');
      setPayload(null);

      try {
        const { surahId, ayahId, wordId } = word;
        const endpoint = `${IRAB_API_BASE}/${surahId}/${ayahId}/${wordId}/${IRAB_SOURCE_ID}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('تعذر تحميل الإعراب لهذه الكلمة.');
        }

        const data = await response.json();
        setPayload(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'حدث خطأ أثناء جلب بيانات الإعراب.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchIrab();

    return () => controller.abort();
  }, [word]);

  if (!word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-6">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-lg bg-white shadow-soft dark:bg-slate-900 md:rounded-lg">
        <header className="flex items-start justify-between gap-4 border-b border-quran-mint bg-quran-cream p-5 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-quran-gold shadow-sm dark:bg-slate-800">
              <BookMarked size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-quran-gold">إعراب الكلمة</p>
              <h2 className="font-arabic text-3xl font-bold text-quran-ink dark:text-white">{word.text}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-quran-green focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-emerald-950"
          >
            <X size={22} />
          </button>
        </header>

        <div className="max-h-[68vh] overflow-y-auto p-5 md:p-6">
          {loading && (
            <div className="grid min-h-48 place-items-center text-quran-green dark:text-emerald-300">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 animate-spin" size={32} />
                <p className="font-bold">جاري جلب الإعراب...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
              <AlertCircle className="mb-3" size={28} />
              <p className="font-bold">{error}</p>
              <p className="mt-2 text-sm leading-6">تحقق من اتصالك أو من توفر بيانات هذه الكلمة في المصدر.</p>
            </div>
          )}

          {!loading && !error && payload && (
            <div className="space-y-5">
              <div className="rounded-lg border border-quran-mint bg-quran-paper p-5 dark:border-slate-700 dark:bg-slate-950">
                <p className="mb-2 text-sm font-bold text-quran-gold">النص الإعرابي</p>
                <p className="text-xl leading-10 text-quran-ink dark:text-slate-100">
                  {normalized.irab || 'لم يرجع المصدر نصا إعرابيا مباشرا لهذه الكلمة.'}
                </p>
              </div>

              {normalized.details.length > 0 && (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {normalized.details.map((detail) => (
                    <div
                      key={`${detail.key}-${detail.value}`}
                      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {detail.key}
                      </dt>
                      <dd className="mt-2 break-words text-sm leading-6 text-slate-800 dark:text-slate-100">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
