// Management Portal – The Nocturne | Admin CRUD Dashboard
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, ChevronDown, Image as ImageIcon, DollarSign, Tag,
  AlertTriangle, CheckCircle2, Settings, ArrowLeft, Flame,
  UtensilsCrossed, Coffee, Leaf, ShoppingBag, Loader2, Database,
  RefreshCw, LogOut,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import { seedMenuItems } from '../../services/seedService';
import { authService } from '../../services/authService';
import { useAppStore } from '../../store';
import type { MenuItem, DietaryTag } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────
type Category = MenuItem['category'] | 'all';

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: 'all',       label: 'All Items',  icon: <ShoppingBag  className="w-3.5 h-3.5" /> },
  { key: 'appetizer', label: 'Appetizers', icon: <Leaf         className="w-3.5 h-3.5" /> },
  { key: 'main',      label: 'Mains',      icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
  { key: 'dessert',   label: 'Desserts',   icon: <Flame        className="w-3.5 h-3.5" /> },
  { key: 'beverage',  label: 'Beverages',  icon: <Coffee       className="w-3.5 h-3.5" /> },
];

const DIETARY_OPTIONS: DietaryTag[] = [
  'vegan','vegetarian','gluten-free','dairy-free','nut-free','halal','kosher','keto','low-sodium'
];
const ALLERGEN_OPTIONS = ['nuts','dairy','gluten','eggs','soy','shellfish','fish','sesame'];

const DIETARY_COLORS: Record<string, string> = {
  vegan: '#22C55E', vegetarian: '#4ADE80', 'gluten-free': '#FBBF24',
  'dairy-free': '#60A5FA', 'nut-free': '#F97316', halal: '#A78BFA',
  kosher: '#34D399', keto: '#FB923C', 'low-sodium': '#94A3B8',
};

const CAT_COLOR: Record<string, string> = {
  appetizer: '#FBBF24', main: '#EA580C', dessert: '#F472B6', beverage: '#60A5FA',
};

function newBlankItem(): Omit<MenuItem, 'id'> {
  return {
    name: '', description: '', price: 0,
    imageUrl: '', ingredients: [], dietaryTags: [],
    category: 'main', available: true, allergens: [],
  };
}

