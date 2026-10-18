'use client';
import styles from './page.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { selectRows } from './lib/publicData';
import LazyIframe from './components/LazyIframe';

export default function Home() {
  const [times, setTimes] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState({ name: 'Loading...', time: '' });
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Same congregation times as the board on /salah-times (Maghrib = adhan), via our API route.
    async function fetchTimes() {
      try {
        const res = await fetch('/api/prayer-times');
        const { times: t } = await res.json();
        if (t) {
          setTimes({ Fajr: t.fajr, Sunrise: t.sunrise, Dhuhr: t.dhuhr, Asr: t.asr, Maghrib: t.maghrib, Isha: t.isha });
        }
      } catch (err) {
        console.error('Failed to fetch prayer times:', err);
      }
    }
    fetchTimes();

    // Keep a long-open tab current: the board can change times (e.g. a new Asr time from a
    // given date), so re-read every 5 minutes and whenever the visitor returns to the tab.
    const refresh = setInterval(fetchTimes, 5 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchTimes(); };
    document.addEventListener('visibilitychange', onVisible);

    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => {
      clearInterval(timer);
      clearInterval(refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Load real announcements + events for the News section
  useEffect(() => {
    async function loadNews() {
      try {
        const nowIso = new Date().toISOString();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const [annRes, evtRes] = await Promise.all([
          selectRows('announcements', {
            select: 'id,message,category,event_at,created_at',
            is_active: 'eq.true',
            starts_at: `lte.${nowIso}`,
            or: `(expires_at.is.null,expires_at.gt.${nowIso})`,
            order: 'created_at.desc',
            limit: '3',
          }),
          selectRows('events', {
            select: 'id,title,description,event_date,event_time',
            is_active: 'eq.true',
            event_date: `gte.${todayStr}`,
            order: 'event_date.asc',
            limit: '3',
          }),
        ]);

        const items = [];
        (annRes.data || []).forEach((a) => {
          const when = a.event_at ? new Date(a.event_at) : new Date(a.created_at);
          items.push({
            id: `a-${a.id}`,
            cat: a.category,
            title: a.message,
            desc: '',
            sortDate: when,
            displayDate: when.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        });
        (evtRes.data || []).forEach((e) => {
          const when = new Date(e.event_date);
          items.push({
            id: `e-${e.id}`,
            cat: 'Event',
            title: e.title,
            desc: e.description || '',
            sortDate: when,
            displayDate: when.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + (e.event_time ? ` · ${e.event_time}` : ''),
          });
        });
        items.sort((a, b) => b.sortDate - a.sortDate);
        setNews(items.slice(0, 3));
      } catch (err) {
        console.error('[news] load failed:', err.message);
      }
    }
    loadNews();
  }, []);

  useEffect(() => {
    if (!times) return;
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = currentTime;
    for (const p of prayers) {
      if (p === 'Sunrise' || !times[p]) continue; // next prayer is one of the five obligatory prayers
      const [h, m] = times[p].split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(h, m, 0);
      if (prayerDate > now) {
        setNextPrayer({ name: p, time: formatTime(times[p]) });
        return;
      }
    }
    setNextPrayer({ name: 'Fajr', time: formatTime(times.Fajr) });
  }, [times, currentTime]);

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  const displayPrayers = times ? [
    { name: 'Fajr', time: formatTime(times.Fajr) },
    { name: 'Sunrise', time: formatTime(times.Sunrise) },
    { name: 'Dhuhr', time: formatTime(times.Dhuhr) },
    { name: 'Asr', time: formatTime(times.Asr) },
    { name: 'Maghrib', time: formatTime(times.Maghrib) },
    { name: 'Isha', time: formatTime(times.Isha) },
  ] : [
    { name: 'Fajr', time: '...' },
    { name: 'Sunrise', time: '...' },
    { name: 'Dhuhr', time: '...' },
    { name: 'Asr', time: '...' },
    { name: 'Maghrib', time: '...' },
    { name: 'Isha', time: '...' },
  ];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroGradient} />
          <img
            src="/pictures/placeview2.webp"
            srcSet="/pictures/placeview2-960.webp 960w, /pictures/placeview2.webp 1116w"
            sizes="100vw"
            fetchPriority="high"
            alt="Masjid Architecture"
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Welcome to Blairgowrie Masjid
            </h1>
            <p className={styles.heroSubtitle}>
              Serving the community with spiritual growth and educational excellence
            </p>
            <p className={styles.heroBadge}>Ladies Facilities Available</p>
            <div className={styles.heroBtns}>
              <Link href="/salah-times" className="btn-filled">View Salah Times</Link>
              <Link href="/about" className={`btn ${styles.heroBtnSecondary}`}>Our Mission</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Strip */}
      <section className={styles.prayerStrip}>
        <div className={styles.prayerStripInner}>
          <div className={styles.prayerCurrent}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--accent)', fontSize: '1.75rem' }}>schedule</span>
            <div>
              <p className={styles.prayerLabel}>Next Prayer</p>
              <h3 className={styles.prayerName}>{nextPrayer.name}</h3>
            </div>
          </div>
          <div className={styles.prayerTimes}>
            {displayPrayers.map(p => (
              <div key={p.name} className={styles.prayerTimeItem}>
                <p className={styles.prayerTimeLabel}>{p.name}</p>
                <p className={styles.prayerTimeValue}>{p.time}</p>
              </div>
            ))}
          </div>
          <Link href="/salah-times" className={styles.prayerFullBtn}>Full Schedule</Link>
        </div>

        {/* Phone-only: live Masjid Board iframe replacing the strip */}
        <div className={styles.prayerBoard}>
          <LazyIframe
            src="https://masjidboardlive.com/boards/?id=blairgowrie-ubay-bin-kab"
            title="Masjid Times — Live Board"
            className={styles.prayerBoardFrame}
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href="https://masjidboardlive.com/boards/?id=blairgowrie-ubay-bin-kab"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.prayerBoardLink}
          >
            Open Masjid Board ↗
          </a>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionGrid}>
          <h2 className={styles.sectionTitle}>A Sanctuary for Spiritual Growth &amp; Collective Excellence</h2>
          <div className={styles.missionFlow}>
            <div className={styles.missionImgWrap}>
              <div className={styles.missionGlow} />
              <img
                src="/pictures/home.webp"
                loading="lazy"
                decoding="async"
                alt="Community gathering"
                className={styles.missionImg}
              />
            </div>
            <p className={styles.bodyText}>
              The Blairgowrie Masjid is dedicated to establishing a vibrant spiritual home that nurtures the soul and empowers the mind. We strive to be more than just a place of prayer; we are a center for learning, community service, and bridge-building.
            </p>
            <p className={styles.bodyText}>
              Our mission is to foster an environment where every individual, regardless of their stage in life, can find peace, guidance, and a sense of belonging through the timeless values of Islam.
            </p>
          </div>
          <div className={styles.pillars}>
            <div>
              <h4 className={styles.pillarTitle}>Education</h4>
              <p className={styles.pillarText}>Formal and informal programs for all ages to deepen religious understanding.</p>
            </div>
            <div>
              <h4 className={styles.pillarTitle}>Community</h4>
              <p className={styles.pillarText}>Welfare initiatives and social support systems for our local neighbors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className={styles.news}>
        <div className={styles.newsContainer}>
          <div className={styles.newsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>News &amp; Community Updates</h2>
              <p className={styles.newsSubtitle}>Stay connected with the latest happenings at our Masjid.</p>
            </div>
            <Link href="/events" className={styles.viewAll}>
              View All Events <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          <div className={styles.newsGrid}>
            {news.length === 0 ? (
              <div className={styles.newsCard} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <h3 className={styles.newsCardTitle}>Nothing new just yet</h3>
                <p className={styles.newsCardDesc}>
                  No announcements or upcoming events posted right now. Check back soon, insha&apos;Allah.
                </p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className={styles.newsCard}>
                  <div className={styles.newsCardCat}>{item.cat}</div>
                  <h3 className={styles.newsCardTitle}>{item.title}</h3>
                  {item.desc && <p className={styles.newsCardDesc}>{item.desc}</p>}
                  <div className={styles.newsCardDate}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '0.875rem' }}>calendar_today</span>
                    {item.displayDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={styles.location}>
        <div className={styles.locationGrid}>
          <div className={styles.locationInfo}>
            <h2 className={styles.locationTitle}>Sayyidina Ubay bin Ka'b (RA) - Musalla & Madressa</h2>
            <p className={styles.locationDesc}>
              Our Musalla & Madressa is located at 70 Conrad Dr, Blairgowrie, Randburg, 2195. A central beacon for the community, designed for accessibility and peace.
            </p>
            <div className={styles.locationDetails}>
              <div className={styles.locationItem}>
                <div className={styles.locationIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--accent)' }}>location_on</span>
                </div>
                <span>70 Conrad Dr, Blairgowrie, Randburg, 2195</span>
              </div>
              <div className={styles.locationItem}>
                <div className={styles.locationIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--accent)' }}>mail</span>
                </div>
                <span>blairgowriemasjid@gmail.com</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Sayyidina+Ubay+bin+Ka'b+(RA)+-+Musalla+%26+Madressa,+70+Conrad+Dr,+Blairgowrie,+Randburg,+2195,+South+Africa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directionsBtn}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem' }}>directions</span>
              Get Directions
            </a>
          </div>
          <div className={styles.locationMap}>
            <LazyIframe
              src="https://maps.google.com/maps?q=Sayyidina+Ubay+bin+Ka'b+(RA)+-+Musalla+%26+Madressa,+70+Conrad+Dr,+Blairgowrie,+Randburg,+2195,+South+Africa&z=16&output=embed&hl=en"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Sayyidina Ubay bin Ka'b (RA) - Musalla & Madressa Location"
            />
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Sayyidina+Ubay+bin+Ka'b+(RA)+-+Musalla+%26+Madressa,+70+Conrad+Dr,+Blairgowrie,+Randburg,+2195,+South+Africa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapOverlay}
              aria-label="Click to get directions in Google Maps"
            >
              <div className={styles.mapOverlayBadge}>
                <span className="material-symbols-outlined" aria-hidden="true">near_me</span>
                Open in Google Maps
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
