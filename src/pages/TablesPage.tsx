import { useState } from 'react';
import Icon from '@/components/ui/icon';

const tables = [
  { name: 'products', rows: 4821, cols: 12, size: '2.4 MB', lastSync: '5 мин назад', status: 'synced', engine: 'InnoDB' },
  { name: 'orders', rows: 12430, cols: 18, size: '8.1 MB', lastSync: '12 мин назад', status: 'synced', engine: 'InnoDB' },
  { name: 'customers', rows: 3201, cols: 9, size: '1.8 MB', lastSync: '1 час назад', status: 'warning', engine: 'InnoDB' },
  { name: 'inventory', rows: 889, cols: 7, size: '0.6 MB', lastSync: '3 часа назад', status: 'synced', engine: 'MyISAM' },
  { name: 'categories', rows: 47, cols: 5, size: '0.1 MB', lastSync: '2 дня назад', status: 'synced', engine: 'InnoDB' },
  { name: 'suppliers', rows: 234, cols: 11, size: '0.4 MB', lastSync: '1 день назад', status: 'error', engine: 'InnoDB' },
  { name: 'transactions', rows: 58920, cols: 14, size: '32 MB', lastSync: '7 мин назад', status: 'synced', engine: 'InnoDB' },
  { name: 'price_history', rows: 19231, cols: 6, size: '7.2 MB', lastSync: '2 часа назад', status: 'synced', engine: 'InnoDB' },
];

const mockData: Record<string, { headers: string[], rows: string[][] }> = {
  products: {
    headers: ['id', 'name', 'price', 'category', 'stock', 'sku'],
    rows: [
      ['1', 'Ноутбук Pro 15', '89 990 ₽', 'Электроника', '24', 'NB-PRO-001'],
      ['2', 'Мышь беспроводная', '2 490 ₽', 'Аксессуары', '156', 'MS-WL-002'],
      ['3', 'Клавиатура механич.', '7 800 ₽', 'Аксессуары', '43', 'KB-MC-003'],
      ['4', 'Монитор 27"', '34 500 ₽', 'Электроника', '12', 'MN-27-004'],
      ['5', 'Веб-камера HD', '3 290 ₽', 'Аксессуары', '89', 'WC-HD-005'],
    ],
  },
  orders: {
    headers: ['id', 'customer_id', 'total', 'status', 'created_at', 'payment'],
    rows: [
      ['10421', '342', '127 800 ₽', 'Выполнен', '2026-04-01', 'Карта'],
      ['10420', '891', '4 290 ₽', 'В доставке', '2026-04-01', 'СБП'],
      ['10419', '128', '89 990 ₽', 'Выполнен', '2026-03-31', 'Карта'],
      ['10418', '567', '18 400 ₽', 'Отменён', '2026-03-31', 'Карта'],
      ['10417', '234', '2 490 ₽', 'Выполнен', '2026-03-30', 'Наличные'],
    ],
  },
};

