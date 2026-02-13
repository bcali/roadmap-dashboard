import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RecommendationsPanel } from './RecommendationsPanel';

interface LayoutProps {
  children: ReactNode;
  onSearch: (query: string) => void;
  onNewItem: () => void;
}

export function Layout({ children, onSearch, onNewItem }: LayoutProps) {
  const [recsPanelOpen, setRecsPanelOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <Sidebar onOpenRecommendations={() => setRecsPanelOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearch={onSearch} onNewItem={onNewItem} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <RecommendationsPanel isOpen={recsPanelOpen} onClose={() => setRecsPanelOpen(false)} />
    </div>
  );
}
