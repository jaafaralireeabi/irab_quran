import { Platform, StyleSheet, Text, View } from 'react-native';
import { createElement } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { colors } from '../theme/colors.js';
import { fonts } from '../theme/typography.js';

const CHEVRON_LIGHT =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231f6f5b' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")";
const CHEVRON_DARK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a7f3d0' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")";

function buildWebSelectStyle(darkMode, withHashIcon) {
  return {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    width: '100%',
    minHeight: 48,
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: withHashIcon ? 36 : 14,
    paddingLeft: 36,
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: darkMode ? '#334155' : '#e2e8f0',
    backgroundColor: darkMode ? '#020617' : '#ffffff',
    backgroundImage: darkMode ? CHEVRON_DARK : CHEVRON_LIGHT,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 14px center',
    color: darkMode ? '#f8fafc' : colors.ink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: `${fonts.sans}, system-ui, sans-serif`,
    direction: 'rtl',
    textAlign: 'right',
    cursor: 'pointer',
    boxSizing: 'border-box',
    outline: 'none',
  };
}

/**
 * على الويب: <select> HTML مع أنماط inline (تعمل مع Vite و Expo web).
 * على الجوال: react-native-element-dropdown.
 */
export default function SelectField({
  data,
  value,
  onValueChange,
  darkMode,
  theme,
  dropdownStyle,
  containerStyle,
  textStyle,
  placeholderStyle,
  activeColor,
  maxHeight = 280,
  withHashIcon = false,
  accessibilityLabel,
}) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFieldWrap, dropdownStyle]}>
        {withHashIcon ? <Text style={[styles.webHash, theme.gold]}>#</Text> : null}
        {createElement('select', {
          value,
          'aria-label': accessibilityLabel,
          onChange: (event) => onValueChange(Number(event.target.value)),
          style: buildWebSelectStyle(darkMode, withHashIcon),
        }, data.map((item) =>
          createElement('option', { key: item.value, value: item.value }, item.label),
        ))}
      </View>
    );
  }

  return (
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      onChange={(item) => onValueChange(item.value)}
      style={dropdownStyle}
      containerStyle={containerStyle}
      placeholderStyle={placeholderStyle}
      selectedTextStyle={textStyle}
      itemTextStyle={textStyle}
      activeColor={activeColor}
      maxHeight={maxHeight}
    />
  );
}

const styles = StyleSheet.create({
  webFieldWrap: {
    position: 'relative',
    width: '100%',
  },
  webHash: {
    fontSize: 16,
    fontWeight: '800',
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 2,
  },
});
