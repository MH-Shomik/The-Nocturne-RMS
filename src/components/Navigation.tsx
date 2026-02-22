import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, CalendarDays, Home, ChefHat, Settings } from 'lucide-react';
import { useAppStore } from '../store';

const Navigation: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppStore();
    const isAdmin   = user?.role === 'admin';
    const isStaff   = user?.role === 'admin' || user?.role === 'kitchen';
    const isHome        = location.pathname === '/';
    const isReservation = location.pathname === '/reservations';
    const isKitchen     = location.pathname === '/kitchen';
    const isManagement  = location.pathname === '/management';
    const isDietaryMenu = location.pathname === '/dietary-menu';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location]);

    const scrollToMenu = () => {
        if (isHome) {
            document.getElementById('full-menu')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/dietary-menu');
        }
    };

    const navLinkCls = (active = false) =>
        `relative text-xs md:text-sm font-semibold tracking-[0.2em] uppercase transition-colors duration-200 group ${
            active ? 'text-brand-gold' : 'text-white/60 hover:text-white'
        }`;

    return (
        <>
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 transition-all duration-500 ${
                scrolled || isReservation || isKitchen || isManagement || isDietaryMenu
                    ? 'py-4 bg-background/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-white/5'
                    : 'py-6 bg-gradient-to-b from-black/70 to-transparent'
            }`}
        >
            {/* ── Left links ── */}
            <div className="flex-1 hidden md:flex items-center justify-start gap-8">
                {!isHome && (
                    <Link to="/" className={navLinkCls(false)}>
                        <Home className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />Home
                    </Link>
                )}
                {!isDietaryMenu && (
                <button onClick={scrollToMenu} className={navLinkCls(isDietaryMenu)}>
                    <UtensilsCrossed className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />Menu
                </button>
                )}
                {isStaff && !isKitchen && (
                    <Link
                        to="/kitchen"
                        className={navLinkCls(false)}
                    >
                        <ChefHat className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />Kitchen
                        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full align-middle"
                            style={{ background: 'rgba(234,88,12,0.18)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.3)' }}>
                            STAFF
                        </span>
                    </Link>
                )}
                {isAdmin && !isManagement && (
                    <Link
                        to="/management"
                        className={navLinkCls(false)}
                    >
                        <Settings className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />Admin
                        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full align-middle"
                            style={{ background: 'rgba(251,191,36,0.13)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.28)' }}>
                            ADMIN
                        </span>
                    </Link>
                )}
            </div>

            {/* ── Centre brand ── */}
            <Link
                to="/"
                className="flex-shrink-0 text-center relative group mx-auto md:mx-0"
            >
                <div className="absolute inset-0 bg-brand-orange/15 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <span className="relative text-2xl md:text-3xl font-display font-bold tracking-[0.3em] uppercase text-white group-hover:text-brand-gold transition-colors duration-500">
                    The Nocturne
                </span>
                {/* Subtle underline accent */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-px bg-brand-gold/50 transition-all duration-500 rounded-full" />
            </Link>

            {/* ── Right links ── */}
            <div className="flex-1 hidden md:flex items-center justify-end gap-4">
                {!isReservation && (
                    <Link
                        to="/reservations"
                        className="relative group overflow-hidden px-5 py-2 rounded-full transition-all duration-300 border border-brand-orange/30 bg-white/5 backdrop-blur-sm hover:border-brand-orange/60 hover:shadow-[0_0_16px_rgba(234,88,12,0.2)]"
                    >
                        <div className="absolute inset-0 bg-brand-orange/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 flex items-center gap-1.5 text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-300 text-brand-gold group-hover:text-white">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Reserve
                        </span>
                    </Link>
                )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
                className="md:hidden ml-auto flex flex-col gap-1.5 p-1"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
            >
                <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </button>
        </motion.nav>

        {/* ── Mobile dropdown ── */}
        <motion.div
            initial={false}
            animate={menuOpen ? { opacity: 1, y: 0, pointerEvents: 'auto' } : { opacity: 0, y: -8, pointerEvents: 'none' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed top-[64px] left-0 right-0 z-40 md:hidden"
            style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
            <div className="flex flex-col px-6 py-4 gap-4">
                {!isHome && (
                    <Link to="/" className="text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors flex items-center gap-2">
                        <Home className="w-4 h-4" />Home
                    </Link>
                )}
                {!isDietaryMenu && (
                    <button onClick={scrollToMenu} className="text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors text-left flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />Menu
                    </button>
                )}
                {!isReservation && (
                    <Link to="/reservations" className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-brand-gold">
                        <CalendarDays className="w-4 h-4" />Reserve a Table
                    </Link>
                )}
                {isStaff && !isKitchen && (
                    <Link
                        to="/kitchen"
                        className={`text-sm font-semibold tracking-widest uppercase flex items-center gap-2 ${isKitchen ? 'text-brand-orange' : 'text-white/55 hover:text-white'} transition-colors`}
                    >
                        <ChefHat className="w-4 h-4" />Kitchen Display
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(234,88,12,0.18)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.3)' }}>
                            STAFF
                        </span>
                    </Link>
                )}
                {isAdmin && !isManagement && (
                    <Link
                        to="/management"
                        className="text-sm font-semibold tracking-widest uppercase flex items-center gap-2 text-white/55 hover:text-white transition-colors"
                    >
                        <Settings className="w-4 h-4" />Admin Portal
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(251,191,36,0.13)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.28)' }}>
                            ADMIN
                        </span>
                    </Link>
                )}
            </div>
        </motion.div>
        </>
    );
};

export default Navigation;
