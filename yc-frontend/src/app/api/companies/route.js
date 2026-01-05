import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Filters
    const active = searchParams.get("active");      // true / false
    const batch = searchParams.get("batch");        // e.g. W21
    const stage = searchParams.get("stage");        // Active / Acquired / Public
    const location = searchParams.get("location");  // text
    const search = searchParams.get("search");      // name or domain

    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (active !== null) {
      whereClauses.push(`c.is_active = $${idx++}`);
      values.push(active === "true");
    }

    if (batch) {
      whereClauses.push(`s.batch = $${idx++}`);
      values.push(batch);
    }

    if (stage) {
      whereClauses.push(`s.stage = $${idx++}`);
      values.push(stage);
    }

    if (location) {
      whereClauses.push(`s.location ILIKE $${idx++}`);
      values.push(`%${location}%`);
    }

    if (search) {
      whereClauses.push(
        `(c.name ILIKE $${idx} OR c.domain ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }

    const whereSQL =
      whereClauses.length > 0
        ? "WHERE " + whereClauses.join(" AND ")
        : "";

    /**
     * NOTE:
     * We join with latest snapshot to enable batch/stage/location filters
     */
    const query = `
      SELECT DISTINCT ON (c.id)
        c.id,
        c.name,
        c.domain,
        c.is_active,
        c.last_seen_at,
        s.batch,
        s.stage,
        s.location
      FROM companies c
      LEFT JOIN company_snapshots s
        ON s.company_id = c.id
      ${whereSQL}
      ORDER BY c.id, s.scraped_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);

    return NextResponse.json({
      page,
      limit,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
