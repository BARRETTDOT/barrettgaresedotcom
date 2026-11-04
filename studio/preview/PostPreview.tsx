// "Preview" tab for posts: renders the current draft with the site's own reading styles
// (src/styles/post.css) and body renderer (src/lib/portableText.ts), updating as you type.
// Drafts never leave the Studio, so no preview secret or server is needed.
import {useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'
import type {UserViewComponent} from 'sanity/structure'
import {createImageUrlBuilder} from '@sanity/image-url'
import {toHTML, type ImageHelpers} from '../../src/lib/portableText'
import {formatDate, readingMinutes} from '../../src/lib/format'
import '../../src/styles/post.css'

const builder = createImageUrlBuilder({projectId: '5wv4afsl', dataset: 'production'})
const images: ImageHelpers = {
  hasImage: (src) => Boolean(src?.asset?._ref),
  imageUrl: (src, w, h) => {
    let b = builder.image(src).width(w).auto('format').quality(80)
    if (h) b = b.height(h).fit('crop')
    return b.url()
  },
  srcset: (src, widths, ratio) =>
    widths.map((w) => `${images.imageUrl(src, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', '),
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap'

// The Studio pane isn't the full window: keep wide/full-bleed media inside it.
const PANE_CSS = `
.paper.studio-preview { background: var(--paper); color: var(--ink); font-family: var(--text); min-height: 100%; padding-bottom: 96px; container-type: inline-size; }
.studio-preview *, .studio-preview *::before, .studio-preview *::after { box-sizing: border-box; }
.studio-preview .post-head { padding-top: 56px; }
.studio-preview .post-head h1 { font-size: clamp(34px, 6cqi, 64px); margin: 0; }
.studio-preview .post-body .pt-wide, .studio-preview .post-body .pt-gallery { width: min(1040px, 100cqi - 2 * var(--gutter)); }
.studio-preview .post-body .pt-full-bleed { width: 100cqi; }
.studio-preview .post-body img { max-width: 100%; display: block; }
.studio-preview .post-body .pt-thumb { display: block; }
.studio-preview .draft-note { font-family: var(--ui); font-size: 12px; letter-spacing: .06em; color: var(--ink-faint); text-align: center; padding: 14px; border-bottom: 1px solid var(--rule); }
`

type Names = Record<string, string>

export const PostPreview: UserViewComponent = ({document}) => {
  const doc = (document.displayed ?? {}) as any
  const client = useClient({apiVersion: '2026-11-01'})
  const [names, setNames] = useState<Names>({})
  const [seriesCount, setSeriesCount] = useState<number>()

  useEffect(() => {
    if (!window.document.querySelector(`link[href="${FONTS}"]`)) {
      const l = window.document.createElement('link')
      l.rel = 'stylesheet'
      l.href = FONTS
      window.document.head.appendChild(l)
    }
  }, [])

  // Resolve titles for topics/places/series references
  const refIds = [doc.series?._ref, ...(doc.topics ?? []).map((r: any) => r._ref), ...(doc.places ?? []).map((r: any) => r._ref)]
    .filter(Boolean)
    .join(',')
  useEffect(() => {
    const ids = refIds ? refIds.split(',') : []
    if (!ids.length) return
    client.fetch<{_id: string; title: string}[]>(`*[_id in $ids]{_id, title}`, {ids}).then((rows) =>
      setNames(Object.fromEntries(rows.map((r) => [r._id, r.title]))),
    )
    if (doc.series?._ref)
      client.fetch<number>(`count(*[_type == "post" && series._ref == $s && !(_id in path("drafts.**"))])`, {s: doc.series._ref}).then(setSeriesCount)
  }, [client, refIds, doc.series?._ref])

  const html = useMemo(() => toHTML(doc.body ?? [], images), [doc.body])
  const name = (r: any) => names[r?._ref] ?? '…'
  const kicker = doc.series
    ? `${name(doc.series)}${doc.seriesPart ? ` · Part ${doc.seriesPart}${seriesCount ? ` of ${Math.max(seriesCount, doc.seriesPart)}` : ''}` : ''}`
    : (doc.topics ?? []).map(name).join(' · ')
  const places = (doc.places ?? []).map(name).join(', ')

  return (
    <div className="paper studio-preview">
      <style>{PANE_CSS}</style>
      <p className="draft-note">
        Preview of {document.draft ? 'your unpublished changes' : 'the published version'} · links and the photo viewer work on the live site
      </p>
      <article className="post">
        <header className="post-head">
          {kicker && <p className="kicker">{kicker}</p>}
          <h1>{doc.title || 'Untitled'}</h1>
          {doc.subtitle && <p className="subtitle">{doc.subtitle}</p>}
          <p className="meta" style={{marginTop: 26}}>
            {doc.publishedAt ? formatDate(doc.publishedAt) : 'No date yet'} · {readingMinutes(doc.body)} min read
            {places && ` · ${places}`}
          </p>
        </header>
        {images.hasImage(doc.coverImage) && (
          <figure className="cover">
            <img
              src={images.imageUrl(doc.coverImage, 1800)}
              srcSet={images.srcset(doc.coverImage, [800, 1200, 1800])}
              sizes="100vw"
              alt={doc.coverImage.alt ?? ''}
            />
            {doc.coverImage.caption && <figcaption>{doc.coverImage.caption}</figcaption>}
          </figure>
        )}
        <div className="post-body" dangerouslySetInnerHTML={{__html: html}} />
      </article>
    </div>
  )
}
