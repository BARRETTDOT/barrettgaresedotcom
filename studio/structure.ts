import type {StructureResolver} from 'sanity/structure'

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
