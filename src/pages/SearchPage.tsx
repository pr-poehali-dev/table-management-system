import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { getTables, getColumns, getRows, type DsTable, type DsColumn, type DsRow } from '@/lib/api';

interface FlatRow {
  tableId: number;
  tableName: string;
  rowId: number;
  rowIndex: number;
  columns: DsColumn[];
  data: Record<string, string>;
  preview: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState<FlatRow[]>([]);
  const [activeFilter, setActiveFilter] = useState('Все таблицы');
  const [tableNames, setTableNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const tables = await getTables();
      setTableNames(tables.map(t => t.name));
      const flat: FlatRow[] = [];
      for (const t of tables) {
        const [cols, rows] = await Promise.all([getColumns(t.id), getRows(t.id)]);
        rows.forEach((row, idx) => {
          flat.push({
            tableId: t.id,
            tableName: t.name,
            rowId: row.id,
            rowIndex: idx + 1,
            columns: cols,
            data: row.data,
            preview: Object.values(row.data).filter(Boolean).slice(0, 3).join(' · '),
          });
        });
      }
      setAllRows(flat);
      setLoading(false);
    };
    load();
  }, []);

  const results = allRows.filter(r => {
    const matchFilter = activeFilter === 'Все таблицы' || r.tableName === activeFilter;
    if (!matchFilter) return false;
    if (!query || query.length < 2) return true;
    const q = query.toLowerCase();
    return Object.values(r.data).some(v => v?.toLowerCase().includes(q));
  }).slice(0, 50);

  const highlight = (text: string) => {
    if (!query || query.length < 2) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part)
            ? <mark key={i} style={{ background: 'hsla(82,100%,55%,0.25)', color: 'hsl(82,100%,65%)', borderRadius: '3px', padding: '0 2px' }}>{part}</mark>
            : part
        )}
      </>
    );
  };

  const tableColors: Record<string, string> = {};
  const palette = ['hsl(82,100%,55%)', 'hsl(185,90%,55%)', 'hsl(265,80%,65%)', 'hsl(40,100%,60%)', 'hsl(320,80%,65%)', 'hsl(30,100%,60%)'];
  tableNames.forEach((n, i) => { tableColors[n] = palette[i % palette.length]; });

  const filters = ['Все таблицы', ...tableNames];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Поиск и фильтрация</h1>
        <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>Поиск по всем таблицам базы данных</p>
      </div>

      {/* Search box */}
      <div className="relative mb-5 animate-fade-in-up stagger-1">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200"
          style={{
            background: 'hsla(237,30%,13%,0.8)',
            border: focused ? '1px solid hsla(82,100%,55%,0.5)' : '1px solid hsla(237,25%,22%,0.6)',
            boxShadow: focused ? '0 0 0 3px hsla(82,100%,55%,0.08)' : 'none',
          }}
        >
          <Icon name={loading ? 'Loader2' : 'Search'} size={18} style={{ color: focused ? 'hsl(82,100%,55%)' : 'hsl(215,20%,45%)', flexShrink: 0, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={loading ? 'Загружаем данные...' : 'Начните вводить запрос...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'hsl(210,40%,92%)', caretColor: 'hsl(82,100%,55%)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg" style={{ color: 'hsl(215,20%,50%)' }}>
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in-up stagger-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background: activeFilter === f ? 'hsla(82,100%,55%,0.15)' : 'hsla(237,25%,16%,0.6)',
              color: activeFilter === f ? 'hsl(82,100%,60%)' : 'hsl(215,20%,55%)',
              border: activeFilter === f ? '1px solid hsla(82,100%,55%,0.3)' : '1px solid hsla(237,25%,22%,0.4)',
            }}
          >
            {f !== 'Все таблицы' && (
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: tableColors[f], boxShadow: `0 0 4px ${tableColors[f]}` }} />
            )}
            {f}
          </button>
        ))}
      </div>

      {/* Count */}
      {query.length >= 2 && !loading && (
        <div className="text-xs mb-4 animate-fade-in" style={{ color: 'hsl(215,20%,50%)' }}>
          Найдено: <span style={{ color: 'hsl(82,100%,60%)' }}>{results.length}</span> строк
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-2 animate-fade-in-up stagger-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="skeleton w-2 h-8 rounded-full" />
              <div className="flex-1"><div className="skeleton h-4 w-48 mb-2" /><div className="skeleton h-3 w-64" /></div>
            </div>
          ))
        ) : results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} style={{ color: 'hsl(215,20%,35%)', margin: '0 auto 12px' }} />
            <div className="text-sm" style={{ color: 'hsl(215,20%,50%)' }}>
              {query.length < 2 ? 'Введите минимум 2 символа для поиска' : 'Ничего не найдено'}
            </div>
          </div>
        ) : results.map((r, i) => (
          <div
            key={`${r.tableId}-${r.rowId}`}
            className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: tableColors[r.tableName] || 'hsl(82,100%,55%)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium mb-0.5" style={{ color: 'hsl(210,40%,90%)' }}>
                {highlight(r.preview || 'Пустая строка')}
              </div>
              <div className="text-xs flex gap-3">
                {r.columns.slice(0, 4).map(c => (
                  <span key={c.id} style={{ color: 'hsl(215,20%,50%)' }}>
                    <span className="font-mono" style={{ color: 'hsl(215,20%,40%)' }}>{c.name}:</span>{' '}
                    {highlight(r.data[c.name] || '—')}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
                style={{ background: 'hsla(237,25%,20%,0.6)', color: tableColors[r.tableName] || 'hsl(82,100%,55%)' }}
              >
                {r.tableName}
              </div>
              <div className="text-xs font-mono" style={{ color: 'hsl(215,20%,40%)' }}>#{r.rowId}</div>
              <Icon name="ChevronRight" size={15} style={{ color: 'hsl(215,20%,40%)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
