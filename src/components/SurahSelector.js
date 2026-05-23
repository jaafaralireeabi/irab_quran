import { StyleSheet, Text, View } from 'react-native';
import { SURAHS } from '../data/surahs.js';
import { colors } from '../theme/colors.js';
import SelectField from './SelectField.js';

function buildAyahOptions(count) {
  return Array.from({ length: count }, (_, index) => ({
    label: `الآية ${index + 1}`,
    value: index + 1,
  }));
}

const surahOptions = SURAHS.map((surah) => ({
  label: `${surah.id}. سورة ${surah.name}`,
  value: surah.id,
}));

export default function SurahSelector({
  darkMode,
  selectedSurah,
  selectedAyah,
  onSurahChange,
  onAyahChange,
}) {
  const theme = darkMode ? darkStyles : lightStyles;
  const currentSurah = SURAHS.find((surah) => surah.id === selectedSurah) ?? SURAHS[0];
  const ayahOptions = buildAyahOptions(currentSurah.ayahs);
  const activeColor = darkMode ? '#064e3b' : colors.mint;

  const dropdownProps = {
    darkMode,
    theme,
    activeColor,
    dropdownStyle: [styles.dropdown, theme.dropdown],
    containerStyle: [styles.dropdownContainer, theme.dropdownContainer],
    textStyle: [styles.dropdownText, theme.dropdownText],
    placeholderStyle: [styles.dropdownText, theme.placeholder],
  };

  return (
    <View style={[styles.card, theme.card]}>
      <View style={styles.headingRow}>
      <View style={[styles.iconBox, theme.iconBox]}>
          <Text style={[styles.iconText, theme.iconText]}>📖</Text>
        </View>
      <View style={styles.headingText}>
          <Text style={[styles.kicker, theme.gold]}>التصفح</Text>
          <Text style={[styles.heading, theme.title]}>اختر السورة والآية</Text>
        </View>

        
      </View>

      <Text style={[styles.label, theme.label]}>السورة</Text>
      <SelectField
        {...dropdownProps}
        data={surahOptions}
        value={selectedSurah}
        onValueChange={onSurahChange}
        accessibilityLabel="اختر السورة"
      />

      <Text style={[styles.label, theme.label, styles.ayahLabel]}>الآية</Text>
      <SelectField
        {...dropdownProps}
        data={ayahOptions}
        value={selectedAyah}
        onValueChange={onAyahChange}
        withHashIcon
        accessibilityLabel="اختر الآية"
      />

      <View style={[styles.summary, theme.summary]}>
        <Text style={[styles.summaryText, theme.summaryText]}>
          <Text style={theme.summaryStrong}>سورة {currentSurah.name}</Text>
          <Text style={theme.gold}> • </Text>
          {currentSurah.ayahs} آية
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'visible',
    padding: 16,
    shadowColor: '#1f2933',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
    zIndex: 1,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconText: {
    fontSize: 20,
  },
  headingText: {
    alignItems: 'flex-start',
    flex: 1,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'right',
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'right',
  },
  ayahLabel: {
    marginTop: 4,
  },
  dropdown: {
    borderRadius: 10,
    marginBottom: 20,
    minHeight: 48,
  },
  dropdownContainer: {
    borderRadius: 10,
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  summary: {
    borderRadius: 10,
    padding: 14,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'right',
  },
});

const lightStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white85,
    borderColor: 'rgba(219, 238, 229, 0.8)',
  },
  iconBox: {
    backgroundColor: colors.mint,
  },
  iconText: {
    color: colors.green,
  },
  gold: {
    color: colors.gold,
  },
  title: {
    color: colors.ink,
  },
  label: {
    color: '#334155',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  dropdownText: {
    color: colors.ink,
  },
  placeholder: {
    color: '#64748b',
  },
  summary: {
    backgroundColor: colors.cream,
  },
  summaryText: {
    color: '#334155',
  },
  summaryStrong: {
    color: colors.green,
    fontWeight: '800',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.slate900_80,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconBox: {
    backgroundColor: '#064e3b',
  },
  iconText: {
    color: '#d1fae5',
  },
  gold: {
    color: '#f4d47c',
  },
  title: {
    color: '#ffffff',
  },
  label: {
    color: '#e2e8f0',
  },
  dropdown: {
    backgroundColor: '#020617',
    borderColor: '#334155',
  },
  dropdownContainer: {
    backgroundColor: '#020617',
    borderColor: '#334155',
  },
  dropdownText: {
    color: '#ffffff',
  },
  placeholder: {
    color: '#94a3b8',
  },
  summary: {
    backgroundColor: '#1e293b',
  },
  summaryText: {
    color: '#cbd5e1',
  },
  summaryStrong: {
    color: '#a7f3d0',
    fontWeight: '800',
  },
});
