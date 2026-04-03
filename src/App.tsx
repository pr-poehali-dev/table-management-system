import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Icon from '@/components/ui/icon';
import HomePage from './pages/HomePage';
import TablesPage from './pages/TablesPage';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'home' | 'tables' | 'search' | 'history' | 'settings';

const navItems = [
  { id: 'home' as Page, label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'tables' as Page, label: 'Таблицы', icon: 'Table2' },
  { id: 'search' as Page, label: 'Поиск', icon: 'Search' },
  { id: 'history' as Page, label: 'История', icon: 'History' },
  { id: 'settings' as Page, label: 'Настройки', icon: 'Settings2' },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage onNavigate={setPage} />;
      case 'tables': return <TablesPage />;
      case 'search': return <SearchPage />;
      case 'history': return <HistoryPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col transition-all duration-300"
          style={{
            width: sidebarOpen ? '240px' : '72px',
            background: 'hsla(237, 32%, 9%, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid hsla(237, 25%, 22%, 0.6)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid hsla(237, 25%, 22%, 0.6)' }}>
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(82,100%,55%), hsl(185,90%,55%))' }}
            >
              <Icon name="Database" size={18} style={{ color: 'hsl(237, 35%, 7%)' }} />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in overflow-hidden">
                <div className="font-bold text-sm leading-tight" style={{ color: 'hsl(210, 40%, 96%)' }}>DataSync</div>
                <div className="text-xs" style={{ color: 'hsl(215, 20%, 50%)' }}>MySQL Bridge</div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto p-1.5 rounded-lg transition-all duration-200"
              style={{ color: 'hsl(215, 20%, 50%)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon name={sidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
                style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
              >
                <Icon name={item.icon} size={18} />
                {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Status */}
          <div className="px-3 py-4" style={{ borderTop: '1px solid hsla(237, 25%, 22%, 0.6)' }}>
            <div
              className={`flex items-center rounded-xl px-3 py-2.5 ${sidebarOpen ? 'gap-2.5' : 'justify-center'}`}
              style={{ background: 'hsla(82, 100%, 55%, 0.08)' }}
            >
              <div className="pulse-dot flex-shrink-0" />
              {sidebarOpen && (
                <div className="animate-fade-in text-xs" style={{ color: 'hsl(82, 100%, 60%)' }}>
                  MySQL подключён
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </TooltipProvider>
  );
}
