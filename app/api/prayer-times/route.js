// Today's congregation (salah) times from the masjid's own MasjidBoardLive board, the same
// numbers shown on /salah-times. Their API sends no CORS header, so the browser can't call
// it directly: this route fetches it server-side and is cached for a minute.
// Maghrib uses the adhan time (the board has no separate Maghrib salah time).

export const revalidate = 60;

const BOARD_API = 'https://masjidboardlive.com/boards/api/board.php?id=blairgowrie-ubay-bin-kab';
// Placeholders the board uses for "no value" (same list as its own times-refresh.js).
const EMPTY = ['~~~~', '#N/A', '#REF', '#VALUE', '00:00', '', ' ', '&nbsp;'];

const clean = (v) => (typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v.trim()) && !EMPTY.includes(v.trim()) ? v.trim() : null);

export async function GET() {
  try {
    const res = await fetch(BOARD_API, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`board api ${res.status}`);
    const { ok, data } = await res.json();
    if (!ok || !data) throw new Error('board api returned no data');
    const times = {
      fajr: clean(data.fajrJamaah),
      sunrise: clean(data.sunrise),
      dhuhr: clean(data.dhuhrJamaah),
      asr: clean(data.asrJamaah),
      maghrib: clean(data.maghribAthan),
      isha: clean(data.eshaJamaah),
    };
    return Response.json({ times, updated: data.last_updated || null });
  } catch (err) {
    return Response.json({ times: null, error: String(err?.message || err) }, { status: 502 });
  }
}
