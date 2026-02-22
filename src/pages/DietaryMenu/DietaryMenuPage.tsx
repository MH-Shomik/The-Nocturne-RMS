// Dynamic Dietary Menu page - Customer facing menu with filters
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store';
import { menuService } from '../../services/menuService';
import type { MenuItem } from '../../types';
import MenuCard from './components/MenuCard';
import DietaryFilters from './components/DietaryFilters';
import MenuCategories from './components/MenuCategories';
import MenuItemModal from './components/MenuItemModal';
import BrandedLoader from '../../components/ui/BrandedLoader';
import Navigation from '../../components/Navigation';

const DietaryMenuPage: React.FC = () => {
  const {
    dietaryFilters,
    initializeDietaryFilters,
    getActiveDietaryTags,
    clearDietaryFilters,
    setError
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<'all' | MenuItem['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
        activeTags.every(tag => item.dietaryTags.includes(tag));

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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-deep-black">
      <Navigation />



      {/* Animated Modern Hero Section */}
      <section className="relative overflow-hidden pb-24 pt-32 mb-12">
        {/* Animated Background gradients */}
        <div className="absolute inset-0 bg-deep-black z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 -left-1/4 w-1/2 h-full bg-accent-gold/30 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-accent-orange/30 blur-[120px] rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-6 px-5 py-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          >
            <span className="text-accent-gold font-semibold tracking-wider text-sm uppercase">Welcome to The Nocturne</span>
          </motion.div>

          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-light-gray mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            Experience <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-orange">
              Culinary Excellence
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-warm-beige max-w-3xl mx-auto mb-12 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
          >
            Discover our curated selection of dishes from around the world,
            crafted with care for every dietary preference.
          </motion.p>

          {/* Animated Search Bar */}
          <motion.div
            className="max-w-2xl mx-auto relative group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-accent-orange rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-warm-brown/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <svg
                className="w-6 h-6 text-warm-beige ml-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search dishes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-light-gray placeholder-warm-beige focus:outline-none text-lg"
              />
              <button className="bg-gradient-to-r from-accent-gold to-accent-orange text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dietary Filters */}
        <DietaryFilters />

        {/* Category Navigation */}
        <MenuCategories
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-warm-beige">
            {filteredMenuItems.length} dishes found
            {getActiveDietaryTags().length > 0 && (
              <span className="text-accent-gold">
                {' '}• Filtered by dietary preferences
              </span>
            )}
          </p>

          {filteredMenuItems.length === 0 && menuResponse && Array.isArray(menuResponse) && menuResponse.length > 0 && (
            <p className="text-accent-orange text-sm">
              Try adjusting your filters to see more options
            </p>
          )}
        </div>

        {/* Menu Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            {filteredMenuItems.map((item: MenuItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                layout
              >
                <MenuCard
                  item={item}
                  onViewDetails={handleViewDetails}
                  isAllergenSafe={item.allergens.length === 0}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredMenuItems.length === 0 && menuResponse && Array.isArray(menuResponse) && menuResponse.length > 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-light-gray mb-2">
              No dishes match your criteria
            </h3>
            <p className="text-warm-beige mb-6">
              Try adjusting your search or dietary filters to discover more options.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                clearDietaryFilters();
              }}
              className="btn-secondary"
            >
              Clear All Filters
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
    </div>
  );
};

export default DietaryMenuPage;