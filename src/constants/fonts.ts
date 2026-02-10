// Font family constants for consistent typography across the app
export const FONTS = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

// Typography styles for common use cases
export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 28,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  h3: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  bodyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  button: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
} as const;
