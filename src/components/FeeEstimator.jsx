import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CUSTOM_SONG_FROM, EVENT_MIN_MINUTES, EXTRA_HALF_HOUR, MILE_RATE, ORIGIN_ZIP, timedEvents } from '../data/pricing';
import { milesFromOrigin } from '../lib/travelDistance';

const MAX_MINUTES = 8 * 60;
const MAX_SONGS = 12;

const money = (amount) =>
  Math.round(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  if (hours === 0) return `${remainder} min`;
  return `${hours} hr ${remainder} min`;
};

const performanceFee = (firstHour, minutes) => {
  const extraHalfHours = Math.max(0, (minutes - EVENT_MIN_MINUTES) / 30);
  return firstHour + extraHalfHours * EXTRA_HALF_HOUR;
};

const FeeEstimator = () => {
  const [eventId, setEventId] = useState(timedEvents[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [minutes, setMinutes] = useState(EVENT_MIN_MINUTES);
  const [songs, setSongs] = useState(0);
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const menuRef = useRef(null);
  const selected = timedEvents.find((item) => item.id === eventId) ?? timedEvents[0];

  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [result]);

  useEffect(() => {
    const close = (click) => {
      if (menuRef.current && !menuRef.current.contains(click.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const clearResult = () => {
    setResult(null);
    setError('');
  };

  const setSongCount = (next) => {
    setSongs(Math.min(MAX_SONGS, Math.max(0, next)));
    clearResult();
  };

  const setDuration = (next) => {
    setMinutes(Math.min(MAX_MINUTES, Math.max(EVENT_MIN_MINUTES, next)));
    clearResult();
  };

  const handleCalculate = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const destination = zip.trim();
    if (!/^\d{5}$/.test(destination)) {
      setError('Enter a 5-digit US ZIP code.');
      return;
    }

    setLoading(true);
    try {
      const distance = await milesFromOrigin(destination);
      const oneWayMiles = Math.round(distance.oneWayMiles);
      const roundTripMiles = oneWayMiles * 2;
      const performance = performanceFee(selected.min, minutes);
      const songFee = songs * CUSTOM_SONG_FROM;
      const travelFee = roundTripMiles * MILE_RATE;

      setResult({
        title: selected.title,
        minutes,
        songs,
        songFee,
        performance,
        roundTripMiles,
        travelFee,
        total: performance + songFee + travelFee,
        approximate: distance.approximate,
      });
    } catch (err) {
      setError(err.message || 'Distance lookup failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="estimate" onSubmit={handleCalculate} className="fade-in-section mb-12 border border-white/10 bg-white/[0.02] px-6 py-8 md:px-8">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">Estimate</h3>
      <p className="font-serif text-2xl text-white tracking-wide mb-2">Event Estimate</p>
      <p className="text-gray-500 text-xs font-light tracking-wide mb-8 leading-relaxed">
        {money(selected.min)} for the first hour, then {money(EXTRA_HALF_HOUR)} each additional 30 minutes. Custom songs are{' '}
        {money(CUSTOM_SONG_FROM)} each. Travel is the round trip from {ORIGIN_ZIP} at {money(MILE_RATE)} per mile.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 items-end">
        <div className={`relative min-w-0 ${menuOpen ? 'z-20' : ''}`} ref={menuRef}>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Event</label>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            onClick={() => setMenuOpen((open) => !open)}
            className={`w-full min-w-0 bg-transparent border-b py-3 text-left flex justify-between items-center gap-3 transition-colors ${menuOpen ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
          >
            <span className="text-gold">{selected.title}</span>
            <ChevronDown className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          <div
            role="listbox"
            className={`absolute left-0 top-full mt-2 w-full bg-dark-900 border border-white/10 shadow-2xl z-30 transition-all duration-300 ${menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
          >
            {timedEvents.map((item) => (
              <button
                type="button"
                key={item.id}
                role="option"
                aria-selected={item.id === selected.id}
                onClick={() => {
                  setEventId(item.id);
                  setMenuOpen(false);
                  clearResult();
                }}
                className={`w-full px-6 py-3 text-left border-b border-white/5 last:border-0 flex justify-between items-center gap-4 ${item.id === selected.id ? 'bg-[#1a1a1a] text-gold' : 'text-gray-400 hover:bg-[#151515] hover:text-white'}`}
              >
                <span>
                  {item.title}
                  <span className="block text-[10px] uppercase tracking-widest text-gray-600 mt-1">{item.rate}</span>
                </span>
                {item.id === selected.id && <Check className="w-4 h-4 text-gold shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span id="duration-label" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Duration
          </span>
          <div className="flex items-center justify-between border-b border-white/20 py-3">
            <button
              type="button"
              aria-label="Shorter by 30 minutes"
              disabled={minutes <= EVENT_MIN_MINUTES}
              onClick={() => setDuration(minutes - 30)}
              className="w-8 text-gold text-lg leading-none disabled:text-gray-700"
            >
              −
            </button>
            <span className="text-gold tracking-wide" aria-labelledby="duration-label">
              {formatDuration(minutes)}
            </span>
            <button
              type="button"
              aria-label="Longer by 30 minutes"
              disabled={minutes >= MAX_MINUTES}
              onClick={() => setDuration(minutes + 30)}
              className="w-8 text-gold text-lg leading-none disabled:text-gray-700"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="venue-zip" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Venue ZIP
          </label>
          <input
            id="venue-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder={ORIGIN_ZIP}
            value={zip}
            onChange={(event) => {
              setZip(event.target.value.replace(/\D/g, '').slice(0, 5));
              clearResult();
            }}
            className="w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="min-w-0">
          <span id="songs-label" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Custom Songs <span className="text-gray-600">· {money(CUSTOM_SONG_FROM)}</span>
          </span>
          <div className="flex items-center justify-between border-b border-white/20 py-3">
            <button
              type="button"
              aria-label="Fewer custom songs"
              disabled={songs <= 0}
              onClick={() => setSongCount(songs - 1)}
              className="w-8 text-gold text-lg leading-none disabled:text-gray-700"
            >
              −
            </button>
            <span className="text-gold tracking-wide" aria-labelledby="songs-label">
              {songs}
            </span>
            <button
              type="button"
              aria-label="More custom songs"
              disabled={songs >= MAX_SONGS}
              onClick={() => setSongCount(songs + 1)}
              className="w-8 text-gold text-lg leading-none disabled:text-gray-700"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex border px-10 py-3.5 tracking-[0.2em] uppercase text-xs transition-all duration-500 ${loading ? 'border-gold/40 text-gold/60 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'}`}
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
        {error && <p className="text-[#d9736c] text-[10px] tracking-wider uppercase mt-4">{error}</p>}
      </div>

      {result && (
        <div ref={resultRef} className="mt-10 border-t border-white/10 pt-6 scroll-mb-28" aria-live="polite">
          <div className="flex justify-between items-baseline gap-6 py-3">
            <span className="text-gray-200 font-light">
              {result.title} · {formatDuration(result.minutes)}
            </span>
            <span className="text-gold font-serif whitespace-nowrap">{money(result.performance)}</span>
          </div>
          <div className="flex justify-between items-baseline gap-6 py-3">
            <span className="text-gray-200 font-light">Travel · {result.roundTripMiles} mi round trip</span>
            <span className="text-gold font-serif whitespace-nowrap">{money(result.travelFee)}</span>
          </div>
          {result.songs > 0 && (
            <div className="flex justify-between items-baseline gap-6 py-3">
              <span className="text-gray-200 font-light">Custom songs × {result.songs}</span>
              <span className="text-gold font-serif whitespace-nowrap">{money(result.songFee)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline gap-6 pt-4 mt-2 border-t border-gold/30">
            <span className="text-white tracking-wide">Estimated price</span>
            <span className="text-gold font-serif text-2xl whitespace-nowrap">{money(result.total)}</span>
          </div>
          {result.approximate && (
            <p className="text-gray-500 text-xs font-light mt-4 leading-relaxed">
              Driving directions were unavailable, so this mile count is an approximate road distance.
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default FeeEstimator;
