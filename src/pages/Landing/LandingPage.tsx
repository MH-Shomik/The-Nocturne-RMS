import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock, Leaf, Flame, Globe, Wine } from 'lucide-react';
import MenuSection from './components/MenuSection';
import Navigation from '../../components/Navigation';

const LandingPage = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);
    // Custom Cursor state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);


    return (
        <div className="bg-background min-h-screen text-foreground font-sans relative overflow-x-hidden selection:bg-brand-orange selection:text-white">
            {/* Custom Cursor */}
            <motion.div
                className="custom-cursor hidden md:block"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 2 : 1,
                    opacity: isHovering ? 0.8 : 0.4
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            />

            <Navigation />

            <main>
                <HeroSection />
                <ScrollingFeatures />
                <EmberRoomMenu onHover={() => setIsHovering(true)} onLeave={() => setIsHovering(false)} />
                <div id="full-menu">
                    <MenuSection />
                </div>
                <SpecialsGrid />
                <TestimonialsCarousel />
            </main>

            <Footer />
        </div>
    );
};

// --- Subcomponents ---



const HeroSection = () => {
    // Parallax effect for the background
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Background with overlay */}
            <motion.div style={{ y }} className="absolute inset-0 z-0 h-[120%] -top-[10%]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    poster="/images/Img1.png"
                >
                    <source src="/videos/User_Requests_Simpler_AI_Video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/60 z-10 block" /> {/* Dark overlay */}
            </motion.div>

            {/* Seamless edge blending gradients */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-brand-gold uppercase tracking-[0.3em] text-sm md:text-base mb-6 font-semibold"
                >
                    Exclusive Dining Experience
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-5xl md:text-8xl font-display font-bold leading-tight mb-8"
                >
                    Ignite Your <br /> Senses
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-white/70 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto"
                >
                    Where culinary artistry meets the primal elegance of fire. Welcome to a journey beyond taste.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    onClick={() => document.getElementById('full-menu')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-10 py-5 bg-ember-gradient rounded-full text-white font-semibold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(234,88,12,0.4)]"
                >
                    Discover The Menu
                </motion.button>
            </div>
        </section>
    );
};

