import { EXCLUDED_GENRES } from '../constants/api';

/**
 * Returns true if an anime should be shown (passes the content filter).
 *
 * Jikan v4 returns two separate genre arrays:
 *   - `genres`          → regular genres (e.g. Ecchi ID 9)
 *   - `explicit_genres` → adult genres (e.g. Hentai ID 12, Boys Love ID 28)
 *
 * The API's `genres_exclude` param only reliably filters `genres`, so we
 * must also check `explicit_genres` on the client side.
 *
 * @param {object} anime - Jikan anime object
 * @returns {boolean}
 */
/**
 * Returns true if an anime should be shown (passes the content filter).
 *
 * Jikan v4 returns two separate genre arrays:
 *   - `genres`          → regular genres (e.g. Ecchi ID 9)
 *   - `explicit_genres` → adult genres (e.g. Hentai ID 12)
 *
 * The API's `genres_exclude` param only reliably filters `genres`, so we
 * must also check `explicit_genres` on the client side.
 *
 * @param {object} anime - Jikan anime object
 * @param {number[]} excludedIds - Genre IDs to block (empty = allow all)
 * @returns {boolean}
 */
export const isAllowedAnime = (anime, excludedIds = EXCLUDED_GENRES) => {
  if (!anime) return false;
  if (excludedIds.length === 0) return true;

  const allGenres = [
    ...(anime.genres ?? []),
    ...(anime.explicit_genres ?? []),
    ...(anime.themes ?? []),
    ...(anime.demographics ?? []),
  ];

  return !allGenres.some((g) => excludedIds.includes(g.mal_id));
};

/**
 * Filters an array of anime objects, removing any with excluded genres
 * and deduplicating by mal_id (Jikan can return the same title twice
 * when multiple platforms list it separately).
 * @param {object[]} items
 * @param {number[]} excludedIds - Genre IDs to block (empty = allow all)
 * @returns {object[]}
 */
export const filterAnime = (items, excludedIds = EXCLUDED_GENRES) => {
  const seen = new Set();
  return (items ?? []).filter((anime) => {
    if (!isAllowedAnime(anime, excludedIds)) return false;
    if (seen.has(anime.mal_id)) return false;
    seen.add(anime.mal_id);
    return true;
  });
};

// Jikan rating string prefixes (lowercase) mapped from our picker values
const RATING_PREFIX = {
  g:    'g -',
  pg:   'pg -',
  pg13: 'pg-13',
  r17:  'r -',
  r:    'r+ -',
};

/**
 * Applies user-selected search filters to an already-fetched seasonal anime array.
 * All filtering is done client-side so results always stay within /seasons/now.
 *
 * @param {object[]} items    - Seasonal anime list (already content-filtered)
 * @param {object|null} filters - Filter object from the search screen, or null
 * @returns {object[]}
 */
export const applySearchFilters = (items, filters) => {
  if (!filters) return items;

  return items.filter((anime) => {
    // Title (matches Japanese or English title)
    if (filters.title) {
      const q  = filters.title.toLowerCase();
      const t  = (anime.title ?? '').toLowerCase();
      const te = (anime.title_english ?? '').toLowerCase();
      if (!t.includes(q) && !te.includes(q)) return false;
    }

    // Studio name
    if (filters.studio) {
      const q = filters.studio.toLowerCase();
      const match = anime.studios?.some((s) => s.name.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Genre keyword (text search)
    if (filters.genre) {
      const q = filters.genre.toLowerCase();
      const allG = [...(anime.genres ?? []), ...(anime.themes ?? [])];
      if (!allG.some((g) => g.name.toLowerCase().includes(q))) return false;
    }

    // Genre ID (from picker — checks genres, themes and demographics)
    if (filters.genreId) {
      const id = Number(filters.genreId);
      const allG = [
        ...(anime.genres ?? []),
        ...(anime.themes ?? []),
        ...(anime.demographics ?? []),
        ...(anime.explicit_genres ?? []),
      ];
      if (!allG.some((g) => g.mal_id === id)) return false;
    }

    // Type (TV, Movie, OVA …)
    if (filters.type) {
      if ((anime.type ?? '').toLowerCase() !== filters.type.toLowerCase()) return false;
    }

    // Rating
    if (filters.rating) {
      const prefix = RATING_PREFIX[filters.rating];
      if (prefix && !(anime.rating ?? '').toLowerCase().startsWith(prefix)) return false;
    }

    // Minimum score
    if (filters.minScore > 0) {
      if (!anime.score || anime.score < filters.minScore) return false;
    }

    // Minimum episode count
    if (filters.minEpisodes > 1) {
      if (!anime.episodes || anime.episodes < filters.minEpisodes) return false;
    }

    // Currently airing only
    if (filters.airingOnly && !anime.airing) return false;

    return true;
  });
};
