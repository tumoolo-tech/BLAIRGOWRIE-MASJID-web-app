'use client';
import { useEffect, useRef, useState } from 'react';

// An iframe that only starts loading once it is actually on screen. Native
// loading="lazy" uses a margin of a screen or more, so third-party boards just below
// the fold still loaded during page load (on the home page the MasjidBoardLive embed
// cost ~20 Lighthouse points on mobile). The element keeps its size via CSS, so there
// is no layout shift when the src is set.
export default function LazyIframe({ src, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <iframe ref={ref} src={visible ? src : undefined} {...props} />;
}
