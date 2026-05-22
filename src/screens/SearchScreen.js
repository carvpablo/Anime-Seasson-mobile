import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadows } from '../constants/theme';

// ─── Default State ────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  title: '',
  studio: '',
  genre: '',
  character: '',
  type: '',
  rating: '',
  genreId: '',
  minScore: 0,
  minEpisodes: 1,
  safeSearch: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabel}>
    <Ionicons name={icon} size={14} color={colors.accent} />
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

const StyledInput = ({ placeholder, value, onChangeText, icon }) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={16} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      returnKeyType="search"
    />
  </View>
);

const StyledPicker = ({ label, selectedValue, onValueChange, items }) => (
  <View style={styles.pickerContainer}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={colors.accent}
        itemStyle={{ color: colors.textPrimary }}
      >
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={Platform.OS === 'android' ? colors.textPrimary : undefined}
          />
        ))}
      </Picker>
    </View>
  </View>
);

const StyledSlider = ({ label, value, min, max, step, format, onValueChange }) => (
  <View style={styles.sliderContainer}>
    <View style={styles.sliderHeader}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Text style={styles.sliderValue}>{format(value)}</Text>
    </View>
    <Slider
      style={styles.slider}
      minimumValue={min}
      maximumValue={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      minimumTrackTintColor={colors.accent}
      maximumTrackTintColor={colors.shimmer}
      thumbTintColor={colors.accent}
    />
    <View style={styles.sliderTicks}>
      <Text style={styles.tickLabel}>{min}</Text>
      <Text style={styles.tickLabel}>{max}</Text>
    </View>
  </View>
);

const StyledSwitch = ({ label, description, value, onValueChange, icon }) => (
  <View style={styles.switchRow}>
    <View style={styles.switchInfo}>
      <Ionicons name={icon} size={18} color={value ? colors.accent : colors.textMuted} />
      <View style={styles.switchTextGroup}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.shimmer, true: colors.accentLight }}
      thumbColor={value ? colors.accent : colors.textMuted}
      ios_backgroundColor={colors.shimmer}
    />
  </View>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'Any Type', value: '' },
  { label: 'TV', value: 'tv' },
  { label: 'Movie', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'ONA', value: 'ona' },
  { label: 'Special', value: 'special' },
  { label: 'Music', value: 'music' },
];

const GENRE_OPTIONS = [
  { label: 'Any Genre', value: '' },
  { label: 'Action', value: '1' },
  { label: 'Adventure', value: '2' },
  { label: 'Avant Garde', value: '5' },
  { label: 'Award Winning', value: '46' },
  { label: 'Boys Love', value: '28' },
  { label: 'Comedy', value: '4' },
  { label: 'Drama', value: '8' },
  { label: 'Fantasy', value: '10' },
  { label: 'Girls Love', value: '26' },
  { label: 'Gourmet', value: '47' },
  { label: 'Horror', value: '14' },
  { label: 'Mystery', value: '7' },
  { label: 'Romance', value: '22' },
  { label: 'Sci-Fi', value: '24' },
  { label: 'Slice of Life', value: '36' },
  { label: 'Sports', value: '30' },
  { label: 'Supernatural', value: '37' },
  { label: 'Suspense', value: '41' },
  { label: 'Ecchi', value: '9' },
  { label: 'Erotica', value: '49' },
  { label: 'Hentai', value: '12' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const set = useCallback(
    (key) => (val) => setFilters((prev) => ({ ...prev, [key]: val })),
    []
  );

  const handleSearch = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Inicio', params: { filters: JSON.stringify(filters) } });
  }, [filters, navigation]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 + spacing.xxxl }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Title ── */}
      <View style={[styles.titleBlock, { paddingTop: spacing.xl }]}>
        <View style={styles.titleRow}>
          <Ionicons name="search-circle" size={32} color={colors.accent} />
          <Text style={styles.title}>Anime Discovery</Text>
        </View>
        <Text style={styles.subtitle}>Fine-tune your search with powerful filters</Text>
      </View>

      {/* ── Text Inputs ── */}
      <View style={styles.card}>
        <SectionLabel icon="text-outline" label="Keywords" />
        <StyledInput
          placeholder="Anime title…"
          value={filters.title}
          onChangeText={set('title')}
          icon="tv-outline"
        />
        <StyledInput
          placeholder="Studio name…"
          value={filters.studio}
          onChangeText={set('studio')}
          icon="business-outline"
        />
        <StyledInput
          placeholder="Genre keywords…"
          value={filters.genre}
          onChangeText={set('genre')}
          icon="pricetag-outline"
        />
        <StyledInput
          placeholder="Character name…"
          value={filters.character}
          onChangeText={set('character')}
          icon="person-outline"
        />
      </View>

      {/* ── Pickers ── */}
      <View style={styles.card}>
        <SectionLabel icon="options-outline" label="Category" />
        <View style={styles.pickersRow}>
          <View style={styles.pickerHalf}>
            <StyledPicker
              label="Type"
              selectedValue={filters.type}
              onValueChange={set('type')}
              items={TYPE_OPTIONS}
            />
          </View>
          <View style={styles.pickerDivider} />
          <View style={styles.pickerHalf}>
            <StyledPicker
              label="Genre"
              selectedValue={filters.genreId}
              onValueChange={set('genreId')}
              items={GENRE_OPTIONS}
            />
          </View>
        </View>
      </View>

      {/* ── Sliders ── */}
      <View style={styles.card}>
        <SectionLabel icon="analytics-outline" label="Score & Year" />
        <StyledSlider
          label="Minimum Score"
          value={filters.minScore}
          min={0}
          max={10}
          step={0.5}
          format={(v) => `★ ${v.toFixed(1)}`}
          onValueChange={set('minScore')}
        />
        <View style={styles.divider} />
        <StyledSlider
          label="Minimum Episodes"
          value={filters.minEpisodes}
          min={1}
          max={150}
          step={1}
          format={(v) => `${v} ep${v === 1 ? '' : 's'}`}
          onValueChange={set('minEpisodes')}
        />

      </View>

      {/* ── Switches ── */}
      <View style={styles.card}>
        <SectionLabel icon="toggle-outline" label="Preferences" />
        <StyledSwitch
          label="Safe Search (SFW)"
          description="Exclude adult and explicit content"
          value={filters.safeSearch}
          onValueChange={set('safeSearch')}
          icon="shield-checkmark-outline"
        />
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.75}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Title
  titleBlock: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 40,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
    ...shadows.card,
  },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabelText: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },

  // Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  inputIcon: {
    width: 18,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  // Pickers
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickerHalf: {
    flex: 1,
  },
  pickerDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.sm,
    marginTop: 24,
    height: 70,
  },
  pickerContainer: {
    gap: spacing.xs,
  },
  pickerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  pickerWrapper: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    height: Platform.OS === 'ios' ? 120 : 50,
  },

  // Sliders
  sliderContainer: {
    gap: spacing.xs,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    ...typography.h4,
    color: colors.accent,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  tickLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  switchTextGroup: {
    flex: 1,
    gap: 2,
  },
  switchLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  switchDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  resetButtonText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  searchButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    ...shadows.accent,
  },
  searchButtonText: {
    ...typography.h4,
    color: '#fff',
  },
});
