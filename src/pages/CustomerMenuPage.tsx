import React, { useState, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS } from '../data/menuItems';
import { ProductCard } from '../components/menu/ProductCard';
import { useCafe } from '../context/CafeContext';
import { Search, Sparkles, Coffee, SlidersHorizontal, QrCode } from 'lucide-react';
import { DietaryType } from '../types/cafe';

export const CustomerMenuPage: React.FC = () => {
  const { tableNumber, menuItems } = useCafe();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | DietaryType>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Dietary filter
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  return (
    <div className="pb-28">
      {/* Table Welcome Banner / Hero */}
      <section className="bg-stone-900 text-stone-100 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 text-amber-300 text-xs font-semibold mb-3 border border-stone-700 shadow-xs">
                <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Ordering from Table {tableNumber}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
                Artisanal Coffee & Kitchen
              </h1>

              <p className="text-stone-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-5 max-w-xl">
                Browse our freshly roasted specialty roasts, seasonal viennoiserie, and farm-to-table brunch.
                Your order is prepared fresh and served straight to your table.
              </p>

              {/* Search Input with iOS-friendly font sizing */}
              <div className="relative max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coffee, brunch, bakery, matcha..."
                  className="w-full bg-stone-800/90 text-stone-100 placeholder-stone-400 pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-stone-700 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center text-xs text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Highlights & Features */}
            <div className="hidden lg:grid grid-cols-2 gap-3 shrink-0 max-w-xs text-left">
              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/80">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  Fresh Roasted
                </span>
                <span className="text-xs text-stone-200 font-medium">Single-origin beans & manual brew</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/80">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  Direct to Table
                </span>
                <span className="text-xs text-stone-200 font-medium">Live tracker to Table {tableNumber}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/80">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  Kitchen Queued
                </span>
                <span className="text-xs text-stone-200 font-medium">Real-time barista terminal sync</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/80">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  Flexible Pay
                </span>
                <span className="text-xs text-stone-200 font-medium">UPI QR, Counter, or Table POS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category & Dietary Filter Bar */}
      <div className="sticky top-16 z-20 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
          {/* Categories Tab Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer touch-manipulation min-h-[38px] sm:min-h-[34px] flex items-center ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = menuItems.filter((m) => m.category === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer touch-manipulation min-h-[38px] sm:min-h-[34px] flex items-center ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Dietary Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-0.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <span className="text-[11px] font-semibold text-stone-500 mr-1 flex items-center gap-1 whitespace-nowrap">
                <SlidersHorizontal className="w-3 h-3 text-stone-400" />
                Dietary:
              </span>
              <button
                type="button"
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1 sm:py-0.5 rounded-lg text-xs sm:text-[11px] font-semibold transition-colors cursor-pointer touch-manipulation min-h-[32px] sm:min-h-[26px] flex items-center ${
                  dietaryFilter === 'all'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1 sm:py-0.5 rounded-lg text-xs sm:text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer touch-manipulation min-h-[32px] sm:min-h-[26px] ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dietaryFilter === 'veg' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('vegan')}
                className={`px-2.5 py-1 sm:py-0.5 rounded-lg text-xs sm:text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer touch-manipulation min-h-[32px] sm:min-h-[26px] ${
                  dietaryFilter === 'vegan'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dietaryFilter === 'vegan' ? 'bg-white' : 'bg-teal-500'}`} />
                <span>Vegan</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-2.5 py-1 sm:py-0.5 rounded-lg text-xs sm:text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer touch-manipulation min-h-[32px] sm:min-h-[26px] ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dietaryFilter === 'non-veg' ? 'bg-white' : 'bg-rose-500'}`} />
                <span>Non-Veg</span>
              </button>
            </div>

            <span className="hidden sm:inline text-[11px] text-stone-500 font-mono">
              Showing {filteredItems.length} of {menuItems.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <Coffee className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-stone-800 mb-1">
              No menu items match your search
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Try searching for something else or clearing the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietaryFilter('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {/* If all categories selected and no search, display grouped by category */}
            {selectedCategory === 'all' && !searchQuery.trim() && dietaryFilter === 'all' ? (
              CATEGORIES.map((cat) => {
                const itemsInCat = filteredItems.filter((it) => it.category === cat.id);
                if (itemsInCat.length === 0) return null;
                return (
                  <section key={cat.id} id={cat.id} className="scroll-mt-36">
                    <div className="mb-4 sm:mb-5">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        {cat.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {itemsInCat.map((item) => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
