export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}

export function plainText(blocks: any[] = []): string {
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => (b.children ?? []).map((c: any) => c.text).join(''))
    .join('\n\n');
}

export function readingMinutes(blocks: any[] = []): number {
  const words = plainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function excerptOf(post: { excerpt?: string; body?: any[] }, max = 220): string {
  const src = post.excerpt || plainText(post.body).split('\n\n')[0] || '';
  return src.length > max ? src.slice(0, src.lastIndexOf(' ', max)) + '…' : src;
}
