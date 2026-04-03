"""
История изменений: получение списка событий с фильтрацией.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p95391542_table_management_sys')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action_filter = params.get('action_filter', '')
    limit = min(int(params.get('limit', 50)), 200)

    conn = get_conn()
    cur = conn.cursor()

    where = ''
    if action_filter and action_filter != 'all':
        where = f"WHERE action = '{action_filter}'"

    cur.execute(f"""
        SELECT id, table_id, table_name, action, description, detail, user_name, created_at
        FROM {SCHEMA}.datasync_history
        {where}
        ORDER BY created_at DESC
        LIMIT {limit}
    """)

    events = []
    for r in cur.fetchall():
        events.append({
            'id': r[0],
            'table_id': r[1],
            'table_name': r[2],
            'action': r[3],
            'description': r[4],
            'detail': r[5],
            'user_name': r[6],
            'created_at': str(r[7]),
        })

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'events': events}, ensure_ascii=False, default=str)
    }