const ScrollingFeatures = () => {
    const features = [
        {
            num: '01',
            title: 'Farm to Flame',
            desc: 'We source ingredients directly from local farms within 50 miles. Every vegetable, herb, and protein arrives fresh each morning, ensuring peak flavor and supporting sustainable agriculture.',
            icon: <Leaf className="w-8 h-8 text-brand-orange" />,
            highlight: 'Local Sourcing'
        },
        {
            num: '02',
            title: 'Ancient Fire Techniques',
            desc: 'Our chefs master the art of open-flame cooking using techniques passed down through generations. Wood-fired ovens, charcoal grills, and live-fire roasting bring out flavors no modern method can replicate.',
            icon: <Flame className="w-8 h-8 text-brand-orange" />,
            highlight: 'Artisan Craft'
        },
        {
            num: '03',
            title: 'Global Spice Library',
            desc: 'Over 200 spices from 40 countries. Our spice master curates rare blends—from Kashmiri saffron to smoked Urfa biber—creating signatures that transport your palate across continents.',
            icon: <Globe className="w-8 h-8 text-brand-orange" />,
            highlight: 'World Flavors'
        },
        {
            num: '04',
            title: 'Sommelier Pairing',
            desc: 'Each dish is paired with wines from our 500+ bottle cellar. Our certified sommeliers craft personalized journeys, matching terroir with taste for an elevated dining experience.',
            icon: <Wine className="w-8 h-8 text-brand-orange" />,
            highlight: 'Expert Selection'
        },
    ];

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-8 md:px-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-4 font-semibold"
                    >
                        Our Philosophy
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-display font-bold text-white mb-6"
                    >
                        The Anatomy of <span className="text-ember-gradient">Flavor</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-white/50 text-lg"
                    >
                        Every dish tells a story. Discover the four pillars that define our culinary identity and elevate your dining experience.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="bg-neutral-900/40 border border-white/5 p-10 md:p-14 rounded-3xl relative group hover:bg-neutral-900/80 transition-all duration-500 overflow-hidden"
                        >
                            {/* Hover effect gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Large Background Drop Number */}
                            <div className="absolute -bottom-8 -right-8 text-[12rem] md:text-[14rem] font-display font-bold text-white/[0.02] group-hover:text-brand-orange/[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none select-none">
                                {item.num}
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:border-brand-orange/30 group-hover:scale-110 transition-all duration-500 shadow-xl">
                                        {item.icon}
                                    </div>
                                    <span className="px-4 py-1.5 text-xs uppercase tracking-widest bg-brand-gold/10 text-brand-gold rounded-full font-semibold border border-brand-gold/20">
                                        {item.highlight}
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-white/60 leading-relaxed text-lg">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const EmberRoomMenu = ({ onHover, onLeave }: any) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const menuItems = [
        { title: 'Smoked Wagyu Tartare', image: '/images/wagyu_tartare.png' },
        { title: 'Charred Octopus', image: '/images/charred_octopus.png' },
        { title: 'Roasted Bone Marrow', image: '/images/bone_marrow.png' },
        { title: 'Ash-Crusted Venison', image: '/images/venison.png' },
    ];

    return (
        <section className="py-32 px-8 md:px-16 relative">
            <div className="absolute inset-0 bg-gradient-radial-warm mix-blend-screen opacity-50 z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 container mx-auto items-center">
                <div>
                    <h2 className="text-brand-orange uppercase tracking-widest text-sm mb-4">The Ember Room</h2>
                    <h3 className="text-4xl md:text-6xl font-display mb-12">Signature<br />Experiences</h3>

                    <ul className="space-y-6 md:space-y-10">
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                className="group cursor-pointer"
                                onMouseEnter={() => { setActiveIndex(index); onHover(); }}
                                onMouseLeave={onLeave}
                            >
                                <div className={`flex items-center gap-6 transition-all duration-300 ${activeIndex === index ? 'opacity-100 translate-x-4' : 'opacity-40 hover:opacity-70'}`}>
                                    <span className="text-sm font-semibold text-brand-gold">0{index + 1}</span>
                                    <span className="text-2xl md:text-4xl font-display">{item.title}</span>
                                </div>
                                {activeIndex === index && (
                                    <motion.div layoutId="underline" className="h-[1px] bg-brand-orange mt-6 ml-12" />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="h-[500px] md:h-[700px] w-full rounded-2xl overflow-hidden relative shadow-2xl shadow-brand-orange/10 border border-white/5">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={activeIndex}
                            src={menuItems[activeIndex].image}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Dish"
                        />
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const SpecialsGrid = () => {
    const specials = [
        { title: "Crimson Ember Salmon", type: "Seafood", image: "/images/ember_salmon.png" },
        { title: "Fire-Kissed Asparagus", type: "Vegetarian", image: "/images/fire_asparagus.png" },
        { title: "Chef's Secret Plate", type: "Locked", image: "", locked: true },
        { title: "Smoked Vanilla Bean", type: "Dessert", image: "/images/smoked_vanilla.png" },
    ];

    return (
        <section className="relative py-32 px-8 md:px-16 overflow-hidden">
            {/* Background video — same as hero */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                    poster="/images/Img1.png"
                >
                    <source src="/videos/Chef_Flambé_Video_Generation.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/65 pointer-events-none" />
                {/* Edge blending */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>

            <div className="container mx-auto relative z-10">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-display mb-6">Tonight's Specials</h2>
                <p className="text-white/50 max-w-2xl mx-auto">A fleeting collection of culinary moments, crafted around today's freshest ingredients.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {specials.map((item, i) => (
                    <div key={i} className="group relative h-96 bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                        {!item.locked ? (
                            <>
                                <div className="absolute inset-0 bg-black z-0" />
                                <motion.div
                                    className="absolute inset-0 z-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-all duration-700"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                                {/* Reveal mask effect */}
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-700 ease-out">
                                    <div className="w-48 h-48 rounded-full border border-white/20 overflow-hidden relative">
                                        <img src={item.image} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="" />
                                    </div>
                                </div>

                                <div className="relative z-30 text-center p-6 group-hover:translate-y-8 transition-transform duration-500">
                                    <p className="text-brand-orange text-xs uppercase tracking-widest mb-2">{item.type}</p>
                                    <h4 className="text-2xl font-display">{item.title}</h4>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-brand-red/20 backdrop-blur-xl z-0" />
                                <div className="absolute inset-0 bg-black/40 z-0" />
                                <Lock className="text-brand-gold w-8 h-8 mb-4 relative z-10" />
                                <h4 className="text-2xl font-display relative z-10 text-white/90">{item.title}</h4>
                                <p className="text-white/50 text-sm mt-4 relative z-10 px-4">Available only for exclusive Nocturne Members</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            </div>
        </section>
    );
};



const TestimonialsCarousel = () => {
    const [current, setCurrent] = useState(0);

    const reviews = [
        {
            text: "A masterclass in culinary theater. The flavors were primal yet deeply sophisticated.",
            author: "Jonathan Wells",
            role: "Food Critic",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
        },
        {
            text: "The Ember Room is an experience that stays with you long after the final course.",
            author: "Elena Rostov",
            role: "Gastronomer",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80"
        }
    ];

    const next = () => setCurrent((c) => (c + 1) % reviews.length);
    const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);

    return (
        <section className="relative py-32 px-8 md:px-16 overflow-hidden bg-background">
            {/* Cinematic Background Image */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-color-dodge"
                    style={{ backgroundImage: "url('/images/reviews_bg.png')" }}
                />
                <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />

                {/* Edge Blending Gradients */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
            </div>

            <div className="container mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32 relative z-20">

                <div className="w-full md:w-1/2 relative">
                    <div className="absolute -inset-10 bg-gradient-radial-warm opacity-30 z-0 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex gap-1 mb-8 text-brand-gold">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-3xl md:text-5xl font-display leading-tight mb-10">
                                    "{reviews[current].text}"
                                </p>
                                <div>
                                    <h5 className="text-xl font-bold">{reviews[current].author}</h5>
                                    <p className="text-white/40 uppercase tracking-widest text-sm mt-1">{reviews[current].role}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-4 mt-12">
                            <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.8 }}
                            className="aspect-[4/5] rounded-t-full overflow-hidden border border-white/10 p-2"
                        >
                            <div className="w-full h-full rounded-t-full overflow-hidden">
                                <img src={reviews[current].image} alt="Reviewer" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="pt-32 pb-16 px-8 md:px-16 border-t border-white/5 relative overflow-hidden bg-background">
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-radial-warm opacity-20 pointer-events-none mix-blend-screen" />

            <div className="container mx-auto flex flex-col items-center">
                <h2 className="text-[12vw] leading-none font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#501010] via-brand-red to-brand-orange text-center mix-blend-screen opacity-90 mb-16 select-none bg-ember-gradient hover:scale-105 transition-transform duration-1000">
                    THE NOCTURNE
                </h2>

                <div className="w-full flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 mt-auto gap-6 relative z-10">
                    <p className="text-white/40 text-sm">© 2026 The Nocturne RMS. All rights reserved.</p>
                    <div className="flex gap-8 text-sm text-white/60">
                        <a href="#" className="hover:text-brand-gold transition-colors">Instagram</a>
                        <a href="#" className="hover:text-brand-gold transition-colors">Reservations</a>
                        <a href="#" className="hover:text-brand-gold transition-colors">Careers</a>
                        <Link
                            to="/login"
                            className="hover:text-brand-gold transition-colors text-white/25 hover:text-white/60 flex items-center gap-1.5"
                            title="Kitchen &amp; Admin access"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Staff Access
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LandingPage;
