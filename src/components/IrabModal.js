import { AlertCircle, BookMarked, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const IRAB_API_BASE = "https://dev.surahapp.com/api/v1/word/eerab-word";
const IRAB_SOURCE_ID = 2;
const BISMILLAH_IRAB_BY_WORD = {
  بسم: {
    word: "بِسْمِ",
    content:
      "الباء حرف جر، واسم اسم مجرور بالباء وعلامة جره الكسرة، وهو مضاف.",
  },
  الله: {
    word: "اللَّهِ",
    content:
      "اسم الجلالة مضاف إليه مجرور وعلامة جره الكسرة الظاهرة.",
  },
  الرحمن: {
    word: "الرَّحْمَنِ",
    content:
      "الرحمن نعت لاسم الجلالة مجرور وعلامة جره الكسرة الظاهرة.",
  },
  الرحيم: {
    word: "الرَّحِيمِ",
    content:
      "الرحيم نعت ثان لاسم الجلالة مجرور وعلامة جره الكسرة الظاهرة.",
  },
};

function normalizeArabicWord(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[^\u0621-\u064A]/g, "");
}

function getBismillahFallback(word) {
  if (!word) return null;

  const fallback = BISMILLAH_IRAB_BY_WORD[normalizeArabicWord(word.text)];
  if (!fallback) return null;

  return {
    sura_number: 1,
    aya_number: 1,
    word_number: word.wordId,
  };
}

function isBismillahWord(word) {
  return Boolean(
    word && BISMILLAH_IRAB_BY_WORD[normalizeArabicWord(word.text)],
  );
}

function ayahHasBismillah(word) {
  return Boolean(
    word && word.ayahId === 1 && word.surahId !== 9,
  );
}

function getApiWordId(word) {
  if (!word) return 0;

  if (isBismillahWord(word)) {
    return word.wordId;
  }

  if (ayahHasBismillah(word)) {
    return word.wordId - 4;
  }

  return word.wordId;
}

function pickFirstString(data, keys) {
  if (!data || typeof data !== "object") return "";

  for (const key of keys) {
    if (typeof data[key] === "string" && data[key].trim()) {
      return data[key];
    }
  }

  return "";
}

function normalizeIrabPayload(payload) {
  const item = Array.isArray(payload) ? payload[0] : (payload?.data ?? payload);

  if (!item || typeof item !== "object") {
    return {
      irab: typeof payload === "string" ? payload : "",
      details: [],
    };
  }

  const irab = pickFirstString(item, [
    "content",
    "eerab",
    "irab",
    "iirab",
    "arabicGrammar",
    "grammar",
    "text",
    "description",
    "value",
  ]).replace(/[\u062C\u06DA]/g, "");
  
  const details = Object.entries(item)
    .filter(
      ([, value]) =>
        value !== null && value !== undefined && typeof value !== "object",
    )
    .map(([key, value]) => ({ key, value: String(value) }));

  return { irab, details };
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload?.error === "Word not found.") {
      return "لا تتوفر بيانات إعراب لهذه الكلمة في المصدر الحالي.";
    }

    return payload?.error || payload?.message || "تعذر تحميل الإعراب لهذه الكلمة.";
  } catch {
    return "تعذر تحميل الإعراب لهذه الكلمة.";
  }
}

export default function IrabModal({ word, onClose }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalized = useMemo(() => normalizeIrabPayload(payload), [payload]);

  useEffect(() => {
    if (!word) return undefined;

    const controller = new AbortController();

    async function fetchIrab() {
      setLoading(true);
      setError("");
      setPayload(null);

      try {
        const fallback = getBismillahFallback(word);
        const wordId = fallback
          ? fallback.word_number
          : getApiWordId(word);

        const endpoint = fallback
          ? `${IRAB_API_BASE}/${fallback.sura_number}/${fallback.aya_number}/${wordId}/${wordId}`
          : `${IRAB_API_BASE}/${word.surahId}/${word.ayahId}/${wordId}/${wordId}`;
        
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = await response.json();
        setPayload(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "حدث خطأ أثناء جلب بيانات الإعراب.");
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
              <h2 className="font-arabic text-3xl font-bold text-quran-ink dark:text-white">
                {word.text}
              </h2>
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
              <p className="mt-2 text-sm leading-6">
                جرّب كلمة أخرى، أو تحقق من توفر بيانات هذه الكلمة في مصدر الإعراب.
              </p>
            </div>
          )}

          {!loading && !error && payload && (
            <div className="space-y-5">
              <div className="rounded-lg border border-quran-mint bg-quran-paper p-5 dark:border-slate-700 dark:bg-slate-950">
                <p className="mb-2 text-sm font-bold text-quran-gold">
                  الإعراب:
                </p>
                <p className="text-xl leading-10 text-quran-ink dark:text-slate-100">
                  {normalized.irab ||
                    "لم يرجع المصدر نصًا إعرابيًا مباشرًا لهذه الكلمة."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
