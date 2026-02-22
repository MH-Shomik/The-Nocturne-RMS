
// Kitchen Display System – The Nocturne | Real-time Kanban order board
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ChefHat, Clock, CheckCircle2, Flame,
  Bell, Wifi, WifiOff, ArrowRight, ArrowLeft, CircleX,
  Timer, UtensilsCrossed, RefreshCw, LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { authService } from '../../services/authService';
import { useAppStore } from '../../store';
import type { Order } from '../../types';

// ─── Menu name lookup ────────────────────────────────────────────────────────
const MENU_NAMES: Record<string, string> = {
  m1: 'Beef Truffle Sliders',       m2: 'Mediterranean Mezze Platter',
  m3: 'Tuna Tartare Tower',         m4: 'Vegan Spring Rolls',
  m5: 'Spicy Thai Basil Chicken',   m6: 'Pan-Seared Duck Confit',
  m7: 'Grilled Atlantis Salmon',    m8: 'Mushroom Risotto',
  m9: 'Wagyu Beef Tenderloin',      m10: 'Vegan Buddha Bowl',
  m11: 'Crème Brûlée',              m12: 'Chocolate Lava Cake',
  m13: 'Sorbet Trio',               m14: 'Affogato',
  m15: 'Mocktail Sunrise',          m16: 'Virgin Mojito',
  m17: 'Artisan Iced Coffee',       m18: 'Fresh Mint Lemonade',
  m19: 'Golden Turmeric Latte',     m20: 'Sparkling Elderflower',
};

// ─── Demo seed orders ────────────────────────────────────────────────────────
const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-001', tableId: 'T3',
    items: [
      { menuItemId: 'm1', quantity: 2 },
      { menuItemId: 'm5', quantity: 1 },
      { menuItemId: 'm17', quantity: 2 },
    ],
    status: 'incoming', hasAllergy: true,
    allergyNotes: 'Guest 1 — SEVERE NUT ALLERGY. Verify truffle oil source. No cross-contact.',
    timestamp: new Date(Date.now() - 4 * 60_000), estimatedTime: 22,
  },
  {
    id: 'ord-002', tableId: 'T1',
    items: [
      { menuItemId: 'm2', quantity: 1 },
      { menuItemId: 'm8', quantity: 2 },
      { menuItemId: 'm18', quantity: 2 },
    ],
    status: 'incoming', hasAllergy: false,
    timestamp: new Date(Date.now() - 2 * 60_000), estimatedTime: 18,
  },
  {
    id: 'ord-003', tableId: 'V2',
    items: [
      { menuItemId: 'm9', quantity: 2 },
      { menuItemId: 'm11', quantity: 2 },
      { menuItemId: 'm15', quantity: 2 },
    ],
    status: 'cooking', hasAllergy: false,
    specialInstructions: 'Wagyu medium-rare. No sauce on side plate.',
    timestamp: new Date(Date.now() - 18 * 60_000), estimatedTime: 35,
    assignedChef: 'Marco',
  },
  {
    id: 'ord-004', tableId: 'T5',
    items: [
      { menuItemId: 'm7', quantity: 1 },
      { menuItemId: 'm3', quantity: 1 },
      { menuItemId: 'm12', quantity: 1 },
    ],
    status: 'cooking', hasAllergy: true,
    allergyNotes: 'DAIRY-FREE for entire table — no butter on salmon. Check lava cake recipe.',
    timestamp: new Date(Date.now() - 25 * 60_000), estimatedTime: 28,
    assignedChef: 'Sofia',
  },
  {
    id: 'ord-005', tableId: 'B4',
    items: [
      { menuItemId: 'm4', quantity: 2 },
      { menuItemId: 'm10', quantity: 1 },
      { menuItemId: 'm18', quantity: 1 },
    ],
    status: 'ready', hasAllergy: false,
    timestamp: new Date(Date.now() - 38 * 60_000), estimatedTime: 14,
    assignedChef: 'Jordan',
  },
  {
    id: 'ord-006', tableId: 'T6',
    items: [
      { menuItemId: 'm6', quantity: 2 },
      { menuItemId: 'm11', quantity: 2 },
    ],
    status: 'ready', hasAllergy: true,
    allergyNotes: 'GLUTEN-FREE entire order — dedicated cookware used, no croutons.',
    timestamp: new Date(Date.now() - 45 * 60_000), estimatedTime: 30,
    assignedChef: 'Yuki',
  },
];

