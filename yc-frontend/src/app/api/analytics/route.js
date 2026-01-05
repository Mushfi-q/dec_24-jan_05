import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    /* ---------------- Companies per batch ---------------- */
    const batchQuery = `
      SELECT
        s.batch,
        COUNT(DISTINCT s.company_id) AS count
      FROM company_snapshots s
      WHERE s.batch IS NOT NULL
      GROUP BY s.batch
      ORDER BY s.batch
    `;

    /* ---------------- Stage distribution ---------------- */
    const stageQuery = `
      SELECT
        s.stage,
        COUNT(DISTINCT s.company_id) AS count
      FROM company_snapshots s
      WHERE s.stage IS NOT NULL
      GROUP BY s.stage
    `;

    /* ---------------- Top locations ---------------- */
    const locationQuery = `
      SELECT
        s.location,
        COUNT(DISTINCT s.company_id) AS count
      FROM company_snapshots s
      WHERE s.location IS NOT NULL
      GROUP BY s.location
      ORDER BY count DESC
      LIMIT 10
    `;

    /* ---------------- Top tags ---------------- */
    const tagsQuery = `
      SELECT
        tag,
        COUNT(*) AS count
      FROM (
        SELECT UNNEST(tags) AS tag
        FROM company_snapshots
        WHERE tags IS NOT NULL
      ) t
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `;

    const [
      batchResult,
      stageResult,
      locationResult,
      tagsResult,
    ] = await Promise.all([
      pool.query(batchQuery),
      pool.query(stageQuery),
      pool.query(locationQuery),
      pool.query(tagsQuery),
    ]);

    return NextResponse.json({
      companies_per_batch: batchResult.rows,
      stage_distribution: stageResult.rows,
      top_locations: locationResult.rows,
      top_tags: tagsResult.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
