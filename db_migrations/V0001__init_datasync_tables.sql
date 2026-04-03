
CREATE TABLE t_p95391542_table_management_sys.datasync_tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p95391542_table_management_sys.datasync_columns (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES t_p95391542_table_management_sys.datasync_tables(id),
  name VARCHAR(100) NOT NULL,
  col_type VARCHAR(50) DEFAULT 'text',
  position INTEGER DEFAULT 0,
  UNIQUE(table_id, name)
);

CREATE TABLE t_p95391542_table_management_sys.datasync_rows (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES t_p95391542_table_management_sys.datasync_tables(id),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p95391542_table_management_sys.datasync_history (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES t_p95391542_table_management_sys.datasync_tables(id),
  table_name VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  description TEXT,
  detail TEXT,
  user_name VARCHAR(100) DEFAULT 'Пользователь',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p95391542_table_management_sys.datasync_tables (name, description) VALUES
  ('products', 'Каталог товаров'),
  ('orders', 'Заказы клиентов'),
  ('customers', 'База клиентов');

INSERT INTO t_p95391542_table_management_sys.datasync_columns (table_id, name, col_type, position) VALUES
  (1, 'name', 'text', 0),
  (1, 'price', 'number', 1),
  (1, 'category', 'text', 2),
  (1, 'stock', 'number', 3),
  (2, 'customer', 'text', 0),
  (2, 'total', 'number', 1),
  (2, 'status', 'text', 2),
  (3, 'name', 'text', 0),
  (3, 'email', 'text', 1),
  (3, 'phone', 'text', 2);

INSERT INTO t_p95391542_table_management_sys.datasync_rows (table_id, data) VALUES
  (1, '{"name":"Ноутбук Pro 15","price":"89990","category":"Электроника","stock":"24"}'),
  (1, '{"name":"Мышь беспроводная","price":"2490","category":"Аксессуары","stock":"156"}'),
  (1, '{"name":"Клавиатура механич.","price":"7800","category":"Аксессуары","stock":"43"}'),
  (2, '{"customer":"Иванов Пётр","total":"127800","status":"Выполнен"}'),
  (2, '{"customer":"Смирнова Анна","total":"4290","status":"В доставке"}'),
  (3, '{"name":"Иванов Пётр","email":"ivan@mail.ru","phone":"+7 900 000-01-01"}'),
  (3, '{"name":"Смирнова Анна","email":"anna@bk.ru","phone":"+7 900 000-02-02"}');

INSERT INTO t_p95391542_table_management_sys.datasync_history (table_id, table_name, action, description, detail, user_name) VALUES
  (1, 'products', 'import', 'Импорт из Excel', 'products_sample.xlsx · 3 строки', 'Система'),
  (2, 'orders', 'import', 'Импорт из Excel', 'orders_sample.xlsx · 2 строки', 'Система'),
  (3, 'customers', 'import', 'Импорт из Excel', 'customers_sample.xlsx · 2 строки', 'Система');
