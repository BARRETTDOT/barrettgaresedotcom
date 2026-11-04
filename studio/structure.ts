import type {DefaultDocumentNodeResolver, StructureResolver} from 'sanity/structure'
import {PostPreview} from './preview/PostPreview'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Writing')
    .items([
      S.listItem()
        .title('Posts')
        .schemaType('post')
        .child(S.documentTypeList('post').title('Posts').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
      S.divider(),
      S.documentTypeListItem('series').title('Series'),
      S.documentTypeListItem('topic').title('Topics'),
      S.documentTypeListItem('place').title('Places'),
    ])

// Every post opens with two tabs: the editor and a live Preview.
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) =>
  schemaType === 'post'
    ? S.document().views([S.view.form().title('Edit'), S.view.component(PostPreview).title('Preview')])
    : S.document()
