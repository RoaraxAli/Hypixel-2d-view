'use client';

export default function GlobalLoader({ visible, text = 'Contacting Hypixel API...' }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center select-none">
      <div className="mc-chest-window p-4 flex flex-col items-center gap-3 shadow-2xl">
        <div className="mc-inset-box p-4 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="minecraft-font text-base text-yellow-300 font-bold">{text}</p>
        </div>
      </div>
    </div>
  );
}
