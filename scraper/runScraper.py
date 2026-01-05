import asyncio
import time
from datetime import datetime
from enrichment import check_careers_page
from enrichmentRepo import insert_enrichment


from db import get_connection
from companyRepo import (
    get_company_by_yc_id,
    insert_company,
    update_company_seen,
)
from snapshotRepo import (
    get_latest_snapshot,
    insert_snapshot,
)
from hashUtils import compute_snapshot_hash
from ycScraper import scrape_yc_companies   # your Playwright function
import logging
from logger import setup_logger

setup_logger()



async def run():
    logging.info("Scrape run started")
    conn = get_connection()

    # ---- scrape run start ----
    started_at = datetime.utcnow()
    run_start_time = time.perf_counter()

    new_count = 0
    updated_count = 0
    unchanged_count = 0
    failed_count = 0

    seen_company_ids = set()

    # ---- get scraped companies ----
    companies = await scrape_yc_companies()
    logging.info(f"Companies scraped from YC: {len(companies)}")


    for company in companies:
        try:
            profile_url = company["company_profile_url"]
            yc_company_id = profile_url.rstrip("/").split("/")[-1]

            name = company.get("name")
            domain = company.get("domain")  # may be None for now

            # snapshot fields (use what you currently extract)
            snapshot_data = {
                "batch": company.get("batch"),
                "stage": company.get("stage"),
                "description": company.get("description"),
                "location": company.get("location"),
                "tags": company.get("tags", []),
                "employee_range": company.get("employee_range"),
            }

            snapshot_hash = compute_snapshot_hash(snapshot_data)

            existing = get_company_by_yc_id(conn, yc_company_id)

            if existing is None:
                # ---- NEW COMPANY ----
                company_id = insert_company(conn, yc_company_id, name, domain)

                insert_snapshot(
                    conn,
                    company_id,
                    snapshot_data["batch"],
                    snapshot_data["stage"],
                    snapshot_data["description"],
                    snapshot_data["location"],
                    snapshot_data["tags"],
                    snapshot_data["employee_range"],
                    snapshot_hash,
                )

                new_count += 1

            else:
                company_id = existing["id"]
                seen_company_ids.add(company_id)

                update_company_seen(conn, company_id)

                last_snapshot = get_latest_snapshot(conn, company_id)

                if last_snapshot is None or last_snapshot["data_hash"] != snapshot_hash:
                    insert_snapshot(
                        conn,
                        company_id,
                        snapshot_data["batch"],
                        snapshot_data["stage"],
                        snapshot_data["description"],
                        snapshot_data["location"],
                        snapshot_data["tags"],
                        snapshot_data["employee_range"],
                        snapshot_hash,
                    )
                    updated_count += 1
                else:
                    unchanged_count += 1

        except Exception as e:
            failed_count += 1
            logging.error(
                f"Failed company {company.get('name')} | {str(e)}",
                exc_info=True
            )

        try:
            has_careers = check_careers_page(domain)
            insert_enrichment(conn, company_id, has_careers)
        except Exception as e:
            logging.warning(
                f"Website enrichment failed for {name}: {str(e)}"
            )


    # ---- mark inactive companies ----
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE companies
            SET is_active = FALSE
            WHERE id NOT IN %s
            """,
            (tuple(seen_company_ids),)
        )
        conn.commit()

    # ---- scrape run end ----
    ended_at = datetime.utcnow()
    run_time = time.perf_counter() - run_start_time
    avg_time_ms = (run_time / len(companies)) * 1000 if companies else 0

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO scrape_runs
            (started_at, ended_at, total_companies,
             new_companies, updated_companies,
             unchanged_companies, failed_companies,
             avg_time_per_company_ms)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                started_at,
                ended_at,
                len(companies),
                new_count,
                updated_count,
                unchanged_count,
                failed_count,
                avg_time_ms,
            )
        )
        conn.commit()

        logging.info(
            f"Scrape completed | "
            f"Total={len(companies)} | "
            f"New={new_count} | "
            f"Updated={updated_count} | "
            f"Unchanged={unchanged_count} | "
            f"Failed={failed_count} | "
            f"AvgTimeMs={avg_time_ms:.2f}"
        )

    conn.close()

    print("\n--- SCRAPE SUMMARY ---")
    print("Total:", len(companies))
    print("New:", new_count)
    print("Updated:", updated_count)
    print("Unchanged:", unchanged_count)
    print("Failed:", failed_count)
    print(f"Avg time/company: {avg_time_ms:.2f} ms")





if __name__ == "__main__":
    asyncio.run(run())