// Mutable names cache: starts with hardcoded fallback, merged with Firestore on live mode
let _menuNames: Record<string, string> = { ...MENU_NAMES };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function elapsed(ts: Date): string {
  const s = Math.floor((Date.now() - ts.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2,'0')}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
function elapsedMins(ts: Date): number {
  return Math.floor((Date.now() - ts.getTime()) / 60_000);
}
function timeColor(mins: number, est?: number): string {
  const limit = est ?? 20;
  if (mins > limit * 1.4) return '#DC2626';
  if (mins > limit * 0.85) return '#EA580C';
  return '#FBBF24';
}

// ─── Column config ────────────────────────────────────────────────────────────
type ColKey = 'incoming' | 'cooking' | 'ready';
interface ColDef {
  key: ColKey;
  label: string;
  next: ColKey | null;
  prev: ColKey | null;
  color: string;
  icon: React.ReactNode;
  advanceLabel: string;
}
const COLUMNS: ColDef[] = [
  { key: 'incoming', label: 'Incoming',        next: 'cooking', prev: null,      color: '#FBBF24', icon: <Bell          className="w-4 h-4" />, advanceLabel: 'Start Cooking' },
  { key: 'cooking',  label: 'Cooking',          next: 'ready',   prev: 'incoming',color: '#EA580C', icon: <Flame         className="w-4 h-4" />, advanceLabel: 'Mark Ready'   },
  { key: 'ready',    label: 'Ready to Serve',   next: null,      prev: 'cooking', color: '#22C55E', icon: <CheckCircle2  className="w-4 h-4" />, advanceLabel: 'Served — Clear'},
];

// ─── Order Ticket ─────────────────────────────────────────────────────────────
interface TicketProps {
  order: Order;
  onAdvance: (id: string) => void;
  onRevert:  (id: string) => void;
  onRemove:  (id: string) => void;
}

const OrderTicket: React.FC<TicketProps> = ({ order, onAdvance, onRevert, onRemove }) => {
  const [, rerender] = useState(0);
  const col = COLUMNS.find(c => c.key === order.status)!;
  const mins = elapsedMins(order.timestamp);
  const tColor = timeColor(mins, order.estimatedTime);

  useEffect(() => {
    const id = setInterval(() => rerender(n => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93, y: 10 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className={`relative rounded-2xl border overflow-hidden ${
        order.hasAllergy ? 'animate-pulse-danger border-red-500' : 'border-white/8'
      }`}
      style={{ background: order.hasAllergy ? 'rgba(22,6,6,0.96)' : 'rgba(18,16,14,0.94)' }}
    >
      {/* Allergy top strip */}
      {order.hasAllergy && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-700 via-red-400 to-red-700" />
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm"
              style={{
                background: `linear-gradient(135deg,${col.color}22,${col.color}0d)`,
                border: `1px solid ${col.color}44`,
                color: col.color,
              }}
            >
              {order.tableId}
            </div>
            <div>
              <p className="text-white/85 text-xs font-semibold tracking-wider uppercase leading-tight">
                {order.tableId.startsWith('V') ? 'VIP Lounge'
                  : order.tableId.startsWith('B') ? 'Bar Seat'
                  : 'Main Dining'}
              </p>
              <p className="text-white/30 text-[10px] tracking-wider">#{order.id.replace('ord-', '')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Timer className="w-3 h-3" style={{ color: tColor }} />
            <span className="text-[11px] font-bold font-mono" style={{ color: tColor }}>
              {elapsed(order.timestamp)}
            </span>
          </div>
        </div>

        {/* Allergy alert box */}
        {order.hasAllergy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(220,38,38,0.35)' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-[11px] leading-snug font-semibold">{order.allergyNotes}</p>
          </motion.div>
        )}

        {/* Items */}
        <ul className="space-y-1.5">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="text-white/70 text-xs truncate">
                {_menuNames[it.menuItemId] ?? it.menuItemId}
              </span>
              <span
                className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.06)', color: col.color }}
              >
                ×{it.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Special instructions */}
        {order.specialInstructions && (
          <p className="text-[11px] text-amber-300/65 italic border-l-2 border-amber-500/30 pl-2 leading-snug">
            "{order.specialInstructions}"
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <div className="flex items-center gap-1.5">
            <ChefHat className="w-3 h-3 text-white/25" />
            <span className="text-white/35 text-[10px]">{order.assignedChef ?? 'Unassigned'}</span>
          </div>
          {order.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/25" />
              <span className="text-white/35 text-[10px]">~{order.estimatedTime}m est.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {col.prev && (
            <button
              onClick={() => onRevert(order.id)}
              title="Move back"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white/35 hover:text-white/65 border border-white/8 hover:border-white/18 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {col.next ? (
            <button
              onClick={() => onAdvance(order.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg,${col.color}2e,${col.color}16)`,
                border: `1px solid ${col.color}48`,
                color: col.color,
              }}
            >
              {col.advanceLabel}
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onRemove(order.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg,rgba(34,197,94,0.20),rgba(34,197,94,0.10))',
                border: '1px solid rgba(34,197,94,0.38)',
                color: '#22C55E',
              }}
            >
              <UtensilsCrossed className="w-3 h-3" />
              {col.advanceLabel}
            </button>
          )}

          <button
            onClick={() => onRemove(order.id)}
            title="Cancel order"
            className="flex items-center px-2.5 py-1.5 rounded-lg text-white/25 hover:text-red-400 border border-white/8 hover:border-red-500/28 transition-all"
          >
            <CircleX className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
interface ColProps {
  col: ColDef;
  orders: Order[];
  onAdvance: (id: string) => void;
  onRevert:  (id: string) => void;
  onRemove:  (id: string) => void;
}

const KanbanColumn: React.FC<ColProps> = ({ col, orders, onAdvance, onRevert, onRemove }) => {
  const allergyCount = orders.filter(o => o.hasAllergy).length;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Column header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 rounded-xl mb-3 border border-white/6"
        style={{ background: `linear-gradient(135deg,${col.color}12,${col.color}06)` }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: col.color }}>{col.icon}</span>
          <span className="text-white/85 font-bold text-sm tracking-wide">{col.label}</span>
          {allergyCount > 0 && (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.3, repeat: Infinity }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.40)', color: '#F87171' }}
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              {allergyCount} allergy
            </motion.span>
          )}
        </div>
        <span
          className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
          style={{ background: `${col.color}1e`, color: col.color }}
        >
          {orders.length}
        </span>
      </div>

      {/* Tickets */}
      <div
        className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-white/8 text-white/25"
            >
              <ChefHat className="w-7 h-7 mb-2" />
              <p className="text-xs tracking-wider">No orders</p>
            </motion.div>
          ) : (
            orders.map(order => (
              <OrderTicket
                key={order.id}
                order={order}
                onAdvance={onAdvance}
                onRevert={onRevert}
                onRemove={onRemove}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const KitchenDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    navigate('/login');
  };

  const [orders, setOrders]       = useState<Order[]>(DEMO_ORDERS);
  const [liveMode, setLiveMode]   = useState(false);
  const [connected, setConnected] = useState(false);
  const [clock, setClock]         = useState(new Date());
  const [newAlert, setNewAlert]   = useState(false);
  const unsubRef      = useRef<(() => void) | null>(null);
  const prevIncoming  = useRef(DEMO_ORDERS.filter(o => o.status === 'incoming').length);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Flash new-order toast when incoming count rises
  useEffect(() => {
    const count = orders.filter(o => o.status === 'incoming').length;
    if (count > prevIncoming.current) {
      setNewAlert(true);
      const t = setTimeout(() => setNewAlert(false), 3200);
      return () => clearTimeout(t);
    }
    prevIncoming.current = count;
  }, [orders]);

  // Firebase live-mode toggle
  const toggleLive = useCallback(() => {
    if (liveMode) {
      unsubRef.current?.();
      unsubRef.current = null;
      setLiveMode(false);
      setConnected(false);
      setOrders(DEMO_ORDERS);
      return;
    }
    setLiveMode(true);
    // Fetch live menu names from Firestore and merge with local fallback
    menuService.getMenuNamesMap().then(fsNames => {
      _menuNames = { ...MENU_NAMES, ...fsNames };
    });
    try {
      const unsub = orderService.subscribeToOrders(
        (liveOrders) => { setOrders(liveOrders); setConnected(true); },
        ()          => { setConnected(false); setOrders(DEMO_ORDERS); }
      );
      unsubRef.current = unsub;
    } catch {
      setConnected(false);
      setLiveMode(false);
    }
  }, [liveMode]);

  useEffect(() => () => { unsubRef.current?.(); }, []);

  // Status change handlers (update local state + optionally Firestore)
  const handleAdvance = useCallback((id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = COLUMNS.find(c => c.key === o.status)?.next;
      return next ? { ...o, status: next as Order['status'], updatedAt: new Date() } : o;
    }));
  }, []);

  const handleRevert = useCallback((id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const prev2 = COLUMNS.find(c => c.key === o.status)?.prev;
      return prev2 ? { ...o, status: prev2 as Order['status'], updatedAt: new Date() } : o;
    }));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    if (liveMode) orderService.completeOrder(id);
  }, [liveMode]);

  // Fire a random demo incoming order
  const fireDemoOrder = () => {
    const tableIds = ['T2', 'T4', 'T7', 'V1', 'B6', 'B3'];
    const itemSets = [
      [{ menuItemId: 'm6', quantity: 1 }, { menuItemId: 'm13', quantity: 2 }],
      [{ menuItemId: 'm9', quantity: 1 }, { menuItemId: 'm14', quantity: 1 }, { menuItemId: 'm19', quantity: 1 }],
      [{ menuItemId: 'm2', quantity: 2 }, { menuItemId: 'm16', quantity: 2 }],
    ];
    const isAllergy = Math.random() > 0.6;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tableId: tableIds[Math.floor(Math.random() * tableIds.length)],
      items: itemSets[Math.floor(Math.random() * itemSets.length)],
      status: 'incoming',
      hasAllergy: isAllergy,
      allergyNotes: isAllergy ? 'SHELLFISH ALLERGY — dedicated pan required, no shared utensils.' : undefined,
      timestamp: new Date(),
      estimatedTime: 12 + Math.floor(Math.random() * 20),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const byStatus = (s: ColKey) =>
    orders
      .filter(o => o.status === s)
      .sort((a, b) => {
        if (a.hasAllergy && !b.hasAllergy) return -1;
        if (!a.hasAllergy && b.hasAllergy) return 1;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });

  const totalAllergy = orders.filter(o => o.hasAllergy && (o.status === 'incoming' || o.status === 'cooking')).length;
  const inC  = byStatus('incoming').length;
  const ckC  = byStatus('cooking').length;
  const rdC  = byStatus('ready').length;

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden" style={{ background: '#080606' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/6"
        style={{ background: 'rgba(12,9,6,0.97)', backdropFilter: 'blur(16px)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >N</div>
          <div>
            <p className="text-white/90 font-display font-bold text-sm tracking-widest uppercase leading-tight">The Nocturne</p>
            <p className="text-white/28 text-[10px] tracking-wider">Kitchen Display System</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center gap-5">
          {totalAllergy > 0 && (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.3, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/45"
              style={{ background: 'rgba(220,38,38,0.12)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 text-xs font-bold tracking-wide">
                {totalAllergy} ALLERGY{totalAllergy > 1 ? ' WARNINGS' : ' WARNING'}
              </span>
            </motion.div>
          )}
          <div className="text-center">
            <p className="text-white/80 font-mono text-2xl font-bold leading-none tracking-tight">
              {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </p>
            <p className="text-white/22 text-[10px] tracking-widest uppercase mt-0.5">
              {clock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={fireDemoOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/45 hover:text-white/75 hover:border-white/18 transition-all text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5" /> Fire Order
          </motion.button>

          <button
            onClick={toggleLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
            style={
              liveMode && connected
                ? { borderColor: 'rgba(34,197,94,0.38)', background: 'rgba(34,197,94,0.09)', color: '#22C55E' }
                : liveMode
                ? { borderColor: 'rgba(234,88,12,0.38)', background: 'rgba(234,88,12,0.09)', color: '#EA580C' }
                : { borderColor: 'rgba(255,255,255,0.10)', background: 'transparent', color: 'rgba(255,255,255,0.38)' }
            }
          >
            {liveMode && connected ? <><Wifi className="w-3.5 h-3.5" />Live</>
              : liveMode ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Connecting…</>
              : <><WifiOff className="w-3.5 h-3.5" />Demo</>}
          </button>

          {/* Status pills */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/6 text-[11px] font-bold">
            <span style={{ color: '#FBBF24' }}>{inC}</span>
            <span className="text-white/18">|</span>
            <span style={{ color: '#EA580C' }}>{ckC}</span>
            <span className="text-white/18">|</span>
            <span style={{ color: '#22C55E' }}>{rdC}</span>
          </div>

          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-semibold"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>
      </header>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2 border-b border-white/4 text-[10px]"
        style={{ background: 'rgba(10,7,5,0.85)' }}
      >
        <span className="text-white/20 uppercase font-semibold tracking-wider">Legend</span>
        {[
          { color: '#FBBF24', label: 'On track' },
          { color: '#EA580C', label: 'Nearing limit' },
          { color: '#DC2626', label: 'Overdue' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-white/35">
            <Timer className="w-2.5 h-2.5" style={{ color: l.color }} /> {l.label}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-white/35">
          <span className="w-2 h-2 rounded-sm bg-red-500 animate-pulse" />
          Pulsing red border = active allergy alert
        </span>
      </div>

      {/* ── Kanban board ─────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-5 min-h-0 overflow-hidden">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.key}
            col={col}
            orders={byStatus(col.key)}
            onAdvance={handleAdvance}
            onRevert={handleRevert}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* ── New order toast ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {newAlert && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{   opacity: 0, y: 20,  x: '-50%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-6 left-1/2 flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-brand-gold/40 shadow-xl z-50"
            style={{ background: '#1a1100' }}
          >
            <Bell className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-sm font-bold">New order — kitchen!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KitchenDisplayPage;
