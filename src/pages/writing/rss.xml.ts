import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../../lib/sanity';
import { toHTML } from '../../lib/portableText';
import { excerptOf } from '../../lib/format';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Barrett Garese — Writing',
    description: 'Essays, travel and dispatches by Barrett Garese.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.title,
      link: `/writing/${p.slug}`,
      pubDate: new Date(p.publishedAt),
      description: excerptOf(p, 300),
      content: toHTML(p.body),
      categories: [...p.topics, ...p.places].map((r) => r.title),
    })),
  });
}
