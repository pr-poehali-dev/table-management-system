import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { getHistory, type DsEvent } from '@/lib/api';

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  import: { icon: 'Upload', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.12)' },
  sync: { icon: 'RefreshCw', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.12)' },
  create: { icon: 'Plus', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.12)' },
  edit: { icon: 'Pencil', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.12)' },
  add_row: { icon: 'RowsIcon', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.12)' },
  delete: { icon: 'Trash2', color: 'hsl(0,72%,60%)', bg: 'hsla(0,72%,55%,0.12)' },
  error: { icon: 'AlertCircle', color: 'hsl(0,72%,60%)', bg: 'hsla(0,72%,55%,0.12)' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  return `${diffDays} дн. назад`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const [events, setEvents] = useState<DsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const loadHistory = async (filter = '') => {
    setLoading(true);
    const data = await getHistory(filter === 'all' ? '' : filter);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { loadHistory(typeFilter); }, [typeFilter]);

  const typeFilters = [
    { id: 'all', label: 'Все события' },
    { id: 'import', label: 'Импорты' },
    { id: 'create', label: 'Создание' },
    { id: 'edit', label: 'Изменения' },
    { id: 'add_row', label: 'Строки' },
    { id: 'delete', label: 'Удаление' },
  ];

  const grouped = events.reduce((acc, e) => {
    const date = formatDate(e.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {} as Record<string, DsEvent[]>);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>История изменений</h1>
          <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>Все операции с базой данных</p>
        </div>
        <button onClick={() => loadHistory(typeFilter)} className="btn-ghost flex items-center gap-2">
          <Icon name="RefreshCw" size={14} />
          Обновить
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in-up stagger-1">
        {typeFilters.map(f => (
          <button
            key={f.id}
            onClick={() => setTypeFilter(f.id)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background: typeFilter === f.id ? 'hsla(82,100%,55%,0.15)' : 'hsla(237,25%,16%,0.6)',
              color: typeFilter === f.id ? 'hsl(82,100%,60%)' : 'hsl(215,20%,55%)',
              border: typeFilter === f.id ? '1px solid hsla(82,100%,55%,0.3)' : '1px solid hsla(237,25%,22%,0.4)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-3">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0 mt-1" />
              <div className="flex-1"><div className="skeleton h-4 w-48 mb-2" /><div className="skeleton h-3 w-64" /></div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Icon name="History" size={32} style={{ color: 'hsl(215,20%,30%)', margin: '0 auto 12px' }} />
            <div className="text-sm" style={{ color: 'hsl(215,20%,50%)' }}>История пуста</div>
          </div>
        ) : Object.entries(grouped).map(([date, items], gi) => (
          <div key={date} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'hsla(237,25%,18%,0.8)', color: 'hsl(215,20%,60%)' }}>
                {date}
              </div>
              <div className="flex-1 h-px" style={{ background: 'hsla(237,25%,22%,0.4)' }} />
              <div className="text-xs" style={{ color: 'hsl(215,20%,45%)' }}>{items.length} событий</div>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'hsla(237,25%,22%,0.5)' }} />
              <div className="flex flex-col gap-2">
                {items.map((e, i) => {
                  const cfg = typeConfig[e.action] || typeConfig.sync;
                  const isExp = expanded === e.id;
                  return (
                    <div key={e.id} className="relative pl-14 animate-fade-in-up" style={{ animationDelay: `${(gi * 5 + i) * 0.04}s` }}>
                      <div
                        className="absolute left-0 top-3 w-10 h-10 rounded-xl flex items-center justify-center z-10"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      >
                        <Icon name={cfg.icon} size={16} style={{ color: cfg.color }} fallback="Activity" />
                      </div>
                      <div
                        className="glass rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
                        onClick={() => setExpanded(isExp ? null : e.id)}
                        style={{ background: isExp ? cfg.bg : undefined }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium mb-0.5" style={{ color: 'hsl(210,40%,90%)' }}>{e.description}</div>
                            <div className="text-xs truncate" style={{ color: 'hsl(215,20%,50%)' }}>{e.detail}</div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-mono" style={{ color: 'hsl(215,20%,55%)' }}>{formatTime(e.created_at)}</div>
                              {e.table_name && (
                                <div className="text-xs font-mono px-2 py-0.5 rounded-md mt-0.5 inline-block" style={{ background: 'hsla(237,25%,20%,0.7)', color: cfg.color }}>
                                  {e.table_name}
                                </div>
                              )}
                            </div>
                            <Icon name="ChevronDown" size={14} style={{ color: 'hsl(215,20%,45%)', transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {isExp && (
                          <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid hsla(237,25%,22%,0.4)' }}>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Пользователь</div>
                                <div style={{ color: 'hsl(210,40%,85%)' }}>{e.user_name}</div>
                              </div>
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Таблица</div>
                                <div className="font-mono" style={{ color: cfg.color }}>{e.table_name || '—'}</div>
                              </div>
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Время</div>
                                <div style={{ color: 'hsl(210,40%,85%)' }}>{date}, {formatTime(e.created_at)}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
