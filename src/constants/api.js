// ─── Jikan API v4 ───────────────────────────────────────────────────────────
export const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting: Jikan allows ~3 requests/second on the public endpoint
export const RATE_LIMIT = {
  maxRetries: 3,
  // Delay in ms between retries on 429 (exponential: 1s, 2s, 4s)
  baseDelay: 1000,
};

// MAL genre IDs to exclude from all lists
// 9 = Ecchi | 12 = Hentai | 28 = Boys Love | 49 = Erotica
export const EXCLUDED_GENRES = [9, 12, 28, 49];

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
