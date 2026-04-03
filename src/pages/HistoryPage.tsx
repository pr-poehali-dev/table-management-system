import { useState } from 'react';
import Icon from '@/components/ui/icon';

const events = [
  { id: 1, type: 'sync', table: 'products', desc: 'Синхронизация завершена', detail: '+12 записей, обновлено 34', time: '14:22', date: 'Сегодня', user: 'Система', status: 'success' },
  { id: 2, type: 'import', table: 'orders', desc: 'Импорт из Excel', detail: 'products_april.xlsx · 4 821 строк', time: '13:47', date: 'Сегодня', user: 'Администратор', status: 'success' },
  { id: 3, type: 'error', table: 'suppliers', desc: 'Ошибка синхронизации', detail: 'Connection timeout: MySQL server gone away', time: '12:10', date: 'Сегодня', user: 'Система', status: 'error' },
  { id: 4, type: 'edit', table: 'customers', desc: 'Изменение записи', detail: 'ID 342: email обновлён', time: '11:33', date: 'Сегодня', user: 'Менеджер', status: 'success' },
  { id: 5, type: 'sync', table: 'inventory', desc: 'Синхронизация завершена', detail: 'Без изменений', time: '10:00', date: 'Сегодня', user: 'Система', status: 'success' },
  { id: 6, type: 'import', table: 'products', desc: 'Импорт из Excel', detail: 'catalog_v2.xlsx · 3 200 строк', time: '18:30', date: 'Вчера', user: 'Администратор', status: 'success' },
  { id: 7, type: 'delete', table: 'orders', desc: 'Удаление записей', detail: '47 устаревших заказов удалено', time: '16:15', date: 'Вчера', user: 'Администратор', status: 'warning' },
  { id: 8, type: 'sync', table: 'transactions', desc: 'Синхронизация завершена', detail: '+892 новых транзакции', time: '14:00', date: 'Вчера', user: 'Система', status: 'success' },
  { id: 9, type: 'error', table: 'categories', desc: 'Ошибка валидации', detail: 'Дубликат ключа в столбце "slug"', time: '11:20', date: 'Вчера', user: 'Система', status: 'error' },
  { id: 10, type: 'import', table: 'customers', desc: 'Импорт из Excel', detail: 'clients_export.xlsx · 280 строк', time: '09:45', date: '2 дня назад', user: 'Менеджер', status: 'success' },
];

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  sync: { icon: 'RefreshCw', color: 'hsl(82,100%,55%)', bg: 'hsla(82,100%,55%,0.12)' },
  import: { icon: 'Upload', color: 'hsl(185,90%,55%)', bg: 'hsla(185,90%,55%,0.12)' },
  error: { icon: 'AlertCircle', color: 'hsl(0,72%,60%)', bg: 'hsla(0,72%,55%,0.12)' },
  edit: { icon: 'Pencil', color: 'hsl(265,80%,65%)', bg: 'hsla(265,80%,65%,0.12)' },
  delete: { icon: 'Trash2', color: 'hsl(40,100%,60%)', bg: 'hsla(40,100%,60%,0.12)' },
};

export default function HistoryPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const grouped = events
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = [];
      acc[e.date].push(e);
      return acc;
    }, {} as Record<string, typeof events>);

  const typeFilters = [
    { id: 'all', label: 'Все события' },
    { id: 'sync', label: 'Синхронизации' },
    { id: 'import', label: 'Импорты' },
    { id: 'error', label: 'Ошибки' },
    { id: 'edit', label: 'Изменения' },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>История изменений</h1>
          <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>
            Все операции с базой данных
          </p>
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <Icon name="Download" size={14} />
          Экспорт
        </button>
      </div>

      {/* Filters */}
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

      {/* Timeline */}
      <div className="animate-fade-in-up stagger-2">
        {Object.entries(grouped).map(([date, items], gi) => (
          <div key={date} className="mb-8">
            <div
              className="flex items-center gap-3 mb-4"
            >
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'hsla(237,25%,18%,0.8)', color: 'hsl(215,20%,60%)' }}>
                {date}
              </div>
              <div className="flex-1 h-px" style={{ background: 'hsla(237,25%,22%,0.4)' }} />
              <div className="text-xs" style={{ color: 'hsl(215,20%,45%)' }}>{items.length} событий</div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-5 top-0 bottom-0 w-px"
                style={{ background: 'hsla(237,25%,22%,0.5)' }}
              />

              <div className="flex flex-col gap-2">
                {items.map((e, i) => {
                  const cfg = typeConfig[e.type] || typeConfig.sync;
                  const isExpanded = expanded === e.id;
                  return (
                    <div
                      key={e.id}
                      className="relative pl-14 animate-fade-in-up"
                      style={{ animationDelay: `${(gi * 3 + i) * 0.05}s` }}
                    >
                      {/* Icon */}
                      <div
                        className="absolute left-0 top-3 w-10 h-10 rounded-xl flex items-center justify-center z-10"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      >
                        <Icon name={cfg.icon} size={16} style={{ color: cfg.color }} />
                      </div>

                      <div
                        className="glass rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
                        onClick={() => setExpanded(isExpanded ? null : e.id)}
                        style={{
                          borderColor: isExpanded ? `${cfg.color}30` : undefined,
                          background: isExpanded ? `${cfg.bg}` : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium" style={{ color: 'hsl(210,40%,90%)' }}>{e.desc}</span>
                              {e.status === 'error' && (
                                <span className="badge-error py-0.5 text-xs">Ошибка</span>
                              )}
                              {e.status === 'warning' && (
                                <span className="badge-warning py-0.5 text-xs">Внимание</span>
                              )}
                            </div>
                            <div className="text-xs truncate" style={{ color: 'hsl(215,20%,50%)' }}>
                              {e.detail}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-mono" style={{ color: 'hsl(215,20%,55%)' }}>{e.time}</div>
                              <div
                                className="text-xs font-mono px-2 py-0.5 rounded-md mt-0.5"
                                style={{ background: 'hsla(237,25%,20%,0.7)', color: cfg.color }}
                              >
                                {e.table}
                              </div>
                            </div>
                            <Icon
                              name="ChevronDown"
                              size={14}
                              style={{
                                color: 'hsl(215,20%,45%)',
                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div
                            className="mt-3 pt-3 animate-fade-in"
                            style={{ borderTop: '1px solid hsla(237,25%,22%,0.4)' }}
                          >
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Пользователь</div>
                                <div style={{ color: 'hsl(210,40%,85%)' }}>{e.user}</div>
                              </div>
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Таблица</div>
                                <div className="font-mono" style={{ color: cfg.color }}>{e.table}</div>
                              </div>
                              <div>
                                <div style={{ color: 'hsl(215,20%,45%)' }} className="mb-1">Время</div>
                                <div style={{ color: 'hsl(210,40%,85%)' }}>{e.date}, {e.time}</div>
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
