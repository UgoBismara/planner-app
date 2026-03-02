import { useState } from 'react';
import WeekPlanner from './components/WeekPlanner/WeekPlanner';
import MealPlanner from './components/MealPlanner/MealPlanner';
import './App.css';

const TABS = [
  { id: 'week', label: '📅 Semaine' },
  { id: 'meals', label: '🍽️ Repas' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);

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
      </header>

      <main className="app-main">
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
