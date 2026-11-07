# payload-media-gallery

A [Payload CMS](https://payloadcms.com) 3.x plugin that replaces the default table view of an upload collection with a visual grid gallery.

**Features**

- Responsive grid of thumbnails for any upload collection
- Lightbox modal with keyboard navigation (←/→, Esc) and per-page paging
- Drag-and-drop bulk upload (anywhere on the gallery surface)
- Metadata sidebar with filename, format, size, dimensions, dates
- Collapsible "Preview sizes" accordion listing every generated image size
- Inline delete with confirmation
- Bulk select via per-card checkboxes (uses Payload's built-in selection state)
- Field picker drawer support — works as a relationship picker in other collections
- Themed via Payload's `--theme-elevation-*` CSS variables, plus an optional `--media-gallery-accent` override

## Requirements

- Payload `^3.0.0`
- React `^19.0.0`, React DOM `^19.0.0`
- Next.js `^15` or `^16`
- An upload-enabled collection

## Installation

```bash
pnpm add payload-media-gallery
# or
npm install payload-media-gallery
# or
yarn add payload-media-gallery
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

The gallery inherits Payload's neutral theme colors by default. To customize the accent color (selection highlight, checkbox, hover borders, link color), set a CSS custom property anywhere in your admin styles:

```css
:root {
  --media-gallery-accent: #b1852f;
}
```

## How it works

The plugin replaces the list view of the configured collection with the gallery. It also registers one REST endpoint, `DELETE /api/media-gallery/delete`, for the lightbox delete button. It does not change your collection's fields, hooks, or access control. It adds `custom.mediaGallery: true` to the collection, so the endpoint knows which collections it may act on.

### Delete endpoint access

Since 0.3.0, the delete endpoint enforces your access control:

- It needs a signed-in user. Without one, it returns `401`.
- It runs the delete with `overrideAccess: false` and the request user. Your collection's `access.delete` decides. If access is denied, it returns `403`.
- It only deletes from collections that use the gallery. Any other collection returns `400`.

Version 0.1.x did none of this. Anyone, even signed out, could delete any document in any collection. Upgrade to 0.3.0 or later.

## Local development

This repo includes a `dev/` sandbox — a minimal Payload + Next.js app that imports the plugin via workspace path so you can iterate with HMR and an in-memory MongoDB.

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

This runs `copyfiles` (assets like SCSS), `tsc` (type declarations), and `swc` (JS) to produce the `dist/` folder consumed by the `publishConfig` exports.

## License

MIT — see [LICENSE](./LICENSE).
