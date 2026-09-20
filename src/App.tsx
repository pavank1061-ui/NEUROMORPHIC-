import { useEffect, useState } from 'react';
import type { SimSettings, MissionModeId } from '@/types';
import { loadSettings, saveSettings } from '@/lib/settings';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ImageSimulator } from '@/components/ImageSimulator';
import { DataSavings } from '@/components/DataSavings';
import { Architecture } from '@/components/Architecture';
import { OneChipModule } from '@/components/OneChipModule';
import { Impact, Roadmap, Footer } from '@/components/ImpactRoadmap';

function App() {
  const [settings, setSettings] = useState<SimSettings>(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleModeChange = (mode: MissionModeId) => {
    setSettings((prev) => ({ ...prev, missionMode: mode }));
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      <Navbar />
      <main>
        <Hero />
        <ImageSimulator settings={settings} onSettingsChange={setSettings} />
        <DataSavings settings={settings} onSettingsChange={setSettings} />
        <Architecture />
        <OneChipModule settings={settings} onModeChange={handleModeChange} />
        <Impact />
        <Roadmap />
      </main>
      <Footer />
    </div>
  );
}

export default App;
