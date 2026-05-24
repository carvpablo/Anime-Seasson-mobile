import React, { createContext, useContext, useState, useCallback } from 'react';
import { ADULT_GENRE_IDS } from '../constants/api';

// ─── Context ──────────────────────────────────────────────────────────────────

const SafeSearchContext = createContext({
  safeSearch: true,
  toggleSafeSearch: () => {},
  setSafeSearch: () => {},
  excludedGenreIds: ADULT_GENRE_IDS,
});

export const useSafeSearch = () => {
  const ctx = useContext(SafeSearchContext);
  if (!ctx) throw new Error('useSafeSearch must be used inside SafeSearchProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SafeSearchProvider({ children }) {
  // Always starts ON when the app session begins.
  const [safeSearch, setSafeSearchState] = useState(true);

  const setSafeSearch = useCallback((value) => {
    setSafeSearchState(value);
  }, []);

  const toggleSafeSearch = useCallback(() => {
    setSafeSearch(!safeSearch);
  }, [safeSearch, setSafeSearch]);

  // The list of genre IDs to exclude — empty when safe search is OFF
  const excludedGenreIds = safeSearch ? ADULT_GENRE_IDS : [];

  return (
    <SafeSearchContext.Provider value={{ safeSearch, setSafeSearch, toggleSafeSearch, excludedGenreIds }}>
      {children}
    </SafeSearchContext.Provider>
  );
}
