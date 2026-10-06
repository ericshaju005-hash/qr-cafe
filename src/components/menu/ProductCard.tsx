import React, { useState } from 'react';
import { MenuItem } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { Plus, Minus, Clock, Sparkles } from 'lucide-react';

interface ProductCardProps {
  item: MenuItem;
  onOpenNotes?: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onOpenNotes }) => {
  const { cart, addToCart, updateCartQuantity } = useCafe();
  const [imageError, setImageError] = useState(false);

  // Calculate how many of this menu item are currently in cart
  const cartEntries = cart.filter((ci) => ci.menuItemId === item.id);
  const totalItemCountInCart = cartEntries.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleIncrement = () => {
    if (cartEntries.length > 0) {
      // Increment the first entry
      updateCartQuantity(cartEntries[0].id, cartEntries[0].quantity + 1);
    } else {
      addToCart(item, 1);
    }
  };

  const handleDecrement = () => {
    if (cartEntries.length > 0) {
      updateCartQuantity(cartEntries[0].id, cartEntries[0].quantity - 1);
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-stone-400 hover:shadow-xs">
      <div>
        {/* Product Image Slot with zero-broken-image fallback */}
        <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
          {!imageError ? (
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-100 to-amber-50 text-stone-500">
              <span className="font-serif italic text-sm text-stone-700">{item.name}</span>
              <span className="text-[11px] text-stone-400 mt-1 uppercase tracking-wider">
                Cafe Kitchen
              </span>
            </div>
          )}

          {/* Subtle Dietary Tag (unboxed clean marker) */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-stone-950/75 backdrop-blur-xs text-white px-2 py-1 rounded-md text-[10px] font-medium">
            {item.dietary === 'veg' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
            {item.dietary === 'vegan' && (
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
            )}
            {item.dietary === 'non-veg' && (
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            )}
            <span className="capitalize">{item.dietary}</span>
          </div>

          {/* Popular Tag */}
          {item.popular && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Popular</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-3 font-sans">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{item.preparationTimeMinutes} mins</span>
            </span>
            {item.tags && item.tags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.tags[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Price & Add Actions */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-auto flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-sans">
            Price
          </span>
          <span className="text-base sm:text-lg font-bold text-stone-950 font-mono tabular-nums">
            ₹{item.price}
          </span>
        </div>

        <div>
          {totalItemCountInCart === 0 ? (
            <button
              type="button"
              onClick={handleIncrement}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] min-w-[80px] sm:min-h-[38px] text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-xl transition-all border border-stone-300 hover:border-stone-900 shadow-xs cursor-pointer active:scale-95 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-stone-900 text-stone-100 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer active:scale-90 touch-manipulation"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono px-2 tabular-nums min-w-[1.4rem] text-center select-none">
                {totalItemCountInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer active:scale-90 touch-manipulation"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
