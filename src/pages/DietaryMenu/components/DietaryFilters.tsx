// Dietary filters component with toggle switches
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../store';

interface DietaryFiltersProps {
  compact?: boolean;
}

const DietaryFilters: React.FC<DietaryFiltersProps> = ({ compact = false }) => {
  const { dietaryFilters, toggleDietaryFilter, clearDietaryFilters } = useAppStore();

  const activeTags = dietaryFilters.filter(filter => filter.active);

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap py-2">
        {dietaryFilters.map((filter) => (
          <motion.button
            key={filter.tag}
            onClick={() => toggleDietaryFilter(filter.tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter.active 
              ? (filter.tag === 'vegan' || filter.tag === 'vegetarian' 
                  ? 'bg-fresh-green text-deep-black' 
                  : 'bg-accent-gold text-deep-black')
              : 'bg-warm-brown/30 text-light-gray hover:bg-warm-brown/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getFilterIcon(filter.tag)} {filter.label}
          </motion.button>
        ))}
        {activeTags.length > 0 && (
          <button
            onClick={clearDietaryFilters}
            className="text-accent-orange hover:text-alert-red text-sm font-medium ml-2"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold text-light-gray">
          Dietary Preferences
        </h2>
        
        {activeTags.length > 0 && (
          <button
            onClick={clearDietaryFilters}
            className="text-accent-orange hover:text-alert-red text-sm font-medium transition-colors"
          >
            Clear All ({activeTags.length})
          </button>
        )}
      </div>
      
      <p className="text-warm-beige text-sm mb-6">
        Select your dietary preferences to see personalized menu recommendations
      </p>

      {/* Filter Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {dietaryFilters.map((filter) => {
          const isVegan = filter.tag === 'vegan' || filter.tag === 'vegetarian';
          const toggleClasses = `dietary-toggle ${filter.active ? 'active' : ''} ${
            isVegan && filter.active ? 'vegan' : ''
          }`;

          return (
            <motion.button
              key={filter.tag}
              onClick={() => toggleDietaryFilter(filter.tag)}
              className={toggleClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="flex items-center justify-center space-x-2">
                {/* Icon based on dietary type */}
                <span className="text-sm">
                  {getFilterIcon(filter.tag)}
                </span>
                <span className="font-medium text-sm">
                  {filter.label}
                </span>
              </span>
              
              {/* Active indicator */}
              <AnimatePresence>
                {filter.active && (
                  <motion.div 
                    className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Active filters summary */}
      <AnimatePresence>
        {activeTags.length > 0 && (
          <motion.div 
            className="mt-6 p-4 bg-warm-brown/10 border border-warm-brown/20 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-accent-gold font-medium text-sm">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeTags.map((filter) => (
                  <motion.span 
                    key={filter.tag}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filter.tag === 'vegan' || filter.tag === 'vegetarian' 
                        ? 'bg-fresh-green text-deep-black'
                        : 'bg-accent-gold text-deep-black'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    layout
                  >
                    {filter.label}
                    <button
                      onClick={() => toggleDietaryFilter(filter.tag)}
                      className="ml-2 hover:text-alert-red transition-colors"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get icons for each dietary filter
function getFilterIcon(tag: string): string {
  switch (tag) {
    case 'vegan':
      return '🌱';
    case 'vegetarian':
      return '🥗';
    case 'gluten-free':
      return '🌾';
    case 'dairy-free':
      return '🥛';
    case 'nut-free':
      return '🥜';
    case 'halal':
      return '☪️';
    case 'kosher':
      return '✡️';
    case 'keto':
      return '🥑';
    case 'low-sodium':
      return '🧂';
    default:
      return '🍽️';
  }
}

export default DietaryFilters;