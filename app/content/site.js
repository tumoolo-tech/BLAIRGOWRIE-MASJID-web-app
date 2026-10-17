// Single source of truth for the organisation's public and legal details.
// Used by the footer (ECTA s43), the privacy policy (POPIA) and structured data.
// Values marked CONFIRM must be checked with the Association before launch.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://blairgowrie-masjid-web-app.vercel.app';

export const org = {
  name: 'Blairgowrie Masjid',
  legalName: 'Blairgowrie Muslim Association',
  // CONFIRM: legal form and NPO / PBO registration number with the Association.
  legalStatus: 'Non-profit voluntary association',
  registration: 'Not registered (NPO registration to be confirmed)',
  venue: "Sayyidina Ubay bin Ka'b (RA) Musalla & Madressa",
  address: {
    street: '70 Conrad Drive',
    suburb: 'Blairgowrie',
    city: 'Randburg',
    postalCode: '2195',
    province: 'Gauteng',
    country: 'South Africa',
  },
  geo: { latitude: -26.1076, longitude: 28.0075 },
  email: 'blairgowriemasjid@gmail.com',
  phone: '072 441 1651',
  phoneIntl: '+27724411651',
  // CONFIRM: the person the Association names as its information officer under POPIA.
  // Under POPIA the head of the body is the information officer unless another person is designated.
  informationOfficer: 'The Chairperson of the Blairgowrie Muslim Association (name to be confirmed)',
};

export const fullAddress = `${org.address.street}, ${org.address.suburb}, ${org.address.city}, ${org.address.postalCode}`;
