// Privacy policy copy (POPIA). TEMPLATE: to be reviewed by the Association's legal adviser
// before it is relied on. Organisation details come from ./site.js.
import { org, fullAddress } from './site';

export const lastUpdated = '17 October 2026';

export const templateNotice =
  "This policy is a template prepared by the website developer. It must be reviewed and approved by the Association's legal adviser before it is relied on.";

export const intro = `${org.legalName} ("we", "us") runs this website for ${org.name}. We respect your privacy and handle personal information in line with the Protection of Personal Information Act 4 of 2013 (POPIA). This policy explains what we collect through this website, why, who else handles it, how long we keep it and what your rights are.`;

export const responsibleParty = [
  ['Responsible party', `${org.legalName} (${org.legalStatus})`],
  ['Information officer', org.informationOfficer],
  ['Address', fullAddress],
  ['Email', org.email],
  ['Phone', org.phone],
];

export const collected = [
  {
    title: 'Contact form',
    what: 'Your name, email address, the message you write and your agreement to this policy.',
    why: 'To read and reply to your message. We rely on your consent, which you give by ticking the box on the form.',
    kept: 'In our email inbox for up to 24 months after the conversation ends, then deleted.',
  },
  {
    title: 'Spam protection',
    what: 'Your IP address and browser details, processed by our form service when you send the contact form.',
    why: 'To detect and block automated spam. This is in our legitimate interest in keeping the form usable.',
    kept: 'Only as long as the form service needs it for that check (see its policy).',
  },
  {
    title: 'Visitor statistics',
    what: 'Pages viewed, referring site, country, browser and device type. No cookies are used and no one is identified.',
    why: 'To understand which pages are useful and improve the site.',
    kept: 'Aggregated statistics only, kept by the analytics provider for up to 24 months.',
  },
  {
    title: 'Website hosting logs',
    what: 'Your IP address, the page requested and the time, recorded automatically by our host when your browser loads the site.',
    why: 'To deliver the site, keep it secure and investigate faults.',
    kept: 'Short-term, under the host’s log retention (typically days to weeks).',
  },
  {
    title: 'Administrator accounts',
    what: 'The email address and password of the volunteers who manage announcements, events and salah times.',
    why: 'To let authorised people sign in and update the site.',
    kept: 'For as long as the person is an administrator.',
  },
];

export const notCollected =
  'We do not use cookies for tracking or advertising, we do not sell or rent personal information, and we do not take donations through the website: donations are made directly to our bank account.';

export const operators = [
  { name: 'Vercel Inc.', role: 'Hosts the website and provides cookie-free visitor statistics', where: 'United States and global edge network' },
  { name: 'FormSubmit (formsubmit.co)', role: 'Receives the contact form, checks it for spam and emails it to us', where: 'Outside South Africa' },
  { name: 'Google LLC (Gmail)', role: 'Our email inbox, where contact messages are stored', where: 'United States and other countries' },
  { name: 'Supabase Inc.', role: 'Database for announcements, events and salah-time changes, and administrator sign-in', where: 'Outside South Africa (region to be confirmed)' },
];

export const embeds =
  'Some pages show content from other services: a Google Maps map (home and contact pages), the MasjidBoardLive prayer-times board (salah times page and the home page on phones) and prayer times from the AlAdhan API. When these load, your browser connects to those services, which receive your IP address and may set their own cookies under their own privacy policies. We do not control that processing.';

export const crossBorder =
  'Because the services above store or process information outside South Africa, your personal information may be transferred across borders. We only use providers that are subject to data-protection laws or binding terms that give protection substantially similar to POPIA, as section 72 of POPIA requires.';

export const rights = [
  'Ask whether we hold personal information about you and request a copy of it.',
  'Ask us to correct or delete information that is inaccurate, out of date or no longer needed.',
  'Object to our processing your information, and withdraw your consent at any time (this does not affect processing already done).',
  'Lodge a complaint with the Information Regulator.',
];

export const security =
  'The website is served only over encrypted HTTPS, administrator access requires a password, and access to our inbox and database is limited to authorised members of the Association. No method of transmission or storage is completely secure, but we take reasonable steps to protect your information and will notify you and the Information Regulator of any breach as POPIA requires.';

export const regulator = {
  name: 'Information Regulator (South Africa)',
  address: 'JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001',
  complaints: 'POPIAComplaints@inforegulator.org.za',
  enquiries: 'enquiries@inforegulator.org.za',
  website: 'https://inforegulator.org.za',
};

export const changes =
  'We may update this policy when our practices or the law change. The date at the top shows when it was last updated.';
