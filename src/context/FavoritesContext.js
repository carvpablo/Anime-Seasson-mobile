import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

// ─── Context ─────────────────────────────────────────────────────────────────

const FavoritesContext = createContext({});

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // ─── Fetch all favorites from Supabase ─────────────────────────────────────

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('favorited_at', { ascending: false });

      if (!error && data) {
        setFavorites(data);
      }
    } catch (err) {
      console.warn('[FavoritesContext] fetchFavorites error:', err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const isFavorite = useCallback(
    (mal_id) => favorites.some((f) => f.mal_id === mal_id),
    [favorites]
  );

  // ─── Toggle (add / remove) ─────────────────────────────────────────────────

  const toggleFavorite = useCallback(
    async (anime) => {
      if (!user || !anime?.mal_id) return;

      const alreadyFav = isFavorite(anime.mal_id);

      if (alreadyFav) {
        // ── Optimistic remove ─────────────────────────────────────────────
        setFavorites((prev) => prev.filter((f) => f.mal_id !== anime.mal_id));

        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('mal_id', anime.mal_id);

        if (error) {
          // Rollback on failure
          console.warn('[FavoritesContext] delete error:', error);
          fetchFavorites();
        }
      } else {
        // ── Optimistic add ────────────────────────────────────────────────
        const optimistic = {
          mal_id: anime.mal_id,
          user_id: user.id,
          title: anime.title ?? null,
          title_english: anime.title_english ?? null,
          image_url:
            anime.images?.jpg?.large_image_url ||
            anime.images?.jpg?.image_url ||
            null,
          score: anime.score ?? null,
          type: anime.type ?? null,
          episodes: anime.episodes ?? null,
          status: anime.status ?? null,
          favorited_at: new Date().toISOString(),
        };

        setFavorites((prev) => [optimistic, ...prev]);

        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          mal_id: anime.mal_id,
          title: optimistic.title,
          title_english: optimistic.title_english,
          image_url: optimistic.image_url,
          score: optimistic.score,
          type: optimistic.type,
          episodes: optimistic.episodes,
          status: optimistic.status,
        });

        if (error) {
          // Rollback on failure
          console.warn('[FavoritesContext] insert error:', error);
          fetchFavorites();
        }
      }
    },
    [user, isFavorite, fetchFavorites]
  );

  // ─── Value ──────────────────────────────────────────────────────────────────

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loadingFavorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
