// Minimal, dependency-free Portable Text -> HTML for the post body.
// Shared by the site (Astro) and the Studio's Preview tab, so it imports nothing:
// image URL helpers are passed in by the caller.
export interface ImageHelpers {
  imageUrl(src: any, width: number, height?: number): string;
  srcset(src: any, widths: number[], ratio?: number): string;
  hasImage(src: any): boolean;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function spans(block: any): string {
  const defs = new Map<string, any>((block.markDefs ?? []).map((d: any) => [d._key, d]));
  return (block.children ?? [])
    .map((c: any) => {
      let html = esc(c.text ?? '').replace(/\n/g, '<br>');
      for (const m of c.marks ?? []) {
        if (m === 'em') html = `<em>${html}</em>`;
        else if (m === 'strong') html = `<strong>${html}</strong>`;
        else if (defs.get(m)?._type === 'link') {
          const href = defs.get(m).href ?? '#';
          const ext = /^https?:\/\//.test(href) && !/barrettgarese\.com/.test(href);
          html = `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${html}</a>`;
        }
      }
      return html;
    })
    .join('');
}

function figure(h: ImageHelpers, img: any, width: string = img.width ?? 'wide'): string {
  const { imageUrl, srcset, hasImage } = h;
  if (!hasImage(img)) return '';
  const alt = esc(img.alt ?? img.caption ?? '');
  const sizes = width === 'column' ? '(min-width: 760px) 680px, 100vw' : width === 'wide' ? '(min-width: 1100px) 1040px, 100vw' : '100vw';
  return `<figure class="pt-figure pt-${width}">
  <img src="${imageUrl(img, 1400)}" srcset="${srcset(img, [640, 1000, 1400, 2000])}" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async" data-full="${imageUrl(img, 2400)}">
  ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
</figure>`;
}

function gallery(h: ImageHelpers, g: any): string {
  const { imageUrl, srcset, hasImage } = h;
  const imgs = (g.images ?? []).filter(hasImage);
  if (!imgs.length) return '';
  const cls = imgs.length === 1 ? 'one' : imgs.length === 2 ? 'two' : 'many';
  return `<figure class="pt-gallery pt-gallery-${cls}" data-gallery>
  ${imgs
    .map(
      (i: any) =>
        `<button type="button" class="pt-thumb" aria-label="View photo${i.caption ? ': ' + esc(i.caption) : ''}"><img src="${imageUrl(i, 800, 600)}" srcset="${srcset(i, [400, 800, 1200], 0.75)}" sizes="(min-width: 1100px) 340px, 50vw" alt="${esc(i.alt ?? i.caption ?? '')}" loading="lazy" decoding="async" data-full="${imageUrl(i, 2400)}" data-caption="${esc(i.caption ?? '')}"></button>`,
    )
    .join('\n  ')}
  ${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}
</figure>`;
}

export function toHTML(blocks: any[] = [], h: ImageHelpers): string {
  const out: string[] = [];
  let list: string | null = null;
  const closeList = () => { if (list) { out.push(list === 'number' ? '</ol>' : '</ul>'); list = null; } };

  for (const b of blocks) {
    if (b._type === 'block' && b.listItem) {
      if (list !== b.listItem) { closeList(); list = b.listItem; out.push(list === 'number' ? '<ol>' : '<ul>'); }
      out.push(`<li>${spans(b)}</li>`);
      continue;
    }
    closeList();
    switch (b._type) {
      case 'block': {
        const inner = spans(b);
        if (!inner.trim()) break;
        const tag = b.style === 'h2' ? 'h2' : b.style === 'h3' ? 'h3' : b.style === 'blockquote' ? 'blockquote' : 'p';
        out.push(`<${tag}>${inner}</${tag}>`);
        break;
      }
      case 'image': out.push(figure(h, b)); break;
      case 'gallery': out.push(gallery(h, b)); break;
      case 'pullQuote': out.push(`<aside class="pt-pull"><p>${esc(b.text ?? '')}</p></aside>`); break;
      case 'divider': out.push(b.style === 'line' ? '<hr class="pt-rule">' : '<hr class="pt-asterism">'); break;
    }
  }
  closeList();
  return out.join('\n');
}
