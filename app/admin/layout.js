export const metadata = {
  title: "Admin",
  description: "Administration console for Blairgowrie Masjid announcements, events, khutbah and salah times. Sign-in required.",
  alternates: { canonical: '/admin' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return children;
}
