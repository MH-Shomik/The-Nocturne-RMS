// Modal component for detailed menu item view
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem } from '../../../types';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDietaryTagColor = (tag: string) => {
    switch (tag) {
      case 'vegan':
      case 'vegetarian':
        return 'bg-fresh-green text-deep-black';
      case 'gluten-free':
      case 'dairy-free':
      case 'halal':
      case 'kosher':
        return 'bg-accent-gold text-deep-black';
      case 'nut-free':
      case 'keto':
        return 'bg-accent-orange text-deep-black';
      default:
        return 'bg-warm-brown text-light-gray';
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <motion.div 
              className="relative bg-warm-brown/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-deep-black/50 hover:bg-deep-black/70 rounded-full flex items-center justify-center text-light-gray hover:text-accent-gold transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="relative h-64 md:h-80 rounded-t-2xl overflow-hidden">
                <img 
                  src={item.imageUrl || ''}
                  onError={e => (e.currentTarget.style.display = 'none')}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Price overlay */}
                <div className="absolute bottom-4 right-4 bg-deep-black/80 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="text-accent-gold font-bold text-2xl">
                    {formatPrice(item.price)}
                  </span>
                </div>
                
                {/* Availability status */}
                {!item.available && (
                  <div className="absolute inset-0 bg-deep-black/70 flex items-center justify-center">
                    <span className="text-warm-beige font-medium text-xl">Currently Unavailable</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                  <h2 className="font-display text-3xl font-bold text-light-gray mb-2">
                    {item.name}
                  </h2>
                  <p className="text-warm-beige text-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Dietary Tags */}
                {item.dietaryTags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-light-gray mb-3">Dietary Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.dietaryTags.map((tag) => (
                        <span 
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getDietaryTagColor(tag)}`}
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold text-light-gray mb-3">Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {item.ingredients.map((ingredient, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-2 text-warm-beige"
                      >
                        <span className="w-2 h-2 bg-accent-gold rounded-full"></span>
                        <span className="text-sm">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergens */}
                {item.allergens.length > 0 && (
                  <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg p-4">
                    <h3 className="font-semibold text-alert-red mb-2 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Allergen Information
                    </h3>
                    <p className="text-light-gray text-sm">
                      Contains: <span className="font-medium">{item.allergens.join(', ')}</span>
                    </p>
                  </div>
                )}

                {/* Ask your waiter notice */}
                {item.available && (
                  <div className="bg-accent-gold/8 border border-accent-gold/25 rounded-lg p-4 text-center">
                    <p className="text-accent-gold font-semibold text-sm">Ready to order?</p>
                    <p className="text-warm-beige text-xs mt-1">Ask your waiter to place this item.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuItemModal;