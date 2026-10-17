import './globals.css';
import { Bebas_Neue, DM_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebGLBackground from './components/WebGLBackground';
import { SITE_URL, org } from './content/site';

// next/font downloads these at build time and serves them from our own origin (no font CDN).
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const dmMono = DM_Mono({ weight: ['300', '400'], subsets: ['latin'], variable: '--font-dm-mono' });
// Subset of Material Symbols Outlined holding only the icons the site uses
// (list in fonts/material-symbols-icons.txt). `block` so ligature names never flash as text.
const icons = localFont({
  src: './fonts/material-symbols-subset.woff2',
  display: 'block',
  variable: '--font-icons',
  adjustFontFallback: false,
});

const description =
  'Blairgowrie Masjid in Randburg: daily salah times, events, the madressa and how to support the masjid. A centre for prayer, learning and community.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Blairgowrie Masjid — A Sanctuary for Spiritual Growth',
    template: '%s | Blairgowrie Masjid',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Blairgowrie Masjid',
    locale: 'en_ZA',
    title: 'Blairgowrie Masjid — A Sanctuary for Spiritual Growth',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blairgowrie Masjid — A Sanctuary for Spiritual Growth',
    description,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Mosque',
  name: org.name,
  alternateName: org.venue,
  url: SITE_URL,
  email: org.email,
  telephone: org.phoneIntl,
  image: `${SITE_URL}/opengraph-image.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: org.address.street,
    addressLocality: `${org.address.suburb}, ${org.address.city}`,
    addressRegion: org.address.province,
    postalCode: org.address.postalCode,
    addressCountry: 'ZA',
  },
  geo: { '@type': 'GeoCoordinates', latitude: org.geo.latitude, longitude: org.geo.longitude },
  parentOrganization: { '@type': 'NGO', name: org.legalName },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-ZA" data-theme="dark" className={`${bebas.variable} ${dmMono.variable} ${icons.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <WebGLBackground />
        <div className="scroll-content">
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </div>
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
