export const ORIGIN_ZIP = '77070';
export const MILE_RATE = 2;
export const CUSTOM_SONG_FROM = 50;
export const EXTRA_HALF_HOUR = 150;
export const EVENT_MIN_MINUTES = 60;

const TIMED_EVENT_IDS = new Set(['wedding', 'corporate', 'private']);

const usd = (amount) => `$${amount.toLocaleString('en-US')}`;

export const lessonRates = [
  { id: 'in-person', kind: 'lesson', title: 'In-Person · Houston', min: 90, max: 110, travel: true },
  { id: 'online', kind: 'lesson', title: 'Online · Zoom / FaceTime', min: 80, max: 100, travel: false },
].map((item) => ({ ...item, rate: `${usd(item.min)} – ${usd(item.max)}` }));

export const eventRates = [
  { id: 'wedding', kind: 'event', title: 'Weddings & Bridal Events', min: 550, travel: true },
  { id: 'corporate', kind: 'event', title: 'Corporate & VIP Events', min: 500, travel: true },
  { id: 'private', kind: 'event', title: 'Private Parties & Social', min: 450, travel: true },
  { id: 'memorial', kind: 'event', title: 'Memorials, Sacred & Orchestral', min: 400, travel: true },
].map((item) => {
  const timed = TIMED_EVENT_IDS.has(item.id);
  return {
    ...item,
    timed,
    rate: timed ? `${usd(item.min)} for 1 hour` : `from ${usd(item.min)}`,
    detail: timed ? `then ${usd(EXTRA_HALF_HOUR)} each extra 30 min` : undefined,
  };
});

export const timedEvents = eventRates.filter((item) => item.timed);

export const addOns = [
  { title: 'Custom Song Arrangement', rate: `from ${usd(CUSTOM_SONG_FROM)} / song` },
  { title: `Travel from ${ORIGIN_ZIP}`, rate: `${usd(MILE_RATE)} / mile, round trip` },
];
