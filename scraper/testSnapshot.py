from db import get_connection
from companyRepo import get_company_by_yc_id, insert_company
from snapshotRepo import get_latest_snapshot, insert_snapshot
from hashUtils import compute_snapshot_hash

conn = get_connection()

# ---- mock snapshot data ----
yc_company_id = "stripe"
name = "Stripe"
domain = "stripe.com"

company = get_company_by_yc_id(conn, yc_company_id)
if company is None:
    company_id = insert_company(conn, yc_company_id, name, domain)
else:
    company_id = company["id"]

snapshot_data = {
    "batch": "S09",
    "stage": "Active",
    "description": "Online payment processing platform",
    "location": "San Francisco",
    "tags": ["Fintech", "Payments"],
    "employee_range": "1000+"
}

new_hash = compute_snapshot_hash(snapshot_data)

last_snapshot = get_latest_snapshot(conn, company_id)

if last_snapshot is None:
    print("No previous snapshot. Inserting first snapshot.")
    insert_snapshot(
        conn,
        company_id,
        snapshot_data["batch"],
        snapshot_data["stage"],
        snapshot_data["description"],
        snapshot_data["location"],
        snapshot_data["tags"],
        snapshot_data["employee_range"],
        new_hash
    )
    print("Snapshot inserted.")

elif last_snapshot["data_hash"] != new_hash:
    print("Data changed. Inserting new snapshot.")
    insert_snapshot(
        conn,
        company_id,
        snapshot_data["batch"],
        snapshot_data["stage"],
        snapshot_data["description"],
        snapshot_data["location"],
        snapshot_data["tags"],
        snapshot_data["employee_range"],
        new_hash
    )
    print("New snapshot inserted.")

else:
    print("No change detected. Snapshot NOT inserted.")

conn.close()
