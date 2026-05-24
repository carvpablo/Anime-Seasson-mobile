import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentSeason } from '../services/api';
import { filterAnime, applySearchFilters } from '../utils/contentFilter';
import { useSafeSearch } from '../context/SafeSearchContext';

/**
 * Custom hook to fetch and paginate the current seasonal anime list.
 * Always fetches from /seasons/now; when `filters` is provided the results
 * are narrowed client-side so the catalogue stays within the current season.
 *
 * @param {object|null} filters - Search filter object from the search screen, or null
 */
const useSeasonalAnime = (filters = null) => {
  const { excludedGenreIds } = useSafeSearch();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchCurrentSeason(pageNum, excludedGenreIds);

      // 1. Remove adult/duplicate content
      const safe = filterAnime(result.data, excludedGenreIds);
      // 2. Apply user-selected filters client-side (genre, type, score, etc.)
      const filtered = applySearchFilters(safe, filters);

      setData((prev) => {
        if (!append) return filtered;
        const seen = new Set(prev.map((a) => a.mal_id));
        return [...prev, ...filtered.filter((a) => !seen.has(a.mal_id))];
      });
      setHasNextPage(result.pagination?.has_next_page ?? false);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to load seasonal anime.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, excludedGenreIds]); // re-runs whenever filters or safe search change

  useEffect(() => {
    load(1, false);
  }, [load]);

  const refresh = useCallback(() => load(1, false), [load]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      load(page + 1, true);
    }
  }, [load, loadingMore, hasNextPage, page]);

  return { data, loading, loadingMore, error, hasNextPage, refresh, loadMore };
};

export default useSeasonalAnime;
