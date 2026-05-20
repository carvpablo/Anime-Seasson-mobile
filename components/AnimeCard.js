import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';
import { formatBroadcast } from '../utils/dateHelpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.4;   // poster aspect ratio
const INFO_HEIGHT = 68;                  // fixed info area (title + date)
const CARD_HEIGHT = IMAGE_HEIGHT + INFO_HEIGHT;

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  return (
    <View style={styles.scoreBadge}>
      <Ionicons name="star" size={10} color={colors.warning} />
      <Text style={styles.scoreText}>{score.toFixed(1)}</Text>
    </View>
  );
};

const AnimeCard = ({ anime }) => {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push(`/details/${anime.mal_id}`);
  }, [router, anime.mal_id]);

  const imageUri = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;
  const title = anime?.title_english || anime?.title || 'Unknown Title';
  const broadcast = formatBroadcast(anime?.broadcast?.string);
  const type = anime?.type || '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Poster */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
          </View>
        )}

        {/* Gradient overlay */}
        <View style={styles.imageOverlay} />

        {/* Type badge */}
        {type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{type}</Text>
          </View>
        ) : null}

        <ScoreBadge score={anime?.score} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.broadcast} numberOfLines={1}>
          {broadcast !== 'TBA' ? broadcast : ' '}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: colors.shimmer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.shimmer,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  typeBadgeText: {
    ...typography.label,
    color: colors.accent,
  },
  scoreBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  scoreText: {
    ...typography.label,
    color: colors.warning,
  },
  info: {
    height: INFO_HEIGHT,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  broadcast: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default AnimeCard;
