import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Thank You',
  description: 'Thank you for your message or donation to Blairgowrie Masjid. May Allah reward your generosity and support.',
  alternates: { canonical: '/thank-you' },
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <div className={styles.page}>
      {/* Decorative */}
      <div className={styles.sparkle}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '4rem', color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </div>

      {/* Success Message */}
      <section className={styles.message}>
        <h1 className={styles.title}>Thank You for Your Generous Donation</h1>
        <div className={styles.quoteWrap}>
          <div className={styles.quoteGlow} />
          <p className={styles.quote}>&ldquo;May Allah reward your generosity and help us build a home for the community. Your contribution makes a lasting difference.&rdquo;</p>
        </div>

        {/* Confirmation */}
        <div className={styles.confirmCard}>
          <div className={styles.confirmIcon}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className={styles.confirmTitle}>Confirmation Received</h2>
          <p className={styles.confirmDesc}>Your donation has been received and will go directly towards the Blairgowrie Masjid project.</p>
          <div className={styles.confirmDivider} />
          <Link href="/" className={styles.homeBtn}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem' }}>arrow_back</span>
            Return to Home Page
          </Link>
        </div>

        {/* Images */}
        <div className={styles.imageGrid}>
          <div className={styles.imageCard}>
            <img src="/pictures/thank-you-architecture.webp" alt="Islamic architecture" loading="lazy" decoding="async" />
            <div className={styles.imageOverlay} />
          </div>
          <div className={styles.imageCard}>
            <img src="/pictures/thank-you-community.webp" alt="Community gathering" loading="lazy" decoding="async" />
            <div className={styles.imageOverlay} />
          </div>
        </div>
      </section>
    </div>
  );
}
