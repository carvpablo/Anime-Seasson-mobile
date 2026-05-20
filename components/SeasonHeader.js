import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';
import { capitalizeSeason, getCurrentSeason } from '../utils/seasonHelpers';

const SeasonHeader = ({ season, year, animeCount }) => {
  const current = getCurrentSeason();
  const displaySeason = season || current.season;
  const displayYear = year || current.year;

  const seasonIcons = {
    winter: 'snow-outline',
    spring: 'flower-outline',
    summer: 'sunny-outline',
    fall: 'leaf-outline',
  };

  const seasonColors = {
    winter: '#4C9BE8',
    spring: '#FF85A1',
    summer: '#F6C90E',
    fall: '#FF7A45',
  };

  const icon = seasonIcons[displaySeason] || 'calendar-outline';
  const accentColor = seasonColors[displaySeason] || colors.accent;

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}50` }]}>
        <Ionicons name={icon} size={18} color={accentColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.seasonLabel}>
          {capitalizeSeason(displaySeason)} {displayYear}
        </Text>
        {animeCount != null ? (
          <Text style={styles.countLabel}>{animeCount} series airing</Text>
        ) : null}
      </View>
      <View style={[styles.liveBadge, { backgroundColor: `${accentColor}20` }]}>
        <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.liveText, { color: accentColor }]}>NOW</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  seasonLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  countLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    ...typography.label,
    letterSpacing: 1,
  },
});

export default SeasonHeader;
