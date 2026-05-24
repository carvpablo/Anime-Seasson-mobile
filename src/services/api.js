import axios from 'axios';
import { BASE_URL, RATE_LIMIT, EXCLUDED_GENRES } from '../constants/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Retry helper with exponential backoff on 429 ───────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (requestFn, retries = RATE_LIMIT.maxRetries, delay = RATE_LIMIT.baseDelay) => {
  try {
    return await requestFn();
  } catch (error) {
    const status = error?.response?.status;

    if (status === 429 && retries > 0) {
      await sleep(delay);
      return requestWithRetry(requestFn, retries - 1, delay * 2);
    }

    // Re-throw with a friendlier message attached
    const message =
      status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : error?.response?.data?.message || error.message || 'An unexpected error occurred.';

    const enhanced = new Error(message);
    enhanced.status = status;
    enhanced.original = error;
    throw enhanced;
  }
};

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * Fetch the current season's anime list.
 * @param {number} page - Page number (default 1)
 * @param {number[]} excludedGenreIds - Genre IDs to exclude (empty = no filter)
 */
export const fetchCurrentSeason = async (page = 1, excludedGenreIds = EXCLUDED_GENRES) => {
  return requestWithRetry(async () => {
    const params = { page, limit: 25 };
    if (excludedGenreIds.length > 0) params.genres_exclude = excludedGenreIds.join(',');
    const response = await apiClient.get('/seasons/now', { params });
    return response.data;
  });
};

/**
 * Fetch anime airing on a specific day of the week.
 * @param {string} day - e.g. 'monday', 'tuesday' ...
 * @param {number} page
 * @param {number[]} excludedGenreIds - Genre IDs to exclude (empty = no filter)
 */
export const fetchScheduleByDay = async (day, page = 1, excludedGenreIds = EXCLUDED_GENRES) => {
  return requestWithRetry(async () => {
    const params = { filter: day, page, limit: 25 };
    if (excludedGenreIds.length > 0) params.genres_exclude = excludedGenreIds.join(',');
    const response = await apiClient.get('/schedules', { params });
    return response.data;
  });
};

/**
 * Search anime with filters using Jikan's /anime endpoint.
 * @param {object} filters - Filter object from the search screen
 * @param {number} page
 * @param {number[]} excludedGenreIds - Genre IDs to exclude (empty = no filter)
 */
export const searchAnime = async (filters = {}, page = 1, excludedGenreIds = EXCLUDED_GENRES) => {
  return requestWithRetry(async () => {
    const params = { page, limit: 25 };
    if (excludedGenreIds.length > 0) params.genres_exclude = excludedGenreIds.join(',');

    if (filters.title)           params.q            = filters.title;
    if (filters.type)            params.type         = filters.type;
    if (filters.rating)          params.rating       = filters.rating;
    if (filters.genreId)         params.genres       = filters.genreId;
    if (filters.minScore > 0)    params.min_score    = filters.minScore;
    if (filters.minEpisodes > 1) params.min_episodes = filters.minEpisodes;
    if (filters.safeSearch)      params.sfw          = true;

    const response = await apiClient.get('/anime', { params });
    return response.data;
  });
};

/**
 * Fetch full details for a single anime.
 * @param {number|string} id - MAL anime ID
 */
export const fetchAnimeDetail = async (id) => {
  return requestWithRetry(async () => {
    const response = await apiClient.get(`/anime/${id}/full`);
    return response.data;
  });
};

/**
 * Fetch the episode list for a single anime (name + air date).
 * Jikan paginates episodes at 100 per page; we load all pages automatically.
 * @param {number|string} id - MAL anime ID
 */
export const fetchAnimeEpisodes = async (id) => {
  return requestWithRetry(async () => {
    const response = await apiClient.get(`/anime/${id}/episodes`, {
      params: { page: 1 },
    });
    return response.data;
  });
};

export default apiClient;
