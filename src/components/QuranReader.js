import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { SURAHS } from '../data/surahs.js';
import { colors } from '../theme/colors.js';
import { useResponsiveLayout } from '../utils/responsive.js';

const QURAN_TEXT_API = 'https://api.alquran.cloud/v1/ayah';

function splitAyahIntoWords(text) {
  return text
    .replace(/\s+[\u06D6\u06D7\u06D8\u06D9\u06DB\u06DD\u06DA]/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export default function QuranReader({ darkMode, selectedSurah, selectedAyah, onWordClick }) {
  const [ayahText, setAyahText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const layout = useResponsiveLayout();
  const theme = darkMode ? darkStyles : lightStyles;
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
    <View style={[styles.card, theme.card, layout.isWideLayout && styles.cardWide]}>
      <View style={[styles.header, theme.divider]}>


        <View style={styles.headerText}>
          <Text style={[styles.kicker, theme.gold]}>إعراب القرآن الكريم</Text>
          <Text
            style={[
              styles.title,
              theme.title,
              layout.isTablet && styles.titleWide,
            ]}
          >
            سورة {surah.name}، الآية {selectedAyah}
          </Text>
        </View>
        <View style={[styles.hint, theme.hint]}>
          <Text style={[styles.hintIcon, theme.hintText]}>✦</Text>
          <Text style={[styles.hintText, theme.hintText]}>اضغط على أي كلمة</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator color={darkMode ? '#a7f3d0' : colors.green} size="large" />
          <Text style={[styles.stateText, theme.title]}>جاري تحميل الآية...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={[styles.errorBox, theme.errorBox]}>
          <Text style={[styles.errorIcon, theme.errorText]}>!</Text>
          <Text style={[styles.errorText, theme.errorText]}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <View style={styles.ayahWrap}>
          <Text
            style={[
              styles.ayahText,
              theme.ayahText,
              Platform.OS === 'web' && styles.ayahFontWeb,
              { fontSize: layout.ayahFontSize, lineHeight: layout.ayahLineHeight },
            ]}
          >
            {words.map((word, index) => (
              <Text key={`${word}-${index}`}>
                <Text> </Text>
                <Text
                  onPress={() =>
                    onWordClick({
                      text: word,
                      wordId: index + 1,
                      surahId: selectedSurah,
                      ayahId: selectedAyah,
                    })
                  }
                  style={[
                    styles.word,
                    theme.word,
                    { fontSize: layout.ayahFontSize, lineHeight: layout.ayahLineHeight },
                  ]}
                >
                  {word}
                </Text>
              </Text>
            ))}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 420,
    padding: 16,
    shadowColor: '#1f2933',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  cardWide: {
    minHeight: 520,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 20,
  },
  headerText: {
    alignItems: 'flex-start',
    flexGrow: 1,
    minWidth: 200,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 4,
    textAlign: 'right',
  },
  titleWide: {
    fontSize: 30,
    lineHeight: 40,
  },
  hint: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hintIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '800',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  stateText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 30,
    minHeight: 320,
    padding: 18,
  },
  errorIcon: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  ayahWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 896,
    minHeight: 320,
    alignSelf: 'center',
    width: '100%',
  },
  ayahText: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  ayahFontWeb: {
    fontFamily: 'Amiri, Scheherazade New, serif',
  },
  word: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});

const lightStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    borderBottomColor: colors.mint,
  },
  gold: {
    color: colors.gold,
  },
  title: {
    color: colors.ink,
  },
  hint: {
    backgroundColor: colors.mint,
  },
  hintText: {
    color: colors.green,
  },
  ayahText: {
    color: colors.ink,
  },
  word: {
    color: colors.ink,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  divider: {
    borderBottomColor: '#334155',
  },
  gold: {
    color: '#f4d47c',
  },
  title: {
    color: '#ffffff',
  },
  hint: {
    backgroundColor: '#064e3b',
  },
  hintText: {
    color: '#d1fae5',
  },
  ayahText: {
    color: '#f8fafc',
  },
  word: {
    color: '#f8fafc',
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  errorText: {
    color: '#fecaca',
  },
});
