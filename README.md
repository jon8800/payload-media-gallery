# payload-media-gallery

A [Payload CMS](https://payloadcms.com) plugin that replaces the default table view of an upload collection with a visual grid gallery.

| Plugin version | Payload | npm tag |
| --- | --- | --- |
| `0.4.0-next.*` | 4 (`^4.0.0-beta.8`) | `next` |
| `0.3.x` | 3 | `latest` |

**Features**

- Responsive grid of thumbnails for any upload collection
- Lightbox modal with keyboard navigation (←/→, Esc) and per-page paging
- Drag-and-drop bulk upload (anywhere on the gallery surface)
- Metadata sidebar with filename, format, size, dimensions, dates
- Collapsible "Preview sizes" accordion listing every generated image variant
- Inline delete with confirmation
- Bulk select via per-card checkboxes (uses Payload's built-in selection state)
- Field picker drawer support — works as a relationship picker in other collections
- Uses Payload's own table / grid layout toggle
- Themed with Payload 4's semantic `--color-*` tokens (light and dark), plus an optional `--media-gallery-accent` override

## Requirements

- Payload and `@payloadcms/ui` `^4.0.0-beta.8`
- React and React DOM `^19.3.1`
- Node.js `>=24.22.1` (Payload 4's minimum)
- An upload-enabled collection

For Payload 3, use `payload-media-gallery@0.3`.

## Installation

```bash
pnpm add payload-media-gallery@next
# or
npm install payload-media-gallery@next
# or
yarn add payload-media-gallery@next
```

## Usage

Add the plugin to your `payload.config.ts` and pass the slug of the upload collection you want to attach the gallery to:

```ts
import { buildConfig } from 'payload'
import { mediaGalleryPlugin } from 'payload-media-gallery'

export default buildConfig({
  collections: [
    {
      slug: 'media',
      upload: true,
      fields: [
        { name: 'alt', type: 'text' },
      ],
    },
    // ... your other collections
  ],
  plugins: [
    mediaGalleryPlugin({
      collectionSlug: 'media',
    }),
  ],
})
```

After installing, regenerate the Payload import map:

```bash
pnpm payload generate:importmap
```

This also runs automatically on `next dev` and `next build`.

## Options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `collectionSlug` | `string` | yes | The slug of the upload collection the gallery should replace the default list for. |

## Theming

The gallery uses Payload 4's semantic colour tokens, so it follows the admin's light and dark themes. To customize the accent color (selection highlight, checkbox, hover borders, link color), set a CSS custom property anywhere in your admin styles:

```css
:root {
  --media-gallery-accent: #b1852f;
}
```

## How it works

The plugin replaces the list view of the configured collection with the gallery. It also registers one REST endpoint, `DELETE /api/media-gallery/delete`, for the lightbox delete button. It does not change your collection's fields, hooks, or access control. It adds `custom.mediaGallery: true` to the collection, so the endpoint knows which collections it may act on.

### File metadata on list reads

Payload 4's list view asks the database only for the active table columns. The gallery also needs file metadata, so the plugin sets a collection `select` function. On every read that uses an include-mode `select` (for example `select: { filename: true }`), it adds `url`, `thumbnailURL`, `filename`, `mimeType`, `filesize`, `width`, `height`, `variants`, `createdAt`, `updatedAt`, and `alt` when the collection has an `alt` field. Your own `select` function still runs first. Reads without a `select`, and exclude-mode selects, are unchanged. Field access control still applies.

### Thumbnails

Cards show `variants.thumbnail.url` when the collection has a variant named `thumbnail`, then `thumbnailURL`, then the original `url`. In Payload 4, image sizes are `variants` on `sharpTransformer()` from `@payloadcms/transformer-sharp`:

```ts
import { sharpTransformer } from '@payloadcms/transformer-sharp'

export default buildConfig({
  // ...
  upload: {
    transformers: [
      sharpTransformer({
        collections: {
          media: { variants: [{ name: 'thumbnail', width: 400, height: 300 }] },
        },
      }),
    ],
  },
})
```

### Delete endpoint access

Since 0.3.0, the delete endpoint enforces your access control:

- It needs a signed-in user. Without one, it returns `401`.
- It runs the delete with `overrideAccess: false` and the request user. Your collection's `access.delete` decides. If access is denied, it returns `403`.
- It only deletes from collections that use the gallery. Any other collection returns `400`.

Version 0.1.x did none of this. Anyone, even signed out, could delete any document in any collection. Upgrade to 0.3.0 or later.

## Local development

This repo includes a `dev/` sandbox — a minimal Payload + Next.js app that imports the plugin via workspace path so you can iterate with HMR and an in-memory MongoDB. It has a `media` collection with three variants and a `posts` collection with single and `hasMany` upload fields, so you can test the gallery inside upload pickers.

Payload 4 needs Node `>=24.22.1`. `pnpm-workspace.yaml` sets `useNodeVersion`, so pnpm downloads and uses that Node for every script.

```bash
pnpm install
cp dev/.env.example dev/.env
# edit dev/.env and set PAYLOAD_SECRET to anything

pnpm dev
```

Open <http://localhost:3000/admin>. The seeded login is `dev@payloadcms.com` / `test`.

The sandbox uses [`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server) by default — no Mongo install needed. To use a real Mongo instance, set `DATABASE_URL` in `dev/.env`.

The dev app turns on Next.js `cacheComponents`. In that setup the admin page hydrates under Suspense, which is where hydration bugs in the gallery show up.

### Tests

```bash
pnpm test        # vitest
pnpm typecheck
```

### Building for publish

```bash
pnpm build
```

This runs `copyfiles` (assets like CSS), `tsc` (type declarations), and `swc` (JS) to produce the `dist/` folder consumed by the `publishConfig` exports. The package ships plain CSS, so apps need no `sass`.

## License

MIT — see [LICENSE](./LICENSE).
