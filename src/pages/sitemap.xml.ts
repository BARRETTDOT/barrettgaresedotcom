// /sitemap.xml: the homepage, the writing index, every post, and every topic/place/series page.
import type { APIContext } from 'astro';
import { getPosts, collect } from '../lib/sanity';

export async function GET(context: APIContext) {
  const site = context.site!;
  const posts = await getPosts();
  const newest = (list: typeof posts) =>
    list.map((p) => p._updatedAt ?? p.publishedAt).sort().at(-1);

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    { loc: '/writing', lastmod: newest(posts) },
    ...posts.map((p) => ({ loc: `/writing/${p.slug}`, lastmod: p._updatedAt ?? p.publishedAt })),
  ];
  const groups: [string, (p: (typeof posts)[number]) => { slug: string }[]][] = [
    ['topics', (p) => p.topics],
    ['places', (p) => p.places],
    ['series', (p) => (p.series ? [p.series] : [])],
  ];
  for (const [path, pick] of groups) {
    for (const ref of collect(posts, pick as any)) {
      const members = posts.filter((p) => pick(p).some((r) => r.slug === ref.slug));
      urls.push({ loc: `/writing/${path}/${ref.slug}`, lastmod: newest(members) });
    }
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${esc(new URL(u.loc, site).href)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
