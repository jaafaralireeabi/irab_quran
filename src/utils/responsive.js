import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  compact: 0,
  tablet: 768,
  desktop: 1024,
};

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isCompact = !isTablet;

  return {
    width,
    height,
    isCompact,
    isTablet,
    isDesktop,
    isWideLayout: isDesktop,
    contentMaxWidth: 1280,
    sidebarWidth: 320,
    screenPadding: isCompact ? 16 : isTablet ? 24 : 32,
    ayahFontSize: isCompact ? 34 : 48,
    ayahLineHeight: isCompact ? 78 : 103,
    modalMaxWidth: isTablet ? 560 : width,
  };
}