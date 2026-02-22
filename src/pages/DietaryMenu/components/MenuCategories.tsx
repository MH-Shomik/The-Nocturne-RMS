// Menu categories navigation component
import React from 'react';
import { motion } from 'framer-motion';
import type { MenuItem } from '../../../types';

interface MenuCategoriesProps {
  selectedCategory: 'all' | MenuItem['category'];
  onCategoryChange: (category: 'all' | MenuItem['category']) => void;
  compact?: boolean;
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  compact = false
}) => {
  const categories: Array<{ value: 'all' | MenuItem['category']; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '🍽️' },
    { value: 'appetizer', label: 'Appetizers', icon: '🥗' },
    { value: 'main', label: 'Mains', icon: '🍖' },
    { value: 'dessert', label: 'Desserts', icon: '🧁' },
    { value: 'beverage', label: 'Drinks', icon: '🥤' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 overflow-x-auto">
        {categories.map((category) => (
          <motion.button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category.value
              ? 'bg-accent-gold text-deep-black'
              : 'bg-warm-brown/30 text-light-gray hover:bg-warm-brown/50'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="font-display text-lg font-semibold text-light-gray mb-4">
        Browse by Category
      </h3>
      
      {/* Desktop horizontal scroll */}
      <div className="hidden md:flex space-x-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.value
                ? 'bg-accent-gold text-deep-black shadow-lg'
                : 'bg-warm-brown/20 text-light-gray hover:bg-warm-brown/40 hover:text-accent-gold'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
            {selectedCategory === category.value && (
              <motion.div 
                className="w-2 h-2 bg-deep-black rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {categories.map((category) => (
          <motion.button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`flex flex-col items-center space-y-2 p-4 rounded-xl font-medium transition-all ${
              selectedCategory === category.value
                ? 'bg-accent-gold text-deep-black'
                : 'bg-warm-brown/20 text-light-gray'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-sm text-center">{category.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MenuCategories;