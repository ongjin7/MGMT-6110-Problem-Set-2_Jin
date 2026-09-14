import React, { useState, useEffect } from 'react';
import { AppScreen, SystemHealth, LocationItem } from './types';
import { Header } from './components/Header';
import { DirectionsScreen } from './components/DirectionsScreen';
import { WeatherScreen } from './components/WeatherScreen';
import { OlaHubScreen } from './components/OlaHubScreen';
import { HealthModal } from './components/HealthModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('directions');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [preselectedDestination, setPreselectedDestination] = useState<LocationItem | null>(null);

  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.warn('Unable to query health endpoint:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Ensure view resets to the top whenever switching screens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentScreen]);

  // Handle switching from Weather Screen activity recommendation directly to Directions
  const handleSelectPlaceForDirections = (place: LocationItem) => {
    setPreselectedDestination(place);
    setCurrentScreen('directions');
  };

  return (
    <div id="ola-buddy-app-root" className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 antialiased font-sans">
      {/* Header */}
      <Header
        currentScreen={currentScreen}
        onScreenChange={screen => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        systemHealth={systemHealth}
        onOpenHealth={() => setIsHealthModalOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {currentScreen === 'directions' && (
          <DirectionsScreen initialDestination={preselectedDestination} />
        )}
        {currentScreen === 'weather' && (
          <WeatherScreen onSelectPlaceForDirections={handleSelectPlaceForDirections} />
        )}
        {currentScreen === 'hub' && <OlaHubScreen />}
      </main>

      {/* Diagnostics Health Modal */}
      <HealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        systemHealth={systemHealth}
        onRefresh={fetchHealth}
        isLoading={isHealthLoading}
      />

      {/* Footer with statutory license credits */}
      <Footer />
    </div>
  );
}
