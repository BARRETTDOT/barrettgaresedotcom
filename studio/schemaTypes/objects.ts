import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {RemoveIcon} from '@sanity/icons/Remove'

export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      options: {layout: 'grid'},
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({name: 'caption', type: 'string'}),
          ],
        }),
      ],
      validation: (r) => r.min(1),
    }),
    defineField({name: 'caption', title: 'Gallery caption', type: 'string'}),
  ],
  preview: {
    select: {images: 'images', caption: 'caption'},
    prepare({images = [], caption}) {
      return {title: caption || 'Gallery', subtitle: `${images.length} photo${images.length === 1 ? '' : 's'}`, media: images[0]}
    },
  },
})

export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [defineField({name: 'text', type: 'text', rows: 3, validation: (r) => r.required()})],
  preview: {select: {title: 'text'}, prepare: ({title}) => ({title, subtitle: 'Pull quote'})},
})

export const divider = defineType({
  name: 'divider',
  title: 'Section break',
  type: 'object',
  icon: RemoveIcon,
  fields: [
    defineField({
      name: 'style',
      type: 'string',
      options: {list: ['line', 'asterism'], layout: 'radio', direction: 'horizontal'},
      initialValue: 'asterism',
    }),
  ],
  preview: {prepare: () => ({title: '⁂ Section break'})},
})
