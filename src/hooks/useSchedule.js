import { useState, useEffect, useCallback } from 'react';
import { fetchScheduleByDay } from '../services/api';
import { getCurrentDay } from '../utils/seasonHelpers';
import { filterAnime } from '../utils/contentFilter';
import { useSafeSearch } from '../context/SafeSearchContext';

/**
 * Custom hook to fetch the weekly airing schedule for a given day.
 * Defaults to today's day.
 *
 * @param {string|null} dayOverride - Override day key, e.g. 'monday'
 */
const useSchedule = (dayOverride = null) => {
  const { excludedGenreIds } = useSafeSearch();
  const [selectedDay, setSelectedDay] = useState(dayOverride || getCurrentDay());
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (day, pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchScheduleByDay(day, pageNum, excludedGenreIds);
      const newItems = filterAnime(result.data, excludedGenreIds);

      // Sort by score descending — unscored anime fall to the bottom
      const sortByScore = (arr) =>
        [...arr].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      setData((prev) => {
        if (!append) return sortByScore(newItems);
        const seen = new Set(prev.map((a) => a.mal_id));
        const merged = [...prev, ...newItems.filter((a) => !seen.has(a.mal_id))];
        return sortByScore(merged);
      });
      setHasNextPage(result.pagination?.has_next_page ?? false);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to load schedule.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [excludedGenreIds]); // re-runs when safe search changes

  useEffect(() => {
    load(selectedDay, 1, false);
  }, [selectedDay, load]);

  const changeDay = useCallback((day) => {
    setSelectedDay(day);
    setData([]);
    setPage(1);
  }, []);

  const refresh = useCallback(() => load(selectedDay, 1, false), [load, selectedDay]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      load(selectedDay, page + 1, true);
    }
  }, [load, loadingMore, hasNextPage, selectedDay, page]);

  return {
    data,
    selectedDay,
    loading,
    loadingMore,
    error,
    hasNextPage,
    changeDay,
    refresh,
    loadMore,
  };
};

export default useSchedule;
