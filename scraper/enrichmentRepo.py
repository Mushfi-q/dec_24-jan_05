from datetime import datetime

def insert_enrichment(conn, company_id, has_careers_page):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO company_web_enrichment
            (company_id, has_careers_page, scraped_at)
            VALUES (%s, %s, %s)
            """,
            (company_id, has_careers_page, datetime.utcnow())
        )
        conn.commit()
