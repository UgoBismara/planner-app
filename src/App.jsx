import { useState, useRef, useEffect } from 'react';
import WeekPlanner from './components/WeekPlanner/WeekPlanner';
import MealPlanner from './components/MealPlanner/MealPlanner';
import './App.css';

const TABS = [
  { id: 'week', label: '📅 Semaine' },
  { id: 'meals', label: '🍽️ Repas' },
];

function collectPlannerData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('planner_') && key !== 'planner_pending_export') {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

function triggerDownload(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `planner-sauvegarde-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleExport() {
  triggerDownload(collectPlannerData());
}

function handleImport(e, onDone) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('planner_')) localStorage.setItem(key, value);
      });
      onDone();
    } catch {
      alert('Fichier invalide.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [key, setKey] = useState(0);
  const importRef = useRef(null);

  useEffect(() => {
    // Demander au navigateur de ne pas effacer le localStorage automatiquement
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }

    // Si un export en attente existe depuis la session précédente, le télécharger maintenant
    const pending = localStorage.getItem('planner_pending_export');
    if (pending) {
      try {
        triggerDownload(JSON.parse(pending));
      } catch { /* ignore */ }
      localStorage.removeItem('planner_pending_export');
    }

    // À la fermeture : sauvegarder un snapshot dans localStorage (toujours fiable)
    // Le téléchargement s'effectuera à la prochaine ouverture de l'app
    const saveSnapshot = () => {
      localStorage.setItem('planner_pending_export', JSON.stringify(collectPlannerData()));
    };
    window.addEventListener('beforeunload', saveSnapshot);
    return () => window.removeEventListener('beforeunload', saveSnapshot);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Mon Planner</h1>
        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="btn-data" onClick={handleExport} title="Exporter toutes les données">
            ↓ Exporter
          </button>
          <button className="btn-data" onClick={() => importRef.current.click()} title="Importer une sauvegarde">
            ↑ Importer
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => handleImport(e, () => setKey((k) => k + 1))}
          />
        </div>
      </header>

      <main className="app-main" key={key}>
        {activeTab === 'week' && (
          <WeekPlanner weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        )}
        {activeTab === 'meals' && (
          <MealPlanner weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        )}
      </main>
    </div>
  );
}
