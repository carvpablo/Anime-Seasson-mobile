// ─── Color Palette ──────────────────────────────────────────────────────────
export const colors = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#1A1A2E',
  card: '#16213E',
  cardBorder: '#0F3460',

  // Accent
  accent: '#E94560',
  accentLight: 'rgba(233, 69, 96, 0.15)',

  // Text
  textPrimary: '#EAEAEA',
  textSecondary: '#8892A4',
  textMuted: '#4A5568',

  // Status
  success: '#00D4AA',
  warning: '#F6C90E',
  error: '#FF5252',
  info: '#4C9BE8',

  // Misc
  divider: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.6)',
  shimmer: '#1E2A45',
  shimmerHighlight: '#263552',
};

// ─── Spacing Scale ───────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Border Radius ───────────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' },
  h4: { fontSize: 15, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 17 },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
};

// ─── Shadows ────────────────────────────────────────────────────────────────
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  accent: {
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
};
