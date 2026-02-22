// Reservation Page – The Nocturne 3D Interactive Seat Selection
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Clock, Phone, Mail, MessageSquare, ChevronRight, ChevronLeft, Sparkles, MapPin } from 'lucide-react';
import Navigation from '../../components/Navigation';
import RestaurantScene from './components/RestaurantScene';

type SeatStatus = 'available' | 'reserved';
type SeatId     = string;

function seatTypeLabel(id: SeatId) {
  if (id.startsWith('V')) return 'VIP Round Table';
  if (id.startsWith('T')) return 'Dining Table';
  if (id.startsWith('B')) return 'Bar Seat';
  return 'Seat';
}
function seatCapacity(id: SeatId) {
  if (id.startsWith('V')) return 5;
  if (id.startsWith('T')) return 4;
  return 1;
}
function seatZone(id: SeatId) {
  if (id.startsWith('V')) return 'VIP Lounge';
  if (id.startsWith('B')) return 'Cocktail Bar';
  return 'Main Dining';
}

interface ReservationForm {
  name: string; email: string; phone: string;
  date: string; time: string; guests: number; requests: string;
}

const TIME_SLOTS = [
  { label: '6:00 PM', sub: 'Early Evening' },
  { label: '7:00 PM', sub: 'Dinner' },
  { label: '8:00 PM', sub: 'Prime Time' },
  { label: '9:00 PM', sub: 'Late Dinner' },
  { label: '10:00 PM', sub: 'Nightcap' },
  { label: '11:00 PM', sub: 'Midnight Ember' },
];

const LEGEND = [
  { color: '#FBBF24', shadow: 'rgba(251,191,36,0.75)', label: 'Available' },
  { color: '#EA580C', shadow: 'rgba(234,88,12,0.75)',  label: 'Hover' },
  { color: '#DC2626', shadow: 'rgba(220,38,38,0.75)',  label: 'Reserved' },
];

