import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  onSearch: (query: string) => void;
  onNewItem: () => void;
}

export function Layout({ children, onSearch, onNewItem }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearch={onSearch} onNewItem={onNewItem} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
