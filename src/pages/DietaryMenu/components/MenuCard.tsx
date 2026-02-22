// Menu item card component with WorldPlate styling
import React from 'react';
import { motion } from 'framer-motion';
import type { MenuItem } from '../../../types';

interface MenuCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
  isAllergenSafe: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  onViewDetails, 
  isAllergenSafe 
}) => {
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
    <motion.div 
      className="card overflow-hidden group cursor-pointer relative before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-accent-gold/40 before:via-warm-brown/20 before:to-accent-orange/30 before:-z-10 hover:before:from-accent-gold/70 hover:before:via-accent-orange/40 hover:before:to-fresh-green/50 before:transition-all before:duration-300 shadow-lg hover:shadow-accent-gold/20"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => onViewDetails(item)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img 
          src={item.imageUrl || ''}
          onError={e => (e.currentTarget.style.display = 'none')}
          alt={item.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Price overlay */}
        <div className="absolute top-3 right-3 bg-deep-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-accent-gold font-bold text-lg">
            {formatPrice(item.price)}
          </span>
        </div>
        
        {/* Allergen warning */}
        {!isAllergenSafe && (
          <div className="absolute top-3 left-3 bg-alert-red/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white text-xs font-bold">⚠️ ALLERGY</span>
          </div>
        )}
        
        {/* Availability overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-deep-black/70 flex items-center justify-center">
            <span className="text-warm-beige font-medium text-lg">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-display font-semibold text-xl text-light-gray group-hover:text-accent-gold transition-colors">
          {item.name}
        </h3>
        
        {/* Description */}
        <p className="text-warm-beige text-sm line-clamp-2">
          {item.description}
        </p>
        
        {/* Dietary Tags */}
        {item.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.dietaryTags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDietaryTagColor(tag)}`}
              >
                {tag.replace('-', ' ')}
              </span>
            ))}
            {item.dietaryTags.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-warm-brown/50 text-warm-beige">
                +{item.dietaryTags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="text-xs text-accent-orange">
            Contains: {item.allergens.join(', ')}
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(item);
          }}
          className="w-full bg-warm-brown hover:bg-warm-brown/80 text-light-gray py-2 px-4 rounded-lg transition-colors font-medium text-sm"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default MenuCard;