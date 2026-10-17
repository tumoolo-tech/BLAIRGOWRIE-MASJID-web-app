import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'Learn about the Blairgowrie Muslim Association, our journey to purchase a permanent masjid, and our vision for the community.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="/pictures/placeview1.webp"
            srcSet="/pictures/placeview1-960.webp 960w, /pictures/placeview1.webp 1181w"
            sizes="100vw"
            fetchPriority="high"
            alt="Masjid Exterior"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>Establishing a Sanctuary</span>
          <h1 className={styles.heroTitle}>About Blairgowrie Masjid</h1>
          <div className={styles.heroBar} />
        </div>
      </section>

      {/* Journey Section */}
      <section className={styles.journey}>
        <div className={styles.journeyGrid}>
          <div className={styles.journeyText}>
            <h2 className={styles.sectionTitle}>Our Journey to Purchase</h2>
            <div className={styles.textBlock}>
              <p className={styles.blackText}>Blairgowrie Masjid is one of the first initiatives of the Blairgowrie Muslim Association. We are a non-profit organization located in Blairgowrie, Randburg.</p>
              <p className={styles.quote}>&ldquo;We have signed an offer to purchase for a property and we intend to turn this property into a masjid.&rdquo;</p>
              <p className={styles.blackText}>We are currently raising funds for the purchase price. The masjid aims to serve the Islamic needs of the community and teach Islamic education, creating a hub for spiritual growth and community cohesion.</p>
            </div>
          </div>
          <div className={styles.journeyCta}>
            <div className={styles.ctaCard}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>account_balance_wallet</span>
              <h3 className={styles.ctaTitle}>Support Our Foundation</h3>
              <p className={styles.ctaDesc}>Your contributions help secure our permanent home in Blairgowrie.</p>
              <Link href="/donate" className={styles.ctaBtn}>CONTRIBUTE TO PURCHASE</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className={styles.vision}>
        <div className={styles.visionCenter}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '3rem', color: 'var(--accent)' }}>visibility</span>
          <h2 className={styles.visionTitle}>Our Vision</h2>
          <p className={styles.visionQuote}>
            &ldquo;To serve the community with excellence, fostering a space where spiritual devotion meets community service in the heart of Blairgowrie.&rdquo;
          </p>
        </div>
        <div className={styles.visionPillars}>
          {[
            { icon: 'school', title: 'Education and Madrassah', desc: 'Providing authentic Islamic education for children and adults through structured programs.' },
            { icon: 'diversity_3', title: 'Community', desc: "Building a supportive network for Blairgowrie's Muslim families and our neighbors." },
            { icon: 'mosque', title: 'Spirituality', desc: 'Establishing a serene environment for the five daily prayers and spiritual reflection.' },
          ].map((item, i) => (
            <div key={i} className={styles.pillarCard}>
              <h4 className={styles.pillarTitle}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.title}
              </h4>
              <p className={styles.pillarDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* History Section */}
      <section className={styles.history}>
        <div className={styles.historyGrid}>
          <div className={styles.historyHero}>
            <div className={styles.historyGhost}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '8rem', opacity: 0.1 }}>history</span>
            </div>
            <h2 className={styles.historyTitle}>History Section</h2>
            <p className={styles.historyDesc}>Tracing the roots of the Blairgowrie Muslim Association (BMA) and our vision for the future.</p>
          </div>
          <div className={styles.historyCards}>
            <div className={styles.historyCard}>
              <span className={styles.historyCardTitle}>The Beginning</span>
              <p className={styles.historyCardText}>Placeholder for BMA history text regarding the formation of the association and initial community gatherings in Blairgowrie.</p>
            </div>
            <div className={styles.historyCard}>
              <span className={styles.historyCardTitle}>Community Growth</span>
              <p className={styles.historyCardText}>Documenting the growth of the Muslim population in the Randburg area and the increasing need for a dedicated prayer space.</p>
            </div>
            <div className={`${styles.historyCard} ${styles.historyCardWide}`}>
              <span className={styles.historyCardTitle}>The Milestone</span>
              <p className={styles.historyCardText}>The historic moment the offer to purchase was signed, marking the transition from a dream to a tangible project for the Blairgowrie community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy CTA */}
      <section className={styles.legacy}>
        <div className={styles.legacyInner}>
          <h2 className={styles.legacyTitle}>Be Part of the Legacy</h2>
          <p className={styles.legacyDesc}>Your support today builds the foundation for generations of worship and learning in our neighborhood.</p>
          <div className={styles.legacyBtns}>
            <Link href="/donate" className="btn-filled">Make a Donation</Link>
            <Link href="/prospectus" className="btn">Download Prospectus</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
