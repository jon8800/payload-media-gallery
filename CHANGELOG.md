# Changelog

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
