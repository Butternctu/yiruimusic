export const LESSON_TYPES = [
  // --- In-Person ---
  { id: 'inperson-harp-30', format: 'In-Person', category: 'Private Harp Lesson', duration: 30, name: 'In-Person: Private Harp Lesson (30m)', shortLabel: '30 min' },
  { id: 'inperson-harp-60', format: 'In-Person', category: 'Private Harp Lesson', duration: 60, name: 'In-Person: Private Harp Lesson (60m)', shortLabel: '60 min' },
  { id: 'inperson-masterclass-90', format: 'In-Person', category: 'Masterclass Consultation', duration: 90, name: 'In-Person: Masterclass Consultation (90m)', shortLabel: '90 min' },
  { id: 'inperson-masterclass-120', format: 'In-Person', category: 'Masterclass Consultation', duration: 120, name: 'In-Person: Masterclass Consultation (120m)', shortLabel: '120 min' },
  { id: 'inperson-ensemble-60', format: 'In-Person', category: 'Ensemble Coaching', duration: 60, name: 'In-Person: Ensemble Coaching (60m)', shortLabel: '60 min' },
  { id: 'inperson-theory-30', format: 'In-Person', category: 'Theory Class', duration: 30, name: 'In-Person: Theory Class (30m)', shortLabel: '30 min' },
  { id: 'inperson-theory-45', format: 'In-Person', category: 'Theory Class', duration: 45, name: 'In-Person: Theory Class (45m)', shortLabel: '45 min' },
  { id: 'inperson-private-60', format: 'In-Person', category: 'Private Engagements', duration: 60, name: 'In-Person: Private Engagements (60m)', shortLabel: '60 min' },
  { id: 'inperson-private-120', format: 'In-Person', category: 'Private Engagements', duration: 120, name: 'In-Person: Private Engagements (120m)', shortLabel: '120 min' },
  { id: 'inperson-private-180', format: 'In-Person', category: 'Private Engagements', duration: 180, name: 'In-Person: Private Engagements (180m)', shortLabel: '180 min' },

  // --- Online ---
  { id: 'online-harp-30', format: 'Online', category: 'Private Harp Lesson', duration: 30, name: 'Online: Private Harp Lesson (30m)', shortLabel: '30 min' },
  { id: 'online-harp-60', format: 'Online', category: 'Private Harp Lesson', duration: 60, name: 'Online: Private Harp Lesson (60m)', shortLabel: '60 min' },
  { id: 'online-theory-30', format: 'Online', category: 'Music Theory Class', duration: 30, name: 'Online: Music Theory Class (30m)', shortLabel: '30 min' },
  { id: 'online-theory-45', format: 'Online', category: 'Music Theory Class', duration: 45, name: 'Online: Music Theory Class (45m)', shortLabel: '45 min' },

  // --- Legacy Fallbacks (for old DB entries) ---
  { id: 'private-60', format: 'In-Person', category: 'Private Harp Lesson', duration: 60, name: 'Private Harp Lesson', shortLabel: '60 min', isLegacy: true },
  { id: 'private-30', format: 'In-Person', category: 'Private Harp Lesson', duration: 30, name: 'Private Harp Lesson', shortLabel: '30 min', isLegacy: true },
  { id: 'masterclass', format: 'In-Person', category: 'Masterclass Consultation', duration: 90, name: 'Masterclass Consultation', shortLabel: '90 min', isLegacy: true },
  { id: 'performance-coaching', format: 'In-Person', category: 'Performance Coaching', duration: 60, name: 'Performance Coaching', shortLabel: '60 min', isLegacy: true },
];

export const MEMBERSHIP_TIERS = [
  { id: 'bronze', name: 'Bronze', color: '#CD7F32', borderColor: 'border-[#CD7F32]/50', bgColor: 'bg-[#CD7F32]/10', textColor: 'text-[#CD7F32]' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0', borderColor: 'border-[#C0C0C0]/50', bgColor: 'bg-[#C0C0C0]/10', textColor: 'text-[#C0C0C0]' },
  { id: 'gold', name: 'Gold', color: '#C5A059', borderColor: 'border-gold/50', bgColor: 'bg-gold/10', textColor: 'text-gold' },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2', borderColor: 'border-[#E5E4E2]/50', bgColor: 'bg-[#E5E4E2]/10', textColor: 'text-[#E5E4E2]' }
];

export const SLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  CANCELLED: 'cancelled',
};

export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};


// ── Date / time helpers ──────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatFullDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${FULL_DAY_NAMES[d.getDay()]}, ${FULL_MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minuteStr} ${ampm}`;
}

export function getDayName(date) {
  const d = date instanceof Date ? date : new Date(date);
  return DAY_NAMES[d.getDay()];
}

export function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  sunday.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function isSameDay(d1, d2) {
  const a = d1 instanceof Date ? d1 : new Date(d1);
  const b = d2 instanceof Date ? d2 : new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function isPast(date) {
  return new Date(date) < new Date();
}

export function getLessonTypeById(id) {
  return LESSON_TYPES.find((lt) => lt.id === id);
}

export function formatPhoneNumber(val) {
  if (!val) return val;
  let digits = val.replace(/[^\d]/g, '');
  if (digits.startsWith('1') && digits.length === 11) {
    digits = digits.slice(1);
  }
  const len = digits.length;
  if (len < 4) return digits;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}
