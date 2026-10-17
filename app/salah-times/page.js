'use client';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import { selectRows } from '../lib/publicData';
import LazyIframe from '../components/LazyIframe';

// ── Helpers ─────────────────────────────────────────────────────

function to12h(t24) {
  if (!t24) return '';
  const [hStr, mStr] = t24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function addMinutes24(t24, mins) {
  if (!t24) return null;
  const [h, m] = t24.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m + mins, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toLocalDateIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Postgres `time` comes back as "HH:MM:SS" — trim to "HH:MM" for our helpers
function timeDbTo24(t) {
  return t ? t.slice(0, 5) : null;
}

function ChangeCell({ change, styles }) {
  if (!change) return <span className={styles.changeEmpty}>—</span>;
  return (
    <div className={styles.changeCellInner}>
      {change.new_adhan_time && (
        <span className={styles.changeLine}>
          <span className={styles.changeKind}>Adhan</span>
          <span className={styles.changeVal}>{to12h(timeDbTo24(change.new_adhan_time))}</span>
        </span>
      )}
      {change.new_iqamah_time && (
        <span className={styles.changeLine}>
          <span className={styles.changeKind}>Iqamah</span>
          <span className={styles.changeVal}>{to12h(timeDbTo24(change.new_iqamah_time))}</span>
        </span>
      )}
      <span className={styles.changeFrom}>from {formatShortDate(change.effective_from)}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────

export default function SalahTimesPage() {
  const [times, setTimes] = useState(null);
  // null until mounted: the page is prerendered at build time, so rendering a clock
  // during SSR would never match the visitor's time (React hydration error #418).
  const [currentTime, setCurrentTime] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: 'Loading...', time: '' });
  const [salahChanges, setSalahChanges] = useState([]);

  // Default Iqamah offsets (applied when no admin override exists)
  const iqamahOffsets = { fajr: 30, dhuhr: 15, asr: 15, maghrib: 5, isha: 15 };
  const jumuahDefaultAdhan24  = '12:15';
  const jumuahDefaultIqamah24 = '13:00';

  // Fetch today's prayer times from Aladhan API
  useEffect(() => {
    async function fetchTimes() {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=-26.1076&longitude=28.0075&method=2`
        );
        const data = await res.json();
        if (data.code === 200) setTimes(data.data.timings);
      } catch (err) {
        console.error('Failed to fetch prayer times:', err);
      }
    }
    fetchTimes();

    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch ALL active salah changes (past + future). We partition them below.
  useEffect(() => {
    async function loadChanges() {
      try {
        const { data, error } = await selectRows('salah_changes', {
          select: 'id,prayer,new_adhan_time,new_iqamah_time,effective_from,note',
          is_active: 'eq.true',
          order: 'effective_from.asc',
        });
        if (error) {
          console.warn('[salah-changes] load failed:', error.message);
          return;
        }
        setSalahChanges(data || []);
      } catch (err) {
        console.warn('[salah-changes] load failed:', err?.message || err);
      }
    }
    loadChanges();
  }, []);

  // Partition changes into:
  //   currentOverride[prayer] → latest change where effective_from <= today (acts as current)
  //   upcomingChange[prayer]  → earliest change where effective_from >  today (shown in column)
  const { currentOverride, upcomingChange } = useMemo(() => {
    const current = {};
    const upcoming = {};
    const todayStr = toLocalDateIso(new Date());
    salahChanges.forEach(c => {
      if (c.effective_from <= todayStr) {
        const existing = current[c.prayer];
        if (!existing || existing.effective_from < c.effective_from) current[c.prayer] = c;
      } else {
        const existing = upcoming[c.prayer];
        if (!existing || existing.effective_from > c.effective_from) upcoming[c.prayer] = c;
      }
    });
    return { currentOverride: current, upcomingChange: upcoming };
  }, [salahChanges]);

  // Effective times (admin override takes precedence over API/calculated)
  function effectiveAdhan24(prayerKey, apiName) {
    const ov = currentOverride[prayerKey];
    if (ov?.new_adhan_time) return timeDbTo24(ov.new_adhan_time);
    if (!times) return null;
    return times[apiName];
  }

  function effectiveIqamah24(prayerKey, apiName, offset) {
    const ov = currentOverride[prayerKey];
    if (ov?.new_iqamah_time) return timeDbTo24(ov.new_iqamah_time);
    return addMinutes24(effectiveAdhan24(prayerKey, apiName), offset);
  }

  // Recompute "next prayer" whenever the effective adhan times change
  useEffect(() => {
    if (!times || !currentTime) return;
    const sequence = [
      { key: 'fajr',    apiName: 'Fajr' },
      { key: 'dhuhr',   apiName: 'Dhuhr' },
      { key: 'asr',     apiName: 'Asr' },
      { key: 'maghrib', apiName: 'Maghrib' },
      { key: 'isha',    apiName: 'Isha' },
    ];
    const now = currentTime;
    for (const p of sequence) {
      const t24 = effectiveAdhan24(p.key, p.apiName);
      if (!t24) continue;
      const [h, m] = t24.split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(h, m, 0);
      if (prayerDate > now) {
        setNextPrayer({ name: p.apiName, time: to12h(t24) });
        return;
      }
    }
    // All prayers today have passed — next is tomorrow's Fajr
    const fajr24 = effectiveAdhan24('fajr', 'Fajr');
    setNextPrayer({ name: 'Fajr', time: to12h(fajr24) });
  }, [times, currentTime, currentOverride]);

  // Build table rows using effective times
  const prayerRows = times ? [
    { key: 'fajr',    name: 'Fajr',    adhan24: effectiveAdhan24('fajr', 'Fajr'),       iqamah24: effectiveIqamah24('fajr', 'Fajr', iqamahOffsets.fajr) },
    { key: 'dhuhr',   name: 'Dhuhr',   adhan24: effectiveAdhan24('dhuhr', 'Dhuhr'),     iqamah24: effectiveIqamah24('dhuhr', 'Dhuhr', iqamahOffsets.dhuhr) },
    { key: 'asr',     name: 'Asr',     adhan24: effectiveAdhan24('asr', 'Asr'),         iqamah24: effectiveIqamah24('asr', 'Asr', iqamahOffsets.asr) },
    { key: 'maghrib', name: 'Maghrib', adhan24: effectiveAdhan24('maghrib', 'Maghrib'), iqamah24: effectiveIqamah24('maghrib', 'Maghrib', iqamahOffsets.maghrib) },
    { key: 'isha',    name: 'Isha',    adhan24: effectiveAdhan24('isha', 'Isha'),       iqamah24: effectiveIqamah24('isha', 'Isha', iqamahOffsets.isha) },
  ].map(p => ({
    ...p,
    adhan: to12h(p.adhan24),
    iqamah: to12h(p.iqamah24),
    current: nextPrayer.name === p.name,
  })) : [];

  // Jumu'ah with overrides
  const jumuahOv = currentOverride['jumuah'];
  const jumuahAdhan = to12h(jumuahOv?.new_adhan_time ? timeDbTo24(jumuahOv.new_adhan_time) : jumuahDefaultAdhan24);
  const jumuahIqamah = to12h(jumuahOv?.new_iqamah_time ? timeDbTo24(jumuahOv.new_iqamah_time) : jumuahDefaultIqamah24);

  const currentTimeStr = currentTime
    ? currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Salah Times</h1>
        <p className={styles.heroSubtitle}>
          &ldquo;Indeed, prayer has been decreed upon the believers a decree of specified times.&rdquo; (An-Nisa 4:103)
        </p>
      </section>

      {/* Main Grid */}
      <section className={styles.mainGrid}>
        <div className={styles.activeCard}>
          <div className={styles.activeGhost}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '12rem' }}>schedule</span>
          </div>
          <div className={styles.activeTop}>
            <p className={styles.activeLabel}>Next Prayer</p>
            <h2 className={styles.activeName}>{nextPrayer.name}</h2>
          </div>
          <div className={styles.activeBottom}>
            <div className={styles.activeTime}>{currentTimeStr}</div>
            <p className={styles.activeIqamah}>
              {nextPrayer.name !== 'Loading...' && times
                ? `Iqamah will be at ${prayerRows.find(p => p.name === nextPrayer.name)?.iqamah || ''}`
                : 'Loading times...'}
            </p>
          </div>
        </div>

        {/* Times Table — phone shows external Masjid Board, PC shows the local table */}
        <div className={styles.externalBoard}>
          <LazyIframe
            src="https://masjidboardlive.com/boards/?id=blairgowrie-ubay-bin-kab"
            title="Masjid Times — Live Board"
            className={styles.externalBoardFrame}
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href="https://masjidboardlive.com/boards/?id=blairgowrie-ubay-bin-kab"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalBoardLink}
          >
            Open Masjid Board ↗
          </a>
        </div>

        <div className={styles.tableWrap}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Prayer</th>
                  <th>Adhan</th>
                  <th>Iqamah</th>
                  <th>Upcoming Change</th>
                </tr>
              </thead>
              <tbody>
                {prayerRows.map(p => (
                  <tr key={p.name} className={p.current ? styles.currentRow : ''}>
                    <td className={styles.prayerCell}>
                      {p.name}
                      {p.current && <span className={styles.pulseGold} />}
                    </td>
                    <td className={styles.timeCell}>{p.adhan}</td>
                    <td className={styles.iqamahCell}>{p.iqamah}</td>
                    <td className={styles.changeCell}>
                      <ChangeCell change={upcomingChange[p.key]} styles={styles} />
                    </td>
                  </tr>
                ))}
                <tr className={styles.jumuahRow}>
                  <td className={styles.prayerCell} style={{ color: 'var(--secondary)' }}>Jumu&apos;ah</td>
                  <td className={styles.timeCell}>{jumuahAdhan}</td>
                  <td className={styles.iqamahCell} style={{ color: 'var(--secondary)' }}>{jumuahIqamah}</td>
                  <td className={styles.changeCell}>
                    <ChangeCell change={upcomingChange['jumuah']} styles={styles} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className={styles.info}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Adhan vs. Iqamah</h3>
            <p className={styles.infoText}>
              The <strong>Adhan</strong> is the call to prayer, signaling that the time for prayer has begun. The <strong>Iqamah</strong> is the second call given just before the congregation (jama&apos;ah) begins the prayer.
            </p>
            <p className={styles.infoText}>
              Please try to arrive at the Masjid at least 5 minutes before the Iqamah time to ensure you are ready for the congregational prayer.
            </p>
          </div>
          <div className={styles.infoNotices}>
            <div className={styles.notice}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--secondary)' }}>info</span>
              <div>
                <h4 className={styles.noticeTitle}>Weekly Changes</h4>
                <p className={styles.noticeText}>Prayer times are updated automatically using the Aladhan API based on the sun&apos;s position for Blairgowrie, Randburg.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Quote */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteDivider} />
        <p className={styles.quoteText}>
          &ldquo;The closest a servant comes to his Lord is when he is prostrating himself, so make many supplications in it.&rdquo;
        </p>
        <p className={styles.quoteSource}>Sahih Muslim</p>
      </section>
    </div>
  );
}
