# Changelog

## 0.4.0-next.0

The Payload 4 line, on the npm `next` tag. It has every feature and fix of 0.3.1. The Payload 3 line stays on `0.3.x` and the `latest` tag.

### Breaking changes

- Requires Payload and `@payloadcms/ui` `^4.0.0-beta.8`, React `^19.3.1`, and Node `>=24.22.1`. Payload 3 is no longer supported on this line.
- `next` is no longer a peer dependency. The plugin imports nothing from `next/*`. It uses the router hooks from `@payloadcms/ui` and reads the view-mode cookie through Payload's `server` adapter.
- The gallery reads generated image sizes from `variants` instead of `sizes`. Card thumbnails use `variants.thumbnail.url`, then `thumbnailURL`, then `url`. Configure image sizes as `variants` on `sharpTransformer()` (see the Payload 4 migration guide). Existing documents need Payload's `sizes-to-variants` migration.
- The styles ship as plain CSS (`mediaGallery.css`) instead of SCSS. They use Payload 4's semantic tokens (`--color-*`, `--radius-*`, `--spacer-*`) and sit in Payload's `payload-default` cascade layer. The `--theme-elevation-*` variables are gone. `--media-gallery-accent` still works.

### Changes

- The plugin sets a collection `select` function. Payload 4's list view reads only the active columns, so the plugin adds the file metadata the cards and the lightbox need (`url`, `thumbnailURL`, `filename`, `mimeType`, `filesize`, `width`, `height`, `variants`, `createdAt`, `updatedAt`, and `alt` when the field exists). It runs after your own `select` function and only changes include-mode reads.
- The view toggle is Payload 4's own table / grid `LayoutToggle`. The gallery hides Payload's built-in copy, which would switch to Payload's document grid. The gallery always asks Payload for the table layout and puts the gallery in its place.
- Upload picker drawers always show the grid and no view toggle, like Payload's own drawers. Before, the toggle in a drawer rewrote the URL of the page behind it.
- The bulk upload modal uses Payload 4's `useBulkUploadModalSlug` (renamed from `useBulkUploadDrawerSlug`).
- Choosing a card in an upload picker calls `onSelect({ collectionSlug, doc })`, the Payload 4 signature.
- The saved view-mode preference is read with `overrideAccess: false` as the signed-in user. Payload 4 enforces access on the Local API by default.
- Document IDs are typed as `number | string`, so MongoDB IDs work in selection and delete.
- The grid has the same insets as Payload's own document grid.

### Development

- The dev app runs on Payload 4 with `@payloadcms/transformer-sharp` and a `posts` collection that has single and `hasMany` upload fields.
- `pnpm-workspace.yaml` sets `useNodeVersion: 24.22.3`.
- TypeScript 6.0.3. The tsconfig files no longer use `baseUrl`.
- New tests for the `select` function and for Payload 3 leftovers (`next/*` imports, `sizes`, SCSS, `--theme-*` variables).

## 0.3.1

### Fix

- The gallery list view no longer renders a second bulk upload drawer. Payload's `BulkUploadProvider` already renders one.

## 0.3.0

This release is for Payload 3. The `0.2.0-next.*` prereleases on the npm `next` tag are a separate Payload 4 beta line. This release skips 0.2.0, so a `^0.2.0-next.1` range does not resolve to this Payload 3 build.

### Breaking change: the delete endpoint now enforces access control

`DELETE /api/media-gallery/delete` had no access check in 0.1.x. Anyone could delete any document in any collection, even when signed out. The endpoint ran Payload's Local API, which skips access control by default.

The endpoint now:

- returns `401` when no user is signed in.
- runs the delete with `overrideAccess: false` and the request user, so the collection's `access.delete` applies. It returns `403` when access is denied.
- returns `400` for a collection that does not use the gallery, or for a missing or invalid `collection` or `id`.
- returns `404` when the document does not exist.
- returns `500` with a generic message for unexpected errors, and logs the error on the server.

If you called this endpoint without a signed-in user, or relied on it to bypass your collection's delete access, those calls now fail. The lightbox delete button works as before for users who have delete access.

### Fixes

- The Media list no longer causes a hydration error. The lightbox rendered a `<dialog>` in the browser that the server never rendered. This broke hydration when the list hydrated after Payload's modal container mounted, for example under Next.js `cacheComponents`. The lightbox now renders nothing on the server and during hydration, and mounts right after.
- The delete endpoint is registered once, even when the plugin runs for more than one collection.

### Development

- Added vitest tests for the delete endpoint, the plugin config, and the hydration guard (`pnpm test`).
- Added `pnpm typecheck`.
- The publish workflow runs typecheck and tests before it publishes, and checks that the tag matches `package.json`. It packs with pnpm and publishes with a raw authenticated PUT (`scripts/publish.mjs`), like the other plugins. It skips a version that is already on npm.

## 0.1.1

- Publish workflow and build tsconfig.

## 0.1.0

- First release.
