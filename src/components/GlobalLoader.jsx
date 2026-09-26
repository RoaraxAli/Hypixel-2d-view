'use client';

export default function GlobalLoader({ visible, text = 'Contacting Hypixel API...' }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center">
      <div className="bg-[#161b22] border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-200 font-mono">{text}</p>
      </div>
    </div>
  );
}
