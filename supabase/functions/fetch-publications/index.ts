import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  doi: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { authorName } = await req.json();
    
    if (!authorName) {
      throw new Error('Author name is required');
    }

    console.log('Fetching publications for:', authorName);

    // Step 1: Search PubMed for articles by author
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(authorName)}[Author]&retmax=50&retmode=json&sort=date`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const pmids = searchData.esearchresult?.idlist || [];
    
    if (pmids.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No publications found', publications: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pmids.length} publications`);

    // Step 2: Fetch detailed information for each article
    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
    
    const detailsResponse = await fetch(detailsUrl);
    const xmlText = await detailsResponse.text();
    
    // Parse XML to extract publication details
    const publications = parsePublications(xmlText);
    
    console.log(`Parsed ${publications.length} publications`);

    // Step 3: Store in database (supabase client already initialized above)
    // Insert publications (upsert to avoid duplicates)
    for (const pub of publications) {
      const { error } = await supabase
        .from('publications')
        .upsert({
          pmid: pub.pmid,
          title: pub.title,
          journal: pub.journal,
          year: pub.year,
          type: 'Research Article',
          impact: 'Medium Impact',
          authors: pub.authors,
          doi: pub.doi,
          abstract: pub.abstract,
        }, {
          onConflict: 'pmid'
        });

      if (error) {
        console.error('Error inserting publication:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully fetched and stored ${publications.length} publications`,
        publications 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-publications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parsePublications(xmlText: string): PubMedArticle[] {
  const publications: PubMedArticle[] = [];
  
  // Simple XML parsing using regex (for production, consider using a proper XML parser)
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  const articles = xmlText.match(articleRegex) || [];
  
  for (const article of articles) {
    try {
      const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
      const title = article.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] || '';
      const abstractText = article.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/)?.[1] || '';
      const journal = article.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] || '';
      const year = article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';
      
      // Extract DOI
      const doiMatch = article.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/);
      const doi = doiMatch ? doiMatch[1] : '';
      
      // Extract authors
      const authorMatches = article.match(/<Author[^>]*>[\s\S]*?<LastName>([\s\S]*?)<\/LastName>[\s\S]*?<ForeName>([\s\S]*?)<\/ForeName>[\s\S]*?<\/Author>/g) || [];
      const authors = authorMatches.slice(0, 5).map(author => {
        const lastName = author.match(/<LastName>([\s\S]*?)<\/LastName>/)?.[1] || '';
        const firstName = author.match(/<ForeName>([\s\S]*?)<\/ForeName>/)?.[1] || '';
        return `${lastName} ${firstName.charAt(0)}`;
      }).join(', ');
      
      const authorsFinal = authors + (authorMatches.length > 5 ? ', et al.' : '');
      
      publications.push({
        pmid,
        title: title.replace(/<[^>]*>/g, ''), // Remove HTML tags
        authors: authorsFinal,
        journal,
        year,
        abstract: abstractText.replace(/<[^>]*>/g, ''),
        doi,
      });
    } catch (err) {
      console.error('Error parsing article:', err);
    }
  }
  
  return publications;
}
