import styles from './page.module.css';
import { org } from '../content/site';
import {
  lastUpdated, templateNotice, intro, responsibleParty, collected, notCollected,
  operators, embeds, crossBorder, rights, security, regulator, changes,
} from '../content/privacy';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How the Blairgowrie Muslim Association collects, uses and protects personal information on this website, in line with POPIA.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.meta}>
            <span>Last updated: {lastUpdated}</span>
            <span className={styles.metaDivider}>|</span>
            <span>{org.legalName}</span>
          </div>
        </header>

        {/* Decorative Image */}
        <div className={styles.decorImg}>
          <img src="/pictures/privacy-patterns.webp" alt="" />
          <div className={styles.decorOverlay} />
        </div>

        <div className={styles.content}>
          <p className={styles.highlightSection} role="note">{templateNotice}</p>
          <p className={styles.intro}>{intro}</p>

          <section className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Who is responsible</h2>
            <dl className={styles.bulletList}>
              {responsibleParty.map(([k, v]) => (
                <div key={k}>
                  <dt className={styles.purposeTitle}>{k}</dt>
                  <dd className={styles.sectionText}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What we collect, why, and how long we keep it</h2>
            <div className={styles.purposeGrid}>
              {collected.map((c) => (
                <div key={c.title} className={styles.purposeCard}>
                  <h3 className={styles.purposeTitle}>{c.title}</h3>
                  <p className={styles.purposeDesc}><strong>What:</strong> {c.what}</p>
                  <p className={styles.purposeDesc}><strong>Why:</strong> {c.why}</p>
                  <p className={styles.purposeDesc}><strong>Kept:</strong> {c.kept}</p>
                </div>
              ))}
            </div>
            <p className={styles.sectionText} style={{ marginTop: '1rem' }}>{notCollected}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Who else handles your information</h2>
            <p className={styles.sectionText}>These operators process personal information on our behalf:</p>
            <ul className={styles.bulletList}>
              {operators.map((o) => (
                <li key={o.name}>
                  <span className={styles.bullet} />
                  <span><strong>{o.name}</strong>: {o.role}. Location: {o.where}.</span>
                </li>
              ))}
            </ul>
            <p className={styles.sectionText} style={{ marginTop: '1rem' }}>{embeds}</p>
          </section>

          <section className={styles.highlightSection}>
            <h2 className={styles.sectionTitle}>Transfers outside South Africa</h2>
            <p className={styles.sectionText}>{crossBorder}</p>
          </section>

          <section className={styles.twoCol}>
            <div>
              <h2 className={styles.sectionTitle}>Your rights</h2>
              <ul className={styles.bulletList}>
                {rights.map((r) => (
                  <li key={r}><span className={styles.bullet} /><span>{r}</span></li>
                ))}
              </ul>
              <p className={styles.sectionText} style={{ marginTop: '1rem' }}>
                To use any of these rights, email {org.email}. We will reply within a reasonable time and may ask you to confirm your identity.
              </p>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Security</h2>
              <p className={styles.sectionText}>{security}</p>
            </div>
          </section>

          <section className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Complaints: the Information Regulator</h2>
            <p className={styles.sectionText}>
              Please contact us first so we can try to resolve your concern. You may also complain to the {regulator.name}:
            </p>
            <ul className={styles.bulletList}>
              <li><span className={styles.bullet} /><span>Address: {regulator.address}</span></li>
              <li><span className={styles.bullet} /><span>Complaints: {regulator.complaints}</span></li>
              <li><span className={styles.bullet} /><span>General enquiries: {regulator.enquiries}</span></li>
              <li><span className={styles.bullet} /><span>Website: <a href={regulator.website} target="_blank" rel="noopener noreferrer">{regulator.website.replace('https://', '')}</a></span></li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Changes to this policy</h2>
            <p className={styles.sectionText}>{changes}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
