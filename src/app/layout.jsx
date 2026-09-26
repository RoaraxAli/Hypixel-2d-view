import './globals.css';

export const metadata = {
  title: 'Hypixel SkyBlock Hub Village',
  description: 'Interactive 2D Hub Village Intelligence Platform for Hypixel SkyBlock',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070a] text-[#e6edf3] h-screen w-screen overflow-hidden selection:bg-brand-gold/30 selection:text-white select-none">
        {children}
      </body>
    </html>
  );
}
