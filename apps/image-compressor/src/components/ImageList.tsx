import React from 'react';
import { ImageItem } from '../types';
import { ImageCard } from './ImageCard';
import { Trash2 } from 'lucide-react';

interface ImageListProps {
  items: ImageItem[];
  onOpenInspector: (id: string) => void;
  onRemove: (id: string) => void;
  namingPattern: string;
  onClearAll?: () => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  onOpenInspector,
  onRemove,
  namingPattern,
  onClearAll,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--c-text)]">
          Image Files ({items.length})
        </h2>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-text-tertiary)] hover:text-[var(--c-danger)] hover:bg-red-50 rounded-full transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ImageCard
            key={item.id}
            item={item}
            onOpenInspector={onOpenInspector}
            onRemove={onRemove}
            namingPattern={namingPattern}
          />
        ))}
      </div>
    </div>
  );
};
