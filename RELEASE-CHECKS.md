# payload-media-gallery 0.2.0-next.0 release checks

Prepared in `release/payload-v4-next`. Nothing committed, tagged, pushed, or published.

2 node tests, typecheck, SWC/types build, and compiled Node ESM import passed. The release guard rejects branch refs, mismatched tags, and stable tags.

The tarball contains compiled exports and their declarations. All relative ESM imports resolve. Tests, fixtures, and source files are absent.

Archive: `C:\Projects\sandbox\payload-plugins-v4-next\artifacts\payload-media-gallery-0.2.0-next.0.tgz`
SHA-256: `f5f5028e570056157c88613ad876dd16c0b6e01a4d92767824ad574938ae1dc4`

Payload packages and peers target `4.0.0-beta.3`. Next.js targets `16.4.2`; Node targets `24.15.0`; TypeScript targets `6.0.3`.

The npm channel is explicitly `next` in publishConfig and the tag workflow. The workflow uses Node 24.15.0 and verifies the tag matches package.json. GitHub Actions has a secret named NPM_TOKEN; its value was not accessed. Local npm authentication was not used.
