import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import {
  getTables, getColumns, getRows,
  createTable, addRow, updateRow, deleteRow, deleteTable, addColumn,
  importExcel,
  type DsTable, type DsColumn, type DsRow,
} from '@/lib/api';

type Modal = 'none' | 'create-table' | 'add-row' | 'edit-row' | 'add-column' | 'import';

export default function TablesPage() {
  const [tables, setTables] = useState<DsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DsTable | null>(null);
  const [columns, setColumns] = useState<DsColumn[]>([]);
  const [rows, setRows] = useState<DsRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [modal, setModal] = useState<Modal>('none');
  const [editingRow, setEditingRow] = useState<DsRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const fileRef = useRef<HTMLInputElement>(null);

  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [newCols, setNewCols] = useState([{ name: '', col_type: 'text' }]);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('text');
  const [rowForm, setRowForm] = useState<Record<string, string>>({});

  const loadTables = async () => {
    setLoading(true);
    const data = await getTables();
    setTables(data);
    setLoading(false);
  };

  useEffect(() => { loadTables(); }, []);

  const selectTable = async (t: DsTable) => {
    setSelected(t);
    setLoadingRows(true);
    const [cols, r] = await Promise.all([getColumns(t.id), getRows(t.id)]);
    setColumns(cols);
    setRows(r);
    setLoadingRows(false);
  };

  const openAddRow = () => {
    const empty: Record<string, string> = {};
    columns.forEach(c => { empty[c.name] = ''; });
    setRowForm(empty);
    setEditingRow(null);
    setModal('add-row');
  };

  const openEditRow = (row: DsRow) => {
    setRowForm({ ...row.data });
    setEditingRow(row);
    setModal('edit-row');
  };

  const saveRow = async () => {
    if (!selected) return;
    setSaving(true);
    if (editingRow) {
      await updateRow(editingRow.id, rowForm);
    } else {
      await addRow(selected.id, rowForm);
    }
    const r = await getRows(selected.id);
    setRows(r);
    await loadTables();
    setSaving(false);
    setModal('none');
  };

  const handleDeleteRow = async (row_id: number) => {
    if (!selected) return;
    setDeletingRow(row_id);
    await deleteRow(row_id);
    const r = await getRows(selected.id);
    setRows(r);
    await loadTables();
    setDeletingRow(null);
  };

  const handleCreateTable = async () => {
    const validCols = newCols.filter(c => c.name.trim());
    if (!newTableName.trim() || validCols.length === 0) return;
    setSaving(true);
    await createTable(newTableName.trim(), newTableDesc, validCols);
    await loadTables();
    setModal('none');
    setNewTableName('');
    setNewTableDesc('');
    setNewCols([{ name: '', col_type: 'text' }]);
    setSaving(false);
  };

  const handleAddColumn = async () => {
    if (!selected || !newColName.trim()) return;
    setSaving(true);
    await addColumn(selected.id, newColName.trim(), newColType);
    const cols = await getColumns(selected.id);
    setColumns(cols);
    setNewColName('');
    setNewColType('text');
    setSaving(false);
    setModal('none');
  };

  const handleImport = async () => {
    if (!importFile) return;
    setSaving(true);
    setImportProgress(20);
    const fakeP = setInterval(() => setImportProgress(p => Math.min(p + 15, 85)), 400);
    const result = await importExcel(importFile, '', importMode);
    clearInterval(fakeP);
    setImportProgress(100);
    await loadTables();
    setTimeout(async () => {
      setSaving(false);
      setImportProgress(0);
      setImportFile(null);
      setModal('none');
      if (result.ok) {
        const fresh = await getTables();
        setTables(fresh);
        const found = fresh.find(t => t.name === result.table_name);
        if (found) selectTable(found);
      }
    }, 600);
  };

  const colTypes = ['text', 'number', 'date', 'boolean'];

  const statusBadge = (t: DsTable) => {
    const mins = Math.floor((Date.now() - new Date(t.updated_at).getTime()) / 60000);
    if (mins < 120) return <span className="badge-sync"><Icon name="Check" size={10} />Актуально</span>;
    if (mins < 1440) return <span className="badge-warning"><Icon name="Clock" size={10} />Давно</span>;
    return <span className="badge-error"><Icon name="AlertCircle" size={10} />Устарело</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(210,40%,96%)' }}>Таблицы</h1>
          <p className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>
            {loading ? 'Загрузка...' : `${tables.length} таблиц в базе данных`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost flex items-center gap-2" onClick={() => setModal('import')}>
            <Icon name="Upload" size={15} />
            Импорт Excel
          </button>
          <button onClick={() => setModal('create-table')} className="btn-primary flex items-center gap-2">
            <Icon name="Plus" size={15} />
            Новая таблица
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>
        {/* Table list */}
        <div className={selected ? 'xl:col-span-2' : 'xl:col-span-5'}>
          <div className="glass rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
            <div
              className="grid text-xs font-semibold px-5 py-3"
              style={{
                color: 'hsl(215,20%,50%)',
                borderBottom: '1px solid hsla(237,25%,22%,0.4)',
                gridTemplateColumns: selected ? '1fr auto' : '2fr 1fr 1fr 1fr auto',
              }}
            >
              <span>Таблица</span>
              {!selected && <><span>Строк</span><span>Столбцов</span><span>Статус</span></>}
              <span />
            </div>

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid hsla(237,25%,22%,0.3)' }}>
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="flex-1"><div className="skeleton h-3 w-32 mb-2" /><div className="skeleton h-2 w-20" /></div>
                </div>
              ))
            ) : tables.length === 0 ? (
              <div className="py-16 text-center">
                <Icon name="Table2" size={32} style={{ color: 'hsl(215,20%,30%)', margin: '0 auto 12px' }} />
                <div className="text-sm" style={{ color: 'hsl(215,20%,50%)' }}>Нет таблиц. Создайте или импортируйте Excel</div>
              </div>
            ) : tables.map((t, i) => (
              <div
                key={t.id}
                onClick={() => selected?.id === t.id ? (setSelected(null)) : selectTable(t)}
                className="table-row-hover cursor-pointer"
                style={{
                  borderBottom: i < tables.length - 1 ? '1px solid hsla(237,25%,22%,0.3)' : 'none',
                  background: selected?.id === t.id ? 'hsla(82,100%,55%,0.06)' : undefined,
                  display: 'grid',
                  gridTemplateColumns: selected ? '1fr auto' : '2fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  padding: '12px 20px',
                  gap: '12px',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: selected?.id === t.id ? 'hsla(82,100%,55%,0.15)' : 'hsla(237,25%,20%,0.8)' }}
                  >
                    <Icon name="Table2" size={13} style={{ color: selected?.id === t.id ? 'hsl(82,100%,55%)' : 'hsl(215,20%,55%)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono font-medium truncate" style={{ color: selected?.id === t.id ? 'hsl(82,100%,60%)' : 'hsl(210,40%,90%)' }}>
                      {t.name}
                    </div>
                    {t.description && !selected && (
                      <div className="text-xs truncate" style={{ color: 'hsl(215,20%,45%)' }}>{t.description}</div>
                    )}
                  </div>
                </div>
                {!selected && (
                  <>
                    <div className="text-sm font-mono" style={{ color: 'hsl(210,40%,80%)' }}>{t.row_count.toLocaleString('ru')}</div>
                    <div className="text-sm" style={{ color: 'hsl(215,20%,55%)' }}>{t.col_count}</div>
                    <div>{statusBadge(t)}</div>
                  </>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (!confirm(`Удалить таблицу "${t.name}"?`)) return;
                    if (selected?.id === t.id) setSelected(null);
                    deleteTable(t.id).then(loadTables);
                  }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'hsl(215,20%,40%)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'hsl(0,72%,60%)'; e.currentTarget.style.background = 'hsla(0,72%,55%,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'hsl(215,20%,40%)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Row editor */}
        {selected && (
          <div className="xl:col-span-3 animate-scale-in">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsla(237,25%,22%,0.4)' }}>
                <div className="flex items-center gap-2.5">
                  <Icon name="Table2" size={16} style={{ color: 'hsl(82,100%,55%)' }} />
                  <span className="font-mono font-semibold text-sm" style={{ color: 'hsl(82,100%,60%)' }}>{selected.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'hsla(237,25%,20%,0.8)', color: 'hsl(215,20%,55%)' }}>
                    {rows.length} строк
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal('add-column')} className="btn-ghost text-xs py-1.5 flex items-center gap-1.5">
                    <Icon name="Columns3" size={13} />
                    Столбец
                  </button>
                  <button onClick={openAddRow} className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
                    <Icon name="Plus" size={13} />
                    Строка
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg" style={{ color: 'hsl(215,20%,50%)' }}>
                    <Icon name="X" size={15} />
                  </button>
                </div>
              </div>

              {loadingRows ? (
                <div className="p-8 flex items-center justify-center gap-3" style={{ color: 'hsl(215,20%,50%)' }}>
                  <Icon name="Loader2" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span className="text-sm">Загрузка данных...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid hsla(237,25%,22%,0.4)', background: 'hsla(237,28%,14%,0.5)' }}>
                        <th className="px-4 py-3 text-left font-mono font-semibold w-10" style={{ color: 'hsl(215,20%,40%)' }}>#</th>
                        {columns.map(c => (
                          <th key={c.id} className="px-4 py-3 text-left font-mono font-semibold whitespace-nowrap" style={{ color: 'hsl(215,20%,55%)' }}>
                            {c.name}
                          </th>
                        ))}
                        <th className="px-4 py-3 w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-sm" style={{ color: 'hsl(215,20%,50%)' }}>
                            Нет данных — добавьте строку или импортируйте Excel
                          </td>
                        </tr>
                      ) : rows.map((row, i) => (
                        <tr
                          key={row.id}
                          className="table-row-hover group"
                          style={{ borderBottom: i < rows.length - 1 ? '1px solid hsla(237,25%,22%,0.25)' : 'none' }}
                        >
                          <td className="px-4 py-3 font-mono" style={{ color: 'hsl(215,20%,40%)' }}>{i + 1}</td>
                          {columns.map(c => (
                            <td key={c.id} className="px-4 py-3 font-mono max-w-[160px] truncate" style={{ color: 'hsl(210,40%,86%)' }}>
                              {row.data[c.name] ?? '—'}
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditRow(row)}
                                className="p-1 rounded transition-all"
                                style={{ color: 'hsl(215,20%,50%)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'hsl(185,90%,55%)'; e.currentTarget.style.background = 'hsla(185,90%,55%,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'hsl(215,20%,50%)'; e.currentTarget.style.background = 'transparent'; }}
                              >
                                <Icon name="Pencil" size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                disabled={deletingRow === row.id}
                                className="p-1 rounded transition-all"
                                style={{ color: 'hsl(215,20%,50%)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'hsl(0,72%,60%)'; e.currentTarget.style.background = 'hsla(0,72%,55%,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'hsl(215,20%,50%)'; e.currentTarget.style.background = 'transparent'; }}
                              >
                                <Icon name={deletingRow === row.id ? 'Loader2' : 'Trash2'} size={12}
                                  style={{ animation: deletingRow === row.id ? 'spin 1s linear infinite' : 'none' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modal !== 'none' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,12,20,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal('none'); }}
        >
          <div className="glass rounded-2xl w-full max-w-lg animate-scale-in" style={{ border: '1px solid hsla(237,25%,28%,0.6)' }}>

            {/* Create table */}
            {modal === 'create-table' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-base" style={{ color: 'hsl(210,40%,96%)' }}>Новая таблица</h2>
                  <button onClick={() => setModal('none')} style={{ color: 'hsl(215,20%,50%)' }}><Icon name="X" size={16} /></button>
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  <input className="search-input" placeholder="Название (напр. products)" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
                  <input className="search-input" placeholder="Описание (необязательно)" value={newTableDesc} onChange={e => setNewTableDesc(e.target.value)} />
                </div>
                <div className="mb-2 text-xs font-semibold" style={{ color: 'hsl(215,20%,60%)' }}>Столбцы</div>
                <div className="flex flex-col gap-2 mb-4">
                  {newCols.map((col, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="search-input flex-1"
                        placeholder={`Столбец ${i + 1}`}
                        value={col.name}
                        onChange={e => setNewCols(prev => prev.map((c, j) => j === i ? { ...c, name: e.target.value } : c))}
                      />
                      <select
                        className="search-input w-28"
                        value={col.col_type}
                        onChange={e => setNewCols(prev => prev.map((c, j) => j === i ? { ...c, col_type: e.target.value } : c))}
                      >
                        {colTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {newCols.length > 1 && (
                        <button onClick={() => setNewCols(prev => prev.filter((_, j) => j !== i))} style={{ color: 'hsl(0,72%,60%)' }}>
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewCols(prev => [...prev, { name: '', col_type: 'text' }])}
                    className="text-xs flex items-center gap-1.5 py-2"
                    style={{ color: 'hsl(82,100%,55%)' }}
                  >
                    <Icon name="Plus" size={13} /> Добавить столбец
                  </button>
                </div>
                <button onClick={handleCreateTable} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  {saving ? <Icon name="Loader2" size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon name="Check" size={15} />}
                  Создать таблицу
                </button>
              </div>
            )}

            {/* Add / Edit row */}
            {(modal === 'add-row' || modal === 'edit-row') && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-base" style={{ color: 'hsl(210,40%,96%)' }}>
                    {modal === 'edit-row' ? 'Редактировать строку' : 'Добавить строку'}
                  </h2>
                  <button onClick={() => setModal('none')} style={{ color: 'hsl(215,20%,50%)' }}><Icon name="X" size={16} /></button>
                </div>
                <div className="flex flex-col gap-3 mb-5 max-h-80 overflow-y-auto pr-1">
                  {columns.map(c => (
                    <div key={c.id}>
                      <label className="text-xs font-mono mb-1 block" style={{ color: 'hsl(215,20%,55%)' }}>{c.name}</label>
                      <input
                        className="search-input w-full"
                        placeholder={`Значение...`}
                        value={rowForm[c.name] ?? ''}
                        onChange={e => setRowForm(prev => ({ ...prev, [c.name]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={saveRow} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  {saving ? <Icon name="Loader2" size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon name="Check" size={15} />}
                  {modal === 'edit-row' ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            )}

            {/* Add column */}
            {modal === 'add-column' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-base" style={{ color: 'hsl(210,40%,96%)' }}>Добавить столбец</h2>
                  <button onClick={() => setModal('none')} style={{ color: 'hsl(215,20%,50%)' }}><Icon name="X" size={16} /></button>
                </div>
                <div className="flex flex-col gap-3 mb-5">
                  <input className="search-input" placeholder="Название столбца" value={newColName} onChange={e => setNewColName(e.target.value)} />
                  <select className="search-input" value={newColType} onChange={e => setNewColType(e.target.value)}>
                    {colTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button onClick={handleAddColumn} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  {saving ? <Icon name="Loader2" size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon name="Plus" size={15} />}
                  Добавить столбец
                </button>
              </div>
            )}

            {/* Import Excel */}
            {modal === 'import' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-base" style={{ color: 'hsl(210,40%,96%)' }}>Импорт Excel</h2>
                  <button onClick={() => { setModal('none'); setImportFile(null); }} style={{ color: 'hsl(215,20%,50%)' }}><Icon name="X" size={16} /></button>
                </div>

                {!saving ? (
                  <>
                    <div
                      className={`drag-zone rounded-xl p-8 text-center cursor-pointer mb-4 ${dragOver ? 'dragging' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setImportFile(f); }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Icon name="FileSpreadsheet" size={32} style={{ color: importFile ? 'hsl(82,100%,55%)' : 'hsl(215,20%,40%)', margin: '0 auto 12px' }} />
                      {importFile ? (
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'hsl(82,100%,60%)' }}>{importFile.name}</div>
                          <div className="text-xs mt-1" style={{ color: 'hsl(215,20%,50%)' }}>{(importFile.size / 1024).toFixed(0)} KB</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm" style={{ color: 'hsl(210,40%,75%)' }}>Перетащите или выберите .xlsx</div>
                          <div className="text-xs mt-1" style={{ color: 'hsl(215,20%,45%)' }}>.xlsx, .xls</div>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { if (e.target.files?.[0]) setImportFile(e.target.files[0]); }} />

                    <div className="mb-4">
                      <div className="text-xs mb-2" style={{ color: 'hsl(215,20%,55%)' }}>Режим импорта</div>
                      <div className="flex gap-2">
                        {(['replace', 'append'] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => setImportMode(m)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: importMode === m ? 'hsla(82,100%,55%,0.15)' : 'hsla(237,25%,18%,0.6)',
                              color: importMode === m ? 'hsl(82,100%,60%)' : 'hsl(215,20%,55%)',
                              border: importMode === m ? '1px solid hsla(82,100%,55%,0.3)' : '1px solid hsla(237,25%,22%,0.4)',
                            }}
                          >
                            {m === 'replace' ? 'Заменить данные' : 'Добавить к данным'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleImport} disabled={!importFile} className="btn-primary w-full flex items-center justify-center gap-2">
                      <Icon name="Upload" size={15} />
                      Импортировать
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <Icon name="Loader2" size={32} style={{ color: 'hsl(82,100%,55%)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <div className="text-sm mb-4" style={{ color: 'hsl(210,40%,80%)' }}>Импортируем файл...</div>
                    <div className="progress-bar mx-4">
                      <div className="progress-fill" style={{ width: `${importProgress}%` }} />
                    </div>
                    <div className="text-xs mt-2 font-mono" style={{ color: 'hsl(82,100%,55%)' }}>{importProgress}%</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
