// ─── Jikan API v4 ───────────────────────────────────────────────────────────
export const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting: Jikan allows ~3 requests/second on the public endpoint
export const RATE_LIMIT = {
  maxRetries: 3,
  // Delay in ms between retries on 429 (exponential: 1s, 2s, 4s)
  baseDelay: 1000,
};

// MAL genre IDs considered adult/explicit content
// 9 = Ecchi | 12 = Hentai | 49 = Erotica (Boys Love 28 removed per product decision)
export const ADULT_GENRE_IDS = [9, 12, 49];

// Kept for any legacy references — always the full adult list
export const EXCLUDED_GENRES = ADULT_GENRE_IDS;

// Days of the week as returned by Jikan's /schedules?filter= endpoint
export const SCHEDULE_DAYS = [
  { key: 'monday',    label: 'Mon' },
  { key: 'tuesday',   label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday',  label: 'Thu' },
  { key: 'friday',    label: 'Fri' },
  { key: 'saturday',  label: 'Sat' },
  { key: 'sunday',    label: 'Sun' },
];