export default function TablesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncing(name);
    setTimeout(() => setSyncing(null), 1800);
  };

  const tableData = selected ? mockData[selected] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Таблицы</h1>
          <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>
            {tables.length} таблиц в базе данных
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn-ghost flex items-center gap-2"
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
          >
            <Icon name="Upload" size={15} />
            Импорт Excel
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Icon name="Plus" size={15} />
            Новая таблица
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Table list */}
        <div className={`${selected ? 'xl:col-span-2' : 'xl:col-span-5'}`}>
          <div className="glass rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
            <div
              className="grid text-xs font-semibold px-5 py-3"
              style={{
                color: 'hsl(215,20%,50%)',
                borderBottom: '1px solid hsla(237,25%,22%,0.4)',
                gridTemplateColumns: selected ? '1fr auto' : '2fr 1fr 1fr 1fr 1fr auto',
              }}
            >
              <span>Таблица</span>
              {!selected && <>
                <span>Строк</span>
                <span>Размер</span>
                <span>Синхронизация</span>
                <span>Статус</span>
              </>}
              <span></span>
            </div>
            {tables.map((t, i) => (
              <div
                key={t.name}
                onClick={() => setSelected(selected === t.name ? null : t.name)}
                className={`table-row-hover cursor-pointer animate-fade-in-up stagger-${Math.min(i + 2, 6)} ${selected === t.name ? '' : ''}`}
                style={{
                  borderBottom: i < tables.length - 1 ? '1px solid hsla(237,25%,22%,0.3)' : 'none',
                  background: selected === t.name ? 'hsla(82,100%,55%,0.06)' : undefined,
                  display: 'grid',
                  gridTemplateColumns: selected ? '1fr auto' : '2fr 1fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  padding: '12px 20px',
                  gap: '12px',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: selected === t.name ? 'hsla(82,100%,55%,0.15)' : 'hsla(237,25%,20%,0.8)' }}
                  >
                    <Icon name="Table2" size={13} style={{ color: selected === t.name ? 'hsl(82,100%,55%)' : 'hsl(215,20%,55%)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono font-medium truncate" style={{ color: selected === t.name ? 'hsl(82,100%,60%)' : 'hsl(210,40%,90%)' }}>
                      {t.name}
                    </div>
                    {!selected && <div className="text-xs" style={{ color: 'hsl(215,20%,45%)' }}>{t.cols} столбцов · {t.engine}</div>}
                  </div>
                </div>
                {!selected && <>
                  <div className="text-sm font-mono" style={{ color: 'hsl(210,40%,80%)' }}>{t.rows.toLocaleString('ru')}</div>
                  <div className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>{t.size}</div>
                  <div className="text-xs" style={{ color: 'hsl(215,20%,50%)' }}>{t.lastSync}</div>
                  <div>
                    {t.status === 'synced' && <span className="badge-sync"><Icon name="Check" size={10} />Синхр.</span>}
                    {t.status === 'warning' && <span className="badge-warning"><Icon name="AlertCircle" size={10} />Задержка</span>}
                    {t.status === 'error' && <span className="badge-error"><Icon name="X" size={10} />Ошибка</span>}
                  </div>
                </>}
                <button
                  onClick={e => handleSync(t.name, e)}
                  className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
                  style={{ color: 'hsl(215,20%,50%)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'hsla(82,100%,55%,0.1)';
                    e.currentTarget.style.color = 'hsl(82,100%,55%)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'hsl(215,20%,50%)';
                  }}
                >
                  <Icon
                    name="RefreshCw"
                    size={14}
                    style={{ animation: syncing === t.name ? 'spin 1s linear infinite' : 'none' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Table preview */}
        {selected && (
          <div className="xl:col-span-3 animate-scale-in">
            <div className="glass rounded-2xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid hsla(237,25%,22%,0.4)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="Table2" size={16} style={{ color: 'hsl(82,100%,55%)' }} />
                  <span className="font-mono font-semibold text-sm" style={{ color: 'hsl(82,100%,60%)' }}>{selected}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-xs py-1.5 flex items-center gap-1.5">
                    <Icon name="Download" size={13} />
                    Экспорт
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: 'hsl(215,20%,50%)' }}
                  >
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </div>
              {tableData ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid hsla(237,25%,22%,0.4)', background: 'hsla(237,28%,14%,0.5)' }}>
                        {tableData.headers.map(h => (
                          <th key={h} className="text-left px-4 py-3 font-mono font-semibold" style={{ color: 'hsl(215,20%,55%)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="table-row-hover"
                          style={{ borderBottom: i < tableData.rows.length - 1 ? '1px solid hsla(237,25%,22%,0.25)' : 'none' }}
                        >
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 font-mono" style={{ color: j === 0 ? 'hsl(215,20%,55%)' : 'hsl(210,40%,86%)' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 text-xs" style={{ color: 'hsl(215,20%,45%)', borderTop: '1px solid hsla(237,25%,22%,0.3)' }}>
                    Показано 5 из {tables.find(t => t.name === selected)?.rows.toLocaleString('ru')} строк
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-sm" style={{ color: 'hsl(215,20%,50%)' }}>
                  Предпросмотр недоступен
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
