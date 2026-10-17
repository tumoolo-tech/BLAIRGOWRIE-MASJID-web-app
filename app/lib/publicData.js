// Read-only access to public Supabase tables for the public pages, using plain fetch
// against the REST API. Importing @supabase/supabase-js here would ship its auth,
// realtime and storage clients (~54KB gzipped) to every visitor; only /admin needs those.
// Row-level security applies exactly as it does for the anon supabase-js client.

export async function selectRows(table, params) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { data: null, error: { message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY' } };
  }
  try {
    const res = await fetch(`${url}/rest/v1/${table}?${new URLSearchParams(params)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const body = await res.json();
    if (!res.ok) return { data: null, error: { message: body?.message || res.statusText } };
    return { data: body, error: null };
  } catch (err) {
    return { data: null, error: { message: err?.message || String(err) } };
  }
}
