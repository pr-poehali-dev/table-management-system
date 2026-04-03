"""
Загрузка Excel (.xlsx/.xls/.csv) файлов и импорт данных в таблицы.
Принимает base64-encoded файл, парсит, создаёт/обновляет таблицу в БД.
"""
import json
import os
import base64
import io
import psycopg2
import openpyxl

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p95391542_table_management_sys')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    file_b64 = body.get('file')
    filename = body.get('filename', 'file.xlsx')
    table_name = body.get('table_name', '').strip()
    mode = body.get('mode', 'replace')  # replace | append

    if not file_b64:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Файл не передан'})}

    file_bytes = base64.b64decode(file_b64)

    # Парсим Excel
    try:
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
        ws = wb.active
        all_rows = list(ws.iter_rows(values_only=True))
    except Exception as e:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': f'Ошибка чтения файла: {str(e)}'})}

    if not all_rows:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Файл пустой'})}

    headers = [str(h).strip() if h is not None else f'col_{i}' for i, h in enumerate(all_rows[0])]
    data_rows = all_rows[1:]

    if not table_name:
        base = os.path.splitext(filename)[0]
        table_name = base.lower().replace(' ', '_').replace('-', '_')[:50]

    conn = get_conn()
    cur = conn.cursor()

    # Найти или создать таблицу
    cur.execute(f"SELECT id FROM {SCHEMA}.datasync_tables WHERE name = %s", (table_name,))
    existing = cur.fetchone()

    if existing:
        table_id = existing[0]
        if mode == 'replace':
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_rows WHERE table_id = %s", (table_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.datasync_columns WHERE table_id = %s", (table_id,))
            for i, h in enumerate(headers):
                cur.execute(
                    f"INSERT INTO {SCHEMA}.datasync_columns (table_id, name, col_type, position) VALUES (%s, %s, 'text', %s)",
                    (table_id, h, i)
                )
    else:
        cur.execute(
            f"INSERT INTO {SCHEMA}.datasync_tables (name, description) VALUES (%s, %s) RETURNING id",
            (table_name, f'Импортировано из {filename}')
        )
        table_id = cur.fetchone()[0]
        for i, h in enumerate(headers):
            cur.execute(
                f"INSERT INTO {SCHEMA}.datasync_columns (table_id, name, col_type, position) VALUES (%s, %s, 'text', %s)",
                (table_id, h, i)
            )

    # Вставляем строки
    inserted = 0
    for row in data_rows:
        if all(v is None for v in row):
            continue
        data = {headers[i]: (str(v) if v is not None else '') for i, v in enumerate(row)}
        cur.execute(
            f"INSERT INTO {SCHEMA}.datasync_rows (table_id, data) VALUES (%s, %s)",
            (table_id, json.dumps(data, ensure_ascii=False))
        )
        inserted += 1

    # История
    cur.execute(
        f"""INSERT INTO {SCHEMA}.datasync_history (table_id, table_name, action, description, detail)
            VALUES (%s, %s, 'import', %s, %s)""",
        (table_id, table_name, 'Импорт из Excel', f'{filename} · {inserted} строк')
    )

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'ok': True,
            'table_id': table_id,
            'table_name': table_name,
            'inserted': inserted,
            'columns': headers,
        }, ensure_ascii=False)
    }
