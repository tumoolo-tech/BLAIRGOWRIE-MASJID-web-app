import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Prospectus',
  description: 'Explore the Blairgowrie Masjid prospectus — our visionary roadmap for faith, education, and community unity.',
  alternates: { canonical: '/prospectus' },
};

export default function ProspectusPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Prospectus</h1>
          <p className={styles.heroSub}>A visionary roadmap for the spiritual heart of Blairgowrie. Building a legacy of faith, education, and community unity.</p>
        </div>
      </header>

      {/* Main Content */}
      <section className={styles.main}>
        <div className={styles.mainGrid}>
          <div className={styles.textCol}>
            <span className={styles.label}>Foundation &amp; Future</span>
            <h2 className={styles.sectionTitle}>A Sanctuary for Generations</h2>
            <div className={styles.textBody}>
              <p className={`${styles.dropCap} ${styles.veryWhiteText}`}>The Blairgowrie Masjid project represents more than just a place of prayer; it is a meticulously planned ecosystem designed to serve the spiritual, social, and educational needs of our growing community. Our vision is to create a landmark of tranquility that honors Islamic tradition while embracing modern community dynamics.</p>
              <div className={styles.quoteBlock}>
                <p>&ldquo;To foster an environment where spiritual growth meets civic excellence, providing a beacon of light for all residents of Blairgowrie and beyond.&rdquo;</p>
              </div>
              <p className={styles.veryWhiteText}>Our commitment extends beyond the physical structure. We are dedicated to establishing programs that empower the youth, support the elderly, and create a welcoming space for dialogue and learning. The prospectus outlines our phased development approach, ensuring fiscal responsibility and community transparency at every milestone.</p>
            </div>
          </div>
          <div className={styles.cardsCol}>
            {[
              { icon: 'auto_stories', title: 'Educational Excellence', desc: 'Structured Madrasah programs and adult education seminars focusing on classical Islamic sciences and contemporary ethics.' },
              { icon: 'diversity_1', title: 'Community Impact', desc: 'Welfare initiatives including food security programs, counseling services, and interfaith engagement platforms.' },
              { icon: 'eco', title: 'Sustainable Design', desc: 'Implementing green energy solutions and water conservation systems to ensure our masjid serves as a steward of the earth.' },
            ].map((c, i) => (
              <div key={i} className={styles.initiativeCard}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '1.75rem', color: 'var(--secondary)' }}>{c.icon}</span>
                <div>
                  <h3 className={styles.initiativeTitle}>{c.title}</h3>
                  <p className={styles.initiativeDesc}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className={styles.download}>
        <div className={styles.downloadIcon}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
        </div>
        <h2 className={styles.downloadTitle}>Explore the Complete Vision</h2>
        <p className={styles.downloadDesc}>Our comprehensive prospectus provides in-depth details on architectural plans, financial projections, governance structures, and the five-year community roadmap.</p>
        <div className={styles.downloadBtns}>
          <button className="btn-filled" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Download our full Prospectus PDF <span className="material-symbols-outlined" aria-hidden="true">download</span>
          </button>
          <Link href="/contact" className={styles.printLink}>Request a Printed Copy</Link>
        </div>
      </section>

      {/* Architecture Preview */}
      <section className={styles.architecture}>
        <div className={styles.archGrid}>
          <h3 className={styles.archTitle}>The Blueprint of Serenity</h3>
          <div className={styles.archFlow}>
            <div className={styles.archImg}>
              <img src="/pictures/prospectus.webp" alt="Masjid Concept" loading="lazy" decoding="async" />
            </div>
            <p className={styles.archDesc}>The architectural language of Blairgowrie Masjid balances classic proportions with contemporary clarity. Utilizing local materials and maximizing natural light, the design ensures that every visitor experiences an immediate sense of detachment from worldly noise upon entry.</p>
          </div>
          <ul className={styles.archList}>
            <li><span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--secondary)' }}>check_circle</span> 800+ Musalli Capacity</li>
            <li><span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--secondary)' }}>check_circle</span> Dedicated Women&apos;s Prayer &amp; Learning Center</li>
            <li><span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--secondary)' }}>check_circle</span> Multi-purpose Community Hall</li>
          </ul>
        </div>
      </section>
      {/* Design & Concept Gallery */}
      <section className={styles.gallerySection}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>Design &amp; Views</h2>
        <div className={styles.galleryGrid}>
          {[
            { src: '/pictures/placeview1.webp', ratio: '16/9', alt: 'Place View 1' },
            { src: '/pictures/placeview2.webp', ratio: '16/9', alt: 'Place View 2' },
            { src: '/pictures/designtemplate1.webp', ratio: '3/4', alt: 'Design Template 1' },
            { src: '/pictures/designtemplate2.webp', ratio: '3/4', alt: 'Design Template 2' },
            { src: '/pictures/design1.webp', ratio: '3/2', alt: 'Design 1' },
            { src: '/pictures/design2.webp', ratio: '3/2', alt: 'Design 2' }
          ].map((img, i) => (
            <div key={i} className={styles.wrap} style={{ '--img': `url(${img.src})` }}>
              <img src={img.src} style={{ '--img-r': img.ratio }} alt={img.alt} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
