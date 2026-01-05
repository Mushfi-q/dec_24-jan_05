import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
      SELECT
        id,
        started_at,
        ended_at,
        total_companies,
        new_companies,
        updated_companies,
        unchanged_companies,
        failed_companies,
        avg_time_per_company_ms
      FROM scrape_runs
      ORDER BY started_at DESC
    `;

    const result = await pool.query(query);

    return NextResponse.json({
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
