"use client"

import { useState, useEffect } from 'react';
import LightPillar from '../components/LightPillar';
import ValidationDashboard from '../components/ValidationDashboard';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [view, setView] = useState<'hero' | 'dashboard' | 'about'>('hero');

  const switchTo = (target: 'hero' | 'dashboard' | 'about') => {
    if (target === view) return;
    setTransitioning(true);
    setTimeout(() => {
      setView(target);
      setShowDashboard(target === 'dashboard');
      setTimeout(() => setTransitioning(false), 50);
    }, 300);
  };

  return (
    <div className="h-screen bg-[#0a0a1a] relative overflow-hidden flex flex-col">
      {/* Full-screen Light Pillar background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#10b981"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Floating glass navbar */}
      <nav className="relative z-10 flex justify-center pt-3 sm:pt-5 px-3 sm:px-6 shrink-0" style={{ fontFamily: "'League Spartan', sans-serif" }}>
        <div className="flex items-center justify-between w-full max-w-[92%] sm:max-w-2xl md:max-w-3xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full border border-white/10 backdrop-blur-xl bg-white/5 shadow-lg shadow-black/10">
          <span
            className="text-white text-lg sm:text-2xl font-bold tracking-wide cursor-pointer"
            onClick={() => switchTo('hero')}
          >
            Veri<span className="text-[#10B981]">Web</span>
          </span>
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 text-sm sm:text-base font-regular">
            <a href="#" className={`hover:text-white transition-colors ${view === 'hero' || view === 'dashboard' ? 'text-white' : 'text-white/70'}`} onClick={(e) => { e.preventDefault(); switchTo('hero'); }}>Home</a>
            <a href="#" className={`hover:text-white transition-colors ${view === 'about' ? 'text-white' : 'text-white/70'}`} onClick={(e) => { e.preventDefault(); switchTo('about'); }}>About Us</a>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="relative z-10 flex flex-col items-center justify-start flex-1 px-3 sm:px-4 overflow-y-auto">
        <div
          className={`transition-all duration-300 ease-in-out w-full flex flex-col items-center ${
            transitioning ? 'opacity-0 translate-y-4 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          {view === 'hero' ? (
            <div className="pt-16 sm:pt-28 md:pt-36 lg:pt-52">
              {/* Badge */}
              <div className="mb-3 sm:mb-5 text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/15 backdrop-blur-md bg-white/5 text-white/60 text-[10px] sm:text-xs">
                  Automated Website Validation
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center text-white mb-4 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-[1.15] tracking-tight">
                Validate availability, detect redirects, and verify brand presence at scale.
              </h1>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => switchTo('dashboard')}
                  className="px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 cursor-pointer"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => switchTo('about')}
                  className="px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm rounded-full font-semibold text-white/80 border border-white/20 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </div>
          ) : view === 'dashboard' ? (
            <div className="w-full max-w-7xl pt-4 sm:pt-8 pb-6 sm:pb-8">
              <ValidationDashboard />
            </div>
          ) : (
            /* About Us Page */
            <div className="w-full max-w-4xl pt-4 sm:pt-8 pb-8 sm:pb-12">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-10">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/15 backdrop-blur-md bg-white/5 text-white/60 text-[10px] sm:text-xs mb-3 sm:mb-5">
                  S&P Global × FDSS DataFest
                </div>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
                  About Veri<span className="text-[#10B981]">Web</span>
                </h1>
                <p className="text-white/50 text-xs sm:text-sm md:text-base max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
                  A hackathon project built for the S&P Global & FDSS DataFest challenge — automating website validation at scale.
                </p>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Problem Statement */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#5227FF]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#5227FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 sm:mb-2">The Problem</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                    Organizations maintain large lists of company websites that need validation. Manual checks for availability, redirects, and brand presence are inefficient and don't scale.
                  </p>
                </div>

                {/* Our Solution */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 sm:mb-2">Our Solution</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                    VeriWeb is an automated agent that accepts a company name and website URL, checks reachability, detects redirects, extracts homepage content, and verifies brand presence — outputting a structured summary.
                  </p>
                </div>

                {/* How It Works */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 sm:mb-2">How It Works</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                    Upload a CSV or enter URLs manually. Our n8n-powered backend agent validates each website — checking HTTP status, following redirects, scraping content, and using AI to verify brand presence on the page.
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 sm:mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'n8n', 'Three.js'].map((tech) => (
                      <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hackathon Info */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-white font-bold text-sm sm:text-lg mb-2 sm:mb-3">The Hackathon</h3>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  This project was built for <span className="text-white/80 font-medium">Problem Statement 2: Website Availability, Redirect & Brand Presence Verification Agent</span> at the S&P Global × FDSS DataFest hackathon.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">100+</div>
                    <div className="text-white/40 text-[9px] sm:text-xs">URLs Validated</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">3</div>
                    <div className="text-white/40 text-[9px] sm:text-xs">Input Methods</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg sm:text-2xl font-bold text-[#10B981] mb-0.5 sm:mb-1">AI</div>
                    <div className="text-white/40 text-[9px] sm:text-xs">Brand Verification</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={() => switchTo('dashboard')}
                  className="px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 cursor-pointer"
                >
                  Try It Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
