import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  // ✅ Required in Next.js 16
  const params = await context.params;
  const companyId = params.id;

  try {
    /* --------------------------------------------------
       1️⃣ Fetch company core details
    -------------------------------------------------- */
    const companyQuery = `
      SELECT
        id,
        yc_company_id,
        name,
        domain,
        is_active,
        first_seen_at,
        last_seen_at
      FROM companies
      WHERE id = $1
    `;
    const companyResult = await pool.query(companyQuery, [companyId]);

    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const company = companyResult.rows[0];

    /* --------------------------------------------------
       2️⃣ Fetch snapshot history (chronological)
    -------------------------------------------------- */
    const snapshotQuery = `
      SELECT
        batch,
        stage,
        description,
        location,
        tags,
        employee_range,
        scraped_at
      FROM company_snapshots
      WHERE company_id = $1
      ORDER BY scraped_at ASC
    `;
    const snapshotResult = await pool.query(snapshotQuery, [companyId]);
    const snapshots = snapshotResult.rows;

    /* --------------------------------------------------
       3️⃣ Build change timeline (derived, not stored)
    -------------------------------------------------- */
    const timeline = [];

    for (let i = 0; i < snapshots.length; i++) {
      const current = snapshots[i];

      if (i === 0) {
        timeline.push({
          scraped_at: current.scraped_at,
          change: "Initial snapshot",
          stage: current.stage,
          batch: current.batch,
        });
        continue;
      }

      const previous = snapshots[i - 1];
      const changes = [];

      if (previous.stage !== current.stage) {
        changes.push(`Stage: ${previous.stage} → ${current.stage}`);
      }

      if (previous.location !== current.location) {
        changes.push(
          `Location: ${previous.location || "N/A"} → ${current.location || "N/A"}`
        );
      }

      if (previous.employee_range !== current.employee_range) {
        changes.push(
          `Employees: ${previous.employee_range || "N/A"} → ${current.employee_range || "N/A"}`
        );
      }

      timeline.push({
        scraped_at: current.scraped_at,
        change: changes.length > 0 ? changes.join(", ") : "No significant change",
        stage: current.stage,
        batch: current.batch,
      });
    }

    /* --------------------------------------------------
       4️⃣ Final response
    -------------------------------------------------- */
    return NextResponse.json({
      company,
      snapshots,
      timeline,
      enrichment: null, // explicitly not implemented yet
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
