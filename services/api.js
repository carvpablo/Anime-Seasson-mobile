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
 */
export const fetchCurrentSeason = async (page = 1) => {
  return requestWithRetry(async () => {
    const response = await apiClient.get('/seasons/now', {
      params: { page, limit: 25, genres_exclude: EXCLUDED_GENRES.join(',') },
    });
    return response.data;
  });
};

/**
 * Fetch anime airing on a specific day of the week.
 * @param {string} day - e.g. 'monday', 'tuesday' ...
 * @param {number} page
 */
export const fetchScheduleByDay = async (day, page = 1) => {
  return requestWithRetry(async () => {
    const response = await apiClient.get('/schedules', {
      params: { filter: day, page, limit: 25, genres_exclude: EXCLUDED_GENRES.join(',') },
    });
    return response.data;
  });
};

/**
 * Search anime with filters using Jikan's /anime endpoint.
 * @param {object} filters - Filter object from the search screen
 * @param {number} page
 */
export const searchAnime = async (filters = {}, page = 1) => {
  return requestWithRetry(async () => {
    const params = { page, limit: 25, genres_exclude: EXCLUDED_GENRES.join(',') };

    if (filters.title)       params.q        = filters.title;
    if (filters.type)        params.type      = filters.type;
    if (filters.rating)      params.rating    = filters.rating;
    if (filters.minScore > 0) params.min_score = filters.minScore;
    if (filters.minEpisodes > 1) params.min_episodes = filters.minEpisodes;
    if (filters.airingOnly)  params.status    = 'airing';
    if (filters.safeSearch)  params.sfw       = true;

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

export default apiClient;
