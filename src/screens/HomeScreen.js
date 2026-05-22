import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimeCard from '../components/AnimeCard';
import SeasonHeader from '../components/SeasonHeader';
import LoadingState, { LoadingMore } from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

import useSeasonalAnime from '../hooks/useSeasonalAnime';
import { colors, spacing, typography, radius } from '../constants/theme';

const numColumns = 2;

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth <= 402; // iPhone 17 Pro logical width (402pt)

  // Read filters passed from the search screen (serialized as JSON string)
  const filtersParam = route.params?.filters;
  const activeFilters = useMemo(
    () => (filtersParam ? JSON.parse(filtersParam) : null),
    [filtersParam]
  );

  const { data, loading, loadingMore, error, hasNextPage, refresh, loadMore } =
    useSeasonalAnime(activeFilters);

  const handleSchedulePress = useCallback(() => {
    navigation.navigate('Grade');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const handleClearFilters = useCallback(() => {
    navigation.setParams({ filters: undefined });
  }, [navigation]);

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <View>
            <Text style={styles.appTitle}>AnimeSeason</Text>
            <Text style={styles.appSubtitle}>
              {activeFilters ? 'Search results' : "This season's airing anime"}
            </Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSearchPress}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={isCompact ? styles.iconButton : styles.scheduleButton}
              onPress={handleSchedulePress}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.accent} />
              {!isCompact && (
                <Text style={styles.scheduleButtonText}>Schedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active filters banner */}
        {activeFilters && (
          <TouchableOpacity
            style={styles.filterBanner}
            onPress={handleClearFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={14} color={colors.accent} />
            <Text style={styles.filterBannerText}>Filters active — tap to clear</Text>
            <Ionicons name="close-circle" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* Season header (only in seasonal mode) */}
        {!activeFilters && (
          <SeasonHeader animeCount={data.length > 0 ? data.length : null} />
        )}

        {/* Grid spacer */}
        <View style={styles.gridSpacer} />
      </View>
    ),
    [data.length, handleSchedulePress, handleSearchPress, handleClearFilters, activeFilters]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
        <AnimeCard anime={item} />
      </View>
    ),
    []
  );

  const renderFooter = useCallback(
    () => (loadingMore ? <LoadingMore /> : null),
    [loadingMore]
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="tv-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>
          {activeFilters
            ? 'No anime matched your filters.\nTry adjusting them.'
            : 'No anime found for this season.'}
        </Text>
      </View>
    );
  }, [loading, activeFilters]);

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingState message={activeFilters ? 'Searching…' : 'Loading seasonal anime...'} fullScreen />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <ErrorState message={error} onRetry={refresh} fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.mal_id)}
        renderItem={renderItem}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={hasNextPage ? loadMore : null}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={loading && data.length > 0}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: spacing.xl + 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  appTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  appSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  scheduleButtonText: {
    ...typography.h4,
    color: colors.accent,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  filterBannerText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
  },
  gridSpacer: {
    height: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
  },
  cardLeft: {
    marginRight: spacing.md / 2,
  },
  cardRight: {
    marginLeft: spacing.md / 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
