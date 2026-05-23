import { I18nManager, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import IrabModal from './components/IrabModal.js';
import QuranReader from './components/QuranReader.js';
import SurahSelector from './components/SurahSelector.js';
import SearchBar from './components/SearchBar.js';
import { SURAHS } from './data/surahs.js';
import { colors } from './theme/colors.js';
import { useResponsiveLayout } from './utils/responsive.js';

I18nManager.allowRTL(true);

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const layout = useResponsiveLayout();
  const theme = darkMode ? darkStyles : lightStyles;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.removeAttribute('dir');
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

  function handleSearchSelect({ surahId, ayahId }) {
    setSelectedSurah(surahId);
    setSelectedAyah(ayahId);
    setSelectedWord(null);
  }

  function openProject() {
    Linking.openURL('https://github.com/jaafaralireeabi/irab_quran');
  }

  return (
    <View style={[styles.screen, theme.screen]}>
      <IrabModal darkMode={darkMode} word={selectedWord} onClose={() => setSelectedWord(null)} />

      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: layout.screenPadding,
            paddingBottom: layout.isCompact ? 28 : 40,
            alignItems: 'center',
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        
        <View
          style={[
            styles.contentInner,
            styles.contentRtl,
            { maxWidth: layout.contentMaxWidth, width: '100%' },
            layout.isWideLayout && styles.contentWide,
          ]}
        >
          {/* quran */}
          <View style={[layout.isWideLayout ? styles.columns : styles.stack]}>
            <View
              style={[
                layout.isWideLayout && styles.sidebar,
                { width: layout.isWideLayout ? layout.sidebarWidth : '100%' },
              ]}
            >
              <View style={[styles.header, theme.panel]}>
              <View style={styles.headerText}>
                  <Text style={[styles.kicker, theme.gold]}>تطبيق تفاعلي</Text>
                  <Text style={[styles.title, theme.title]}>إعراب القرآن الكريم</Text>
                </View>
                <Pressable
                  onPress={() => setDarkMode((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                  style={[styles.themeButton, darkMode && styles.themeButtonDark]}
                >
                  <Text style={styles.themeButtonText}>{darkMode ? '☀' : '☾'}</Text>
                </Pressable>

              </View>

              <View style={styles.searchBar}>
              <SearchBar darkMode={darkMode} onSelectAyah={handleSearchSelect}  />
              </View>
              
              <View style = {styles.surahSelector}>
              <SurahSelector
                darkMode={darkMode}
                selectedSurah={selectedSurah}
                selectedAyah={selectedAyah}
                onSurahChange={handleSurahChange}
                onAyahChange={handleAyahChange}
                
              />
              </View>
            </View>

            <View style={layout.isWideLayout ? styles.main : styles.mainStacked}>
              <QuranReader
                darkMode={darkMode}
                selectedSurah={selectedSurah}
                selectedAyah={selectedAyah}
                onWordClick={setSelectedWord}
              />
            </View>
          </View>

          {/* footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, theme.muted]}>تم تطوير هذا التطبيق بواسطة </Text>
            <Pressable onPress={openProject} accessibilityRole="link">
              <Text style={[styles.footerLink, theme.gold]}>jaafaralireeabi</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 20 : 40,
  },
  scroll: {
    flex: 1,
    ...({ direction: 'rtl' }),
    
  },
  contentRtl: Platform.select({
    web: { direction: 'rtl' },
    default: {},
  }),
  content: {
    paddingTop: 16,
    width: '100%',
  },
  contentInner: {
    gap: 14,
    width: '100%',
  },
  contentWide: {
    gap: 24,
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
  },
  stack: {
    gap: 14,
    width: '100%',
  },
  sidebar: {
    gap: 16,
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  mainStacked: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    shadowColor: '#1f2933',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 14
  },
  headerText: {
    alignItems: 'flex-start',
    flex: 1,
  },
  searchBar: {
    marginBottom: 14,
  },
  surahSelector: {
    marginBottom: 14,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'right',
  },
  themeButton: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  themeButtonDark: {
    backgroundColor: colors.gold,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});

const lightStyles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
  },
  panel: {
    backgroundColor: colors.white85,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    color: colors.green,
  },
  gold: {
    color: colors.gold,
  },
  muted: {
    color: colors.ink,
    opacity: 0.8,
  },
});

const darkStyles = StyleSheet.create({
  screen: {
    backgroundColor: '#101820',
  },
  panel: {
    backgroundColor: colors.slate900_80,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#a7f3d0',
  },
  gold: {
    color: '#f4d47c',
  },
  muted: {
    color: '#e2e8f0',
    opacity: 0.8,
  },
});
