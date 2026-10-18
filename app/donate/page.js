'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const copyAccount = () => {
    navigator.clipboard.writeText('63078513893');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="/pictures/mosque-interior.webp"
            srcSet="/pictures/mosque-interior-960.webp 960w, /pictures/mosque-interior.webp 1600w"
            sizes="100vw"
            fetchPriority="high"
            alt="Mosque interior"
            className={styles.heroImg}
          />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Make a Donation</h1>
          <p className={styles.heroSub}>Blairgowrie Masjid relies on the support of the community to continue its programs and initiatives. Your donation will go towards the masjid.</p>
        </div>
      </section>

      {/* Message */}
      <section className={styles.message}>
        <div className={styles.messageGrid}>
          <h2 className={styles.messageQuote}>&ldquo;Build a house for yourself in Jannah, by contributing to the establishment of this House of Allah Ta&apos;ala.&rdquo;</h2>
          <div className={styles.messageFlow}>
            <div className={styles.messageImgWrap}>
              <img src="/pictures/mosque-interior-960.webp" alt="Mosque interior" className={styles.messageImg} loading="lazy" decoding="async" />
            </div>
            <p className={styles.blackText}>Our masjid is more than just a building; it is a sanctuary for prayer, a hub for education, and a pillar for our community&apos;s spiritual growth. Every brick laid and every program run is made possible by the generosity of individuals like you.</p>
            <p className={styles.blackText}>We invite you to be a part of this enduring legacy. Please make a donation today and help us maintain and grow this sacred space for generations to come.</p>
          </div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className={styles.methods}>
        <div className={styles.methodsGrid}>
          {/* EFT */}
          <div className={styles.eftCard}>
            <div className={styles.eftHeader}>
              <div className={styles.eftIcon}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.75rem' }}>account_balance</span>
              </div>
              <div>
                <h3 className={styles.eftTitle}>EFT / Bank Transfer</h3>
                <p className={styles.eftSub}>The most direct way to support our ongoing efforts.</p>
              </div>
            </div>
            <div className={styles.bankDetails}>
              <div className={styles.bankRow}>
                <label>Bank</label>
                <p className={styles.bankValue}>First National Bank (FNB)</p>
              </div>
              <div className={styles.bankRow}>
                <label>Account Name</label>
                <p className={styles.bankValue}>Blairgowrie Muslim Association</p>
              </div>
              <div className={styles.bankRow}>
                <label>Account Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <p className={styles.bankValueGold}>63078513893</p>
                  <button onClick={copyAccount} className={styles.copyBtn} title="Copy account number" aria-label="Copy account number">
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.125rem' }}>{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
              </div>
              <div className={styles.bankRow}>
                <label>Branch Code</label>
                <p className={styles.bankValue}>250655</p>
              </div>
            </div>
          </div>

          {/* Cash */}
          <div className={styles.cashCard}>
            <div className={styles.cashIcon}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.75rem' }}>payments</span>
            </div>
            <h3 className={styles.cashTitle}>Cash Donation</h3>
            <p className={styles.cashDesc}>You can also make a donation to Blairgowrie Masjid using cash. This can be done at FNB via a direct cash deposit.</p>
            <div className={styles.cashNote}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--secondary-fixed)' }}>info</span>
              <span className={styles.cashNoteText}>Please use your name or &apos;Donation&apos; as a reference.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Message */}
      <section className={styles.bottom}>
        <div className={styles.bottomDivider} />
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2.5rem', color: 'var(--secondary)', display: 'block', textAlign: 'center', marginBottom: '1rem' }}>volunteer_activism</span>
        <h4 className={styles.bottomTitle}>May Allah reward your generosity.</h4>
        <p className={styles.bottomText}>For any queries regarding donations or to request a receipt, please contact our treasurer at blairgowriemasjid@gmail.com</p>
      </section>
    </div>
  );
}
