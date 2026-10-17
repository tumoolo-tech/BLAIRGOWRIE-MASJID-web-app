import Link from 'next/link';
import styles from '../../thank-you/page.module.css';

export const metadata = {
  title: 'Message Sent',
  description: 'Thank you for contacting Blairgowrie Masjid. Your message has been sent and we will reply as soon as we can, In Shaa Allah.',
  alternates: { canonical: '/contact/sent' },
  robots: { index: false, follow: true },
};

export default function MessageSentPage() {
  return (
    <div className={styles.page}>
      <section className={styles.message}>
        <h1 className={styles.title}>Message Sent</h1>
        <div className={styles.confirmCard}>
          <div className={styles.confirmIcon}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className={styles.confirmTitle}>Jazakallah Khair</h2>
          <p className={styles.confirmDesc}>Thank you for reaching out. We&apos;ll get back to you shortly, In Shaa Allah.</p>
          <div className={styles.confirmDivider} />
          <Link href="/" className={styles.homeBtn}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1rem' }}>arrow_back</span>
            Return to Home Page
          </Link>
        </div>
      </section>
    </div>
  );
}