// ── Floating label input ──────────────────────────────────────────────────────
const FloatInput: React.FC<{
  label: string; icon: React.ReactNode;
  value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
  min?: string;
}> = ({ label, icon, value, onChange, type = 'text', required, placeholder, min }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${active ? 'opacity-60' : 'opacity-30'}`}>
        {icon}
      </div>
      <label className={`absolute left-11 transition-all duration-200 pointer-events-none font-medium ${
        active
          ? 'top-3 text-[10px] uppercase tracking-[0.15em] text-brand-orange'
          : 'top-1/2 -translate-y-1/2 text-sm text-white/40'
      }`}>
        {label}
      </label>
      <input
        required={required}
        type={type}
        value={value}
        min={min}
        placeholder={active ? (placeholder || '') : ''}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ colorScheme: 'dark' }}
        className={`w-full h-16 bg-white/5 rounded-xl pl-11 pr-4 pt-5 pb-2 text-sm text-white outline-none transition-all duration-200 border ${
          focused
            ? 'border-brand-orange/60 bg-white/8 shadow-[0_0_0_3px_rgba(234,88,12,0.1)]'
            : 'border-white/8 hover:border-white/15'
        }`}
      />
    </div>
  );
};

// ── Reservation Modal ──────────────────────────────────────────────────────────
interface ModalProps {
  seatId: SeatId;
  onClose: () => void;
  onConfirm: (seatId: SeatId, form: ReservationForm) => void;
}

const ReservationModal: React.FC<ModalProps> = ({ seatId, onClose, onConfirm }) => {
  const [step, setStep]   = useState<1 | 2>(1);
  const [done, setDone]   = useState(false);
  const [form, setForm]   = useState<ReservationForm>({
    name: '', email: '', phone: '', date: '', time: '', guests: 2, requests: '',
  });

  const set = (field: keyof ReservationForm) => (v: string | number) =>
    setForm(prev => ({ ...prev, [field]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => { onConfirm(seatId, form); onClose(); }, 2400);
  };

  const maxGuests = seatCapacity(seatId);

  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center:                 ({ opacity: 1, x: 0 }),
    exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };
  const [dir, setDir]   = useState(1);
  const goNext = () => { setDir(1); setStep(2); };
  const goBack = () => { setDir(-1); setStep(1); };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(5,4,3,0.82)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(18,14,10,0.98) 0%, rgba(12,9,6,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        {/* Ember glow top */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(ellipse, rgba(234,88,12,0.18) 0%, transparent 70%)' }} />

        {/* Top accent stripe */}
        <div className="h-[3px] w-full bg-ember-gradient" />

        <div className="flex min-h-[520px]">

          {/* ── Left panel ──────────────────────────── */}
          <div className="hidden md:flex flex-col justify-between w-56 flex-shrink-0 p-7"
               style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

            <div>
              {/* Seat badge */}
              <div className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,rgba(234,88,12,0.25),rgba(251,191,36,0.12))', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span className="font-display text-2xl font-bold text-brand-gold">{seatId}</span>
              </div>
              <p className="text-[10px] text-brand-orange uppercase tracking-[0.25em] font-semibold mb-1">{seatZone(seatId)}</p>
              <p className="text-white font-display text-lg font-bold leading-tight">{seatTypeLabel(seatId)}</p>
              <p className="text-white/35 text-xs mt-1">Up to {maxGuests} {maxGuests === 1 ? 'guest' : 'guests'}</p>

              <div className="mt-6 space-y-3">
                {[
                  { icon: <MapPin className="w-3.5 h-3.5" />, text: 'The Nocturne' },
                  { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Fine Dining Experience' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="text-brand-orange/60">{icon}</span>
                    <span className="text-white/35 text-xs">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step dots */}
            <div className="flex gap-2 items-center">
              {[1,2].map(n => (
                <div key={n} className="h-1 rounded-full transition-all duration-400"
                     style={{
                       background: n <= step ? 'linear-gradient(to right,#EA580C,#FBBF24)' : 'rgba(255,255,255,0.12)',
                       width: n === step ? '28px' : '8px',
                     }} />
              ))}
              <span className="text-white/25 text-[10px] ml-1">{step} / 2</span>
            </div>
          </div>

          {/* ── Right panel ─────────────────────────── */}
          <div className="flex-1 flex flex-col">
            {/* Header row */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">
                  {step === 1 ? 'Your Details' : 'Booking Details'}
                </p>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {step === 1 ? 'Who are you?' : 'When & How many?'}
                </h2>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>

            {/* Form area */}
            <div className="flex-1 overflow-hidden px-8 pb-7">
              <AnimatePresence mode="wait" custom={dir}>
                {done ? (
                  <motion.div
                    key="done"
                    className="flex flex-col items-center justify-center h-full gap-5 py-8"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  >
                    {/* Animated ring */}
                    <div className="relative">
                      <motion.div
                        className="w-20 h-20 rounded-full"
                        style={{ border: '2px solid rgba(251,191,36,0.3)' }}
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                             style={{ background: 'radial-gradient(circle,rgba(251,191,36,0.25),rgba(234,88,12,0.1))', border: '1px solid rgba(251,191,36,0.4)' }}>
                          <Sparkles className="w-7 h-7 text-brand-gold" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold text-white mb-2">You're all set</p>
                      <p className="text-white/45 text-sm leading-relaxed max-w-[260px] mx-auto">
                        Reservation confirmed for <span className="text-brand-gold">{seatId}</span>.
                        We look forward to welcoming you, <span className="text-white/75">{form.name || 'Guest'}</span>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                         style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
                      <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-xs text-brand-orange/80">{form.time || 'Time TBC'} · {form.date || 'Date TBC'}</span>
                    </div>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.form
                    key="step1"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="space-y-3 h-full flex flex-col"
                    onSubmit={e => { e.preventDefault(); goNext(); }}
                  >
                    <div className="flex-1 space-y-3">
                      <FloatInput
                        label="Full Name" required
                        icon={<Users className="w-4 h-4 text-white" />}
                        value={form.name} onChange={set('name')}
                      />
                      <FloatInput
                        label="Email Address" required type="email"
                        icon={<Mail className="w-4 h-4 text-white" />}
                        value={form.email} onChange={set('email')}
                        placeholder="your@email.com"
                      />
                      <FloatInput
                        label="Phone (optional)"
                        icon={<Phone className="w-4 h-4 text-white" />}
                        value={form.phone} onChange={set('phone')}
                        placeholder="+1 555 000 0000"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-white text-sm font-semibold tracking-widest uppercase mt-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_32px_rgba(234,88,12,0.35)] bg-ember-gradient"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="step2"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="space-y-5 h-full flex flex-col"
                    onSubmit={handleSubmit}
                  >
                    <div className="flex-1 space-y-5">
                      {/* Date */}
                      <FloatInput
                        label="Date" required type="date"
                        icon={<Calendar className="w-4 h-4 text-white" />}
                        value={form.date} onChange={set('date')}
                        min={new Date().toISOString().split('T')[0]}
                      />

                      {/* Guest stepper */}
                      <div className="bg-white/5 rounded-xl border border-white/8 px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-brand-orange font-medium">Guests</p>
                            <p className="text-sm text-white font-medium">{form.guests} {form.guests === 1 ? 'Guest' : 'Guests'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button"
                            onClick={() => set('guests')(Math.max(1, form.guests - 1))}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg font-light border border-white/10">
                            −
                          </button>
                          <span className="w-8 text-center font-display font-bold text-white/80 text-base">{form.guests}</span>
                          <button type="button"
                            onClick={() => set('guests')(Math.min(maxGuests, form.guests + 1))}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg font-light border border-white/10">
                            +
                          </button>
                        </div>
                      </div>

                      {/* Time slot pills */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 font-medium mb-2.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Time Slot *
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map(({ label, sub }) => {
                            const active = form.time === label;
                            return (
                              <button
                                key={label} type="button"
                                onClick={() => set('time')(label)}
                                className="rounded-xl p-2.5 text-left transition-all duration-200 border hover:scale-[1.03] active:scale-[0.98]"
                                style={{
                                  background: active
                                    ? 'linear-gradient(135deg,rgba(234,88,12,0.25),rgba(251,191,36,0.12))'
                                    : 'rgba(255,255,255,0.04)',
                                  borderColor: active ? 'rgba(234,88,12,0.5)' : 'rgba(255,255,255,0.07)',
                                  boxShadow: active ? '0 0 16px rgba(234,88,12,0.15)' : 'none',
                                }}
                              >
                                <span className={`block text-xs font-bold ${active ? 'text-brand-gold' : 'text-white/70'}`}>{label}</span>
                                <span className={`block text-[9px] mt-0.5 ${active ? 'text-brand-orange/80' : 'text-white/25'}`}>{sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Special requests */}
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-white/25 pointer-events-none">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <textarea
                          value={form.requests}
                          onChange={e => set('requests')(e.target.value)}
                          placeholder="Special requests, dietary needs, occasions…"
                          rows={2}
                          className="w-full bg-white/5 rounded-xl pl-11 pr-4 pt-4 pb-3 text-sm text-white placeholder-white/20 outline-none resize-none border border-white/8 focus:border-brand-orange/50 focus:bg-white/7 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button type="button" onClick={goBack}
                        className="h-14 px-5 rounded-2xl flex items-center justify-center text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all duration-200">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="submit"
                        disabled={!form.date || !form.time}
                        className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-white text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_32px_rgba(234,88,12,0.35)] disabled:opacity-40 disabled:cursor-not-allowed bg-ember-gradient"
                      >
                        Confirm Reservation
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ReservationPage: React.FC = () => {
  const [statuses,  setStatuses]  = useState<Record<SeatId, SeatStatus>>({});
  const [hoveredId, setHoveredId] = useState<SeatId | null>(null);
  const [modalSeat, setModalSeat] = useState<SeatId | null>(null);

  // Clicking a seat opens the modal (if available) or cancels reservation (if reserved)
  const handleToggle = useCallback((id: SeatId) => {
    if (statuses[id] === 'reserved') {
      // Un-reserve directly
      setStatuses(prev => ({ ...prev, [id]: 'available' }));
    } else {
      setModalSeat(id);
    }
  }, [statuses]);

  const handleHover = useCallback((id: SeatId | null) => {
    setHoveredId(id);
  }, []);

  const handleConfirm = useCallback((id: SeatId) => {
    setStatuses(prev => ({ ...prev, [id]: 'reserved' }));
    setModalSeat(null);
  }, []);

  // 8 square + 4 VIP round + 8 bar stools = 20 seats
  const reservedCount  = Object.values(statuses).filter(s => s === 'reserved').length;
  const availableCount = 20 - reservedCount;

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none text-foreground font-sans"
      style={{
        backgroundImage: 'url(/images/bg-reservation.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundColor: '#030201',
      }}
    >

      {/* Navigation bar — same as landing page */}
      <Navigation />

      {/* ── 3D Canvas (full screen behind everything) ─────────────── */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 2,
          toneMappingExposure: 2.4,
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: hoveredId ? 'pointer' : 'grab' }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 1;
        }}
      >
        {/* background is the SVG via CSS — canvas is transparent */}
        <RestaurantScene
          statuses={statuses}
          hoveredId={hoveredId}
          onToggle={handleToggle}
          onHover={handleHover}
        />
      </Canvas>

      {/* ── Top-right counter chip ────────────────────────────────── */}
      <div className="absolute top-24 right-6 z-20 flex gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[72px]">
          <span className="block text-xl font-bold font-display" style={{ color: '#FBBF24' }}>{availableCount}</span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(245,245,241,0.4)' }}>Free</span>
        </div>
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[72px]">
          <span className="block text-xl font-bold font-display" style={{ color: '#DC2626' }}>{reservedCount}</span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(245,245,241,0.4)' }}>Booked</span>
        </div>
      </div>

      {/* ── Bottom legend + hint bar ──────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6">
          {LEGEND.map(({ color, shadow, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${shadow}` }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(245,245,241,0.55)' }}>{label}</span>
            </div>
          ))}
          <span className="w-px h-4 bg-white/10" />
          <span className="text-xs" style={{ color: 'rgba(245,245,241,0.35)' }}>
            Click a table to book · Drag to explore
          </span>
        </div>
      </div>

      {/* ── Hovered seat tooltip ──────────────────────────────────── */}
      <AnimatePresence>
        {hoveredId && statuses[hoveredId] !== 'reserved' && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-black/75 backdrop-blur-xl border border-brand-orange/30 rounded-xl px-5 py-2.5 flex items-center gap-3"
                 style={{ boxShadow: '0 0 20px rgba(234,88,12,0.2)' }}>
              <span className="font-display text-lg font-bold text-brand-gold">{hoveredId}</span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-white/60 text-sm">{seatTypeLabel(hoveredId)}</span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-brand-orange text-xs font-semibold uppercase tracking-wider">Click to reserve</span>
            </div>
          </motion.div>
        )}
        {hoveredId && statuses[hoveredId] === 'reserved' && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-black/75 backdrop-blur-xl border border-red-500/30 rounded-xl px-5 py-2.5 flex items-center gap-3"
                 style={{ boxShadow: '0 0 20px rgba(220,38,38,0.15)' }}>
              <span className="font-display text-lg font-bold text-red-400">{hoveredId}</span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-red-400/70 text-xs font-semibold uppercase tracking-wider">Click to cancel</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reservation Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {modalSeat && (
          <ReservationModal
            seatId={modalSeat}
            onClose={() => setModalSeat(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationPage;
