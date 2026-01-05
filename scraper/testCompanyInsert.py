from db import get_connection
from companyRepo import get_company_by_yc_id, insert_company, update_company_seen

conn = get_connection()

yc_company_id = "stripe"
name = "Stripe"
domain = "stripe.com"

company = get_company_by_yc_id(conn, yc_company_id)

if company is None:
    print("Company not found. Inserting...")
    company_id = insert_company(conn, yc_company_id, name, domain)
    print("Inserted company with ID:", company_id)
else:
    print("Company exists. Updating last_seen_at...")
    update_company_seen(conn, company["id"])
    print("Updated company:", company["id"])

conn.close()
