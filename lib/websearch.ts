const DEFAULT_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

type SearchResult = { title: string; url: string; excerpt?: string; source?: string };

const cache = new Map<string, { ts: number; results: SearchResult[] }>();

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Vetra/1.0' } });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function webSearch(query: string, mode: 'general_web' | 'lore' = 'general_web', maxResults = 5): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  const key = `${mode}:${query}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.results;

  try {
    // Use DuckDuckGo HTML lite endpoint to avoid API keys
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, DEFAULT_TIMEOUT_MS);
    if (!res.ok) return [];

    const text = await res.text();

    // Quick and dirty parse of result anchors
    const results: SearchResult[] = [];
    const anchorRe = /<a[^>]*?href="([^"\s>]+)"[^>]*?>(.*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((match = anchorRe.exec(text)) && results.length < maxResults) {
      const url = match[1];
      let title = match[2].replace(/<.*?>/g, '').trim();
      if (!title) title = url;
      if (seen.has(url)) continue;
      seen.add(url);
      results.push({ title, url, excerpt: undefined, source: new URL(url, 'https://example.com').hostname });
    }

    // Optionally attempt to fetch top pages in parallel but keep it fast
    const top = results.slice(0, Math.min(results.length, 3));
    await Promise.all(top.map(async (r) => {
      try {
        const p = await fetchWithTimeout(r.url, 1500);
        if (!p.ok) return;
        const body = await p.text();
        // Extract meta description
        const m = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        if (m && m[1]) r.excerpt = m[1].substring(0, 400);
        else {
          // fallback: first paragraph
          const pMatch = body.match(/<p[^>]*>([^<]{50,400})<\/p>/i);
          if (pMatch) r.excerpt = pMatch[1].replace(/<.*?>/g, '').substring(0, 400);
        }
      } catch (e) {
        // ignore per-page errors
      }
    }));

    cache.set(key, { ts: Date.now(), results });
    return results;
  } catch (err) {
    console.warn('[webSearch] Error fetching search results:', err);
    return [];
  }
}

export function formatSearchContext(query: string, results: SearchResult[], mode: 'general_web' | 'lore' = 'general_web'): string {
  if (!results || results.length === 0) return '';
  const header = mode === 'lore'
    ? '[WEB SEARCH RESULTS — RP/LORE MODE. Use the character card as authoritative; treat results as optional color.]\n'
    : '[WEB SEARCH RESULTS — Live reference data fetched for this request. Prefer ★ sources.]\n';

  const lines = results.map((r, i) => {
    const star = (r.source && /wikipedia|wiki|fandom/i.test(r.source)) ? '★' : '';
    return `[Source ${i + 1} ${star}] ${r.title} URL: ${r.url} Content: ${r.excerpt || 'No excerpt available.'}`;
  });

  return `${header}\n${lines.join('\n\n')}\n\n[END WEB SEARCH RESULTS]`;
}
