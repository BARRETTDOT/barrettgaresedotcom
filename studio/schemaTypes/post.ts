import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'organize', title: 'Organize'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'subtitle', type: 'string', group: 'content'}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      description: 'The web address: barrettgarese.com/writing/<slug>',
      options: {source: 'title', maxLength: 64},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      description: 'Shown at the top of the post and on preview cards when the link is shared.',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
        defineField({name: 'caption', type: 'string'}),
      ],
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One or two sentences for the index page and link previews.',
    }),
    defineField({
      name: 'body',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading', value: 'h2'},
            {title: 'Subheading', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Italic', value: 'em'},
              {title: 'Bold', value: 'strong'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto']}),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({name: 'caption', type: 'string'}),
            defineField({
              name: 'width',
              type: 'string',
              options: {list: ['column', 'wide', 'full-bleed'], layout: 'radio', direction: 'horizontal'},
              initialValue: 'wide',
            }),
          ],
        }),
        defineArrayMember({type: 'gallery'}),
        defineArrayMember({type: 'pullQuote'}),
        defineArrayMember({type: 'divider'}),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published',
      type: 'datetime',
      group: 'organize',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'topics',
      type: 'array',
      group: 'organize',
      of: [defineArrayMember({type: 'reference', to: [{type: 'topic'}]})],
    }),
    defineField({
      name: 'places',
      type: 'array',
      group: 'organize',
      of: [defineArrayMember({type: 'reference', to: [{type: 'place'}]})],
    }),
    defineField({name: 'series', type: 'reference', to: [{type: 'series'}], group: 'organize'}),
    defineField({
      name: 'seriesPart',
      title: 'Part number in series',
      type: 'number',
      group: 'organize',
      hidden: ({document}) => !document?.series,
    }),
    defineField({
      name: 'legacyUrl',
      title: 'Original URL (barrettwrites.com)',
      type: 'url',
      group: 'meta',
      readOnly: true,
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
    {title: 'Oldest first', name: 'publishedAsc', by: [{field: 'publishedAt', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', date: 'publishedAt', media: 'coverImage', series: 'series.title', part: 'seriesPart'},
    prepare({title, date, media, series, part}) {
      const when = date ? new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'No date'
      return {title, media, subtitle: series ? `${when} · ${series}${part ? `, part ${part}` : ''}` : when}
    },
  },
})
