'use client';

import { useEffect, useState, useRef } from 'react';

export default function ItemTooltip() {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null
  });
  const tooltipRef = useRef(null);

  useEffect(() => {
    function position(e) {
      const offset = 16;
      let x = e.clientX + offset;
      let y = e.clientY + offset;

      if (tooltipRef.current) {
        const w = tooltipRef.current.offsetWidth || 280;
        const h = tooltipRef.current.offsetHeight || 150;

        if (x + w > window.innerWidth - 10) {
          x = e.clientX - w - offset;
        }
        if (y + h > window.innerHeight - 10) {
          y = e.clientY - h - offset;
        }
      }

      return {
        x: Math.max(10, x),
        y: Math.max(10, y)
      };
    }

    function handleMouseOver(e) {
      const slot = e.target.closest('[data-item]');
      if (!slot) return;

      try {
        const raw = slot.getAttribute('data-item');
        if (!raw) return;
        const item = JSON.parse(decodeURIComponent(raw));
        if (item.empty) return;

        const pos = position(e);
        setTooltip({
          visible: true,
          x: pos.x,
          y: pos.y,
          item
        });
      } catch (err) {
        console.error('Error parsing data-item tooltip:', err);
      }
    }

    function handleMouseMove(e) {
      setTooltip(prev => {
        if (!prev.visible) return prev;
        const pos = position(e);
        return { ...prev, x: pos.x, y: pos.y };
      });
    }

    function handleMouseOut(e) {
      const slot = e.target.closest('[data-item]');
      if (slot) {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    }

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!tooltip.visible || !tooltip.item) return null;

  const { item } = tooltip;

  return (
    <div
      ref={tooltipRef}
      className="mc-tooltip"
      style={{
        display: 'block',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }}
    >
      <div
        className="font-bold text-base mb-1"
        dangerouslySetInnerHTML={{
          __html: item.formattedName || item.cleanName || item.rawName || 'Item'
        }}
      />
      {item.starsDisplay && (
        <div className="text-amber-400 text-xs mb-1 font-bold">{item.starsDisplay}</div>
      )}
      {item.loreHtml && item.loreHtml.length > 0 && (
        <div className="text-xs space-y-0.5">
          {item.loreHtml.map((line, idx) => (
            <div
              key={idx}
              dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
