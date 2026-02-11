import ValidationDashboard from "../components/ValidationDashboard";
import LiquidBackground from "../components/LiquidBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <LiquidBackground />
      
      {/* Subtle green gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
      
      <main className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 mb-3 sm:mb-4 md:mb-6 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 text-[10px] sm:text-xs md:text-sm font-medium tracking-wide">Automated Website Validation</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight px-2">
            <span className="text-white">
              Website <span className="text-emerald-400">Verification</span>
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6">
            Validate availability, detect redirects, and verify brand presence at scale
          </p>
        </div>

        {/* Reduced spacer for better mobile experience */}
        <div className="h-8 sm:h-16 md:h-24 lg:h-32"></div>

        {/* Dashboard */}
        <div className="w-full">
          <ValidationDashboard />
        </div>
      </main>
    </div>
  );
}
