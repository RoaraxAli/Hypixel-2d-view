'use client';

import { useState } from 'react';
import { getItemTexture } from '@/lib/itemTextures';

export default function ItemSlot({ item, customClass = '', style = {} }) {
  const [imageError, setImageError] = useState(false);
  const textureUrl = getItemTexture(item);

  // Auto-reset error state if texture changes
  const [prevTexture, setPrevTexture] = useState(textureUrl);
  if (textureUrl !== prevTexture) {
    setPrevTexture(textureUrl);
    setImageError(false);
  }

  if (!item || item.empty) {
    return <div className={`mc-slot empty ${customClass}`} style={style} />;
  }

  const encodedData = encodeURIComponent(JSON.stringify(item));
  const isEnchanted = Boolean(
    item.starsCount > 0 ||
    item.recombobulated ||
    (item.enchants && Object.keys(item.enchants).length > 0)
  );
  const rarityBorder = item.rarityColor || '#ffffff';

  return (
    <div
      className={`mc-slot ${isEnchanted ? 'mc-enchanted' : ''} ${customClass}`}
      data-item={encodedData}
      style={{ borderColor: rarityBorder, ...style }}
    >
      {textureUrl && !imageError ? (
        <img
          src={textureUrl}
          alt={item.cleanName || ''}
          className="w-8 h-8 max-w-[85%] max-h-[85%] object-contain pointer-events-none select-none"
          style={{ imageRendering: 'pixelated' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="text-xs font-bold text-center px-1 truncate pointer-events-none select-none"
          style={{ color: item.rarityColor || '#fff' }}
        >
          {item.cleanName ? item.cleanName.slice(0, 5) : 'item'}
        </div>
      )}

      {item.count && item.count > 1 && (
        <span className="mc-slot-count">{item.count}</span>
      )}
    </div>
  );
}
