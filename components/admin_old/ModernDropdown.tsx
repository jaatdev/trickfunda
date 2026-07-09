// components/admin/ModernDropdown.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';

type DropdownItem = {
  value: string;
  label: string;
  icon?: string;
  subtitle?: string;
  preview?: React.ReactNode;
  color?: string;
};

type Props = {
  value: string;
  items: DropdownItem[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
  searchable?: boolean;
};

export default function ModernDropdown({
  value,
  items,
  onChange,
  placeholder = 'Select...',
  icon,
  className = '',
  searchable = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.value === value);

  const filteredItems = searchable
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 text-left flex items-center justify-between gap-3 transition-all duration-200 hover:bg-slate-800/70 group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(icon || selectedItem?.icon) && (
            <span className="text-lg shrink-0">
              {selectedItem?.icon || icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            {selectedItem ? (
              <>
                <div className="text-sm font-medium text-white truncate">
                  {selectedItem.label}
                </div>
                {selectedItem.subtitle && (
                  <div className="text-xs text-slate-400 truncate">
                    {selectedItem.subtitle}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-slate-400">{placeholder}</div>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-hidden rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl z-50 animate-slide-down">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-slate-700/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          )}

          {/* Items List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150 ${
                    item.value === value
                      ? 'bg-indigo-500/20 border-l-2 border-indigo-400'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon && <span className="text-xl shrink-0">{item.icon}</span>}
                  {item.color && (
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{item.label}</div>
                    {item.subtitle && (
                      <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>
                    )}
                  </div>
                  {item.preview && <div className="shrink-0">{item.preview}</div>}
                  {item.value === value && (
                    <svg
                      className="w-5 h-5 text-indigo-400 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
