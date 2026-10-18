'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';
import { org, fullAddress } from '../content/site';

export default function Footer() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', styleClass: styles.link },
    { href: '/about', label: 'About', styleClass: styles.link },
    { href: '/salah-times', label: 'Salah Times', styleClass: styles.link },
    { href: '/events', label: 'Events', styleClass: styles.link },
    { href: '/contact', label: 'Contact', styleClass: styles.link },
    { href: '/prospectus', label: 'Prospectus →', styleClass: styles.linkGold },
    { href: '/donate', label: 'Donate →', styleClass: styles.linkGold },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Brand */}
        <div>
          <div className={styles.logo}>
            <img src="/pictures/logo.webp" alt="" className={styles.logoImg} />
            <span className={styles.logoText}>BLAIRGOWRIE MASJID</span>
          </div>
          <p className={styles.desc}>A sanctuary for spiritual growth, education, and community service in the heart of Blairgowrie, Randburg.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className={styles.colTitle}>NAVIGATE</h3>
          <div className={styles.links}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${link.styleClass} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className={styles.colTitle}>CONTACT</h3>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:'1rem'}}>location_on</span>
              70 Conrad Drive, Blairgowrie
            </li>
            <li className={styles.listItem}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:'1rem'}}>mail</span>
              <a href="mailto:blairgowriemasjid@gmail.com">blairgowriemasjid@gmail.com</a>
            </li>
            <li className={styles.listItem}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:'1rem'}}>phone</span>
              072 441 1651
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        {/* ECTA s43 disclosure */}
        <p className={styles.legal}>
          {org.legalName} · {org.legalStatus} · Registration: {org.registration}
          <br />
          {fullAddress} · {org.phone} · <a href={`mailto:${org.email}`}>{org.email}</a>
        </p>
        <p className={styles.copyright}>© {new Date().getFullYear()} {org.legalName}.
          <Link prefetch={false} href="/privacy-policy" className={styles.policyLink}>Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
}
