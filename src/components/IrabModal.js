import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useResponsiveLayout } from '../utils/responsive.js';

const IRAB_API_BASE = 'https://dev.surahapp.com/api/v1/word/eerab-word';
const BISMILLAH_IRAB_BY_WORD = {
  بسم: {
    word: 'بِسْمِ',
    content:
      'الباء حرف جر، واسم اسم مجرور بالباء وعلامة جره الكسرة، وهو مضاف.',
  },
  الله: {
    word: 'اللَّهِ',
    content:
      'اسم الجلالة مضاف إليه مجرور وعلامة جره الكسرة الظاهرة.',
  },
  الرحمن: {
    word: 'الرَّحْمَنِ',
    content:
      'الرحمن نعت لاسم الجلالة مجرور وعلامة جره الكسرة الظاهرة.',
  },
  الرحيم: {
    word: 'الرَّحِيمِ',
    content:
      'الرحيم نعت ثان لاسم الجلالة مجرور وعلامة جره الكسرة الظاهرة.',
  },
};

function normalizeArabicWord(text) {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[^\u0621-\u064A]/g, '');
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
  return Boolean(word && BISMILLAH_IRAB_BY_WORD[normalizeArabicWord(word.text)]);
}

function ayahHasBismillah(word) {
  return Boolean(word && word.ayahId === 1 && word.surahId !== 9);
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
  if (!data || typeof data !== 'object') return '';

  for (const key of keys) {
    if (typeof data[key] === 'string' && data[key].trim()) {
      return data[key];
    }
  }

  return '';
}

function normalizeIrabPayload(payload) {
  const item = Array.isArray(payload) ? payload[0] : (payload?.data ?? payload);

  if (!item || typeof item !== 'object') {
    return {
      irab: typeof payload === 'string' ? payload : '',
    };
  }

  const irab = pickFirstString(item, [
    'content',
    'eerab',
    'irab',
    'iirab',
    'arabicGrammar',
    'grammar',
    'text',
    'description',
    'value',
  ]);

  return { irab };
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload?.error === 'Word not found.') {
      return 'لا تتوفر بيانات إعراب لهذه الكلمة في المصدر الحالي.';
    }

    return payload?.error || payload?.message || 'تعذر تحميل الإعراب لهذه الكلمة.';
  } catch {
    return 'تعذر تحميل الإعراب لهذه الكلمة.';
  }
}

export default function IrabModal({ darkMode, word, onClose }) {
  const layout = useResponsiveLayout();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = darkMode ? darkStyles : lightStyles;
  const normalized = useMemo(() => normalizeIrabPayload(payload), [payload]);

  useEffect(() => {
    if (!word) return undefined;

    const controller = new AbortController();

    async function fetchIrab() {
      setLoading(true);
      setError('');
      setPayload(null);

      try {
        const fallback = getBismillahFallback(word);
        const wordId = fallback ? fallback.word_number : getApiWordId(word);

        const endpoint = fallback
          ? `${IRAB_API_BASE}/${fallback.sura_number}/${fallback.aya_number}/${wordId}/${wordId}`
          : `${IRAB_API_BASE}/${word.surahId}/${word.ayahId}/${wordId}/${wordId}`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
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
  return (
    //close modal when click on overlay
    <Modal visible={Boolean(word)} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, layout.isTablet && styles.backdropWide]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            theme.sheet,
            layout.isTablet && styles.sheetWide,
            { maxWidth: layout.modalMaxWidth },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.header, theme.header]}>
            <View style={styles.titleWrap}>
              <View style={[styles.iconBox, theme.iconBox]}>
                <Text style={[styles.iconText, theme.gold]}>إ</Text>
              </View>
              <View style={styles.wordTitleWrap}>
                <Text style={[styles.kicker, theme.gold]}>إعراب الكلمة</Text>
                <Text style={[styles.wordTitle, theme.title]}>{word?.text}</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              style={[styles.closeButton, theme.closeButton]}
            >
              <Text style={[styles.closeButtonText, theme.closeButtonText]}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={[styles.body, styles.modalBodyRtl]}>
            {loading && (
              <View style={styles.centerState}>
                <ActivityIndicator color={darkMode ? '#a7f3d0' : '#14532d'} size="large" />
                <Text style={[styles.stateText, theme.title]}>جاري جلب الإعراب...</Text>
              </View>
            )}

            {!loading && error && (
              <View style={[styles.errorBox, theme.errorBox]}>
                <Text style={[styles.errorIcon, theme.errorText]}>!</Text>
                <Text style={[styles.errorText, theme.errorText]}>{error}</Text>
                <Text style={[styles.errorHint, theme.errorText]}>
                  جرّب كلمة أخرى، أو تحقق من توفر بيانات هذه الكلمة في مصدر الإعراب.
                </Text>
              </View>
            )}

            {!loading && !error && payload && (
              <View style={[styles.irabBox, theme.irabBox]}>
                <Text style={[styles.irabLabel, theme.gold]}>الإعراب:</Text>
                <Text style={[styles.irabText, theme.bodyText]}>
                  {normalized.irab ||
                    'لم يرجع المصدر نصا إعرابيا مباشرا لهذه الكلمة.'}
                </Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
    
  );
}



const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropWide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '88%',
    overflow: 'hidden',
    width: '100%',
  },
  sheetWide: {
    borderRadius: 18,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  titleWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconText: {
    fontSize: 22,
    fontWeight: '900',
  },
  wordTitleWrap: {
    alignItems: 'flex-end',
    flex: 1,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  wordTitle: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  modalScroll: {
    ...(Platform.OS === 'web' ? { direction: 'ltr' } : null),
  },
  modalBodyRtl: Platform.select({
    web: { direction: 'rtl' },
    default: {},
  }),
  body: {
    padding: 16,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  stateText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  errorIcon: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'right',
  },
  errorHint: {
    fontSize: 14,
    lineHeight: 24,
    marginTop: 8,
    textAlign: 'right',
  },
  irabBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  irabLabel: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'right',
  },
  irabText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

const lightStyles = StyleSheet.create({
  sheet: {
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#f3ead7',
    borderBottomColor: '#d8e9dd',
  },
  iconBox: {
    backgroundColor: '#ffffff',
  },
  gold: {
    color: '#b88924',
  },
  title: {
    color: '#173b2f',
  },
  closeButton: {
    backgroundColor: '#ffffff',
  },
  closeButtonText: {
    color: '#334155',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
  },
  irabBox: {
    backgroundColor: '#fffdf7',
    borderColor: '#d8e9dd',
  },
  bodyText: {
    color: '#173b2f',
  },
});

const darkStyles = StyleSheet.create({
  sheet: {
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#334155',
  },
  iconBox: {
    backgroundColor: '#1f2937',
  },
  gold: {
    color: '#f4d47c',
  },
  title: {
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#1f2937',
  },
  closeButtonText: {
    color: '#e5e7eb',
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  errorText: {
    color: '#fecaca',
  },
  irabBox: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  bodyText: {
    color: '#f8fafc',
  },
});
