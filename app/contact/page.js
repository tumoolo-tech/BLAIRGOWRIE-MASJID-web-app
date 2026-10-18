'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import LazyIframe from '../components/LazyIframe';

// Time-trap: a person takes longer than this to fill the form; bots usually don't.
const MIN_FILL_MS = 3000;

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [nextUrl, setNextUrl] = useState('/contact/sent');
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
    setNextUrl(`${window.location.origin}/contact/sent`);
    // Coming back with the browser's Back button restores this page from cache: re-enable the form.
    const onShow = (e) => { if (e.persisted) setSending(false); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  function onSubmit(e) {
    if (Date.now() - openedAt.current < MIN_FILL_MS) {
      e.preventDefault();
      setError('That was quick! Please check your message and press send again.');
      return;
    }
    setError('');
    setSending(true);
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Contact Us</h1>
        <p className={styles.heroSub}>Connecting our hearts and community. We are here to answer your questions and welcome you to our spiritual home.</p>
      </section>

      {/* Main Grid */}
      <section className={styles.main}>
        <div className={styles.mainGrid}>
          {/* Left: Location + Contact Details */}
          <div className={styles.leftCol}>
            {/* Map Card */}
            <div className={styles.mapCard}>
              <div className={styles.mapCardInner}>
                <h2 className={styles.mapTitle}>Our Future Home</h2>
                <p className={styles.mapDesc}>Blairgowrie Masjid intends to be located at <strong>70 Conrad Drive, Blairgowrie, Randburg.</strong></p>
                <div className={styles.mapWrapper}>
                  <LazyIframe
                    src="https://maps.google.com/maps?q=70+Conrad+Drive+Blairgowrie+South+Africa&z=16&output=embed&hl=en"
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                    title="Blairgowrie Masjid Location"
                  />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=70+Conrad+Drive+Blairgowrie+Randburg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapPin}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    <span>View on Google Maps</span>
                  </a>
                </div>
              </div>
              <div className={styles.mapGhost}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '8rem', opacity: 0.05 }}>mosque</span>
              </div>
            </div>

            {/* Contact Cards */}
            <div className={styles.contactCards}>
              <div className={`${styles.contactCard} ${styles.contactCardEmail}`}>
                <div className={styles.contactIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                </div>
                <div>
                  <h4 className={styles.contactLabel}>Email Inquiry</h4>
                  <p className={styles.contactValue}>blairgowriemasjid@gmail.com</p>
                </div>
              </div>
              <div className={`${styles.contactCard} ${styles.contactCardCall}`}>
                <div className={styles.contactIcon}>
                  <span className="material-symbols-outlined" aria-hidden="true">chat</span>
                </div>
                <div>
                  <h4 className={styles.contactLabel}>Phone &amp; WhatsApp</h4>
                  <div className={styles.phoneList}>
                    <div className={styles.phoneEntry}>
                      <p className={styles.phoneName}>Hafidh Yaseen Waja</p>
                      <p className={styles.phoneNumber}>072 441 1651</p>
                    </div>
                    <hr className={styles.phoneDivider} />
                    <div className={styles.phoneEntry}>
                      <p className={styles.phoneName}>Brother Mohammed M Khan</p>
                      <p className={styles.phoneNumber}>079 879 7246</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className={styles.rightCol}>
            <div className={styles.formCard}>
              <div className={styles.formGhost}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '10rem', opacity: 0.1 }}>edit_note</span>
              </div>
              <h2 className={styles.formTitle}>Send a Message</h2>
              <p className={styles.formSub}>Have a specific question? Fill out the form below and we&apos;ll get back to you shortly.</p>

              <form
                action="https://formsubmit.co/blairgowriemasjid@gmail.com"
                method="POST"
                className={styles.form}
                onSubmit={onSubmit}
              >
                {/* FormSubmit config */}
                <input type="hidden" name="_subject" value="New Contact Form Submission - Blairgowrie Masjid Website" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={nextUrl} />
                {/* Honeypot: hidden from people and screen readers; bots fill it and FormSubmit drops the message */}
                <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className={styles.formGroup}>
                  <label htmlFor="contact-name">Full Name</label>
                  <input type="text" name="name" placeholder="Enter your name" required id="contact-name" autoComplete="name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">Email Address</label>
                  <input type="email" name="email" placeholder="your@email.com" required id="contact-email" autoComplete="email" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea name="message" placeholder="How can we help you?" rows="5" required id="contact-message" />
                </div>
                <div className={styles.consent}>
                  <input type="checkbox" name="consent" value="Agreed to the privacy policy" required id="contact-consent" />
                  <label htmlFor="contact-consent">
                    I agree that the Blairgowrie Muslim Association may use these details to reply to me, as set out in the{' '}
                    <Link href="/privacy-policy">privacy policy</Link>.
                  </label>
                </div>
                {error && <p className={styles.formError} role="alert">{error}</p>}
                <button type="submit" className={styles.submitBtn} id="contact-submit" disabled={sending}>
                  <span>{sending ? 'Sending…' : 'Send Message'}</span>
                  <span className="material-symbols-outlined" aria-hidden="true">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
