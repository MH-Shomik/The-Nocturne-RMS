import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../../store';
import { menuService } from '../../../services/menuService'; // Corrected path
import type { MenuItem } from '../../../types'; // Corrected path
import MenuCard from '../../DietaryMenu/components/MenuCard'; // Corrected path
import DietaryFilters from '../../DietaryMenu/components/DietaryFilters'; // Corrected path
import MenuCategories from '../../DietaryMenu/components/MenuCategories'; // Corrected path
import MenuItemModal from '../../DietaryMenu/components/MenuItemModal'; // Corrected path
import BrandedLoader from '../../../components/ui/BrandedLoader'; // Corrected path

const MenuSection: React.FC = () => {
    const {
        dietaryFilters,
        initializeDietaryFilters,
        getActiveDietaryTags,
        setError,
        clearDietaryFilters
    } = useAppStore();

    const [selectedCategory, setSelectedCategory] = useState<'all' | MenuItem['category']>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isFilterSticky, setIsFilterSticky] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    // Handle sticky filter bar - only show within menu section
    useEffect(() => {
        let lastSticky = false;
        const handleScroll = () => {
            if (filterRef.current && sectionRef.current) {
                const filterRect = filterRef.current.getBoundingClientRect();
                const sectionRect = sectionRef.current.getBoundingClientRect();
                // Show sticky bar when filter is above viewport AND section bottom is still visible
                // Add hysteresis to prevent flickering at boundaries
                const enterThreshold = 64;
                const exitBottomThreshold = 250;
                
                const shouldBeSticky = filterRect.top <= enterThreshold && sectionRect.bottom > exitBottomThreshold;
                
                // Only update state if changed to prevent unnecessary re-renders
                if (shouldBeSticky !== lastSticky) {
                    lastSticky = shouldBeSticky;
                    setIsFilterSticky(shouldBeSticky);
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch menu items
    const { data: menuResponse, isLoading, error } = useQuery({
        queryKey: ['menuItems'],
        queryFn: menuService.getMenuItems,
        select: (response) => response.data
    });

    useEffect(() => {
        if (error) {
            setError((error as Error).message);
        }
    }, [error, setError]);

    // Initialize dietary filters
    useEffect(() => {
        initializeDietaryFilters();
    }, [initializeDietaryFilters]);

    // Filter menu items based on active filters
    const filteredMenuItems = useMemo(() => {
        if (!menuResponse || !Array.isArray(menuResponse)) return [];

        const activeTags = getActiveDietaryTags();

        return (menuResponse as MenuItem[]).filter((item: MenuItem) => {
            // Category filter
            const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;

            // Search filter
            const searchMatch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.ingredients.some((ingredient: string) =>
                    ingredient.toLowerCase().includes(searchQuery.toLowerCase())
                );

            // Dietary filter - item must have ALL active dietary tags
            const dietaryMatch = activeTags.length === 0 ||
                activeTags.every((tag: any) => item.dietaryTags.includes(tag));

            // Availability filter
            const availabilityMatch = item.available;

            return categoryMatch && searchMatch && dietaryMatch && availabilityMatch;
        });
    }, [menuResponse, selectedCategory, searchQuery, dietaryFilters]);

    const handleViewDetails = (item: MenuItem) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    if (isLoading) {
        return <BrandedLoader />;
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-alert-red text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-display font-semibold text-light-gray mb-2">
                        Unable to load menu
                    </h2>
                    <p className="text-warm-beige">
                        Please check your connection and try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <section ref={sectionRef} id="full-menu" className="py-24 bg-deep-black relative overflow-hidden">
            {/* Cinematic Background Image */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
                    style={{ backgroundImage: "url('/images/dietary_menu_bg.png')", backgroundAttachment: 'fixed' }}
                />
                {/* Edge Blending Gradients */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-deep-black to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-deep-black to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-deep-black/60 z-0 pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-6xl font-bold text-light-gray mb-4"
                    >
                        Our Complete <span className="text-accent-gold">Selection</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-warm-beige max-w-2xl mx-auto text-lg"
                    >
                        Explore dishes crafted for every palate and preference.
                    </motion.p>
                </div>

                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-accent-orange rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter by name, ingredient, or craving..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-deep-black/80 border border-warm-brown/30 rounded-xl text-light-gray placeholder-warm-beige/50 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/20 transition-all font-sans"
                        />
                        <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-gold"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-warm-beige/50 hover:text-accent-gold transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Sticky Filter Bar */}
                <div ref={filterRef} className="relative">
                    {/* Normal (non-sticky) filter bar */}
                    <div className={isFilterSticky ? 'invisible' : ''}>
                        <DietaryFilters compact={false} />
                        <MenuCategories
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            compact={false}
                        />
                    </div>
                    
                    {/* Fixed sticky version */}
                    <AnimatePresence>
                        {isFilterSticky && (
                            <motion.div 
                                className="fixed top-16 left-0 right-0 z-40 bg-deep-black/95 backdrop-blur-md border-b border-warm-brown/20 shadow-xl py-2 px-4"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className="max-w-7xl mx-auto">
                                    <DietaryFilters compact={true} />
                                    <MenuCategories
                                        selectedCategory={selectedCategory}
                                        onCategoryChange={setSelectedCategory}
                                        compact={true}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <p className="text-warm-beige text-sm font-medium tracking-wide">
                        {filteredMenuItems.length} dishes found
                        {getActiveDietaryTags().length > 0 && (
                            <span className="text-accent-gold">
                                {' '}• Filtered by dietary preferences
                            </span>
                        )}
                    </p>

                    <div className="flex items-center gap-4">
                        {getActiveDietaryTags().length > 0 && (
                            <button
                                onClick={clearDietaryFilters}
                                className="text-accent-gold hover:text-accent-orange text-sm font-medium transition-colors duration-200"
                            >
                                Clear All Filters
                            </button>
                        )}
                        {filteredMenuItems.length === 0 && menuResponse && Array.isArray(menuResponse) && menuResponse.length > 0 && (
                            <p className="text-accent-orange text-sm font-medium animate-pulse">
                                Try adjusting your filters
                            </p>
                        )}
                    </div>
                </div>

                {/* Menu Grid with Layout Animations */}
                <LayoutGroup>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        layout
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredMenuItems.map((item: MenuItem) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{
                                        opacity: { duration: 0.3 },
                                        scale: { duration: 0.3 },
                                        layout: { duration: 0.4, type: "spring", stiffness: 300, damping: 30 }
                                    }}
                                    className="h-full"
                                >
                                    <MenuCard
                                        item={item}
                                        onViewDetails={handleViewDetails}
                                        isAllergenSafe={true}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </LayoutGroup>

                {/* Empty State */}
                {filteredMenuItems.length === 0 && menuResponse && Array.isArray(menuResponse) && menuResponse.length > 0 && (
                    <motion.div
                        className="text-center py-24 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-6 grayscale opacity-50">🔍</div>
                        <h3 className="text-2xl font-display font-semibold text-light-gray mb-3">
                            No dishes match your criteria
                        </h3>
                        <p className="text-warm-beige mb-8 max-w-md mx-auto">
                            Try adjusting your search terms or dietary filters to discover more culinary treasures.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                // Clear all dietary filters logic would go here if exposed
                            }}
                            className="btn-secondary"
                        >
                            Reset Explore
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Menu Item Detail Modal */}
            <MenuItemModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={closeModal}
            />
        </section>
    );
};

export default MenuSection;