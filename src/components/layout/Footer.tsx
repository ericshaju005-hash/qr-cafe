import React from 'react';
import { useRouter } from '../../router/Router';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-stone-900 text-stone-400 text-xs py-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-serif text-base font-bold text-white">CafeOrder</span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400 text-[11px]">Specialty Roastery & Kitchen</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Open daily 08:00 AM – 10:30 PM · Complimentary High-Speed Guest Wi-Fi
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-stone-400">
          <span>All prices in Indian Rupees (₹)</span>
          <span aria-hidden="true">·</span>
          <span>5% GST inclusive</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => navigate('/cashier')}
            className="text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Shield className="w-3 h-3" />
            <span>Staff Terminal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
