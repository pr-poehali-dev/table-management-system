import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { getTables, importExcel, type DsTable } from '@/lib/api';

type Page = 'home' | 'tables' | 'search' | 'history' | 'settings';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: Props) {
  const [tables, setTables] = useState<DsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState<{ name: string; rows: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTables().then(data => { setTables(data); setLoading(false); });
  }, []);

  const totalRows = tables.reduce((s, t) => s + t.row_count, 0);

  const stats = [
    { label: 'Таблиц', value: loading ? '...' : String(tables.length), icon: 'Table2', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.1)' },
    { label: 'Записей всего', value: loading ? '...' : totalRows.toLocaleString('ru'), icon: 'Rows3', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.1)' },
    { label: 'База данных', value: 'PostgreSQL', icon: 'Database', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.1)' },
    { label: 'Статус', value: 'Активна', icon: 'Activity', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.1)' },
  ];

  const runImport = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadDone(null);
    const fakeP = setInterval(() => setUploadProgress(p => Math.min(p + 18, 85)), 350);
    const result = await importExcel(file, '', 'replace');
    clearInterval(fakeP);
    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      if (result.ok) {
        setUploadDone({ name: result.table_name, rows: result.inserted });
        getTables().then(setTables);
      }
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) runImport(file);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="pulse-dot" />
          <span className="text-xs" style={{ color: 'hsl(82,100%,60%)' }}>Система активна</span>
        </div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Панель управления</h1>
        <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>Управление таблицами с поддержкой Excel-импорта</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
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
          <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(210,40%,80%)' }}>Загрузить Excel</div>
          <div
            className={`drag-zone rounded-2xl p-8 text-center cursor-pointer ${dragOver ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) runImport(e.target.files[0]); }}
            />

            {uploading ? (
              <div className="animate-fade-in">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(82,100%,55%,0.1)' }}>
                  <Icon name="Loader2" size={28} style={{ color: 'hsl(82,100%,55%)', animation: 'spin 1s linear infinite' }} />
                </div>
                <div className="text-sm font-medium mb-3" style={{ color: 'hsl(210,40%,90%)' }}>Загружаем файл...</div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="text-xs font-mono" style={{ color: 'hsl(82,100%,60%)' }}>{Math.round(uploadProgress)}%</div>
              </div>
            ) : uploadDone ? (
              <div className="animate-scale-in">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(82,100%,55%,0.15)' }}>
                  <Icon name="CheckCircle2" size={28} style={{ color: 'hsl(82,100%,55%)' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: 'hsl(82,100%,60%)' }}>Готово!</div>
                <div className="text-xs mb-3" style={{ color: 'hsl(215,20%,50%)' }}>
                  <span className="font-mono">{uploadDone.name}</span> · {uploadDone.rows.toLocaleString('ru')} строк
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onNavigate('tables'); }}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'hsla(82,100%,55%,0.1)', color: 'hsl(82,100%,55%)' }}
                >
                  Открыть таблицу →
                </button>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(237,25%,20%,0.8)' }}>
                  <Icon name="Upload" size={28} style={{ color: dragOver ? 'hsl(82,100%,55%)' : 'hsl(215,20%,50%)' }} />
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: 'hsl(210,40%,80%)' }}>Перетащите .xlsx файл</div>
                <div className="text-xs mb-4" style={{ color: 'hsl(215,20%,45%)' }}>или нажмите для выбора</div>
                <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsla(82,100%,55%,0.08)', color: 'hsl(82,100%,60%)' }}>
                  <Icon name="FileSpreadsheet" size={13} />
                  .xlsx, .xls
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent tables */}
        <div className="lg:col-span-3 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: 'hsl(210,40%,80%)' }}>Таблицы</div>
            <button onClick={() => onNavigate('tables')} className="text-xs flex items-center gap-1" style={{ color: 'hsl(82,100%,55%)' }}>
              Все таблицы <Icon name="ChevronRight" size={14} />
            </button>
          </div>

          {loading ? (
            <div className="glass rounded-2xl p-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="flex-1"><div className="skeleton h-3 w-32 mb-1.5" /><div className="skeleton h-2 w-20" /></div>
                </div>
              ))}
            </div>
          ) : tables.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Icon name="Table2" size={28} style={{ color: 'hsl(215,20%,35%)', margin: '0 auto 10px' }} />
              <div className="text-sm mb-3" style={{ color: 'hsl(215,20%,50%)' }}>Нет таблиц</div>
              <button onClick={() => onNavigate('tables')} className="btn-primary text-xs">Создать таблицу</button>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              {tables.slice(0, 5).map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => onNavigate('tables')}
                  className="flex items-center gap-4 px-5 py-3.5 table-row-hover cursor-pointer"
                  style={{ borderBottom: i < Math.min(tables.length, 5) - 1 ? '1px solid hsla(237,25%,22%,0.4)' : 'none' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsla(237,25%,20%,0.8)' }}>
                    <Icon name="Table2" size={15} style={{ color: 'hsl(215,20%,55%)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono font-medium truncate" style={{ color: 'hsl(210,40%,90%)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>{t.row_count.toLocaleString('ru')} строк · {t.col_count} столбцов</div>
                  </div>
                  <div className="text-right">
                    <span className="badge-sync"><Icon name="Check" size={10} />Активна</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 animate-fade-in-up stagger-5">
        <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(210,40%,80%)' }}>Быстрые действия</div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Все таблицы', icon: 'Table2', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.1)', nav: 'tables' as Page },
            { label: 'Поиск по данным', icon: 'Search', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.1)', nav: 'search' as Page },
            { label: 'История изменений', icon: 'History', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.1)', nav: 'history' as Page },
            { label: 'Настройки', icon: 'Settings2', color: 'hsl(40,100%,60%)', bg: 'hsla(40,100%,60%,0.1)', nav: 'settings' as Page },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.nav)}
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
