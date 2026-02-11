import ValidationDashboard from "../components/ValidationDashboard";
import LiquidBackground from "../components/LiquidBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <LiquidBackground />
      
      {/* Subtle green gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
      
      <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-4 sm:mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 text-xs sm:text-sm font-medium tracking-wide">Automated Website Validation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="text-white">
              Website <span className="text-emerald-400">Verification</span>
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            Validate availability, detect redirects, and verify brand presence at scale
          </p>
        </div>

        {/* Spacer to push dashboard down */}
        <div className="h-32 sm:h-40 lg:h-48"></div>

        {/* Dashboard */}
        <div className="w-full max-w-7xl mx-auto">
          <ValidationDashboard />
        </div>
      </main>
    </div>
  );
}
