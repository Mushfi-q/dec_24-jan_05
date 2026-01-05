from datetime import datetime
from db import get_connection

def get_company_by_yc_id(conn, yc_company_id):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM companies WHERE yc_company_id = %s",
            (yc_company_id,)
        )
        return cur.fetchone()


def insert_company(conn, yc_company_id, name, domain):
    now = datetime.utcnow()

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO companies
            (yc_company_id, name, domain, first_seen_at, last_seen_at, is_active)
            VALUES (%s, %s, %s, %s, %s, TRUE)
            RETURNING id
            """,
            (yc_company_id, name, domain, now, now)
        )
        company_id = cur.fetchone()["id"]
        conn.commit()

    return company_id


def update_company_seen(conn, company_id):
    now = datetime.utcnow()

    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE companies
            SET last_seen_at = %s, is_active = TRUE
            WHERE id = %s
            """,
            (now, company_id)
        )
        conn.commit()
