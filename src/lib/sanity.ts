// Content for /writing, fetched once per build from Sanity (project 5wv4afsl).
// Publishing in the Studio triggers a Vercel rebuild (deploy hook), so pages are fully static.
//
// For local design work without network access to Sanity, set WRITING_FIXTURE to the path of
// the import .ndjson file; references are resolved in memory and images use their original URLs.
import { createClient } from '@sanity/client';
import fs from 'node:fs';

export const sanity = createClient({
  projectId: '5wv4afsl',
  dataset: 'production',
  apiVersion: '2026-11-01',
  useCdn: false,
  perspective: 'published',
});

export interface Ref { title: string; slug: string; order?: number; description?: string }
export interface Post {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  coverImage?: any;
  body: any[];
  topics: Ref[];
  places: Ref[];
  series?: Ref;
  seriesPart?: number;
}

const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  _id, title, subtitle, "slug": slug.current, publishedAt, excerpt, coverImage, body, seriesPart,
  "topics": coalesce(topics[]->{title, "slug": slug.current, order}, []),
  "places": coalesce(places[]->{title, "slug": slug.current}, []),
  "series": series->{title, "slug": slug.current, description}
}`;

function fromFixture(path: string): Post[] {
  const docs = fs.readFileSync(path, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const byId = new Map(docs.map((d) => [d._id, d]));
  const ref = (r: any): Ref | undefined => {
    const d = r && byId.get(r._ref);
    return d ? { title: d.title, slug: d.slug.current, order: d.order, description: d.description } : undefined;
  };
  return docs
    .filter((d) => d._type === 'post' && !d._id.startsWith('drafts.'))
    .map((d) => ({
      _id: d._id, title: d.title, subtitle: d.subtitle, slug: d.slug.current, publishedAt: d.publishedAt,
      excerpt: d.excerpt, coverImage: d.coverImage, body: d.body ?? [], seriesPart: d.seriesPart,
      topics: (d.topics ?? []).map(ref).filter(Boolean), places: (d.places ?? []).map(ref).filter(Boolean),
      series: ref(d.series),
    }))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

let cache: Promise<Post[]> | undefined;
export function getPosts(): Promise<Post[]> {
  const fixture = import.meta.env.WRITING_FIXTURE ?? process.env.WRITING_FIXTURE;
  cache ??= fixture
    ? Promise.resolve(fromFixture(fixture))
    : sanity.fetch<Post[]>(POSTS_QUERY).then((posts) => {
        // Fail the build rather than publish an empty /writing (e.g. a private dataset or network issue).
        if (!posts.length) throw new Error('Sanity returned no posts for project 5wv4afsl / production. Is the dataset public?');
        return posts;
      });
  return cache;
}

/** Unique refs across posts, with counts, sorted by `order` then title. */
export function collect(posts: Post[], pick: (p: Post) => Ref[]): (Ref & { count: number })[] {
  const map = new Map<string, Ref & { count: number }>();
  for (const p of posts) for (const r of pick(p)) {
    const e = map.get(r.slug) ?? { ...r, count: 0 };
    e.count++; map.set(r.slug, e);
  }
  return [...map.values()].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
}

export function seriesParts(posts: Post[], seriesSlug: string): Post[] {
  return posts.filter((p) => p.series?.slug === seriesSlug).sort((a, b) => (a.seriesPart ?? 99) - (b.seriesPart ?? 99));
}
