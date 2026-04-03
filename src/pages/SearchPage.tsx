import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

const allData = [
  { table: 'products', id: 1, field: 'name', value: 'Ноутбук Pro 15', extra: '89 990 ₽ · Электроника' },
  { table: 'products', id: 2, field: 'name', value: 'Мышь беспроводная', extra: '2 490 ₽ · Аксессуары' },
  { table: 'products', id: 3, field: 'sku', value: 'NB-PRO-001', extra: 'Ноутбук Pro 15' },
  { table: 'orders', id: 10421, field: 'status', value: 'Выполнен', extra: '127 800 ₽ · 01.04.2026' },
  { table: 'orders', id: 10418, field: 'status', value: 'Отменён', extra: '18 400 ₽ · 31.03.2026' },
  { table: 'customers', id: 342, field: 'name', value: 'Иванов Пётр', extra: 'ivan@mail.ru · 8 заказов' },
  { table: 'customers', id: 891, field: 'name', value: 'Смирнова Анна', extra: 'anna@bk.ru · 3 заказа' },
  { table: 'suppliers', id: 12, field: 'company', value: 'ООО "Техно-Опт"', extra: 'techno-opt.ru' },
  { table: 'inventory', id: 5, field: 'location', value: 'Склад А-12', extra: '889 единиц' },
  { table: 'categories', id: 3, field: 'name', value: 'Электроника', extra: '4 подкатегории' },
];

const filters = ['Все таблицы', 'products', 'orders', 'customers', 'suppliers', 'inventory'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все таблицы');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = allData.filter(d => {
    const matchQuery = query.length < 2 || d.value.toLowerCase().includes(query.toLowerCase()) || d.extra.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === 'Все таблицы' || d.table === activeFilter;
    return matchQuery && matchFilter;
  });

  const highlight = (text: string) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: 'hsla(82,100%,55%,0.25)', color: 'hsl(82,100%,65%)', borderRadius: '3px', padding: '0 2px' }}>{part}</mark>
        : part
    );
  };

  const tableColors: Record<string, string> = {
    products: 'hsl(82,100%,55%)',
    orders: 'hsl(185,90%,55%)',
    customers: 'hsl(265,80%,65%)',
    suppliers: 'hsl(40,100%,60%)',
    inventory: 'hsl(320,80%,65%)',
    categories: 'hsl(30,100%,60%)',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Поиск и фильтрация</h1>
        <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>
          Поиск по всем таблицам базы данных
        </p>
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
          <Icon name="Search" size={18} style={{ color: focused ? 'hsl(82,100%,55%)' : 'hsl(215,20%,45%)', flexShrink: 0, transition: 'color 0.2s' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Начните вводить запрос..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'hsl(210,40%,92%)', caretColor: 'hsl(82,100%,55%)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg transition-all" style={{ color: 'hsl(215,20%,50%)' }}>
              <Icon name="X" size={14} />
            </button>
          )}
          <div
            className="px-2 py-1 rounded-md text-xs font-mono"
            style={{ background: 'hsla(237,25%,20%,0.8)', color: 'hsl(215,20%,50%)' }}
          >
            Ctrl+K
          </div>
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
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: tableColors[f] || 'hsl(82,100%,55%)', boxShadow: `0 0 4px ${tableColors[f] || 'hsl(82,100%,55%)'}` }}
              />
            )}
            {f}
          </button>
        ))}
      </div>

      {/* Results count */}
      {query.length >= 2 && (
        <div className="text-xs mb-4 animate-fade-in" style={{ color: 'hsl(215,20%,50%)' }}>
          Найдено результатов: <span style={{ color: 'hsl(82,100%,60%)' }}>{results.length}</span>
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-2 animate-fade-in-up stagger-3">
        {results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} style={{ color: 'hsl(215,20%,35%)', margin: '0 auto 12px' }} />
            <div className="text-sm" style={{ color: 'hsl(215,20%,50%)' }}>Ничего не найдено</div>
          </div>
        ) : results.map((r, i) => (
          <div
            key={`${r.table}-${r.id}-${i}`}
            className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div
              className="w-2 h-8 rounded-full flex-shrink-0"
              style={{ background: tableColors[r.table] || 'hsl(82,100%,55%)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium mb-0.5" style={{ color: 'hsl(210,40%,90%)' }}>
                {highlight(r.value)}
              </div>
              <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>
                {highlight(r.extra)}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
                  style={{ background: 'hsla(237,25%,20%,0.6)', color: tableColors[r.table] || 'hsl(82,100%,55%)' }}
                >
                  {r.table}
                </div>
              </div>
              <div className="text-xs font-mono" style={{ color: 'hsl(215,20%,40%)' }}>
                #{r.id}
              </div>
              <Icon name="ChevronRight" size={15} style={{ color: 'hsl(215,20%,40%)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
