export const SITE = {
  name: 'Limani Fliesenleger',
  nameShort: 'Limani',
  tagline: 'Fliesen, Bäder & Wohnungssanierung',
  description: 'Fliesenleger Mannheim – Limani: Fliesen, Badsanierung, Bodenverlegung, Trockenbau & Wohnungssanierung. 900+ Projekte, 30+ Jahre Erfahrung. Kostenlose Beratung & schnelle Termine.',
  url: 'https://www.limani-fliesenleger.de',
  phone: '0173 329 3668',
  phoneTel: '+491733293668',
  email: 'kontakt@limani-fliesenleger.de',
  whatsapp: 'https://wa.me/491733293668',
  address: {
    street: 'E7 13',
    city: 'Mannheim',
    zip: '68159',
    country: 'DE',
  },
  social: {
    instagram: 'https://www.instagram.com/limani_fliesenleger/',
    facebook: 'https://www.facebook.com/limanifliesenleger/',
    google: 'https://maps.app.goo.gl/gayv2hFuPx7h2xTm6',
  },
  ga4: 'G-RMM9L4YHL0',
  // Worker URL wird nach Deployment gesetzt
  workerUrl: 'https://limani-contact.ACCOUNT.workers.dev',
};

export const NAV_LINKS = [
  {
    label: 'Leistungen',
    href: '/#leistungen',
    dropdown: [
      { label: 'Übersicht', href: '/#leistungen' },
      { label: 'Fliesenarbeiten', href: '/fliesenarbeiten-mannheim' },
      { label: 'Badsanierung', href: '/badsanierung-mannheim' },
      { label: 'Verputz & Malerarbeiten', href: '/malerarbeiten-mannheim' },
      { label: 'Trockenbauarbeiten', href: '/trockenbauarbeiten-mannheim' },
      { label: 'Bodenverlegung & Estrich', href: '/bodenarbeiten-mannheim' },
      { label: 'Abbruch & Entsorgung', href: '/abbrucharbeiten-mannheim' },
      { label: 'Wohnungssanierung', href: '/wohnungssanierung-mannheim' },
    ],
  },
  { label: 'Über uns', href: '/#vorteile' },
  { label: 'Kontakt', href: '/kontakt-mannheim' },
];
