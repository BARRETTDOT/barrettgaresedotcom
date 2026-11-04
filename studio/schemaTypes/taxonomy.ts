import {defineField, defineType} from 'sanity'
import {TagIcon, PinIcon, BookIcon} from '@sanity/icons'

const slugField = defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()})

export const topic = defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    slugField,
    defineField({name: 'description', type: 'text', rows: 2}),
    defineField({name: 'order', type: 'number', description: 'Position in the topic filter on /writing'}),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
})

export const place = defineType({
  name: 'place',
  title: 'Place',
  type: 'document',
  icon: PinIcon,
  fields: [defineField({name: 'title', type: 'string', validation: (r) => r.required()}), slugField],
})

export const series = defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    slugField,
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'image', options: {hotspot: true}}),
  ],
})
