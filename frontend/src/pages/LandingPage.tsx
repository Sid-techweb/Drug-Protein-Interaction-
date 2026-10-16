import React from 'react';
import { ScientificBackground } from '../components/landing/ScientificBackground';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { SystemMetricsSection } from '../components/landing/SystemMetricsSection';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { TechStackSection } from '../components/landing/TechStackSection';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* 1. Dynamic SVG/Canvas Scientific Background */}
      <ScientificBackground />

      {/* 2. Glassmorphism Navigation Bar */}
      <Navbar />

      {/* 3. Hero Section with Three.js WebGL 3D Molecule Center Visual */}
      <Hero />

      {/* 4. Live API-Driven System Telemetry Metrics */}
      <SystemMetricsSection />

      {/* 5. 9-Stage End-to-End Workflow Pipeline */}
      <WorkflowSection />

      {/* 6. Enterprise Platform Capabilities */}
      <CapabilitiesSection />

      {/* 7. Interactive Technology Stack & Architectural Specs Modals */}
      <TechStackSection />

      {/* 8. Billion-Dollar Biotech Startup Footer */}
      <Footer />
    </div>
  );
};
