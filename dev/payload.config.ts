import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import { mediaGalleryPlugin } from 'payload-media-gallery'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (!process.env.DATABASE_URL) {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URL = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
      user: 'users',
    },
    collections: [
      {
        slug: 'users',
        auth: true,
        fields: [],
      },
      {
        slug: 'media',
        fields: [
          {
            name: 'alt',
            type: 'text',
          },
        ],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
      {
        // Opens the gallery inside upload pickers (single and hasMany).
        slug: 'posts',
        admin: { useAsTitle: 'title' },
        fields: [
          { name: 'title', type: 'text' },
          { name: 'image', type: 'upload', relationTo: 'media' },
          { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
        ],
      },
    ],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URL || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      mediaGalleryPlugin({
        collectionSlug: 'media',
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    // Payload 4: image resizing is an optional transformer, and image sizes are
    // declared as `variants` on it.
    upload: {
      transformers: [
        sharpTransformer({
          collections: {
            media: {
              variants: [
                {
                  name: 'thumbnail',
                  width: 400,
                  height: 300,
                  position: 'centre',
                },
                {
                  name: 'card',
                  width: 768,
                  height: 576,
                  position: 'centre',
                },
                {
                  name: 'tablet',
                  width: 1024,
                  height: undefined,
                  position: 'centre',
                },
              ],
            },
          },
        }),
      ],
    },
  })
}

export default buildConfigWithMemoryDB()
