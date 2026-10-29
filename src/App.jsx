import { useState, useEffect } from 'react';
import { Ellipsis } from 'lucide-react';
import WeekPlanner from './components/WeekPlanner/WeekPlanner';
import MealPlanner from './components/MealPlanner/MealPlanner';
import NutritionGoal from './components/Nutrition/NutritionGoal';
import IdeasList from './components/Ideas/IdeasList';
import VintedWorkshop from './components/Vinted/VintedWorkshop';
import QuestsBoard from './components/Quests/QuestsBoard';
import JournalBoard from './components/Journal/JournalBoard';
import { TabIcon } from './components/Icons';
import './App.css';

// primary : présent dans la barre du bas sur téléphone, les autres passent dans « Plus »
const TABS = [
  { id: 'week', label: 'Semaine', primary: true },
  { id: 'quests', label: 'Quêtes', primary: true },
  { id: 'journal', label: 'Carnet', primary: true },
  { id: 'meals', label: 'Repas', primary: true },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'ideas', label: 'Idées' },
  { id: 'vinted', label: 'Vinted' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }
  }, []);

  // Changer d'onglet ramène en haut de page, comme dans une appli native
  const openTab = (id) => {
    setMoreOpen(false);
    if (id !== activeTab) window.scrollTo({ top: 0 });
    setActiveTab(id);
  };

  const activeIsSecondary = !TABS.find((t) => t.id === activeTab)?.primary;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Mon Planner</h1>
        <nav className="tab-nav" aria-label="Sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => openTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <TabIcon id={tab.id} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'week' && (
          <WeekPlanner weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        )}
        {activeTab === 'meals' && (
          <MealPlanner weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        )}
        {activeTab === 'nutrition' && <NutritionGoal />}
        {activeTab === 'ideas' && <IdeasList />}
        {activeTab === 'vinted' && <VintedWorkshop />}
        {activeTab === 'quests' && <QuestsBoard />}
        {activeTab === 'journal' && <JournalBoard />}
      </main>

      {/* ── Téléphone : barre d'onglets en bas, à portée de pouce ── */}
      {moreOpen && (
        <>
          <div className="more-backdrop" onClick={() => setMoreOpen(false)} />
          <div className="more-sheet" role="menu" aria-label="Autres sections">
            {TABS.filter((t) => !t.primary).map((tab) => (
              <button
                key={tab.id}
                role="menuitem"
                className={`more-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => openTab(tab.id)}
              >
                <TabIcon id={tab.id} size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}
      <nav className="bottom-nav" aria-label="Sections">
        {TABS.filter((t) => t.primary).map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => openTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <TabIcon id={tab.id} size={22} />
            <span>{tab.label}</span>
          </button>
        ))}
        <button
          className={`bottom-nav-btn${activeIsSecondary ? ' active' : ''}`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
        >
          <Ellipsis size={22} aria-hidden="true" />
          <span>{activeIsSecondary ? TABS.find((t) => t.id === activeTab).label : 'Plus'}</span>
        </button>
      </nav>
    </div>
  );
}
