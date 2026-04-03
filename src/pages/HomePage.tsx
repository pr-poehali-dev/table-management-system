import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'tables' | 'search' | 'history' | 'settings';

interface Props {
  onNavigate: (page: Page) => void;
}

const stats = [
  { label: 'Таблиц', value: '12', icon: 'Table2', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.1)' },
  { label: 'Записей всего', value: '84 291', icon: 'Rows3', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.1)' },
  { label: 'Синхронизаций', value: '347', icon: 'RefreshCw', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.1)' },
  { label: 'Последняя синхр.', value: '2 мин назад', icon: 'Clock', color: 'hsl(40,100%,60%)', bg: 'hsla(40,100%,60%,0.1)' },
];

const recentTables = [
  { name: 'products', rows: 4821, updated: '5 мин назад', status: 'synced' },
  { name: 'orders', rows: 12430, updated: '12 мин назад', status: 'synced' },
  { name: 'customers', rows: 3201, updated: '1 час назад', status: 'warning' },
  { name: 'inventory', rows: 889, updated: '3 часа назад', status: 'synced' },
];

export default function HomePage({ onNavigate }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadDone(false);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setUploadDone(true);
        }, 400);
      }
      setUploadProgress(Math.min(p, 100));
    }, 180);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    simulateUpload();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="pulse-dot" />
          <span className="text-xs" style={{ color: 'hsl(82,100%,60%)' }}>Система активна</span>
        </div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>
          Панель управления
        </h1>
        <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>
          Синхронизация Excel → MySQL в реальном времени
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card animate-fade-in-up stagger-${i + 1}`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg }}
            >
              <Icon name={s.icon} size={20} style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload zone */}
        <div className="lg:col-span-2 animate-fade-in-up stagger-3">
          <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(210,40%,80%)' }}>
            Загрузить Excel
          </div>
          <div
            className={`drag-zone rounded-2xl p-8 text-center cursor-pointer ${dragOver ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={simulateUpload}
          >
            {uploading ? (
              <div className="animate-fade-in">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'hsla(82,100%,55%,0.1)' }}
                >
                  <Icon name="Loader2" size={28} style={{ color: 'hsl(82,100%,55%)', animation: 'spin 1s linear infinite' }} />
                </div>
                <div className="text-sm font-medium mb-3" style={{ color: 'hsl(210,40%,90%)' }}>
                  Загружаем файл...
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="text-xs font-mono" style={{ color: 'hsl(82,100%,60%)' }}>
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            ) : uploadDone ? (
              <div className="animate-scale-in">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'hsla(82,100%,55%,0.15)' }}
                >
                  <Icon name="CheckCircle2" size={28} style={{ color: 'hsl(82,100%,55%)' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: 'hsl(82,100%,60%)' }}>
                  Синхронизировано!
                </div>
                <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>4 821 строк импортировано</div>
              </div>
            ) : (
              <div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200"
                  style={{ background: 'hsla(237,25%,20%,0.8)' }}
                >
                  <Icon name="Upload" size={28} style={{ color: dragOver ? 'hsl(82,100%,55%)' : 'hsl(215,20%,50%)' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: 'hsl(210,40%,80%)' }}>
                  Перетащите .xlsx файл
                </div>
                <div className="text-xs mb-4" style={{ color: 'hsl(215,20%,45%)' }}>
                  или нажмите для выбора
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsla(82,100%,55%,0.08)', color: 'hsl(82,100%,60%)' }}>
                  <Icon name="FileSpreadsheet" size={13} />
                  .xlsx, .xls, .csv
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent tables */}
        <div className="lg:col-span-3 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: 'hsl(210,40%,80%)' }}>
              Последние таблицы
            </div>
            <button
              onClick={() => onNavigate('tables')}
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: 'hsl(82,100%,55%)' }}
            >
              Все таблицы
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {recentTables.map((t, i) => (
              <div
                key={t.name}
                className="flex items-center gap-4 px-5 py-3.5 table-row-hover"
                style={{
                  borderBottom: i < recentTables.length - 1 ? '1px solid hsla(237,25%,22%,0.4)' : 'none',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsla(237,25%,20%,0.8)' }}
                >
                  <Icon name="Table2" size={15} style={{ color: 'hsl(215,20%,55%)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-medium truncate" style={{ color: 'hsl(210,40%,90%)' }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>
                    {t.rows.toLocaleString('ru')} строк
                  </div>
                </div>
                <div className="text-right">
                  <div className={t.status === 'synced' ? 'badge-sync' : 'badge-warning'}>
                    <Icon name={t.status === 'synced' ? 'CheckCircle2' : 'AlertCircle'} size={11} />
                    {t.status === 'synced' ? 'Синхр.' : 'Задержка'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'hsl(215,20%,45%)' }}>{t.updated}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 animate-fade-in-up stagger-5">
        <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(210,40%,80%)' }}>Быстрые действия</div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Синхронизировать всё', icon: 'RefreshCw', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.1)' },
            { label: 'Экспорт в Excel', icon: 'Download', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.1)' },
            { label: 'Добавить таблицу', icon: 'Plus', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.1)', action: () => onNavigate('tables') },
            { label: 'Посмотреть историю', icon: 'History', color: 'hsl(40,100%,60%)', bg: 'hsla(40,100%,60%,0.1)', action: () => onNavigate('history') },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 glass glass-hover"
              style={{ color: a.color }}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: a.bg }}>
                <Icon name={a.icon} size={13} style={{ color: a.color }} />
              </div>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
