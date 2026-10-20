# payload-media-gallery 0.2.0-next.1 recovery checks

This recovery candidate is uncommitted and unpushed. The existing `v0.2.0-next.0` tag stays on `82b1525382ce862ce468fa08a19c33c9ce22a832`.

Two tests, typecheck, build, compiled Node ESM import, and the raw publisher dry run passed. Packed entry points resolve. No source, tests, or fixtures ship. Every dist file is byte-for-byte identical to the previous next.0 tarball.

Archive: `C:\Projects\sandbox\payload-plugins-v4-next\artifacts\payload-media-gallery-0.2.0-next.1.tgz`
SHA-256: `66b3536085075b8fdc4d1a4f940471efdf9356cdc14b8d4178b913e5de583e92`

The workflow still requires a matching next prerelease tag. It builds and packs before publishing. It passes the exact tarball and expected version to `scripts/publish.mjs`. The script is a byte-for-byte copy of the audited Canvas publisher. Prerelease versions use npm dist-tag `next`. Only the publish step receives the existing Actions `NPM_TOKEN` secret. The dry run does not read a token or publish.

The previous Actions run `39376058243` failed on npm PUT with E404 and a permission message. Filtered failure logs contained no 401, expired-token, or revoked-token message. The logs do not prove token expiry. The next real workflow run will establish whether the token permits raw publishing.
