'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { selectRows } from '../lib/publicData';

// How often the featured card rotates between close-together events
const ROTATION_MS = 15000;
// Events within this window rotate as featured; events further apart stay as "next up"
const CLOSE_WINDOW_DAYS = 7;

function toLocalDateIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatMonth(dateStr)   { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }); }
function formatDay(dateStr)     { return new Date(dateStr).getDate(); }
function formatWeekday(dateStr) { return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' }); }
function formatLongDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function isToday(dateStr) {
  return dateStr === toLocalDateIso(new Date());
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const todayStr = toLocalDateIso(new Date());
      const { data, error } = await selectRows('events', {
        select: '*',
        is_active: 'eq.true',
        event_date: `gte.${todayStr}`,
        order: 'event_date.asc,created_at.asc',
      });
      if (!mounted) return;
      if (error) console.error('[events] load failed:', error.message);
      setEvents(data || []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Events eligible for the rotating "featured" spot: the nearest one plus
  // anything else within 7 days of it. Further-out events stay in the calendar.
  const rotationSet = useMemo(() => {
    if (events.length === 0) return [];
    const anchor = events[0].event_date;
    return events.filter(e => daysBetween(e.event_date, anchor) <= CLOSE_WINDOW_DAYS);
  }, [events]);

  // Rotate the featured index only if there are 2+ close-together events.
  useEffect(() => {
    if (rotationSet.length < 2) {
      setFeaturedIdx(0);
      return;
    }
    const id = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % rotationSet.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, [rotationSet.length]);

  const featured = rotationSet[featuredIdx] || null;

  // Horizontal scroller refs/handlers for the "All upcoming" section
  const scrollerRef = useRef(null);
  function scrollByColumns(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    // Jump roughly one column-width at a time (19rem column + 1rem gap)
    const amount = 20 * 16 * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  // Group all upcoming events by date for the "All upcoming" section below.
  const dayGroups = useMemo(() => {
    const groups = [];
    const byDate = new Map();
    events.forEach(e => {
      if (!byDate.has(e.event_date)) {
        const group = { date: e.event_date, items: [] };
        byDate.set(e.event_date, group);
        groups.push(group);
      }
      byDate.get(e.event_date).items.push(e);
    });
    return groups;
  }, [events]);

  // Sidebar calendar — keep compact so it aligns with the featured card
  const calendarEvents = events.slice(0, 3);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="/pictures/mosque-interior.webp"
            srcSet="/pictures/mosque-interior-960.webp 960w, /pictures/mosque-interior.webp 1600w"
            sizes="100vw"
            fetchPriority="high"
            alt="Events"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Community Events</h1>
          <p className={styles.heroSub}>Join us for spiritual growth, community connection, and shared experiences in the heart of Blairgowrie.</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.eventsCol}>
          <div className={styles.eventsHeader}>
            <span className={styles.eventsLabel}>The Calendar</span>
            <h2 className={styles.eventsTitle}>Upcoming Gatherings</h2>
          </div>

          {loading ? (
            // Same box as the empty state, so the sidebar below doesn't jump when data arrives (CLS).
            <div aria-busy="true" style={{ position: 'relative' }}>
              <div style={{ visibility: 'hidden' }} aria-hidden="true"><EmptyEvents /></div>
              <p style={{ color: 'var(--muted)', position: 'absolute', top: '2rem', left: '2rem' }}>Loading events…</p>
            </div>
          ) : !featured ? (
            <EmptyEvents />
          ) : (
            <>
              {/* Featured event — rotates if multiple events fall within 7 days */}
              <div className={styles.featuredEvent} key={featured.id}>
                <div className={styles.featuredImg}>
                  <img
                    src={featured.image_url || '/pictures/ramadan-eid-history.webp'}
                    loading="lazy"
                    decoding="async"
                    alt={featured.title}
                  />
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.eventMeta}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '0.875rem' }}>calendar_today</span>
                    <span>{formatLongDate(featured.event_date)}{featured.event_time ? ` · ${featured.event_time}` : ''}</span>
                  </div>
                  <h3 className={styles.featuredTitle}>{featured.title}</h3>
                  {featured.description && <p className={styles.featuredDesc}>{featured.description}</p>}
                  <div className={styles.featuredActions}>
                    {featured.location && (
                      <span className={styles.eventLocation}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem' }}>location_on</span>
                        {featured.location.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rotation indicator — only shown when we're rotating */}
              {rotationSet.length > 1 && (
                <div className={styles.rotationIndicator}>
                  <span className={styles.rotationCount}>
                    <strong>{featuredIdx + 1}</strong> / {rotationSet.length} · this week
                  </span>
                  <span className={styles.rotationDots}>
                    {rotationSet.map((_, i) => (
                      <span
                        key={i}
                        className={`${styles.rotationDot} ${i === featuredIdx ? styles.rotationDotActive : ''}`}
                      />
                    ))}
                  </span>
                </div>
              )}

              {/* Horizontal scroller — all upcoming days as columns */}
              {dayGroups.length > 0 && (
                <section className={styles.daySection}>
                  <div className={styles.daySectionHeader}>
                    <span className={styles.daySectionTitle}>All Upcoming · scroll to see more</span>
                    <div className={styles.scrollNav}>
                      <button
                        type="button"
                        className={styles.scrollBtn}
                        onClick={() => scrollByColumns(-1)}
                        aria-label="Scroll left"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        className={styles.scrollBtn}
                        onClick={() => scrollByColumns(1)}
                        aria-label="Scroll right"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.dayScroller} ref={scrollerRef}>
                    {dayGroups.map((group) => (
                      <div
                        key={group.date}
                        className={`${styles.dayColumn} ${isToday(group.date) ? styles.dayColumnToday : ''}`}
                      >
                        <div className={styles.dayColHeader}>
                          <div className={styles.dayColDate}>
                            <span className={styles.dayColMonth}>{formatMonth(group.date)}</span>
                            <span className={styles.dayColDay}>{formatDay(group.date)}</span>
                            <span className={styles.dayColWeekday}>
                              {isToday(group.date) ? 'Today' : formatWeekday(group.date)}
                            </span>
                          </div>
                          {group.items.length > 1 && (
                            <span className={styles.dayColCount}>{group.items.length} events</span>
                          )}
                        </div>

                        <div className={styles.dayColEvents}>
                          {group.items.map((ev) => (
                            <div key={ev.id} className={styles.dayEvent}>
                              {ev.event_time && <div className={styles.dayEventTime}>{ev.event_time}</div>}
                              <div className={styles.dayEventTitle}>{ev.title}</div>
                              {ev.description && <div className={styles.dayEventDesc}>{ev.description}</div>}
                              {ev.location && (
                                <div className={styles.dayEventLoc}>
                                  <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                  {ev.location}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.calendarCard}>
            <h3 className={styles.calendarTitle}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ marginRight: '0.5rem' }}>event</span> Quick Calendar
            </h3>
            <div className={styles.calendarList}>
              {calendarEvents.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>No upcoming events posted yet.</p>
              ) : (
                calendarEvents.map((e, i) => (
                  <div key={e.id} className={styles.calendarItem}>
                    <div className={`${styles.calendarDate} ${i === 0 ? styles.calendarDateHighlight : ''}`}>
                      <span className={styles.calendarMonth}>{formatMonth(e.event_date)}</span>
                      <span className={styles.calendarDay}>{formatDay(e.event_date)}</span>
                    </div>
                    <div>
                      <h4 className={styles.calendarEventTitle}>{e.title}</h4>
                      <p className={styles.calendarEventTime}>{e.event_time || new Date(e.event_date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.hostCard}>
            <div className={styles.hostGhost}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '6rem', opacity: 0.1 }}>volunteer_activism</span>
            </div>
            <h3 className={styles.hostTitle}>Want to Host an Event?</h3>
            <p className={styles.hostDesc}>The Masjid is a space for everyone. If you have an idea for a community program or workshop, we&apos;d love to hear it.</p>
            <Link href="/contact" className={styles.hostBtn}>Propose an Event</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className={styles.featuredEvent} style={{ padding: '2rem' }}>
      <div className={styles.featuredContent}>
        <div className={styles.eventMeta}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '0.875rem' }}>info</span>
          <span>Check back soon</span>
        </div>
        <h3 className={styles.featuredTitle}>No upcoming events posted yet</h3>
        <p className={styles.featuredDesc}>
          The committee will share new gatherings here as they&apos;re announced.
          For now, join us for daily prayers and our regular weekly programs.
        </p>
      </div>
    </div>
  );
}
