"""
CRUD для таблиц и строк: получение, создание, обновление, удаление таблиц и строк.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p95391542_table_management_sys')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def log_history(cur, table_id, table_name, action, description, detail=''):
    cur.execute(
        f"""INSERT INTO {SCHEMA}.datasync_history (table_id, table_name, action, description, detail)
            VALUES (%s, %s, %s, %s, %s)""",
        (table_id, table_name, action, description, detail)
    )

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()
    result = {}

    # GET /tables — список таблиц с количеством строк
    if method == 'GET' and not params.get('action'):
        cur.execute(f"""
            SELECT t.id, t.name, t.description, t.created_at, t.updated_at,
                   COUNT(r.id) as row_count,
                   (SELECT COUNT(*) FROM {SCHEMA}.datasync_columns c WHERE c.table_id = t.id) as col_count
            FROM {SCHEMA}.datasync_tables t
            LEFT JOIN {SCHEMA}.datasync_rows r ON r.table_id = t.id
            GROUP BY t.id ORDER BY t.name
        """)
        rows = cur.fetchall()
        tables = []
        for row in rows:
            tables.append({
                'id': row[0], 'name': row[1], 'description': row[2],
                'created_at': str(row[3]), 'updated_at': str(row[4]),
                'row_count': row[5], 'col_count': row[6]
            })
        result = {'tables': tables}

    # GET ?action=columns&table_id=X — получить колонки
    elif method == 'GET' and params.get('action') == 'columns':
        table_id = int(params['table_id'])
        cur.execute(f"""
            SELECT id, name, col_type, position FROM {SCHEMA}.datasync_columns
            WHERE table_id = %s ORDER BY position
        """, (table_id,))
        cols = [{'id': r[0], 'name': r[1], 'col_type': r[2], 'position': r[3]} for r in cur.fetchall()]
        result = {'columns': cols}

    # GET ?action=rows&table_id=X — получить строки
    elif method == 'GET' and params.get('action') == 'rows':
        table_id = int(params['table_id'])
        cur.execute(f"""
            SELECT id, data, created_at, updated_at FROM {SCHEMA}.datasync_rows
            WHERE table_id = %s ORDER BY id
        """, (table_id,))
        rows = [{'id': r[0], 'data': r[1], 'created_at': str(r[2]), 'updated_at': str(r[3])} for r in cur.fetchall()]
        result = {'rows': rows}

    # POST ?action=create_table — создать новую таблицу
    elif method == 'POST' and params.get('action') == 'create_table':
        name = body['name'].strip()
        desc = body.get('description', '')
        columns = body.get('columns', [])
        cur.execute(
            f"INSERT INTO {SCHEMA}.datasync_tables (name, description) VALUES (%s, %s) RETURNING id",
            (name, desc)
        )
        table_id = cur.fetchone()[0]
        for i, col in enumerate(columns):
            cur.execute(
                f"INSERT INTO {SCHEMA}.datasync_columns (table_id, name, col_type, position) VALUES (%s, %s, %s, %s)",
                (table_id, col['name'], col.get('col_type', 'text'), i)
            )
        log_history(cur, table_id, name, 'create', 'Таблица создана', f'{len(columns)} столбцов')
        conn.commit()
        result = {'ok': True, 'table_id': table_id}

    # POST ?action=add_row — добавить строку
    elif method == 'POST' and params.get('action') == 'add_row':
        table_id = int(body['table_id'])
        data = body['data']
        cur.execute(
            f"INSERT INTO {SCHEMA}.datasync_rows (table_id, data) VALUES (%s, %s) RETURNING id",
            (table_id, json.dumps(data, ensure_ascii=False))
        )
        row_id = cur.fetchone()[0]
        cur.execute(f"SELECT name FROM {SCHEMA}.datasync_tables WHERE id = %s", (table_id,))
        tname = cur.fetchone()[0]
        log_history(cur, table_id, tname, 'add_row', 'Добавлена строка', f'ID {row_id}')
        conn.commit()
        result = {'ok': True, 'row_id': row_id}

    # PUT ?action=update_row — обновить строку
    elif method == 'PUT' and params.get('action') == 'update_row':
        row_id = int(body['row_id'])
        data = body['data']
        cur.execute(
            f"UPDATE {SCHEMA}.datasync_rows SET data = %s, updated_at = NOW() WHERE id = %s RETURNING table_id",
            (json.dumps(data, ensure_ascii=False), row_id)
        )
        table_id = cur.fetchone()[0]
        cur.execute(f"SELECT name FROM {SCHEMA}.datasync_tables WHERE id = %s", (table_id,))
        tname = cur.fetchone()[0]
        log_history(cur, table_id, tname, 'edit', 'Строка изменена', f'ID {row_id}')
        conn.commit()
        result = {'ok': True}

    # PUT ?action=update_table — переименовать/изменить описание таблицы
    elif method == 'PUT' and params.get('action') == 'update_table':
        table_id = int(body['table_id'])
        cur.execute(
            f"UPDATE {SCHEMA}.datasync_tables SET name = %s, description = %s, updated_at = NOW() WHERE id = %s",
            (body['name'], body.get('description', ''), table_id)
        )
        log_history(cur, table_id, body['name'], 'edit', 'Таблица переименована')
        conn.commit()
        result = {'ok': True}

    # DELETE ?action=delete_row&row_id=X
    elif method == 'DELETE' and params.get('action') == 'delete_row':
        row_id = int(params['row_id'])
        cur.execute(f"SELECT table_id FROM {SCHEMA}.datasync_rows WHERE id = %s", (row_id,))
        row = cur.fetchone()
        if row:
            table_id = row[0]
            cur.execute(f"SELECT name FROM {SCHEMA}.datasync_tables WHERE id = %s", (table_id,))
            tname = cur.fetchone()[0]
            cur.execute(f"UPDATE {SCHEMA}.datasync_rows SET data = data WHERE id = %s", (row_id,))
            # Physically mark deleted via update - set table_id to null trick not possible
            # Use actual delete since ON DELETE CASCADE won't cascade here
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_rows WHERE id = %s", (row_id,))
            log_history(cur, table_id, tname, 'delete', 'Строка удалена', f'ID {row_id}')
            conn.commit()
        result = {'ok': True}

    # DELETE ?action=delete_table&table_id=X
    elif method == 'DELETE' and params.get('action') == 'delete_table':
        table_id = int(params['table_id'])
        cur.execute(f"SELECT name FROM {SCHEMA}.datasync_tables WHERE id = %s", (table_id,))
        row = cur.fetchone()
        if row:
            tname = row[0]
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_rows WHERE table_id = %s", (table_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_columns WHERE table_id = %s", (table_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_tables WHERE id = %s", (table_id,))
            log_history(cur, None, tname, 'delete', 'Таблица удалена', tname)
            conn.commit()
        result = {'ok': True}

    # POST ?action=add_column — добавить колонку
    elif method == 'POST' and params.get('action') == 'add_column':
        table_id = int(body['table_id'])
        col_name = body['name'].strip()
        col_type = body.get('col_type', 'text')
        cur.execute(
            f"SELECT COALESCE(MAX(position)+1,0) FROM {SCHEMA}.datasync_columns WHERE table_id = %s",
            (table_id,)
        )
        pos = cur.fetchone()[0]
        cur.execute(
            f"INSERT INTO {SCHEMA}.datasync_columns (table_id, name, col_type, position) VALUES (%s, %s, %s, %s) RETURNING id",
            (table_id, col_name, col_type, pos)
        )
        col_id = cur.fetchone()[0]
        conn.commit()
        result = {'ok': True, 'col_id': col_id}

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False, default=str)
    }
