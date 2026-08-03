import React from 'react';
import { ImageItem } from '../types';
import { ImageCard } from './ImageCard';

interface ImageListProps {
  items: ImageItem[];
  onOpenInspector: (id: string) => void;
  onRemove: (id: string) => void;
  namingPattern: string;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  onOpenInspector,
  onRemove,
  namingPattern,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text)' }}>
          Image Batch ({items.length})
        </h3>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--c-text-tertiary)' }}>
          Click any card to inspect Before/After quality
        </span>
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
