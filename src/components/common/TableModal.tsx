import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Utensils, QrCode, Check, X } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose }) => {
  const { tableNumber, setTableNumber } = useCafe();
  const [tempTable, setTempTable] = useState(tableNumber);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTable.trim()) {
      setTableNumber(tempTable.trim());
      onClose();
    }
  };

  const sampleTables = ['01', '02', '04', '08', '12', '15', '21'];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-stone-900 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-stone-800" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">Table Number</h3>
              <p className="text-[11px] text-stone-500">Currently ordering for Table {tableNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Enter Table Number
            </label>
            <input
              type="text"
              value={tempTable}
              onChange={(e) => setTempTable(e.target.value)}
              placeholder="e.g. 12, 04, T-09"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 font-mono font-semibold"
              autoFocus
            />
          </div>

          {/* Quick table buttons for touch convenience */}
          <div>
            <span className="block text-[11px] font-medium text-stone-500 mb-2">
              Quick Select:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTables.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTempTable(t)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                    tempTable === t
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  Table {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>Update Table</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