// ─── Tag Chip ─────────────────────────────────────────────────────────────────
const DietaryChip: React.FC<{ tag: DietaryTag; small?: boolean }> = ({ tag, small }) => (
  <span
    className={`inline-flex items-center rounded-full font-semibold ${small ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}
    style={{ background: `${DIETARY_COLORS[tag] ?? '#aaa'}18`, color: DIETARY_COLORS[tag] ?? '#aaa', border: `1px solid ${DIETARY_COLORS[tag] ?? '#aaa'}30` }}
  >
    {tag}
  </span>
);

// ─── Checkbox row helper ──────────────────────────────────────────────────────
function CheckGroup<T extends string>({
  options, selected, onChange, colorMap,
}: { options: T[]; selected: T[]; onChange: (v: T[]) => void; colorMap?: Record<string, string> }) {
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        const col = colorMap?.[opt] ?? '#EA580C';
        return (
          <button
            key={opt} type="button" onClick={() => toggle(opt)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all capitalize"
            style={active
              ? { background: `${col}22`, borderColor: `${col}60`, color: col }
              : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)' }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Ingredient tag input ─────────────────────────────────────────────────────
const IngredientsInput: React.FC<{ value: string[]; onChange: (v: string[]) => void }> = ({ value, onChange }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Add ingredient, press Enter"
          className="flex-1 bg-white/4 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none focus:border-brand-orange/40 transition-colors"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold hover:bg-brand-orange/25 transition-all">
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(ing => (
            <span key={ing} className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-white/65">
              {ing}
              <button type="button" onClick={() => onChange(value.filter(i => i !== ing))} className="text-white/30 hover:text-red-400 transition-colors ml-0.5">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Form field ───────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold tracking-widest uppercase text-white/40">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-white/25">{hint}</p>}
  </div>
);

const TextInput: React.FC<{
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string; min?: string;
}> = ({ value, onChange, placeholder, type = 'text', step, min }) => (
  <input
    type={type} step={step} min={min}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/85 placeholder-white/25 outline-none focus:border-brand-orange/40 focus:shadow-[0_0_10px_rgba(234,88,12,0.08)] transition-all"
  />
);

// ─── Add / Edit Modal ────────────────────────────────────────────────────────
interface ModalProps {
  item: Omit<MenuItem, 'id'> & { id?: string };
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'> & { id?: string }) => void;
  isNew: boolean;
}

const ItemFormModal: React.FC<ModalProps> = ({ item: initial, onClose, onSave, isNew }) => {
  const [form, setForm] = useState({ ...initial });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaved(true);
    setTimeout(() => { onSave(form); onClose(); }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,2,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: '#0e0b08', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8" style={{ background: '#0e0b08' }}>
          <div>
            <h2 className="font-display font-bold text-lg text-white">{isNew ? 'Add New Dish' : 'Edit Dish'}</h2>
            <p className="text-white/35 text-xs mt-0.5">{isNew ? 'Fill in the details to add to the menu' : `Editing: ${initial.name}`}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Name + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dish Name">
              <TextInput value={form.name} onChange={v => update('name', v)} placeholder="e.g. Wagyu Beef Tenderloin" />
            </Field>
            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value as MenuItem['category'])}
                  className="w-full appearance-none bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/85 outline-none focus:border-brand-orange/40 transition-all pr-8"
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Short enticing description of the dish..."
              rows={2}
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/85 placeholder-white/25 outline-none focus:border-brand-orange/40 transition-all resize-none"
            />
          </Field>

          {/* Price + Image URL row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <TextInput type="number" step="0.50" min="0" value={String(form.price)} onChange={v => update('price', parseFloat(v) || 0)} placeholder="0.00" />
              </div>
            </Field>
            <Field label="Image URL" hint="Paste an Unsplash or CDN link">
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <TextInput value={form.imageUrl ?? ''} onChange={v => update('imageUrl', v)} placeholder="https://..." />
              </div>
            </Field>
          </div>

          {/* Image preview */}
          {form.imageUrl && (
            <div className="h-28 rounded-xl overflow-hidden border border-white/8">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          {/* Ingredients */}
          <Field label="Ingredients">
            <IngredientsInput value={form.ingredients} onChange={v => update('ingredients', v)} />
          </Field>

          {/* Dietary Tags */}
          <Field label="Dietary Tags" hint="Select all that apply — these power the guest filter menu">
            <CheckGroup
              options={DIETARY_OPTIONS}
              selected={form.dietaryTags as DietaryTag[]}
              onChange={v => update('dietaryTags', v)}
              colorMap={DIETARY_COLORS}
            />
          </Field>

          {/* Allergens */}
          <Field label="Allergens" hint="Flag any allergens present — shown on KDS allergy alerts">
            <CheckGroup
              options={ALLERGEN_OPTIONS as any}
              selected={form.allergens as any}
              onChange={v => update('allergens', v as any)}
            />
          </Field>

          {/* Available toggle */}
          <Field label="Availability">
            <button
              type="button"
              onClick={() => update('available', !form.available)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all"
              style={form.available
                ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)', color: '#22C55E' }
                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.35)' }
              }
            >
              {form.available
                ? <><ToggleRight className="w-5 h-5" /><span className="text-sm font-semibold">Available on menu</span></>
                : <><ToggleLeft  className="w-5 h-5" /><span className="text-sm font-semibold">Hidden from menu</span></>
              }
            </button>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/6">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/45 hover:text-white/70 hover:border-white/20 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || saved}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : isNew ? <><Plus className="w-4 h-4" />Add Dish</> : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Delete confirm ────────────────────────────────────────────────────────────
const DeleteModal: React.FC<{ name: string; onConfirm: () => void; onClose: () => void }> = ({ name, onConfirm, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(4,3,2,0.88)', backdropFilter: 'blur(10px)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <motion.div
      initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }}
      className="w-full max-w-sm rounded-2xl border border-white/10 p-6 text-center"
      style={{ background: '#0e0b08' }}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-1">Delete Dish?</h3>
      <p className="text-white/45 text-sm mb-6">
        <span className="text-white/70 font-semibold">"{name}"</span> will be permanently removed from the menu.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/45 hover:text-white/70 text-sm font-semibold transition-all">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#991B1B,#DC2626)' }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Item Card ────────────────────────────────────────────────────────────────
const ItemCard: React.FC<{
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ item, onEdit, onDelete, onToggle }) => {
  const catColor = CAT_COLOR[item.category] ?? '#FBBF24';
  const visibleTags = item.dietaryTags.slice(0, 3);
  const extraTags = item.dietaryTags.length - 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: item.available ? 1 : 0.55, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      className="rounded-2xl border border-white/8 overflow-hidden flex flex-col"
      style={{ background: 'rgba(16,13,10,0.9)' }}
    >
      {/* Image */}
      <div
        className="h-36 relative flex-shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg,${catColor}12,${catColor}06)` }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/15" />
          </div>
        )}
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
          style={{ background: `${catColor}28`, color: catColor, border: `1px solid ${catColor}40` }}
        >
          {item.category}
        </span>
        {/* Unavailable overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/60 border border-white/20 rounded-full px-2 py-0.5 bg-black/40">
              OFF MENU
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white/90 text-sm font-bold leading-tight line-clamp-1">{item.name}</h3>
          <span className="flex-shrink-0 text-brand-gold font-bold text-sm font-mono">${item.price.toFixed(2)}</span>
        </div>

        <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{item.description}</p>

        {/* Dietary tags */}
        {item.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {visibleTags.map(tag => <DietaryChip key={tag} tag={tag} small />)}
            {extraTags > 0 && (
              <span className="text-[9px] text-white/30 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8">
                +{extraTags}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 pt-1 border-t border-white/6 mt-1">
          <button
            onClick={onToggle}
            title={item.available ? 'Hide from menu' : 'Show on menu'}
            className="p-1.5 rounded-lg border border-white/8 transition-all hover:border-white/20"
            style={{ color: item.available ? '#22C55E' : 'rgba(255,255,255,0.25)' }}
          >
            {item.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-white/8 text-white/45 hover:text-white/75 hover:border-white/20 text-[11px] font-semibold transition-all"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-white/8 text-white/25 hover:text-red-400 hover:border-red-500/25 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    navigate('/login');
  };

  const [items, setItems]       = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [seeding, setSeeding]       = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch]     = useState('');
  const [editTarget, setEditTarget] = useState<(Omit<MenuItem, 'id'> & { id?: string }) | null>(null);
  const [isNew, setIsNew]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const loadFromFirebase = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const result = await menuService.getMenuItems();
    if (result.success && result.data) {
      setItems(result.data);
    } else {
      setLoadError(result.error ?? 'Failed to load menu items');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadFromFirebase(); }, [loadFromFirebase]);

  const handleSeed = async () => {
    setSeeding(true);
    const result = await seedMenuItems();
    if (!result.error) {
      showToast(`Seeded ${result.seeded} items${result.skipped ? ` (${result.skipped} already existed)` : ''}`);
      await loadFromFirebase();
    } else {
      showToast(`Seed error: ${result.error}`);
    }
    setSeeding(false);
  };

  const filtered = useMemo(() => {
    return items.filter(item => {
      const catOk = category === 'all' || item.category === category;
      const q = search.toLowerCase();
      const srchOk = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.ingredients.some(i => i.toLowerCase().includes(q));
      return catOk && srchOk;
    });
  }, [items, category, search]);

  const stats = useMemo(() => ({
    total:     items.length,
    available: items.filter(i => i.available).length,
    bycat:     Object.fromEntries((['appetizer','main','dessert','beverage'] as MenuItem['category'][]).map(c => [c, items.filter(i => i.category === c).length])),
  }), [items]);

  const openAdd = () => { setIsNew(true); setEditTarget(newBlankItem()); };
  const openEdit = (item: MenuItem) => { setIsNew(false); setEditTarget({ ...item }); };

  const handleSave = async (saved: Omit<MenuItem, 'id'> & { id?: string }) => {
    if (isNew) {
      const { id: _drop, ...data } = saved as MenuItem;
      const result = await menuService.addMenuItem(data);
      if (result.success && result.data) {
        const newItem: MenuItem = { ...data, id: result.data };
        setItems(prev => [...prev, newItem]);
        showToast(`"${saved.name}" added to menu`);
      } else {
        showToast(`Error: ${result.error ?? 'Could not add item'}`);
      }
    } else {
      const { id, ...updates } = saved as MenuItem;
      const result = await menuService.updateMenuItem(id, updates);
      if (result.success) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        showToast(`"${saved.name}" updated`);
      } else {
        showToast(`Error: ${result.error ?? 'Could not update item'}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await menuService.deleteMenuItem(deleteTarget.id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      showToast(`"${deleteTarget.name}" removed`);
    } else {
      showToast(`Error: ${result.error ?? 'Could not delete item'}`);
    }
    setDeleteTarget(null);
  };

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newVal = !item.available;
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: newVal } : i));
    const result = await menuService.toggleAvailability(id, newVal);
    if (!result.success) {
      // Revert on failure
      setItems(prev => prev.map(i => i.id === id ? { ...i, available: item.available } : i));
      showToast(`Error: ${result.error ?? 'Could not toggle item'}`);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#080604' }}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b border-white/6 sticky top-0 z-30"
        style={{ background: 'rgba(10,7,4,0.97)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
          >N</div>
          <div>
            <p className="text-white/90 font-display font-bold text-sm tracking-widest uppercase leading-tight">The Nocturne</p>
            <p className="text-white/28 text-[10px] tracking-wider">Management Portal</p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { label: 'Total Items', val: stats.total, col: '#FBBF24' },
            { label: 'On Menu',     val: stats.available, col: '#22C55E' },
            { label: 'Off Menu',    val: stats.total - stats.available, col: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/6 bg-white/3 text-xs">
              <span className="font-bold text-base leading-none" style={{ color: s.col }}>{s.val}</span>
              <span className="text-white/30 font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors font-semibold tracking-widest uppercase">
            <ArrowLeft className="w-3.5 h-3.5" />Site
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-gold/8 border border-brand-gold/20">
            <Settings className="w-3 h-3 text-brand-gold" />
            <span className="text-brand-gold text-[10px] font-bold tracking-wider">{user?.name ?? 'ADMIN'}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-red-400 transition-colors font-semibold tracking-widest uppercase"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* ── Category breakdown bar ─────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {(['appetizer','main','dessert','beverage'] as MenuItem['category'][]).map(cat => {
            const col = CAT_COLOR[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? 'all' : cat as Category)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left"
                style={category === cat
                  ? { background: `${col}12`, borderColor: `${col}40` }
                  : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }
                }
              >
                <div>
                  <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase capitalize">{cat}</p>
                  <p className="text-white/85 text-2xl font-bold font-display mt-0.5" style={{ color: category === cat ? col : undefined }}>
                    {stats.bycat[cat] ?? 0}
                  </p>
                </div>
                <Tag className="w-4 h-4" style={{ color: col, opacity: 0.5 }} />
              </button>
            );
          })}
        </div>

        {/* ── Search + filter bar ────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes, ingredients…"
              className="w-full bg-white/4 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-brand-orange/40 transition-colors"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all"
                style={category === c.key
                  ? { background: 'rgba(234,88,12,0.15)', borderColor: 'rgba(234,88,12,0.40)', color: '#EA580C' }
                  : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' }
                }
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Seed + Refresh + Add buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={loadFromFirebase}
              disabled={isLoading}
              title="Refresh from Firestore"
              className="p-2.5 rounded-xl border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all disabled:opacity-30"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {items.length === 0 && !isLoading && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.30)', color: '#FBBF24' }}
              >
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {seeding ? 'Seeding…' : 'Seed Demo Data'}
              </button>
            )}
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#EA580C,#FBBF24)' }}
            >
              <Plus className="w-4 h-4" /> Add Dish
            </button>
          </div>
        </div>

        {/* ── Error banner ──────────────────────────────────────── */}
        {loadError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{loadError}</span>
            <button onClick={loadFromFirebase} className="ml-auto text-xs underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* ── Results summary ────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">
            Showing <span className="text-white/60 font-bold">{filtered.length}</span> of <span className="text-white/60 font-bold">{items.length}</span> dishes
            {search && <span className="text-brand-orange"> · for "{search}"</span>}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* ── Item grid ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading menu from Firestore…</p>
          </div>
        ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
            layout
          >
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteTarget(item)}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-16 text-white/20"
              >
                {items.length === 0 ? (
                  <>
                    <Database className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm mb-1">No menu items in Firestore yet</p>
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                      style={{ borderColor: 'rgba(251,191,36,0.35)', color: '#FBBF24', background: 'rgba(251,191,36,0.08)' }}
                    >
                      {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                      {seeding ? 'Seeding…' : 'Seed 20 demo items'}
                    </button>
                  </>
                ) : (
                  <>
                    <Search className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No dishes match your filters</p>
                    <button onClick={() => { setSearch(''); setCategory('all'); }} className="mt-3 text-xs text-brand-orange hover:underline">
                      Clear filters
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {editTarget && (
          <ItemFormModal
            key="edit-modal"
            item={editTarget}
            isNew={isNew}
            onClose={() => setEditTarget(null)}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            name={deleteTarget.name}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{   opacity: 0, y: 16,  x: '-50%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-6 left-1/2 flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-brand-gold/35 shadow-xl z-50"
            style={{ background: '#1a1200' }}
          >
            <CheckCircle2 className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-sm font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagementPage;
