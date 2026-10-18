'use client';
import { useEffect, useState } from 'react';

// Local time, HH:MM (24h, like the salah times page). Empty until mounted: the page is
// prerendered at build time, so rendering a time during SSR would cause hydration error #418.
// Only this component re-renders each second, not the page around it.
export default function LiveClock({ className }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const text = now ? now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--';
  return <time className={className} dateTime={now ? now.toISOString() : undefined} suppressHydrationWarning>{text}</time>;
}
