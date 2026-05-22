import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DayTabs from '../components/DayTabs';
import LoadingState, { LoadingMore } from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

import useSchedule from '../hooks/useSchedule';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';
import { formatBroadcast } from '../utils/dateHelpers';


const ScheduleCard = ({ anime, navigation }) => {
  const imageUri = anime?.images?.jpg?.image_url;
  const title = anime?.title_english || anime?.title || 'Unknown Title';
  const broadcast = formatBroadcast(anime?.broadcast?.string);
  const score = anime?.score;
  const episodes = anime?.episodes;
  const genres = anime?.genres?.slice(0, 2).map((g) => g.name).join(' · ') || '';

  return (
    <TouchableOpacity
      style={styles.scheduleCard}
      onPress={() => navigation.navigate('AnimeDetail', { id: anime.mal_id })}
      activeOpacity={0.85}
    >
      {/* Poster thumbnail */}
      <View style={styles.thumbnail}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnailImg} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="image-outline" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>

        {genres ? <Text style={styles.cardGenres} numberOfLines={1}>{genres}</Text> : null}

        <View style={styles.cardMeta}>
          {broadcast !== 'TBA' && (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={11} color={colors.accent} />
              <Text style={styles.metaText}>{broadcast}</Text>
            </View>
          )}
          {score && (
            <View style={styles.metaChip}>
              <Ionicons name="star" size={11} color={colors.warning} />
              <Text style={[styles.metaText, { color: colors.warning }]}>{score.toFixed(1)}</Text>
            </View>
          )}
          {episodes && (
            <View style={styles.metaChip}>
              <Ionicons name="film-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.metaText}>{episodes} ep</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

export default function ScheduleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { data, selectedDay, loading, loadingMore, error, hasNextPage, changeDay, refresh, loadMore } =
    useSchedule();

  const renderItem = useCallback(
    ({ item }) => <ScheduleCard anime={item} navigation={navigation} />,
    [navigation]
  );

  const renderFooter = useCallback(() => (loadingMore ? <LoadingMore /> : null), [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="moon-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyText}>No anime airing on this day.</Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <DayTabs selectedDay={selectedDay} onDayChange={changeDay} />
      </View>

      {loading && data.length === 0 ? (
        <LoadingState message="Loading schedule..." fullScreen />
      ) : error && data.length === 0 ? (
        <ErrorState message={error} onRetry={refresh} fullScreen />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.mal_id)}
          renderItem={renderItem}
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  thumbnail: {
    width: 60,
    height: 85,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.shimmer,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  cardGenres: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
