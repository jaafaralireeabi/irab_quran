import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRef, useState } from 'react';
import { SURAHS } from '../data/surahs.js';
import { colors } from '../theme/colors.js';

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

export default function SearchBar({ darkMode, onSelectAyah }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const latestQueryRef = useRef('');
  const searchRequestRef = useRef(0);
  const theme = darkMode ? darkStyles : lightStyles;

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

  function handleQueryChange(nextQuery) {
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
    <View style={styles.wrap}>
      <View style={[styles.searchBox, theme.panel]}>
      <Text style={[styles.searchIcon, theme.icon]}>⌕</Text>

        <TextInput
          placeholder="ابحث عن كلمة في القرآن..."
          placeholderTextColor={darkMode ? '#cbd5e1' : '#64748b'}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          style={[styles.input, theme.input]}
          textAlign="right"
        />
      <Pressable
          onPress={() => handleSearch()}
          disabled={loading}
          style={[styles.searchButton, theme.searchButton, loading && styles.searchButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={darkMode ? '#0f172a' : '#fff'} size="small" />
          ) : (
            <Text style={[styles.searchButtonText, darkMode && styles.searchButtonTextDark]}>بحث</Text>
          )}
        </Pressable>

      </View>

      {error ? <Text style={[styles.message, theme.errorMessage]}>{error}</Text> : null}

      {!loading && results.length > 0 && (
        <View style={[styles.resultsBox, theme.resultsBox]}>
          <Text style={[styles.resultsCount, theme.resultsCount]}>
            {results.length} نتيجة لـ "{query.trim()}"
          </Text>
          <ScrollView style={styles.resultsScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {results.map((result) => (
              <Pressable
                key={`${result.surahId}-${result.ayahId}`}
                onPress={() => handleSelect(result)}
                style={[styles.resultItem, theme.resultItem]}
              >
                <View style={styles.resultMeta}>
                  <Text style={[styles.resultSurah, theme.resultSurah]}>سورة {result.surahName}</Text>
                  <Text style={[styles.resultAyah, theme.gold]}>الآية {result.ayahId}</Text>
                </View>
                <Text style={[styles.resultText, theme.resultText]} numberOfLines={2}>
                  {result.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {searched && !loading && !error && query.trim() && results.length === 0 && (
        <Text style={[styles.message, theme.errorMessage]}>
          لم يتم العثور على آية تحتوي على هذه الكلمة.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 2,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    shadowColor: '#1f2933',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 24,
    fontWeight: '800',
    width: 28,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 42,
    writingDirection: 'rtl',
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: 12,
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  searchButtonTextDark: {
    color: '#0f172a',
  },
  message: {
    borderRadius: 10,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 8,
    padding: 12,
    textAlign: 'right',
  },
  resultsBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
    zIndex: 20,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '800',
    padding: 12,
    textAlign: 'right',
  },
  resultsScroll: {
    maxHeight: 330,
  },
  resultItem: {
    borderTopWidth: 1,
    padding: 12,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultSurah: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultAyah: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultText: {
    fontSize: 19,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

const lightStyles = StyleSheet.create({
  panel: {
    backgroundColor: colors.white85,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  icon: {
    color: colors.ink,
    opacity: 0.8,
  },
  input: {
    color: colors.ink,
  },
  searchButton: {
    backgroundColor: colors.green,
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  resultsBox: {
    backgroundColor: '#ffffff',
    borderColor: '#d8e9dd',
  },
  resultsCount: {
    color: colors.green,
  },
  resultItem: {
    borderTopColor: 'rgba(219, 238, 229, 0.7)',
  },
  resultSurah: {
    color: colors.green,
  },
  gold: {
    color: colors.gold,
  },
  resultText: {
    color: colors.ink,
  },
});

const darkStyles = StyleSheet.create({
  panel: {
    backgroundColor: colors.slate900_80,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchButton: {
    backgroundColor: colors.gold,
  },
  icon: {
    color: '#e5e7eb',
  },
  input: {
    color: '#ffffff',
  },
  errorMessage: {
    backgroundColor: '#450a0a',
    color: '#fecaca',
  },
  resultsBox: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  resultsCount: {
    color: '#a7f3d0',
  },
  resultItem: {
    borderTopColor: '#1f2937',
  },
  resultSurah: {
    color: '#a7f3d0',
  },
  gold: {
    color: '#f4d47c',
  },
  resultText: {
    color: '#ffffff',
  },
});
