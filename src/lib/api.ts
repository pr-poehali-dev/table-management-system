const TABLES_URL = 'https://functions.poehali.dev/a4be4c59-7639-4722-87e2-a3db11548f43';
const HISTORY_URL = 'https://functions.poehali.dev/8e56c800-dfe3-466d-9c9b-25e17ca15863';
const EXCEL_URL = 'https://functions.poehali.dev/7cf6506d-d62d-4b95-bd48-0168bd8f855f';

export interface DsTable {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  row_count: number;
  col_count: number;
}

export interface DsColumn {
  id: number;
  name: string;
  col_type: string;
  position: number;
}

export interface DsRow {
  id: number;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface DsEvent {
  id: number;
  table_id: number | null;
  table_name: string;
  action: string;
  description: string;
  detail: string;
  user_name: string;
  created_at: string;
}

// Tables
export const getTables = async (): Promise<DsTable[]> => {
  const r = await fetch(TABLES_URL);
  const d = await r.json();
  return d.tables;
};

export const getColumns = async (table_id: number): Promise<DsColumn[]> => {
  const r = await fetch(`${TABLES_URL}?action=columns&table_id=${table_id}`);
  const d = await r.json();
  return d.columns;
};

export const getRows = async (table_id: number): Promise<DsRow[]> => {
  const r = await fetch(`${TABLES_URL}?action=rows&table_id=${table_id}`);
  const d = await r.json();
  return d.rows;
};

export const createTable = async (name: string, description: string, columns: { name: string; col_type: string }[]) => {
  const r = await fetch(`${TABLES_URL}?action=create_table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, columns }),
  });
  return r.json();
};

export const addRow = async (table_id: number, data: Record<string, string>) => {
  const r = await fetch(`${TABLES_URL}?action=add_row`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_id, data }),
  });
  return r.json();
};

export const updateRow = async (row_id: number, data: Record<string, string>) => {
  const r = await fetch(`${TABLES_URL}?action=update_row`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row_id, data }),
  });
  return r.json();
};

export const deleteRow = async (row_id: number) => {
  const r = await fetch(`${TABLES_URL}?action=delete_row&row_id=${row_id}`, {
    method: 'DELETE',
  });
  return r.json();
};

export const deleteTable = async (table_id: number) => {
  const r = await fetch(`${TABLES_URL}?action=delete_table&table_id=${table_id}`, {
    method: 'DELETE',
  });
  return r.json();
};

export const addColumn = async (table_id: number, name: string, col_type: string) => {
  const r = await fetch(`${TABLES_URL}?action=add_column`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_id, name, col_type }),
  });
  return r.json();
};

// History
export const getHistory = async (action_filter = ''): Promise<DsEvent[]> => {
  const r = await fetch(`${HISTORY_URL}?action_filter=${action_filter}&limit=100`);
  const d = await r.json();
  return d.events;
};

// Excel import
export const importExcel = async (
  file: File,
  table_name: string,
  mode: 'replace' | 'append' = 'replace'
): Promise<{ ok: boolean; table_id: number; table_name: string; inserted: number; columns: string[] }> => {
  const b64 = await fileToBase64(file);
  const r = await fetch(EXCEL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: b64, filename: file.name, table_name, mode }),
  });
  return r.json();
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
