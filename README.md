# payload-media-gallery

A [Payload CMS](https://payloadcms.com) 4 beta plugin that replaces the default table view of an upload collection with a visual grid gallery.

**Features**

- Responsive grid of thumbnails for any upload collection
- Lightbox modal with keyboard navigation (←/→, Esc) and per-page paging
- Drag-and-drop bulk upload (anywhere on the gallery surface)
- Metadata sidebar with filename, format, size, dimensions, dates
- Collapsible "Preview sizes" accordion listing every generated image size
- Inline delete with confirmation
- Bulk select via per-card checkboxes (uses Payload's built-in selection state)
- Field picker drawer support — works as a relationship picker in other collections
- Themed via Payload v4 semantic CSS tokens, plus an optional `--media-gallery-accent` override

## Requirements

- Payload and `@payloadcms/ui` `4.0.0-beta.3`
- Node.js `>=24.15.0`
- React `^19.0.0`, React DOM `^19.0.0`
- Next.js `>=16.4.0 <17`
- An upload-enabled collection

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

The gallery inherits Payload's neutral theme colors by default. To customize the accent color (selection highlight, checkbox, hover borders, link color), set a CSS custom property anywhere in your admin styles:

```css
:root {
  --media-gallery-accent: #b1852f;
}
```

## How it works

The plugin replaces the configured collection's list view. It keeps file metadata available through Payload v4's `select` function. Lightbox deletion uses Payload's standard REST DELETE route, which enforces the collection's access rules. Generated image sizes use `variants`. The plugin preserves existing access rules and endpoints.

## Prerelease distribution

Version `0.2.0-next.1` targets Payload `4.0.0-beta.3`. Publish only to the npm `next` dist-tag. The tag workflow checks that the Git tag matches the package version. It builds and packs with pnpm, then publishes the packed manifest through the audited raw registry publisher. The publisher selects `next` for prereleases. It reads the GitHub Actions `NPM_TOKEN` secret only during the publish step.

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

### Building for publish

```bash
pnpm build
```

This runs `copyfiles` (assets like SCSS), `tsc` (type declarations), and `swc` (JS) to produce the `dist/` folder consumed by the `publishConfig` exports.

## License

MIT — see [LICENSE](./LICENSE).
