'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/salah-times', label: 'Salah Times' },
  { href: '/events', label: 'Events' },
  { href: '/prospectus', label: 'Prospectus' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return () => { document.body.style.overflow = ''; };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link prefetch={false} href="/" className={styles.logo}>
            <img src="/pictures/logo.webp" alt="" className={styles.logoImg} />
            <span className={styles.logoText}>BLAIRGOWRIE MASJID</span>
          </Link>

          <div className={styles.desktopLinks}>
            {links.map(l => (
              <Link prefetch={false} key={l.href} href={l.href}
                className={`${styles.navLink} ${pathname === l.href ? styles.active : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className={styles.actions}>
            <Link prefetch={false} href="/donate" className={styles.donateBtn}>DONATE</Link>
            <ThemeToggle />
            <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen} aria-controls="mobile-menu">
              <span className={styles.menuLabel}>MENU</span>
              <span className="material-symbols-outlined" aria-hidden="true">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOpen : ''}`}
        onClick={() => setMenuOpen(false)} />

      {/* Mobile menu */}
      <div id="mobile-menu" className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          {links.map(l => (
            <Link prefetch={false} key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`${styles.mobileLink} ${pathname === l.href ? styles.active : ''}`}>
              {l.label}
            </Link>
          ))}
          <Link prefetch={false} href="/donate" className={styles.mobileDonate} onClick={() => setMenuOpen(false)}>
            DONATE
          </Link>
          <Link prefetch={false} href="/contact" className={styles.mobileContact} onClick={() => setMenuOpen(false)}>
            CONTACT US
          </Link>
        </div>
      </div>
    </>
  );
}
