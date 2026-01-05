export const dynamic = "force-dynamic";

async function getCompanies(page = 1) {
  const res = await fetch(
    `http://localhost:3000/api/companies?page=${page}&limit=20`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch companies");
  }

  return res.json();
}

export default async function Home(props) {
  const searchParams = await props.searchParams; // ✅ FIX
  const page = parseInt(searchParams.page || "1");

  const data = await getCompanies(page);

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>YC Companies</h1>

      <p>
        Page: {page} | Showing {data.count} companies
      </p>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((company) => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{company.domain || "-"}</td>
              <td>{company.is_active ? "Active" : "Inactive"}</td>
              <td>
                {new Date(company.last_seen_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        {page > 1 && (
          <a href={`/?page=${page - 1}`} style={{ marginRight: "10px" }}>
            ⬅ Previous
          </a>
        )}

        {data.count === 20 && (
          <a href={`/?page=${page + 1}`}>Next ➡</a>
        )}
      </div>
      <a href="/analytics">View Analytics</a>
    </main>
  );
}