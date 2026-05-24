import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

import { fetchAnimeDetail, fetchAnimeEpisodes } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';
import { formatBroadcast } from '../utils/dateHelpers';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 320;

// ─── Sub-components ──────────────────────────────────────────────────────────

const GenreChip = ({ name }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{name}</Text>
  </View>
);

const StatBox = ({ icon, label, value }) => (
  <View style={styles.statBox}>
    <Ionicons name={icon} size={20} color={colors.accent} />
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SectionTitle = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

// ─── Episode Row ─────────────────────────────────────────────────────────────

const EpisodeRow = ({ episode }) => {
  const title = episode.title || episode.title_romanji || episode.title_japanese;
  const hasTitle = !!title;

  const airDate = episode.aired
    ? new Date(episode.aired).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <View style={styles.episodeRow}>
      <View style={styles.episodeNumberBadge}>
        <Text style={styles.episodeNumber}>{episode.mal_id}</Text>
      </View>
      <View style={styles.episodeInfo}>
        {hasTitle ? (
          <Text style={styles.episodeTitle} numberOfLines={2}>{title}</Text>
        ) : (
          <View style={styles.comingSoonBadge}>
            <Ionicons name="time-outline" size={11} color={colors.warning} />
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
        )}
        {airDate && (
          <View style={styles.episodeDateRow}>
            <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
            <Text style={styles.episodeDate}>{airDate}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AnimeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Animated bookmark scale
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  // Animated scroll value drives parallax + elastic effect
  const scrollY = useRef(new Animated.Value(0)).current;

  const animateBookmark = useCallback(() => {
    Animated.sequence([
      Animated.timing(bookmarkScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.spring(bookmarkScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [bookmarkScale]);

  const handleToggleFavorite = useCallback(() => {
    if (!anime) return;
    animateBookmark();
    toggleFavorite(anime);
  }, [anime, animateBookmark, toggleFavorite]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEpisodesLoading(true);
    try {
      const result = await fetchAnimeDetail(id);
      setAnime(result.data);
      const title = result.data?.title_english || result.data?.title || '';
      navigation.setOptions({
        title,
        headerRight: () => null, // placeholder — replaced after anime loads
      });
    } catch (err) {
      setError(err.message || 'Failed to load anime details.');
    } finally {
      setLoading(false);
    }

    // Load episodes independently so they don't block the main content
    try {
      const epResult = await fetchAnimeEpisodes(id);
      setEpisodes(epResult.data || []);
    } catch {
      setEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  // Update the header bookmark button whenever anime or favorite state changes
  useEffect(() => {
    if (!anime) return;
    const saved = isFavorite(anime.mal_id);
    navigation.setOptions({
      headerRight: () => (
        <Animated.View style={{ transform: [{ scale: bookmarkScale }], marginRight: spacing.md }}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={saved ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>
      ),
    });
  }, [anime, isFavorite, bookmarkScale, handleToggleFavorite, navigation]);

  if (loading) return <LoadingState message="Loading details..." fullScreen />;
  if (error || !anime) return <ErrorState message={error} onRetry={load} fullScreen />;

  const title = anime.title_english || anime.title;
  const titleJP = anime.title_japanese;
  const synopsis = anime.synopsis?.replace(/\[Written by MAL Rewrite\]/, '').trim();
  const score = anime.score;
  const rank = anime.rank;
  const members = anime.members;
  const episodeCount = anime.episodes;
  const status = anime.status;
  const season = anime.season;
  const year = anime.year;
  const broadcast = formatBroadcast(anime.broadcast?.string);
  const genres = anime.genres || [];
  const studios = anime.studios?.map((s) => s.name).join(', ');
  const trailer = anime.trailer?.url;
  const bannerUri = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  const formatNumber = (n) => {
    if (!n) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };

  // Elastic pull-down only: translateY and scale activate on negative scroll
  // (i.e. when the user overscrolls past the top). No effect on scroll-down,
  // so the banner stays flush with the content below and never disconnects.
  const bannerTranslateY = scrollY.interpolate({
    inputRange: [-BANNER_HEIGHT, 0],
    outputRange: [BANNER_HEIGHT / 2, 0],
    extrapolateRight: 'clamp', // lock at 0 when scrolling down
  });

  const bannerScale = scrollY.interpolate({
    inputRange: [-BANNER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: 'clamp', // lock at 1 when scrolling down
  });

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {/* Banner / poster — no overlay, parallax + elastic on scroll */}
      <View style={styles.bannerContainer}>
        {bannerUri ? (
          <Animated.Image
            source={{ uri: bannerUri }}
            style={[
              styles.banner,
              { transform: [{ translateY: bannerTranslateY }, { scale: bannerScale }] },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder]}>
            <Ionicons name="image-outline" size={64} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {titleJP && <Text style={styles.titleJP}>{titleJP}</Text>}

        <View style={styles.tagRow}>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: status === 'Currently Airing' ? colors.accentLight : colors.surface }]}>
              <View style={[styles.statusDot, { backgroundColor: status === 'Currently Airing' ? colors.accent : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: status === 'Currently Airing' ? colors.accent : colors.textSecondary }]}>
                {status}
              </Text>
            </View>
          )}
          {season && year && (
            <View style={styles.tagChip}>
              <Text style={styles.tagChipText}>{`${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`}</Text>
            </View>
          )}
          {anime.type && (
            <View style={styles.tagChip}>
              <Text style={styles.tagChipText}>{anime.type}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox icon="star" label="Score" value={score ? score.toFixed(2) : '—'} />
        <View style={styles.statDivider} />
        <StatBox icon="trophy-outline" label="Rank" value={rank ? `#${rank}` : '—'} />
        <View style={styles.statDivider} />
        <StatBox icon="people-outline" label="Members" value={formatNumber(members)} />
        <View style={styles.statDivider} />
        <StatBox icon="film-outline" label="Episodes" value={episodeCount ?? '?'} />
      </View>

      {/* Broadcast */}
      {broadcast !== 'TBA' && (
        <View style={styles.broadcastRow}>
          <Ionicons name="time-outline" size={16} color={colors.accent} />
          <Text style={styles.broadcastText}>Airs {broadcast}</Text>
        </View>
      )}

      {/* Studios */}
      {studios && (
        <View style={styles.broadcastRow}>
          <Ionicons name="business-outline" size={16} color={colors.info} />
          <Text style={[styles.broadcastText, { color: colors.info }]}>{studios}</Text>
        </View>
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <View style={styles.section}>
          <SectionTitle>Genres</SectionTitle>
          <View style={styles.chipRow}>
            {genres.map((g) => <GenreChip key={g.mal_id} name={g.name} />)}
          </View>
        </View>
      )}

      {/* Synopsis */}
      {synopsis && (
        <View style={styles.section}>
          <SectionTitle>Synopsis</SectionTitle>
          <Text style={styles.synopsis}>{synopsis}</Text>
        </View>
      )}

      {/* Episodes */}
      {(episodesLoading || episodes.length > 0) && (
        <View style={styles.section}>
          <SectionTitle>Episodes</SectionTitle>
          {episodesLoading ? (
            // Subtle skeleton placeholders while loading
            [...Array(4)].map((_, i) => (
              <View key={i} style={[styles.episodeRow, styles.episodeSkeleton]}>
                <View style={styles.episodeSkeletonBadge} />
                <View style={styles.episodeSkeletonBody}>
                  <View style={styles.episodeSkeletonLine} />
                  <View style={[styles.episodeSkeletonLine, { width: '40%', marginTop: 6 }]} />
                </View>
              </View>
            ))
          ) : (
            episodes.map((ep) => (
              <EpisodeRow key={ep.mal_id} episode={ep} />
            ))
          )}
        </View>
      )}

      {/* Trailer */}
      {trailer && (
        <View style={styles.section}>
          <SectionTitle>Trailer</SectionTitle>
          <TouchableOpacity
            style={styles.trailerButton}
            onPress={() => Linking.openURL(trailer)}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-youtube" size={22} color="#FF0000" />
            <Text style={styles.trailerText}>Watch on YouTube</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: spacing.xxxl }} />
    </Animated.ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  bannerContainer: {
    width,
    height: BANNER_HEIGHT,
    backgroundColor: colors.shimmer,
    overflow: 'hidden',   // clip the image when it scales beyond bounds
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
  },
  bannerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.shimmer,
  },
  titleBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    lineHeight: 34,
  },
  titleJP: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  tagChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  broadcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  broadcastText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  synopsis: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  trailerText: {
    ...typography.h4,
    color: colors.textPrimary,
  },

  // Episodes
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  episodeNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  episodeNumber: {
    ...typography.label,
    color: colors.accent,
    letterSpacing: 0,
  },
  episodeInfo: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  episodeTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(246, 201, 14, 0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(246, 201, 14, 0.3)',
  },
  comingSoonText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  episodeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  episodeDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Skeleton placeholders
  episodeSkeleton: {
    opacity: 0.5,
  },
  episodeSkeletonBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.shimmer,
    flexShrink: 0,
  },
  episodeSkeletonBody: {
    flex: 1,
    gap: 6,
  },
  episodeSkeletonLine: {
    height: 12,
    width: '70%',
    borderRadius: radius.sm,
    backgroundColor: colors.shimmer,
  },
});
