import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useFavorites } from '../context/FavoritesContext';
import AnimeCard from '../components/AnimeCard';
import LoadingState from '../components/LoadingState';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';

const numColumns = 2;

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyFavorites() {
  const navigation = useNavigation();
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconRing}>
        <Ionicons name="bookmark-outline" size={44} color={colors.accent} />
      </View>
      <Text style={emptyStyles.title}>No bookmarks yet</Text>
      <Text style={emptyStyles.subtitle}>
        Open any anime and tap the bookmark icon to save it here.
      </Text>
      <TouchableOpacity
        style={emptyStyles.cta}
        onPress={() => navigation.navigate('Inicio')}
        activeOpacity={0.8}
      >
        <Ionicons name="compass-outline" size={16} color="#fff" />
        <Text style={emptyStyles.ctaText}>Browse Anime</Text>
      </TouchableOpacity>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentLight,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    ...shadows.accent,
  },
  ctaText: {
    ...typography.h4,
    color: '#fff',
  },
});

// ─── Count badge ──────────────────────────────────────────────────────────────

const CountBadge = ({ count }) => (
  <View style={badgeStyles.badge}>
    <Text style={badgeStyles.text}>{count}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: 'center',
  },
  text: {
    ...typography.label,
    color: '#fff',
    letterSpacing: 0.5,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { favorites, loadingFavorites, refreshFavorites } = useFavorites();

  // Convert Supabase favorite rows to the shape AnimeCard expects
  const animeList = favorites.map((f) => ({
    mal_id: f.mal_id,
    title: f.title,
    title_english: f.title_english,
    images: { jpg: { large_image_url: f.image_url, image_url: f.image_url } },
    score: f.score,
    type: f.type,
    episodes: f.episodes,
    status: f.status,
  }));

  const renderHeader = useCallback(
    () => (
      <View>
        {/* ── Top bar ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Bookmarks</Text>
            {animeList.length > 0 && <CountBadge count={animeList.length} />}
          </View>
          <View style={styles.topBarRight}>
            <View style={styles.bookmarkIcon}>
              <Ionicons name="bookmark" size={18} color={colors.accent} />
            </View>
          </View>
        </View>

        {/* ── Divider blob ── */}
        <View style={styles.blob} />

        {animeList.length > 0 && (
          <Text style={styles.sectionLabel}>YOUR SAVED ANIME</Text>
        )}
        <View style={styles.gridSpacer} />
      </View>
    ),
    [animeList.length, insets.top]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
        <AnimeCard anime={item} />
      </View>
    ),
    []
  );

  const renderEmpty = useCallback(() => {
    if (loadingFavorites) return null;
    return <EmptyFavorites />;
  }, [loadingFavorites]);

  if (loadingFavorites && animeList.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingState message="Loading bookmarks..." fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={animeList}
        keyExtractor={(item) => String(item.mal_id)}
        renderItem={renderItem}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loadingFavorites}
            onRefresh={refreshFavorites}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xl + 80 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={animeList.length > 0 ? styles.row : undefined}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },

  blob: {
    position: 'absolute',
    top: -30,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(233,69,96,0.06)',
  },

  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },

  gridSpacer: {
    height: spacing.sm,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
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
});
