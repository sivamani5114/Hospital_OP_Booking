// StarRating.jsx — Interactive star rating display and input
import React, { useState } from 'react';
import { Star } from 'lucide-react';

// Display-only star row
export function StarDisplay({ rating = 0, total, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
      {rating > 0 && (
        <span className="text-[11px] text-slate-400 ml-1 font-semibold">
          {rating.toFixed(1)}{total !== undefined && ` (${total})`}
        </span>
      )}
    </div>
  );
}

// Interactive input star row
export function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-125"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-bold text-amber-400">
        {(hovered || value) === 1 ? 'Poor' :
         (hovered || value) === 2 ? 'Fair' :
         (hovered || value) === 3 ? 'Good' :
         (hovered || value) === 4 ? 'Very Good' :
         (hovered || value) === 5 ? 'Excellent! ⭐' : ''}
      </span>
    </div>
  );
}
