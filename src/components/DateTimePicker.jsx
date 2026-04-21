import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Custom Date Picker ──
export function DatePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse value (YYYY-MM-DD string)
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayValue = selected
    ? `${MONTH_NAMES[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
    : '';

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        className="w-full bg-transparent border-b border-white/20 py-3 text-gold focus:outline-none focus:border-gold transition-colors cursor-pointer flex items-center justify-between hover:border-white/40"
        onClick={() => setOpen(!open)}
      >
        <span className={displayValue ? 'text-gold' : 'text-gray-600'}>{displayValue || 'Select date'}</span>
        <Calendar className="w-4 h-4 text-gold/60" />
      </div>

      {open && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-full max-w-[280px] sm:w-72 bg-dark-800 border border-white/10 rounded-sm shadow-2xl z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
            <button type="button" onClick={prev} className="text-gray-500 hover:text-gold transition-colors p-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white text-sm font-serif tracking-wide">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={next} className="text-gray-500 hover:text-gold transition-colors p-1">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-3 pt-2">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-gray-600 py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 px-3 pb-3">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const isSelected = selected && selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
              const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`py-1.5 text-xs rounded-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-gold text-dark-900 font-semibold'
                      : isToday
                        ? 'text-gold border border-gold/30'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Time Picker ──
const TIMES = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    TIMES.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}` });
  }
}

export function TimePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll to selected time when opened
  useEffect(() => {
    if (open && listRef.current && value) {
      const idx = TIMES.findIndex(t => t.value === value);
      if (idx >= 0) {
        const el = listRef.current.children[idx];
        if (el) {
          // Local scroll instead of global scrollIntoView
          listRef.current.scrollTop = el.offsetTop - listRef.current.offsetHeight / 2 + el.offsetHeight / 2;
        }
      }
    }
  }, [open, value]);

  const displayValue = value ? TIMES.find(t => t.value === value)?.label || value : '';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        className="w-full bg-transparent border-b border-white/20 py-3 text-gold focus:outline-none focus:border-gold transition-colors cursor-pointer flex items-center justify-between hover:border-white/40"
        onClick={() => setOpen(!open)}
      >
        <span className={displayValue ? 'text-gold' : 'text-gray-600'}>{displayValue || 'Select time'}</span>
        <Clock className="w-4 h-4 text-gold/60" />
      </div>

      {open && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-full max-w-[200px] sm:w-48 bg-dark-800 border border-white/10 rounded-sm shadow-2xl z-50 animate-fadeIn">
          <div
            ref={listRef}
            className="max-h-56 overflow-y-auto custom-scrollbar py-1"
          >
            {TIMES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => { onChange(t.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  value === t.value
                    ? 'text-gold bg-gold/10 font-medium'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
