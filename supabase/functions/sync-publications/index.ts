import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENALEX_AUTHOR_ID = 'A5019447790'; // Ahmed Negida (ORCID 0000-0001-5363-6369)
const USER_AGENT = 'AhmedNegidaCV/1.0 (mailto:ahmed.said.negida@gmail.com)';
const THROTTLE_MINUTES = 60;

interface OpenAlexWork {
  id: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_year?: number | null;
  type?: string | null;
  ids?: { pmid?: string };
  primary_location?: {
    source?: { display_name?: string; type?: string };
  } | null;
  authorships?: Array<{
    author?: { display_name?: string };
    raw_author_name?: string;
  }>;
  abstract_inverted_index?: Record<string, number[]> | null;
}

function reconstructAbstract(idx: Record<string, number[]> | null | undefined): string | null {
  if (!idx) return null;
  const positions: { word: string; pos: number }[] = [];
  for (const [word, posList] of Object.entries(idx)) {
    for (const p of posList) positions.push({ word, pos: p });
  }
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map(p => p.word).join(' ');
}

function formatAuthors(authorships: OpenAlexWork['authorships']): string {
  if (!authorships || authorships.length === 0) return '';
  const named = authorships
    .map(a => a.author?.display_name || a.raw_author_name || '')
    .filter(Boolean);
  const trimmed = named.slice(0, 5).map(n => {
    const parts = n.trim().split(/\s+/);
    if (parts.length < 2) return n;
    const last = parts[parts.length - 1];
    const initial = parts[0][0] || '';
    return `${last} ${initial}`;
  }).join(', ');
  return named.length > 5 ? `${trimmed}, et al.` : trimmed;
}

function shouldSkip(w: OpenAlexWork): string | null {
  const t = (w.type || '').toLowerCase();
  if (t === 'dataset' || t === 'software' || t === 'erratum' || t === 'editorial') {
    return `type=${t}`;
  }
  const venue = (w.primary_location?.source?.display_name || '').toLowerCase();
  if (venue.includes('zenodo')) return 'zenodo software/dataset';
  if (!w.title && !w.display_name) return 'no title';
  if (!w.publication_year) return 'no publication_year';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRole);

  // Throttle: reject if last sync was less than THROTTLE_MINUTES minutes ago
  const { data: recentSync } = await supabase
    .from('sync_log')
    .select('started_at')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentSync) {
    const ageMs = Date.now() - new Date(recentSync.started_at).getTime();
    if (ageMs < THROTTLE_MINUTES * 60 * 1000) {
      const remaining = Math.ceil((THROTTLE_MINUTES * 60 * 1000 - ageMs) / 1000);
      return new Response(
        JSON.stringify({ status: 'throttled', message: `Last sync was ${Math.round(ageMs / 60000)} min ago. Wait ${remaining}s.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  const { data: syncRow } = await supabase
    .from('sync_log')
    .insert({ source: 'openalex' })
    .select()
    .single();
  const syncId = syncRow?.id;

  let inserted = 0;
  let skipped = 0;
  let total = 0;

  try {
    let cursor: string | null = '*';
    while (cursor) {
      const url = `https://api.openalex.org/works?filter=author.id:${OPENALEX_AUTHOR_ID}&per-page=100&cursor=${cursor}&select=id,doi,title,display_name,publication_year,type,ids,primary_location,authorships,abstract_inverted_index`;
      const resp = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!resp.ok) throw new Error(`OpenAlex ${resp.status}: ${await resp.text()}`);
      const data = await resp.json();
      const results: OpenAlexWork[] = data.results || [];
      total += results.length;

      for (const w of results) {
        const skipReason = shouldSkip(w);
        if (skipReason) { skipped++; continue; }

        const oaId = (w.id || '').replace('https://openalex.org/', '');
        const doi = (w.doi || '').replace('https://doi.org/', '') || null;
        const pmid = (w.ids?.pmid || '').replace('https://pubmed.ncbi.nlm.nih.gov/', '') || null;
        const venueType = w.primary_location?.source?.type || '';
        const isPreprint = (w.type === 'preprint') || venueType === 'repository';

        const record = {
          openalex_id: oaId,
          pmid,
          doi,
          title: (w.title || w.display_name || '').slice(0, 1000),
          journal: w.primary_location?.source?.display_name || null,
          year: String(w.publication_year || ''),
          type: isPreprint ? 'Preprint' : 'Research Article',
          impact: 'Medium Impact',
          authors: formatAuthors(w.authorships),
          abstract: reconstructAbstract(w.abstract_inverted_index),
          auto_synced: true,
          visible: false,
        };

        const { error } = await supabase.rpc('upsert_publication_if_new', {
          p_openalex_id: oaId,
          p_doi: doi,
          p_pmid: pmid,
          p_title: record.title,
          p_journal: record.journal,
          p_year: record.year,
          p_type: record.type,
          p_impact: record.impact,
          p_authors: record.authors,
          p_abstract: record.abstract,
        });

        if (error) {
          console.error('upsert error:', error.message, 'for', oaId);
          skipped++;
        } else {
          inserted++;
        }
      }

      cursor = data.meta?.next_cursor || null;
      if (!cursor) break;
    }

    if (syncId) {
      await supabase.from('sync_log').update({
        finished_at: new Date().toISOString(),
        works_total: total,
        works_inserted: inserted,
        works_skipped: skipped,
      }).eq('id', syncId);
    }

    return new Response(
      JSON.stringify({ status: 'ok', total, attempted: inserted, skipped }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    if (syncId) {
      await supabase.from('sync_log').update({
        finished_at: new Date().toISOString(),
        works_total: total,
        works_inserted: inserted,
        works_skipped: skipped,
        error: String(err),
      }).eq('id', syncId);
    }
    return new Response(
      JSON.stringify({ status: 'error', error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
