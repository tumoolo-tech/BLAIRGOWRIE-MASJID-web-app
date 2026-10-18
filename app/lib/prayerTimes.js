'use client';
import { useEffect, useState } from 'react';

// One source of truth for "today's times" and "next prayer" on every page: the masjid's
// MasjidBoardLive board via /api/prayer-times. Salah (congregation) times, except Maghrib,
// which uses the adhan time. Home and /salah-times must never disagree.

export const PRAYERS = [
  { key: 'fajr', name: 'Fajr' },
  { key: 'dhuhr', name: 'Dhuhr' },
  { key: 'asr', name: 'Asr' },
  { key: 'maghrib', name: 'Maghrib' },
  { key: 'isha', name: 'Isha' },
];

const REFRESH_MS = 5 * 60 * 1000;

// { fajr, sunrise, dhuhr, asr, maghrib, isha } as "HH:MM", or null while loading / if the
// board is unreachable. Re-read every 5 minutes and when the visitor returns to the tab, so a
// long-open page picks up changes made on the board.
export function useBoardTimes() {
  const [times, setTimes] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/prayer-times');
        const { times: t } = await res.json();
        if (!cancelled && t) setTimes(t);
      } catch (err) {
        console.error('Failed to fetch prayer times:', err);
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return times;
}

// The first of the five prayers whose time hasn't passed yet; after Isha, tomorrow's Fajr.
export function getNextPrayer(times, now) {
  if (!times || !now) return null;
  for (const p of PRAYERS) {
    const t = times[p.key];
    if (!t) continue;
    const [h, m] = t.split(':').map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at > now) return { ...p, time: t };
  }
  return times.fajr ? { ...PRAYERS[0], time: times.fajr } : null;
}

// "Salah at" for every prayer except Maghrib, whose time on the board is the adhan.
export const timeKind = (key) => (key === 'maghrib' ? 'Adhan' : 'Salah');

export function to12h(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Re-renders the caller every 30s so "next prayer" rolls over on time. null until mounted
// (prerendered pages must not render a time during SSR: hydration error #418).
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
