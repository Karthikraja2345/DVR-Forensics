import React, { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { ForensicReplayPage } from './pages/ForensicReplayPage';
import { RecoveryWorkspacePage } from './pages/RecoveryWorkspacePage';
import { LineagePage } from './pages/LineagePage';
import { CustodyLogPage } from './pages/CustodyLogPage';
import { OEMMatrixPage } from './pages/OEMMatrixPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentCaseId, setCurrentCaseId] = useState<string>('DEMO-CASE-001');

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper">
        <Header currentCaseId={currentCaseId} />
        <main className="content-body">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'cases' && <CasesPage onSelectCase={(id) => { setCurrentCaseId(id); setActiveTab('dashboard'); }} />}
          {activeTab === 'replay' && <ForensicReplayPage caseId={currentCaseId} />}
          {activeTab === 'recovery' && <RecoveryWorkspacePage caseId={currentCaseId} />}
          {activeTab === 'lineage' && <LineagePage caseId={currentCaseId} />}
          {activeTab === 'custody' && <CustodyLogPage caseId={currentCaseId} />}
          {activeTab === 'matrix' && <OEMMatrixPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
