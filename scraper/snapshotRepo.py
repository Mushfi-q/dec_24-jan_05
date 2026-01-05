from datetime import datetime
from db import get_connection

def get_latest_snapshot(conn, company_id):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT data_hash
            FROM company_snapshots
            WHERE company_id = %s
            ORDER BY scraped_at DESC
            LIMIT 1
            """,
            (company_id,)
        )
        return cur.fetchone()


def insert_snapshot(
    conn,
    company_id,
    batch,
    stage,
    description,
    location,
    tags,
    employee_range,
    data_hash
):
    now = datetime.utcnow()

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO company_snapshots
            (company_id, batch, stage, description, location,
             tags, employee_range, scraped_at, data_hash)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                company_id,
                batch,
                stage,
                description,
                location,
                tags,
                employee_range,
                now,
                data_hash
            )
        )
        conn.commit()
