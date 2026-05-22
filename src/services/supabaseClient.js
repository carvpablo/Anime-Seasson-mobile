import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://psriczkmxcegjqdaymci.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcmljemtteGNlZ2pxZGF5bWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODg5NzEsImV4cCI6MjA5NDg2NDk3MX0.3UDncYwS-pEs2kHJ6MzXpjr1Zh5by-zrGPeV_Vn1hRM';

// ─── Web Storage (localStorage) ───────────────────────────────────────────────
// expo-secure-store is only available on iOS/Android — fall back to localStorage on web.
const WebStorageAdapter = {
  getItem: (key) => {
    try {
      return typeof localStorage !== 'undefined'
        ? localStorage.getItem(key)
        : null;
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {}
  },
};

// ─── Native Storage (SecureStore with chunking) ───────────────────────────────
// expo-secure-store has a 2 KB limit per key — chunk large JWTs.
const CHUNK_SIZE = 1800;

const NativeStorageAdapter = {
  async getItem(key) {
    try {
      const count = parseInt(
        (await SecureStore.getItemAsync(`${key}__n`)) || '0'
      );
      if (count === 0) return null;
      let value = '';
      for (let i = 0; i < count; i++) {
        value += (await SecureStore.getItemAsync(`${key}__${i}`)) || '';
      }
      return value;
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      const chunks = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}__n`, String(chunks));
      for (let i = 0; i < chunks; i++) {
        await SecureStore.setItemAsync(
          `${key}__${i}`,
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        );
      }
    } catch {}
  },

  async removeItem(key) {
    try {
      const count = parseInt(
        (await SecureStore.getItemAsync(`${key}__n`)) || '0'
      );
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}__${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}__n`);
    } catch {}
  },
};

// ─── Pick storage based on platform ──────────────────────────────────────────
const storage =
  Platform.OS === 'web' ? WebStorageAdapter : NativeStorageAdapter;

// ─── Supabase Client ──────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
