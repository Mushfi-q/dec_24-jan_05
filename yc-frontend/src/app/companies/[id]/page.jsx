export const dynamic = "force-dynamic";

async function getCompanyDetails(id) {
  const res = await fetch(
    `http://localhost:3000/api/companies/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch company details");
  }

  return res.json();
}

export default async function CompanyDetail(props) {
  const params = await props.params; // Next.js 16 requirement
  const { id } = params;

  const data = await getCompanyDetails(id);
  const { company, snapshots, timeline } = data;

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* ---------------- Company Header ---------------- */}
      <h1>{company.name}</h1>

      <p>
        <strong>Status:</strong>{" "}
        {company.is_active ? "Active" : "Inactive"}
      </p>

      <p>
        <strong>Domain:</strong> {company.domain || "N/A"}
      </p>

      <p>
        <strong>First seen:</strong>{" "}
        {new Date(company.first_seen_at).toLocaleDateString()}
        <br />
        <strong>Last seen:</strong>{" "}
        {new Date(company.last_seen_at).toLocaleDateString()}
      </p>

      <hr />

      {/* ---------------- Snapshot History ---------------- */}
      <h2>Snapshot History</h2>

      {snapshots.length === 0 ? (
        <p>No snapshots available.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Batch</th>
              <th>Stage</th>
              <th>Location</th>
              <th>Employees</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((snap, index) => (
              <tr key={index}>
                <td>
                  {new Date(snap.scraped_at).toLocaleDateString()}
                </td>
                <td>{snap.batch || "-"}</td>
                <td>{snap.stage || "-"}</td>
                <td>{snap.location || "-"}</td>
                <td>{snap.employee_range || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* ---------------- Change Timeline ---------------- */}
      <h2>Change Timeline</h2>

      {timeline.length === 0 ? (
        <p>No changes recorded.</p>
      ) : (
        <ul>
          {timeline.map((item, index) => (
            <li key={index}>
              <strong>
                {new Date(item.scraped_at).toLocaleDateString()}:
              </strong>{" "}
              {item.change}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <a href="/">← Back to company list</a>
    </main>
  );
}
